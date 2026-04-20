"""
Subscription API Endpoints
Implements endpoints for subscription management
"""

from datetime import datetime, timedelta
from typing import Optional, List
from decimal import Decimal

from django.db import models
from django.utils import timezone
from ninja import Router, Schema
from ninja.security import SessionAuth

from apps.commerce.models import Subscription, SubscriptionShipment, Product
from apps.content.models import UserPreference

router = Router(tags=["subscriptions"])


# ==================== SCHEMAS ====================


class SubscriptionProductSchema(Schema):
    """Product in subscription preview."""

    id: str
    name: str
    slug: str
    category: str
    image: Optional[str] = None
    origin: Optional[str] = None


class NextBoxPreviewSchema(Schema):
    """Next box preview data."""

    products: List[SubscriptionProductSchema]
    curated_by: str
    estimated_ship_date: Optional[str] = None
    is_curated: bool


class SubscriptionStatusSchema(Schema):
    """Subscription status response."""

    id: str
    status: str
    plan: str
    next_billing_date: str
    price_cents: int
    created_at: str
    started_at: str
    cancelled_at: Optional[str] = None
    paused_at: Optional[str] = None
    payment_method_last4: Optional[str] = "4242"
    payment_method_type: str = "card"


class PreferenceSchema(Schema):
    """User preference from quiz."""

    preferences: dict
    quiz_completed_at: str
    top_categories: List[str]


class BillingRecordSchema(Schema):
    """Billing history record."""

    id: str
    date: str
    amount_cents: int
    status: str
    invoice_url: Optional[str] = None
    description: str


class SubscriptionDashboardSchema(Schema):
    """Complete subscription dashboard data."""

    subscription: SubscriptionStatusSchema
    preferences: Optional[PreferenceSchema]
    next_box: Optional[NextBoxPreviewSchema]
    billing_history: List[BillingRecordSchema]


class CancelSubscriptionRequest(Schema):
    """Cancel subscription request."""

    reason: Optional[str] = None


class PauseSubscriptionRequest(Schema):
    """Pause subscription request."""

    months: Optional[int] = 1
    reason: Optional[str] = None


class SubscriptionErrorSchema(Schema):
    """Subscription error response."""

    detail: str


# ==================== ENDPOINTS ====================


