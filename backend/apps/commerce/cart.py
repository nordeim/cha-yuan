"""
Redis Cart Service

Implements shopping cart functionality using Redis for persistence.
Follows TDD methodology - tests written first, then implementation.

Key Features:
- Anonymous cart support (cookie-based)
- User cart support (authenticated)
- Cart merge on login
- 30-day TTL
- GST-aware calculations
- Stock validation
"""

import uuid
from datetime import timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import Any

import redis
from django.conf import settings
from django.http import HttpRequest

from apps.commerce.models import Product


# Redis client configuration
# Using DB 1 for carts (DB 0 reserved for sessions/cache)
redis_client = redis.Redis(
    host=getattr(settings, "REDIS_HOST", "localhost"),
    port=getattr(settings, "REDIS_PORT", 6379),
    db=1,  # Cart database
    decode_responses=True,
    socket_connect_timeout=5,
    socket_timeout=5,
)

# Cart TTL: 30 days (2,592,000 seconds)
CART_TTL = timedelta(days=30)

# Quantity limits
MIN_QUANTITY = 1
MAX_QUANTITY = 99


def get_cart_id(request: HttpRequest) -> str:
    """
    Get or create cart ID from cookies.

    Returns existing cart_id if present, otherwise generates new UUID.
    """
    cart_id = request.COOKIES.get("cart_id")
    if not cart_id:
        cart_id = str(uuid.uuid4())
    return cart_id


def validate_quantity(quantity: int) -> bool:
    """
    Validate quantity is within acceptable range.

    Raises:
        ValueError: If quantity is invalid
    """
    if not isinstance(quantity, int):
        raise ValueError("Quantity must be an integer")

    if quantity < MIN_QUANTITY:
        raise ValueError(f"Quantity must be at least {MIN_QUANTITY}")

    if quantity > MAX_QUANTITY:
        raise ValueError(f"Maximum quantity is {MAX_QUANTITY}")

    return True


def validate_stock(product_id: int, quantity: int) -> bool:
    """
    Check if sufficient stock is available for product.

    Returns True if stock >= requested quantity.
    Returns False if product doesn't exist or stock insufficient.
    """
    try:
        product = Product.objects.get(id=product_id)
        return product.is_in_stock and product.stock >= quantity
    except Product.DoesNotExist:
        return False
    except Exception:
        return False


def add_to_cart(cart_id: str, product_id: int, quantity: int) -> bool:
    """
    Add item to cart.

    If item already exists, increments quantity.
    Sets 30-day TTL on first addition.

    Args:
        cart_id: Cart identifier (UUID or user:{user_id})
        product_id: Product ID to add
        quantity: Quantity to add

    Returns:
        True on success

    Raises:
        ValueError: If quantity invalid or stock insufficient
    """
    # Validate quantity
    validate_quantity(quantity)

    # Validate stock
    if not validate_stock(product_id, quantity):
        raise ValueError("Insufficient stock")

    # Redis key for this cart
    key = f"cart:{cart_id}"

    # Atomic increment - adds quantity to existing or creates new
    current_qty = redis_client.hincrby(key, str(product_id), quantity)

    # Set TTL on first addition or reset TTL
    redis_client.expire(key, CART_TTL)

    # Enforce max quantity
    if current_qty > MAX_QUANTITY:
        # Rollback to max
        redis_client.hset(key, str(product_id), MAX_QUANTITY)
        raise ValueError(f"Maximum quantity is {MAX_QUANTITY}")

    return True


def get_cart_items(cart_id: str) -> list[dict[str, Any]]:
    """
    Get all items in cart with product details.

    Returns list of items with:
    - product_id
    - quantity
    - product details (requires DB lookup)
    - subtotal
    """
    key = f"cart:{cart_id}"
    cart_data = redis_client.hgetall(key)

    if not cart_data:
        return []

    items = []
    for product_id_str, quantity_str in cart_data.items():
        try:
            product_id = int(product_id_str)
            quantity = int(quantity_str)

            # Get product details
            try:
                product = Product.objects.get(id=product_id)
                price_with_gst = product.price_with_gst_sgd
                subtotal = price_with_gst * quantity

                items.append(
                    {
                        "product_id": product_id,
                        "quantity": quantity,
                        "name": product.name,
                        "slug": product.slug,
                        "image": product.image.url if product.image else None,
                        "weight_grams": product.weight_grams,
                        "price_sgd": float(product.price_sgd),
                        "price_with_gst": float(price_with_gst),
                        "gst_inclusive": product.gst_inclusive,
                        "subtotal": float(subtotal),
                    }
                )
            except Product.DoesNotExist:
                # Product removed from DB, skip
                continue
        except (ValueError, TypeError):
            # Invalid data, skip
            continue

    return items


