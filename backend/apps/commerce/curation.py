"""
Curation Engine - Phase 7.2

Personalized tea subscription curation algorithm.
Matches user preferences with seasonal availability and inventory.

Weighting:
- User preferences: 60%
- Seasonal availability: 30%
- Inventory levels: 10%

Singapore Seasons:
- Spring: March-May (best for green/white teas)
- Summer: June-August (oolong harvest)
- Autumn: September-November (black tea peak)
- Winter: December-February (limited harvest)
"""

from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Optional
from collections import defaultdict
from decimal import Decimal

from pytz import timezone
from django.db.models import QuerySet

from apps.commerce.models import Product, Subscription, SubscriptionShipment
from apps.content.models import UserPreference


# =============================================================================
# SEASON DETECTION
# =============================================================================


def get_current_season_sg() -> str:
    """
    Determine harvest season based on Singapore timezone.

    Singapore is tropical (equatorial), but we map to traditional
    tea harvesting seasons:
    - Spring: March-May (best for green/white teas)
    - Summer: June-August (oolong harvest)
    - Autumn: September-November (black tea peak)
    - Winter: December-February (limited harvest)

    Returns:
        One of: 'spring', 'summer', 'autumn', 'winter'
    """
    sg_now = datetime.now(timezone("Asia/Singapore"))
    month = sg_now.month

    if 3 <= month <= 5:
        return "spring"
    elif 6 <= month <= 8:
        return "summer"
    elif 9 <= month <= 11:
        return "autumn"
    else:
        return "winter"


# =============================================================================
# RECENTLY SHIPPED TRACKING
# =============================================================================


def get_recently_shipped(subscription: Subscription, months: int = 3) -> List[int]:
    """
    Get product IDs shipped in last N months.

    Args:
        subscription: User's subscription
        months: Number of months to look back (default: 3)

    Returns:
        List of product IDs recently shipped
    """
    cutoff = datetime.now(timezone("Asia/Singapore")) - timedelta(days=30 * months)

    shipments = SubscriptionShipment.objects.filter(
        subscription=subscription, shipped_at__gte=cutoff
    ).prefetch_related("products")

    product_ids = set()
    for shipment in shipments:
        for product in shipment.products.all():
            product_ids.add(product.id)

    return list(product_ids)


# =============================================================================
# PRODUCT SCORING
# =============================================================================


def score_products(
    products: QuerySet, preferences: Dict[str, int], current_season: str
) -> List[Tuple[Product, float]]:
    """
    Score products based on user preferences and attributes.

    Scoring Algorithm:
    - Base score: 1.0
    - Category preference: +0.6 * (preference / 100) [60% weight]
    - Season match: +0.3 [30% weight]
    - New arrival: +0.3 bonus
    - Stock level: +0.1 * (stock / 10, max 1.0) [10% weight]

    Args:
        products: QuerySet of products to score
        preferences: Dict mapping category_slug to preference score (0-100)
        current_season: Current season ('spring', 'summer', 'autumn', 'winter')

    Returns:
        List of (product, score) tuples sorted by score descending
    """
    scored = []

    for product in products:
        score = 1.0  # Base score

        # Category preference boost (60% weight)
        category_slug = product.category.slug
        if category_slug in preferences:
            normalized_pref = preferences[category_slug] / 100.0
            score += 0.6 * normalized_pref

        # Season match boost (30% weight)
        if product.harvest_season == current_season:
            score += 0.3

        # New arrival bonus
        if product.is_new_arrival:
            score += 0.3

        # Stock level boost (10% weight, capped at 1.0)
        stock_bonus = min(1.0, product.stock / 10.0) * 0.1
        score += stock_bonus

        scored.append((product, score))

    # Sort by score descending, then by name for tie-breaker
    scored.sort(key=lambda x: (-x[1], x[0].name))

    return scored


# =============================================================================
# MAIN CURATION FUNCTION
# =============================================================================


def curate_subscription_box(
    subscription: Subscription, force_auto: bool = False
) -> List[Product]:
    """
    Curate 5 products for a subscription box.

    Algorithm:
    1. Check for manual override - use if present
    2. Get user preferences (if quiz completed)
    3. Get eligible, in-stock products
    4. Exclude recently shipped products (3 months)
    5. Score products based on preferences + season + inventory
    6. Return top 5 products

    Args:
        subscription: User's subscription
        force_auto: If True, ignore manual override

    Returns:
        List of 5 Product objects for the subscription box
    """
    # Check for manual override first
    if not force_auto and subscription.next_curation_override:
        product_ids = subscription.next_curation_override.get("product_ids", [])

        if product_ids:
            # Fetch override products
            products = Product.objects.filter(
                id__in=product_ids,
                is_subscription_eligible=True,
                stock__gt=0,
                is_available=True,
            )

            # Clear override after use
            subscription.next_curation_override = None
            subscription.save(update_fields=["next_curation_override"])

            return list(products)[:5]

    # Get user preferences
    preferences = {}
    try:
        user_pref = subscription.user.preference
        if user_pref.has_completed_quiz():
            preferences = user_pref.preferences
    except UserPreference.DoesNotExist:
        pass  # No preferences, use default scoring

    # Get eligible products
    eligible_products = Product.objects.filter(
        is_subscription_eligible=True, stock__gt=0, is_available=True
    )

    # Exclude recently shipped
    recently_shipped = get_recently_shipped(subscription, months=3)
    if recently_shipped:
        eligible_products = eligible_products.exclude(id__in=recently_shipped)

    # Get current season
    current_season = get_current_season_sg()

    # Score and sort products
    scored_products = score_products(eligible_products, preferences, current_season)

    # Return top 5
    return [product for product, _ in scored_products[:5]]


# =============================================================================
# MANUAL CURATION OVERRIDE
# =============================================================================


def set_manual_override(subscription: Subscription, product_ids: List[int]) -> None:
    """
    Set manual curation override for next shipment.

    Tea masters can use this to manually select products
    for a specific subscription.

    Args:
        subscription: User's subscription
        product_ids: List of product IDs to include
    """
    # Validate products
    valid_products = Product.objects.filter(
        id__in=product_ids,
        is_subscription_eligible=True,
        stock__gt=0,
        is_available=True,
    )

    valid_ids = list(valid_products.values_list("id", flat=True))

    subscription.next_curation_override = {"product_ids": valid_ids}
    subscription.save(update_fields=["next_curation_override"])


def clear_manual_override(subscription: Subscription) -> None:
    """
    Clear manual curation override.

    Args:
        subscription: User's subscription
    """
    subscription.next_curation_override = None
    subscription.save(update_fields=["next_curation_override"])


# =============================================================================
# SHIPMENT CREATION
# =============================================================================


def create_shipment(
    subscription: Subscription,
    products: List[Product],
    tracking_number: Optional[str] = None,
) -> SubscriptionShipment:
    """
    Create a new subscription shipment.

    Args:
        subscription: User's subscription
        products: List of products in this shipment
        tracking_number: Optional tracking number

    Returns:
        Created SubscriptionShipment
    """
    shipment = SubscriptionShipment.objects.create(
        subscription=subscription,
        status="preparing",
        tracking_number=tracking_number or "",
    )

    shipment.products.set(products)

    return shipment
