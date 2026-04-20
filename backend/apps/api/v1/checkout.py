"""
Checkout API Endpoints - Django Ninja

Stripe Checkout integration for Singapore.
"""

from typing import Any, Optional

from ninja import Router, Schema, Field
from ninja.errors import HttpError
from django.http import HttpRequest
from django.conf import settings

from apps.commerce.cart import (
    get_cart_items,
    get_cart_summary,
    get_cart_id,
)
from apps.commerce.stripe_sg import (
    create_checkout_session,
    verify_webhook_signature,
    process_webhook_event,
)
from apps.core.authentication import JWTAuth


router = Router(tags=["checkout"])


# ============================================================================
# Schemas
# ============================================================================


class CheckoutSessionRequestSchema(Schema):
    """Request to create checkout session."""

    success_url: str = Field(..., description="URL to redirect after success")
    cancel_url: str = Field(..., description="URL to redirect after cancel")


class CheckoutSessionResponseSchema(Schema):
    """Checkout session response."""

    session_id: str
    checkout_url: str
    status: str


class WebhookRequestSchema(Schema):
    """Stripe webhook event."""

    type: str
    data: dict


class WebhookResponseSchema(Schema):
    """Webhook processing response."""

    status: str
    message: Optional[str] = None
    order_id: Optional[int] = None
    order_number: Optional[str] = None


class CheckoutSummarySchema(Schema):
    """Checkout page summary."""

    items: list[dict]
    subtotal: str
    gst_amount: str
    total: str
    item_count: int


# ============================================================================
# Endpoints
# ============================================================================


@router.post(
    "/create-session/",
    response=CheckoutSessionResponseSchema,
    auth=JWTAuth(required=False),
)
def create_checkout_session_endpoint(
    request: HttpRequest,
    data: CheckoutSessionRequestSchema,
):
    """
    Create Stripe Checkout Session.

    Returns checkout URL for customer to complete payment.
    """
    # Get cart
    cart_id = get_cart_id(request)
    cart_summary = get_cart_summary(cart_id)

    if not cart_summary["items"]:
        raise HttpError(400, "Cart is empty")

    # Get user email
    user_email = ""
    if hasattr(request, "auth") and request.auth:
        user_email = getattr(request.auth, "email", "")

    if not user_email:
        # For guest checkout, we'll get email from Stripe
        # Use a placeholder for now
        user_email = "guest@cha-yuan.sg"

    try:
        result = create_checkout_session(
            cart_items=cart_summary["items"],
            user_email=user_email,
            success_url=data.success_url,
            cancel_url=data.cancel_url,
            cart_id=cart_id,
        )

        return CheckoutSessionResponseSchema(
            session_id=result["session_id"],
            checkout_url=result["url"],
            status=result["status"],
        )

    except ValueError as e:
        raise HttpError(400, str(e))
    except Exception as e:
        raise HttpError(500, f"Checkout error: {str(e)}")


@router.post("/webhook/", auth=None)
def stripe_webhook(request: HttpRequest):
    """
    Stripe webhook handler.

    Processes payment events from Stripe.
    Requires Stripe-Signature header.
    """
    payload = request.body
    sig_header = request.headers.get("Stripe-Signature", "")
    secret = settings.STRIPE_WEBHOOK_SECRET_SG

    # Verify signature
    try:
        verify_webhook_signature(payload, sig_header, secret)
    except ValueError as e:
        raise HttpError(400, str(e))

    # Parse event
    import json

    try:
        event = json.loads(payload)
    except json.JSONDecodeError:
        raise HttpError(400, "Invalid JSON payload")

    # Process event
    try:
        result = process_webhook_event(event)

        return {
            "status": result.get("status", "processed"),
            "message": result.get("message"),
            "order_id": result.get("order_id"),
            "order_number": result.get("order_number"),
        }

    except Exception as e:
        raise HttpError(500, f"Webhook processing error: {str(e)}")


@router.get("/summary/", response=CheckoutSummarySchema, auth=JWTAuth(required=False))
def get_checkout_summary(request: HttpRequest):
    """
    Get checkout summary with cart totals.

    Returns cart items and totals for checkout page.
    """
    cart_id = get_cart_id(request)
    summary = get_cart_summary(cart_id)

    return CheckoutSummarySchema(
        items=summary["items"],
        subtotal=str(summary["subtotal"]),
        gst_amount=str(summary["gst_amount"]),
        total=str(summary["total"]),
        item_count=summary["item_count"],
    )


@router.get("/config/", auth=None)
def get_checkout_config(request: HttpRequest):
    """
    Get Stripe publishable key and configuration.

    Used by frontend to initialize Stripe.js
    """
    return {
        "publishable_key": settings.STRIPE_PUBLISHABLE_KEY_SG,
        "currency": "sgd",
        "gst_rate": "0.09",
    }