def update_cart_item(cart_id: str, product_id: int, quantity: int) -> bool:
    """
    Update item quantity in cart.

    Args:
        cart_id: Cart identifier
        product_id: Product ID to update
        quantity: New quantity (0 to remove)

    Returns:
        True on success

    Raises:
        ValueError: If item not in cart or quantity invalid
    """
    key = f"cart:{cart_id}"
    product_id_str = str(product_id)

    # Check if item exists in cart
    if not redis_client.hexists(key, product_id_str):
        raise ValueError("Item not in cart")

    if quantity == 0:
        # Remove item
        redis_client.hdel(key, product_id_str)
    else:
        # Validate new quantity
        validate_quantity(quantity)

        # Validate stock
        if not validate_stock(product_id, quantity):
            raise ValueError("Insufficient stock")

        # Update quantity
        redis_client.hset(key, product_id_str, quantity)

    # Reset TTL
    redis_client.expire(key, CART_TTL)

    return True


def remove_from_cart(cart_id: str, product_id: int) -> bool:
    """
    Remove item from cart.

    Idempotent - succeeds even if item not in cart.

    Args:
        cart_id: Cart identifier
        product_id: Product ID to remove

    Returns:
        True on success
    """
    key = f"cart:{cart_id}"
    product_id_str = str(product_id)

    redis_client.hdel(key, product_id_str)
    redis_client.expire(key, CART_TTL)

    return True


def clear_cart(cart_id: str) -> bool:
    """
    Clear entire cart.

    Args:
        cart_id: Cart identifier

    Returns:
        True on success
    """
    key = f"cart:{cart_id}"
    redis_client.delete(key)

    return True


def merge_anonymous_cart(anonymous_id: str, user_id: int) -> str:
    """
    Merge anonymous cart into user cart on login.

    For duplicate items, quantities are summed (capped at MAX_QUANTITY).
    Anonymous cart is cleared after successful merge.

    Args:
        anonymous_id: Anonymous cart UUID
        user_id: User ID to merge into

    Returns:
        User cart key

    Raises:
        ValueError: If user_id invalid
    """
    if not isinstance(user_id, int) or user_id <= 0:
        raise ValueError("Invalid user_id")

    anon_key = f"cart:{anonymous_id}"
    user_key = f"cart:user:{user_id}"

    # Get anonymous cart data
    anon_data = redis_client.hgetall(anon_key)

    if not anon_data:
        # Nothing to merge
        return user_key

    # Get user cart data (may be empty)
    user_data = redis_client.hgetall(user_key)

    # Merge items
    for product_id_str, anon_qty_str in anon_data.items():
        try:
            anon_qty = int(anon_qty_str)

            # Check if already in user cart
            if product_id_str in user_data:
                user_qty = int(user_data[product_id_str])
                new_qty = min(user_qty + anon_qty, MAX_QUANTITY)
            else:
                new_qty = anon_qty

            redis_client.hset(user_key, product_id_str, new_qty)
        except (ValueError, TypeError):
            # Skip invalid data
            continue

    # Set TTL on user cart
    redis_client.expire(user_key, CART_TTL)

    # Clear anonymous cart
    redis_client.delete(anon_key)

    return user_key


def calculate_cart_totals(items: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Calculate cart totals with GST breakdown.

    Args:
        items: List of cart items with prices

    Returns:
        Dictionary with:
        - subtotal: Sum of base prices
        - gst_amount: GST on subtotal
        - total: Total with GST
        - item_count: Total item count
    """
    if not items:
        return {
            "subtotal": Decimal("0.00"),
            "gst_amount": Decimal("0.00"),
            "total": Decimal("0.00"),
            "item_count": 0,
        }

    subtotal = Decimal("0.00")
    gst_amount = Decimal("0.00")
    item_count = 0

    for item in items:
        qty = item.get("quantity", 0)
        price_sgd = Decimal(str(item.get("price_sgd", 0)))
        price_with_gst = Decimal(str(item.get("price_with_gst", 0)))

        item_count += qty

        if item.get("gst_inclusive", True):
            # GST is already in price
            subtotal += price_sgd * qty
            gst_for_item = (price_with_gst - price_sgd) * qty
            gst_amount += gst_for_item
        else:
            # Need to calculate GST
            item_subtotal = price_sgd * qty
            subtotal += item_subtotal
            gst_for_item = (item_subtotal * Decimal("0.09")).quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
            gst_amount += gst_for_item

    total = subtotal + gst_amount

    return {
        "subtotal": subtotal.quantize(Decimal("0.01")),
        "gst_amount": gst_amount.quantize(Decimal("0.01")),
        "total": total.quantize(Decimal("0.01")),
        "item_count": item_count,
    }


def get_cart_summary(cart_id: str) -> dict[str, Any]:
    """
    Get complete cart summary.

    Returns:
        Dictionary with items, totals, and metadata
    """
    items = get_cart_items(cart_id)
    totals = calculate_cart_totals(items)

    return {
        "items": items,
        **totals,
    }


def get_cart_item_count(cart_id: str) -> int:
    """
    Get total number of items in cart.

    Returns:
        Total quantity count
    """
    key = f"cart:{cart_id}"
    quantities = redis_client.hvals(key)

    total = 0
    for qty_str in quantities:
        try:
            total += int(qty_str)
        except (ValueError, TypeError):
            continue

    return total
