"""
Stripe Checkout Service - Singapore

Stripe Checkout integration for Singapore market.
Supports SGD currency, GrabPay, and PayNow payment methods.
Follows TDD methodology - implementation after tests.
"""

import re
import uuid
from decimal import Decimal, ROUND_HALF_UP
from typing import Any, Optional

import stripe
from django.conf import settings
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

from apps.commerce.cart import clear_cart
from apps.commerce.models import Product


# Stripe configuration
stripe.api_key = getattr(settings, "STRIPE_SECRET_KEY_SG", "")
stripe.api_version = "2026-02-01.acacia"
GST_RATE = Decimal("0.09")


def validate_checkout_data(data: dict) -> bool:
    """
    Validate checkout request data.

    Raises:
        ValueError: If data is invalid
    """
    # Validate cart items
    cart_items = data.get("cart_items", [])
    if not cart_items:
        raise ValueError("Cart is empty")

    # Validate email
    email = data.get("user_email", "")
    if not email or not _is_valid_email(email):
        raise ValueError("Invalid email")

    # Validate URLs
    success_url = data.get("success_url", "")
    cancel_url = data.get("cancel_url", "")
    if not success_url or not cancel_url:
        raise ValueError("Missing redirect URLs")

    return True


def _is_valid_email(email: str) -> bool:
    """Validate email format."""
    if not email:
        return False

    try:
        validate_email(email)
        return True
    except ValidationError:
        return False


def build_line_items(cart_items: list[dict]) -> list[dict]:
    """
    Build Stripe line items from cart items.

    Returns line items formatted for Stripe Checkout Session.
    Unit amount is in cents (price * 100).
    """
    line_items = []

    for item in cart_items:
        # Get price with GST (already calculated)
        price_with_gst = Decimal(str(item.get("price_with_gst", 0)))
        unit_amount_cents = int(price_with_gst * 100)

        # Build product data
        product_data = {
            "name": item.get("name", "Tea Product"),
            "description": f"{item.get('weight_grams', 50)}g",
        }

        # Add image if available
        image_url = item.get("image_url")
        if image_url:
            product_data["images"] = [image_url]

        line_item = {
            "price_data": {
                "currency": "sgd",
                "product_data": product_data,
                "unit_amount": unit_amount_cents,
            },
            "quantity": item.get("quantity", 1),
        }

        line_items.append(line_item)

    return line_items


def create_checkout_session(
    cart_items: list[dict],
    user_email: str,
    success_url: str,
    cancel_url: str,
    cart_id: Optional[str] = None,
) -> dict[str, Any]:
    """
    Create Stripe Checkout Session for Singapore.

    Features:
    - SGD currency
    - GrabPay and PayNow payment methods
    - Singapore-only shipping
    - English locale
    - GST metadata

    Args:
        cart_items: List of cart items with product details
        user_email: Customer email
        success_url: Redirect URL after successful payment
        cancel_url: Redirect URL after cancelled payment
        cart_id: Optional cart ID for metadata

    Returns:
        Dictionary with session_id, url, and status

    Raises:
        ValueError: If validation fails
        stripe.error.StripeError: If Stripe API fails
    """
    # Validate input
    validate_checkout_data(
        {
            "cart_items": cart_items,
            "user_email": user_email,
            "success_url": success_url,
            "cancel_url": cancel_url,
        }
    )

    # Build line items
    line_items = build_line_items(cart_items)

    if not line_items:
        raise ValueError("No valid line items")

    # Calculate total for metadata
    total = sum(
        Decimal(str(item.get("price_with_gst", 0))) * item.get("quantity", 1)
        for item in cart_items
    )

    # Build metadata
    metadata = {
        "gst_rate": str(GST_RATE),
        "total_sgd": str(total),
    }

    if cart_id:
        metadata["cart_id"] = cart_id

    try:
        # Create checkout session
        session = stripe.checkout.Session.create(
            payment_method_types=["card", "grabpay", "paynow"],
            line_items=line_items,
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=user_email,
            locale="en",
            currency="sgd",
            shipping_address_collection={
                "allowed_countries": ["SG"],
            },
            metadata=metadata,
            automatic_tax={"enabled": False},  # GST already included in prices
            billing_address_collection="required",
            phone_number_collection={"enabled": True},
        )

        return {
            "session_id": session.id,
            "url": session.url,
            "status": "created",
        }

    except stripe.error.StripeError as e:
        raise ValueError(f"Stripe error: {str(e)}")


def verify_webhook_signature(payload: bytes, sig_header: str, secret: str) -> bool:
    """
    Verify Stripe webhook signature.

    Args:
        payload: Request body
        sig_header: Stripe-Signature header value
        secret: Webhook signing secret

    Returns:
        True if signature valid

    Raises:
        ValueError: If signature invalid or missing
    """
    if not sig_header:
        raise ValueError("Missing signature")

    if not secret:
        raise ValueError("Missing webhook secret")

    try:
        stripe.Webhook.construct_event(
            payload=payload,
            sig_header=sig_header,
            secret=secret,
        )
        return True
    except stripe.error.SignatureVerificationError as e:
        raise ValueError(f"Invalid signature: {str(e)}")