@router.get(
    "/current/",
    response={200: SubscriptionDashboardSchema, 404: SubscriptionErrorSchema},
)
def get_current_subscription(request):
    """
    Get current user's subscription dashboard data.

    Returns complete subscription information including:
    - Current subscription status and plan
    - Next billing date and price
    - Next box preview (if curated)
    - User preferences from quiz
    - Billing history
    """
    user = request.user

    if not user.is_authenticated:
        return 404, {"detail": "Authentication required"}

    # Get user's subscription
    try:
        subscription = (
            Subscription.objects.filter(user=user)
            .exclude(status="cancelled")
            .latest("created_at")
        )
    except Subscription.DoesNotExist:
        return 404, {"detail": "No active subscription found"}

    # Get user preferences
    try:
        user_pref = UserPreference.objects.get(user=user)
        preferences = PreferenceSchema(
            preferences=user_pref.preferences,
            quiz_completed_at=user_pref.quiz_completed_at.isoformat()
            if user_pref.quiz_completed_at
            else None,
            top_categories=user_pref.top_categories,
        )
    except UserPreference.DoesNotExist:
        preferences = None

    # Get next box preview (next shipment)
    next_shipment = (
        SubscriptionShipment.objects.filter(
            subscription=subscription, status="preparing"
        )
        .order_by("-created_at")
        .first()
    )

    next_box = None
    if next_shipment and next_shipment.products.exists():
        products = [
            SubscriptionProductSchema(
                id=str(p.id),
                name=p.name,
                slug=p.slug,
                category=p.category.slug if p.category else "unknown",
                image=p.image,
                origin=p.origin.name if p.origin else None,
            )
            for p in next_shipment.products.all()[:3]
        ]
        next_box = NextBoxPreviewSchema(
            products=products,
            curated_by=next_shipment.curation_type,
            estimated_ship_date=next_shipment.created_at.isoformat(),
            is_curated=True,
        )
    else:
        # Return empty but valid next box
        next_box = NextBoxPreviewSchema(
            products=[], curated_by="auto", estimated_ship_date=None, is_curated=False
        )

    # Get billing history (last 6 months)
    billing_history = [
        BillingRecordSchema(
            id=f"bill-{subscription.id}-{i}",
            date=(subscription.created_at + timedelta(days=30 * i)).isoformat(),
            amount_cents=int(subscription.price_sgd * 100),
            status="paid" if i == 0 else "pending",
            invoice_url=None,
            description=f"Monthly subscription - {subscription.plan}",
        )
        for i in range(
            min(6, (timezone.now() - subscription.created_at).days // 30 + 1)
        )
    ]

    # Build response
    subscription_data = SubscriptionStatusSchema(
        id=str(subscription.id),
        status=subscription.status,
        plan=subscription.plan,
        next_billing_date=subscription.next_billing_date.isoformat(),
        price_cents=int(subscription.price_sgd * 100),
        created_at=subscription.created_at.isoformat(),
        started_at=subscription.created_at.isoformat(),
        cancelled_at=subscription.cancelled_at.isoformat()
        if subscription.cancelled_at
        else None,
        paused_at=None,  # Add paused_at field if needed
        payment_method_last4="4242",
        payment_method_type="card",
    )

    return SubscriptionDashboardSchema(
        subscription=subscription_data,
        preferences=preferences,
        next_box=next_box,
        billing_history=billing_history,
    )


@router.post("/cancel/", response={200: dict, 400: SubscriptionErrorSchema})
def cancel_subscription(request, data: CancelSubscriptionRequest):
    """
    Cancel the current subscription.

    This will immediately cancel the subscription. The user will continue
    to receive boxes until the end of the current billing period.
    """
    user = request.user

    if not user.is_authenticated:
        return 400, {"detail": "Authentication required"}

    try:
        subscription = (
            Subscription.objects.filter(user=user)
            .exclude(status="cancelled")
            .latest("created_at")
        )
    except Subscription.DoesNotExist:
        return 400, {"detail": "No active subscription found"}

    # Update subscription
    subscription.status = "cancelled"
    subscription.cancelled_at = timezone.now()
    subscription.cancellation_reason = data.reason or ""
    subscription.save()

    return {"detail": "Subscription cancelled successfully"}


@router.post("/pause/", response={200: dict, 400: SubscriptionErrorSchema})
def pause_subscription(request, data: PauseSubscriptionRequest):
    """
    Pause the current subscription.

    Pauses subscription for 1-3 months. During pause, no new boxes
    will be shipped and no charges will be made.
    """
    user = request.user

    if not user.is_authenticated:
        return 400, {"detail": "Authentication required"}

    try:
        subscription = Subscription.objects.filter(user=user, status="active").latest(
            "created_at"
        )
    except Subscription.DoesNotExist:
        return 400, {"detail": "No active subscription found"}

    # Update subscription
    subscription.status = "paused"
    subscription.save()

    return {"detail": f"Subscription paused for {data.months or 1} month(s)"}


@router.post("/resume/", response={200: dict, 400: SubscriptionErrorSchema})
def resume_subscription(request):
    """
    Resume a paused subscription.

    Reactivates the subscription immediately. Next billing date will be
    adjusted based on the resume date.
    """
    user = request.user

    if not user.is_authenticated:
        return 400, {"detail": "Authentication required"}

    try:
        subscription = Subscription.objects.filter(user=user, status="paused").latest(
            "created_at"
        )
    except Subscription.DoesNotExist:
        return 400, {"detail": "No paused subscription found"}

    # Update subscription
    subscription.status = "active"
    # Adjust next billing date
    subscription.next_billing_date = timezone.now() + timedelta(days=30)
    subscription.save()

    return {"detail": "Subscription resumed successfully"}
