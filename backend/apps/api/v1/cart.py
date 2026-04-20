"""
Cart API Endpoints - Django Ninja

RESTful API for cart operations following BFF pattern.
"""

from typing import List, Optional
from decimal import Decimal

from ninja import Router, Schema, Field
from ninja.errors import HttpError
from django.http import HttpRequest

from apps.core.authentication import JWTAuth


router = Router(tags=["cart"])


# ============================================================================
# Lazy imports to avoid circular import issues
# ============================================================================


def get_cart_service():
    """Lazy import cart service to avoid circular imports."""
    from apps.commerce.cart import (
        get_cart_id,
        get_cart_items,
        add_to_cart,
        update_cart_item,
        remove_from_cart,
        clear_cart,
        calculate_cart_totals,
        get_cart_item_count,
        get_cart_summary,
    )

    return {
        "get_cart_id": get_cart_id,
        "get_cart_items": get_cart_items,
        "add_to_cart": add_to_cart,
        "update_cart_item": update_cart_item,
        "remove_from_cart": remove_from_cart,
        "clear_cart": clear_cart,
        "calculate_cart_totals": calculate_cart_totals,
        "get_cart_item_count": get_cart_item_count,
        "get_cart_summary": get_cart_summary,
    }


# ============================================================================
# Schemas
# ============================================================================


class CartItemSchema(Schema):
    """Cart item with product details."""

    product_id: int
    quantity: int = Field(..., ge=1, le=99)
    name: str
    slug: str
    image: Optional[str] = None
    weight_grams: int
    price_sgd: float
    price_with_gst: float
    gst_inclusive: bool
    subtotal: float


class CartTotalsSchema(Schema):
    """Cart totals with GST breakdown."""

    subtotal: str  # Decimal as string for JSON
    gst_amount: str
    total: str
    item_count: int


class CartResponseSchema(Schema):
    """Complete cart response."""

    items: List[CartItemSchema]
    subtotal: str
    gst_amount: str
    total: str
    item_count: int


class AddToCartRequestSchema(Schema):
    """Request to add item to cart."""

    product_id: int = Field(..., description="Product ID to add")
    quantity: int = Field(default=1, ge=1, le=99, description="Quantity to add")


class UpdateCartRequestSchema(Schema):
    """Request to update cart item."""

    product_id: int = Field(..., description="Product ID to update")
    quantity: int = Field(..., ge=0, le=99, description="New quantity (0 to remove)")


class CartItemCountSchema(Schema):
    """Simple item count response."""

    count: int


class MessageSchema(Schema):
    """Generic message response."""

    message: str


# ============================================================================
# Helper Functions
# ============================================================================


def get_cart_response(cart_id: str) -> CartResponseSchema:
    """Build cart response from cart_id."""
    summary = get_cart_summary(cart_id)

    return CartResponseSchema(
        items=summary["items"],
        subtotal=str(summary["subtotal"]),
        gst_amount=str(summary["gst_amount"]),
        total=str(summary["total"]),
        item_count=summary["item_count"],
    )


def get_cart_id_from_request(request: HttpRequest) -> str:
    """Extract cart ID from request (cookies or auth)."""
    # Try to get from cookies first
    cart_id = request.COOKIES.get("cart_id")

    # If authenticated, use user-based cart
    if hasattr(request, "auth") and request.auth:
        user_id = getattr(request.auth, "user_id", None)
        if user_id:
            return f"user:{user_id}"

    # Fall back to cookie-based cart
    if not cart_id:
        # Generate new cart ID
        import uuid

        cart_id = str(uuid.uuid4())

    return cart_id


# ============================================================================
# Endpoints
# ============================================================================


@router.get("/", response=CartResponseSchema, auth=JWTAuth(required=False))
def get_cart(request: HttpRequest):
    """
    Get current cart contents.

    Returns cart items with product details and totals.
    """
    cart_id = get_cart_id_from_request(request)
    return get_cart_response(cart_id)


@router.post("/add/", response=CartResponseSchema, auth=JWTAuth(required=False))
def add_item_to_cart(request: HttpRequest, data: AddToCartRequestSchema):
    """
    Add item to cart.

    If item already exists, increments quantity.
    """
    cart_id = get_cart_id_from_request(request)

    try:
        add_to_cart(cart_id=cart_id, product_id=data.product_id, quantity=data.quantity)
    except ValueError as e:
        raise HttpError(400, str(e))

    return get_cart_response(cart_id)


@router.put("/update/", response=CartResponseSchema, auth=JWTAuth(required=False))
def update_cart_item_quantity(request: HttpRequest, data: UpdateCartRequestSchema):
    """
    Update item quantity in cart.

    Set quantity to 0 to remove item.
    """
    cart_id = get_cart_id_from_request(request)

    try:
        update_cart_item(
            cart_id=cart_id, product_id=data.product_id, quantity=data.quantity
        )
    except ValueError as e:
        raise HttpError(400, str(e))

    return get_cart_response(cart_id)


@router.delete(
    "/remove/{product_id}/", response=CartResponseSchema, auth=JWTAuth(required=False)
)
def remove_item_from_cart(request: HttpRequest, product_id: int):
    """
    Remove item from cart.

    Idempotent - succeeds even if item not in cart.
    """
    cart_id = get_cart_id_from_request(request)

    remove_from_cart(cart_id, product_id)

    return get_cart_response(cart_id)


@router.delete("/clear/", response=MessageSchema, auth=JWTAuth(required=False))
def clear_cart_contents(request: HttpRequest):
    """
    Clear entire cart.

    Removes all items from cart.
    """
    cart_id = get_cart_id_from_request(request)

    clear_cart(cart_id)

    return MessageSchema(message="Cart cleared successfully")


@router.get("/count/", response=CartItemCountSchema, auth=JWTAuth(required=False))
def get_cart_count(request: HttpRequest):
    """
    Get total item count in cart.

    Returns total quantity (sum of all item quantities).
    """
    cart_id = get_cart_id_from_request(request)

    count = get_cart_item_count(cart_id)

    return CartItemCountSchema(count=count)


@router.get("/summary/", response=CartResponseSchema, auth=JWTAuth(required=False))
def get_cart_summary_endpoint(request: HttpRequest):
    """
    Get cart summary with totals.

    Alias for GET /cart/ - returns full cart with totals.
    """
    cart_id = get_cart_id_from_request(request)
    return get_cart_response(cart_id)