def handle_payment_success(event: dict) -> dict[str, Any]:
    """
    Handle payment_intent.succeeded webhook.

    Creates order and clears cart.

    Args:
        event: Stripe webhook event

    Returns:
        Order details dict
    """
    payment_intent = event.get("data", {}).get("object", {})
    payment_intent_id = payment_intent.get("id")
    metadata = payment_intent.get("metadata", {})

    # Check for duplicate (idempotency)
    from commerce.models import Order

    if Order.objects.filter(stripe_payment_intent_id=payment_intent_id).exists():
        # Return existing order
        existing_order = Order.objects.get(stripe_payment_intent_id=payment_intent_id)
        return {
            "order_id": existing_order.id,
            "order_number": existing_order.order_number,
            "status": "existing",
        }

    # Get cart ID
    cart_id = metadata.get("cart_id")

    # Get user ID if available
    user_id = metadata.get("user_id")

    # Calculate totals
    amount_cents = payment_intent.get("amount", 0)
    total_sgd = Decimal(str(amount_cents)) / 100

    # Extract GST
    gst_rate = Decimal(metadata.get("gst_rate", "0.09"))
    base_amount = total_sgd / (Decimal("1") + gst_rate)
    gst_amount = (total_sgd - base_amount).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )

    # Get shipping address
    shipping = payment_intent.get("shipping", {})
    shipping_address = {
        "name": shipping.get("name", ""),
        "line1": shipping.get("address", {}).get("line1", ""),
        "line2": shipping.get("address", {}).get("line2", ""),
        "postal_code": shipping.get("address", {}).get("postal_code", ""),
        "country": shipping.get("address", {}).get("country", "SG"),
    }

    # Get payment method
    charges = payment_intent.get("charges", {}).get("data", [])
    payment_method = "unknown"
    if charges:
        payment_details = charges[0].get("payment_method_details", {})
        payment_type = payment_details.get("type", "")
        if payment_type == "card":
            card = payment_details.get("card", {})
            payment_method = (
                f"{card.get('brand', 'card')} ending in {card.get('last4', '****')}"
            )
        else:
            payment_method = payment_type  # grabpay, paynow, etc.

    # Get receipt URL
    receipt_url = None
    if charges:
        receipt_url = charges[0].get("receipt_url")

    # Create order
    order_data = {
        "total_sgd": total_sgd,
        "gst_amount_sgd": gst_amount,
        "stripe_payment_intent_id": payment_intent_id,
        "payment_method": payment_method,
        "receipt_url": receipt_url,
        "shipping_name": shipping_address["name"],
        "shipping_address_line1": shipping_address["line1"],
        "shipping_address_line2": shipping_address["line2"],
        "shipping_postal_code": shipping_address["postal_code"],
        "status": "paid",
    }

    if user_id:
        from apps.core.models import User

        try:
            order_data["user"] = User.objects.get(id=int(user_id))
        except User.DoesNotExist:
            pass

    order = Order.objects.create(**order_data)

    # Clear cart if cart_id provided
    if cart_id:
        clear_cart(cart_id)

    return {
        "order_id": order.id,
        "order_number": order.order_number,
        "status": "created",
    }


def handle_payment_failure(event: dict) -> dict[str, Any]:
    """
    Handle payment_intent.payment_failed webhook.

    Logs failure, does NOT create order, preserves cart.

    Args:
        event: Stripe webhook event

    Returns:
        Failure details dict
    """
    import logging

    logger = logging.getLogger("commerce.stripe")

    payment_intent = event.get("data", {}).get("object", {})
    payment_intent_id = payment_intent.get("id")

    error = payment_intent.get("last_payment_error", {})
    error_code = error.get("code", "unknown")
    error_message = error.get("message", "Unknown error")

    logger.error(f"Payment failed: {payment_intent_id} - {error_code}: {error_message}")

    return {
        "payment_intent_id": payment_intent_id,
        "error_code": error_code,
        "error_message": error_message,
        "status": "failed",
    }


def handle_checkout_session_completed(event: dict) -> dict[str, Any]:
    """
    Handle checkout.session.completed webhook.

    Alternative entry point for order creation.

    Args:
        event: Stripe webhook event

    Returns:
        Order details dict
    """
    session = event.get("data", {}).get("object", {})
    payment_intent_id = session.get("payment_intent")

    if not payment_intent_id:
        return {"status": "error", "message": "No payment intent"}

    # Get payment intent details
    try:
        payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)

        # Convert to event format
        payment_event = {
            "type": "payment_intent.succeeded",
            "data": {"object": payment_intent},
        }

        return handle_payment_success(payment_event)

    except stripe.error.StripeError as e:
        return {"status": "error", "message": str(e)}


def process_webhook_event(event: dict) -> dict[str, Any]:
    """
    Route webhook event to appropriate handler.

    Args:
        event: Parsed Stripe webhook event

    Returns:
        Handler result
    """
    import logging

    logger = logging.getLogger("commerce.stripe")

    event_type = event.get("type", "")

    if event_type == "payment_intent.succeeded":
        return handle_payment_success(event)

    elif event_type == "payment_intent.payment_failed":
        return handle_payment_failure(event)

    elif event_type == "checkout.session.completed":
        return handle_checkout_session_completed(event)

    else:
        logger.warning(f"Unhandled webhook event type: {event_type}")
        return {"status": "ignored", "event_type": event_type}
