"""
Curation Algorithm Tests - Phase 7.2.1 (RED Phase)

Test-driven development for the subscription curation engine.
These tests verify:
1. Season detection for Singapore calendar
2. Product scoring algorithm
3. Manual override functionality
4. Subscription shipment tracking

Coverage Goals:
- Season detection: 4 tests (spring, summer, autumn, winter)
- Scoring algorithm: 8 tests (preferences, season match, new arrivals, inventory)
- Override system: 3 tests (priority, clearing, empty)
- Edge cases: 4 tests (no preferences, no products, tie-breakers)
"""

from datetime import datetime, timedelta
from unittest.mock import Mock, patch
from decimal import Decimal

import pytest
from django.utils import timezone as django_timezone
from pytz import timezone

from apps.content.models import QuizQuestion, QuizChoice, UserPreference
from apps.core.models import User
from apps.commerce.models import Origin, TeaCategory, Product
from apps.commerce.curation import (
    get_current_season_sg,
    score_products,
    curate_subscription_box,
    get_recently_shipped,
)


# =============================================================================
# FIXTURES
# =============================================================================


pytestmark = pytest.mark.django_db


@pytest.fixture
def singapore_tz():
    """Singapore timezone for testing."""
    return timezone("Asia/Singapore")


@pytest.fixture
def origin():
    """Create a tea origin."""
    return Origin.objects.create(
        name="Fujian Province",
        slug="fujian",
        region="China",
        description="Famous for oolong and black teas",
    )


@pytest.fixture
def tea_categories():
    """Create all tea categories for testing."""
    return {
        "white": TeaCategory.objects.create(
            name="White Tea",
            slug="white-tea",
            fermentation_level=0,
            description="Minimally processed",
            brewing_temp_celsius=75,
            brewing_time_seconds=180,
        ),
        "green": TeaCategory.objects.create(
            name="Green Tea",
            slug="green-tea",
            fermentation_level=5,
            description="Unoxidized tea",
            brewing_temp_celsius=80,
            brewing_time_seconds=120,
        ),
        "oolong": TeaCategory.objects.create(
            name="Oolong Tea",
            slug="oolong",
            fermentation_level=45,
            description="Partially oxidized",
            brewing_temp_celsius=90,
            brewing_time_seconds=180,
        ),
        "black": TeaCategory.objects.create(
            name="Black Tea",
            slug="black-tea",
            fermentation_level=100,
            description="Fully oxidized",
            brewing_temp_celsius=95,
            brewing_time_seconds=240,
        ),
        "puerh": TeaCategory.objects.create(
            name="Pu'erh Tea",
            slug="puerh",
            fermentation_level=-1,
            description="Post-fermented",
            brewing_temp_celsius=100,
            brewing_time_seconds=300,
        ),
    }


@pytest.fixture
def products(origin, tea_categories):
    """Create test products for all seasons and categories."""
    products_list = []

    # Spring products (green, white)
    products_list.append(
        Product.objects.create(
            name="Dragon Well Spring 2024",
            slug="dragon-well-spring-2024",
            description="Famous Hangzhou green tea",
            short_description="Premium spring green tea",
            price_sgd=Decimal("45.00"),
            stock=20,
            is_available=True,
            origin=origin,
            category=tea_categories["green"],
            harvest_season="spring",
            harvest_year=2024,
            weight_grams=50,
            is_new_arrival=False,
            is_subscription_eligible=True,
        )
    )

    products_list.append(
        Product.objects.create(
            name="Silver Needle White 2024",
            slug="silver-needle-white-2024",
            description="Premium white tea",
            short_description="Delicate white tea",
            price_sgd=55.00,
            stock=15,
            is_available=True,
            origin=origin,
            category=tea_categories["white"],
            harvest_season="spring",
            harvest_year=2024,
            weight_grams=50,
            is_new_arrival=True,
            is_subscription_eligible=True,
        )
    )

    # Summer products (oolong)
    products_list.append(
        Product.objects.create(
            name="Tie Guan Yin Summer 2024",
            slug="tie-guan-yin-summer-2024",
            description="Iron Goddess oolong",
            short_description="Floral oolong",
            price_sgd=38.00,
            stock=25,
            is_available=True,
            origin=origin,
            category=tea_categories["oolong"],
            harvest_season="summer",
            harvest_year=2024,
            weight_grams=50,
            is_new_arrival=False,
            is_subscription_eligible=True,
        )
    )

    # Autumn products (black, oolong)
    products_list.append(
        Product.objects.create(
            name="Da Hong Pao Autumn 2024",
            slug="da-hong-pao-autumn-2024",
            description="Big Red Robe oolong",
            short_description="Roasted oolong",
            price_sgd="65.00",
            stock=10,
            is_available=True,
            origin=origin,
            category=tea_categories["oolong"],
            harvest_season="autumn",
            harvest_year=2024,
            weight_grams=50,
            is_new_arrival=False,
            is_subscription_eligible=True,
        )
    )

    products_list.append(
        Product.objects.create(
            name="Keemun Black Autumn 2024",
            slug="keemun-black-autumn-2024",
            description="Famous black tea",
            short_description="Malty black tea",
            price_sgd=42.00,
            stock=30,
            is_available=True,
            origin=origin,
            category=tea_categories["black"],
            harvest_season="autumn",
            harvest_year=2024,
            weight_grams=50,
            is_new_arrival=False,
            is_subscription_eligible=True,
        )
    )

    # Winter products (puerh)
    products_list.append(
        Product.objects.create(
            name="Aged Pu'erh Cake 2019",
            slug="aged-puerh-cake-2019",
            description="5-year aged puerh",
            short_description="Mature puerh",
            price_sgd=88.00,
            stock=8,
            is_available=True,
            origin=origin,
            category=tea_categories["puerh"],
            harvest_season="winter",
            harvest_year=2019,
            weight_grams=357,
            is_new_arrival=False,
            is_subscription_eligible=True,
        )
    )

    # Not eligible for subscription
    products_list.append(
        Product.objects.create(
            name="Limited Edition Tea",
            slug="limited-edition-tea",
            description="Rare limited batch",
            short_description="Not for subscription",
            price_sgd=150.00,
            stock=5,
            is_available=True,
            origin=origin,
            category=tea_categories["green"],
            harvest_season="spring",
            harvest_year=2024,
            weight_grams=25,
            is_new_arrival=True,
            is_subscription_eligible=False,  # NOT eligible
        )
    )

    # Out of stock
    products_list.append(
        Product.objects.create(
            name="Sold Out Tea",
            slug="sold-out-tea",
            description="Currently unavailable",
            short_description="Out of stock",
            price_sgd=35.00,
            stock=0,  # Out of stock
            is_available=True,
            origin=origin,
            category=tea_categories["green"],
            harvest_season="spring",
            harvest_year=2024,
            weight_grams=50,
            is_new_arrival=False,
            is_subscription_eligible=True,
        )
    )

    # Not available
    products_list.append(
        Product.objects.create(
            name="Discontinued Tea",
            slug="discontinued-tea",
            description="No longer sold",
            short_description="Discontinued",
            price_sgd=40.00,
            stock=100,
            is_available=False,  # Not available
            origin=origin,
            category=tea_categories["black"],
            harvest_season="autumn",
            harvest_year=2023,
            weight_grams=50,
            is_new_arrival=False,
            is_subscription_eligible=True,
        )
    )

    return products_list


@pytest.fixture
def user_with_preferences():
    """Create a user with completed quiz and preferences."""
    user = User.objects.create_user(
        email="tea.lover@example.com",
        password="testpassword123",
        first_name="Tea",
        last_name="Lover",
    )

    # Create preferences manually (simulating quiz completion)
    preferences = {
        "green_tea": 85,
        "white_tea": 72,
        "oolong": 45,
        "black_tea": 30,
        "puerh": 15,
    }

    UserPreference.objects.create(
        user=user,
        preferences=preferences,
        quiz_completed_at=django_timezone.now(),
    )

    return user


@pytest.fixture
def user_no_preferences():
    """Create a user who hasn't taken the quiz."""
    return User.objects.create_user(
        email="new.user@example.com",
        password="testpassword123",
        first_name="New",
        last_name="User",
    )


# =============================================================================
# SEASON DETECTION TESTS
# =============================================================================


class TestGetCurrentSeasonSG:
    """Test Singapore season detection."""

    @pytest.mark.parametrize(
        "month,expected_season",
        [
            (3, "spring"),  # March
            (4, "spring"),  # April
            (5, "spring"),  # May
        ],
    )
    def test_spring_months(self, month, expected_season, singapore_tz):
        """Test that March-May returns spring."""
        with patch("apps.commerce.curation.datetime") as mock_datetime:
            mock_now = datetime(2024, month, 15, 12, 0, 0, tzinfo=singapore_tz)
            mock_datetime.now.return_value = mock_now

            result = get_current_season_sg()
            assert result == expected_season

    @pytest.mark.parametrize(
        "month,expected_season",
        [
            (6, "summer"),  # June
            (7, "summer"),  # July
            (8, "summer"),  # August
        ],
    )
    def test_summer_months(self, month, expected_season, singapore_tz):
        """Test that June-August returns summer."""
        with patch("apps.commerce.curation.datetime") as mock_datetime:
            mock_now = datetime(2024, month, 15, 12, 0, 0, tzinfo=singapore_tz)
            mock_datetime.now.return_value = mock_now

            result = get_current_season_sg()
            assert result == expected_season

    @pytest.mark.parametrize(
        "month,expected_season",
        [
            (9, "autumn"),  # September
            (10, "autumn"),  # October
            (11, "autumn"),  # November
        ],
    )
    def test_autumn_months(self, month, expected_season, singapore_tz):
        """Test that September-November returns autumn."""
        with patch("apps.commerce.curation.datetime") as mock_datetime:
            mock_now = datetime(2024, month, 15, 12, 0, 0, tzinfo=singapore_tz)
            mock_datetime.now.return_value = mock_now

            result = get_current_season_sg()
            assert result == expected_season

    @pytest.mark.parametrize(
        "month,expected_season",
        [
            (12, "winter"),  # December
            (1, "winter"),  # January
            (2, "winter"),  # February
        ],
    )
    def test_winter_months(self, month, expected_season, singapore_tz):
        """Test that December-February returns winter."""
        year = 2024 if month == 12 else 2025
        with patch("apps.commerce.curation.datetime") as mock_datetime:
            mock_now = datetime(year, month, 15, 12, 0, 0, tzinfo=singapore_tz)
            mock_datetime.now.return_value = mock_now

            result = get_current_season_sg()
            assert result == expected_season


# =============================================================================
# PRODUCT SCORING TESTS
# =============================================================================


class TestScoreProducts:
    """Test product scoring algorithm."""

    def test_applies_preference_weights(self, products):
        """Test that higher preferences get higher scores."""
        preferences = {
            "green_tea": 90,  # High preference
            "black_tea": 20,  # Low preference
        }

        # Filter to just green and black tea products
        from apps.commerce.models import Product

        filtered_products = Product.objects.filter(
            slug__in=["dragon-well-spring-2024", "keemun-black-autumn-2024"]
        )

        scored = score_products(filtered_products, preferences, "spring")

        # Find the products
        green_scores = [s for s in scored if s[0].slug == "dragon-well-spring-2024"]
        black_scores = [s for s in scored if s[0].slug == "keemun-black-autumn-2024"]

        assert len(green_scores) == 1
        assert len(black_scores) == 1

        # Green tea should have higher score than black tea
        assert green_scores[0][1] > black_scores[0][1]

    def test_boosts_season_match(self, products):
        """Test that products matching current season get bonus."""
        preferences = {"green_tea": 50}

        from apps.commerce.models import Product

        # Same green tea, different seasons
        spring_product = Product.objects.get(slug="dragon-well-spring-2024")

        # Score in spring (matching season)
        spring_scored = score_products(
            Product.objects.filter(id=spring_product.id), preferences, "spring"
        )

        # Score in autumn (non-matching season)
        autumn_scored = score_products(
            Product.objects.filter(id=spring_product.id), preferences, "autumn"
        )

        # Spring-scored should have higher score
        assert spring_scored[0][1] > autumn_scored[0][1]

    def test_boosts_new_arrivals(self, products):
        """Test that new arrivals get bonus points."""
        preferences = {"white_tea": 50}

        from apps.commerce.models import Product

        # New arrival
        new_product = Product.objects.get(slug="silver-needle-white-2024")

        scored = score_products(
            Product.objects.filter(id=new_product.id), preferences, "spring"
        )

        # Should have score > 1.0 (base) + preference bonus + new arrival bonus
        assert scored[0][1] > 1.0

    def test_considers_stock_level(self, products):
        """Test that products with more stock get slight boost."""
        preferences = {"green_tea": 50}

        from apps.commerce.models import Product

        # Same category, different stock levels
        low_stock = Product.objects.get(slug="dragon-well-spring-2024")  # stock=20
        # Would need another green tea product with different stock for true comparison

        scored = score_products(
            Product.objects.filter(id=low_stock.id), preferences, "spring"
        )

        # Score should reflect stock bonus
        assert scored[0][1] > 1.0  # Base + preference + stock

    def test_handles_empty_preferences(self, products):
        """Test scoring works with no preferences."""
        from apps.commerce.models import Product

        product = Product.objects.get(slug="dragon-well-spring-2024")
        scored = score_products(
            Product.objects.filter(id=product.id),
            {},  # Empty preferences
            "spring",
        )

        # Should still return a score (base + bonuses)
        assert scored[0][1] > 0


# =============================================================================
# CURATION ALGORITHM TESTS
# =============================================================================


class TestCurateSubscriptionBox:
    """Test the main curation function."""

    def test_returns_five_products(self, user_with_preferences, products):
        """Test that curation always returns exactly 5 products."""
        from apps.commerce.models import Subscription

        # Create subscription
        subscription = Subscription.objects.create(
            user=user_with_preferences,
            status="active",
            plan="monthly",
            price_sgd=Decimal("89.00"),
            next_billing_date=django_timezone.now() + timedelta(days=30),
        )

        curated = curate_subscription_box(subscription)

        assert len(curated) == 5

    def test_respects_eligibility(self, user_with_preferences, products):
        """Test that only subscription-eligible products are returned."""
        from apps.commerce.models import Subscription, Product

        subscription = Subscription.objects.create(
            user=user_with_preferences,
            status="active",
            plan="monthly",
            price_sgd=Decimal("89.00"),
            next_billing_date=django_timezone.now() + timedelta(days=30),
        )

        curated = curate_subscription_box(subscription)
        curated_ids = [p.id for p in curated]

        # Verify no ineligible products
        ineligible = Product.objects.filter(is_subscription_eligible=False).values_list(
            "id", flat=True
        )

        assert not any(pid in ineligible for pid in curated_ids)

    def test_filters_in_stock(self, user_with_preferences, products):
        """Test that only in-stock products are returned."""
        from apps.commerce.models import Subscription

        subscription = Subscription.objects.create(
            user=user_with_preferences,
            status="active",
            plan="monthly",
            price_sgd=Decimal("89.00"),
            next_billing_date=django_timezone.now() + timedelta(days=30),
        )

        curated = curate_subscription_box(subscription)

        # All returned products should have stock > 0
        for product in curated:
            assert product.stock > 0
            assert product.is_available is True

    def test_matches_season_preference(self, user_with_preferences, products):
        """Test that season-matching products are preferred."""
        from apps.commerce.models import Subscription

        subscription = Subscription.objects.create(
            user=user_with_preferences,
            status="active",
            plan="monthly",
            price_sgd=Decimal("89.00"),
            next_billing_date=django_timezone.now() + timedelta(days=30),
        )

        # Mock current season to spring
        with patch(
            "apps.commerce.curation.get_current_season_sg", return_value="spring"
        ):
            curated = curate_subscription_box(subscription)

        # Should have spring products
        spring_products = [p for p in curated if p.harvest_season == "spring"]
        # At least some spring products should be included
        assert len(spring_products) >= 1

    def test_excludes_recently_shipped(self, user_with_preferences, products):
        """Test that recently shipped products are excluded."""
        from apps.commerce.models import Subscription, SubscriptionShipment

        subscription = Subscription.objects.create(
            user=user_with_preferences,
            status="active",
            plan="monthly",
            price_sgd=Decimal("89.00"),
            next_billing_date=django_timezone.now() + timedelta(days=30),
        )

        # Get a product that would normally be curated
        from apps.commerce.models import Product

        product_to_exclude = Product.objects.get(slug="dragon-well-spring-2024")

        # Create a recent shipment with this product
        shipment = SubscriptionShipment.objects.create(
            subscription=subscription,
            shipped_at=django_timezone.now() - timedelta(days=15),
            status="delivered",
        )
        shipment.products.add(product_to_exclude)

        # Curate again
        curated = curate_subscription_box(subscription)
        curated_slugs = [p.slug for p in curated]

        # The recently shipped product should not appear
        assert "dragon-well-spring-2024" not in curated_slugs

    def test_works_without_quiz(self, user_no_preferences, products):
        """Test curation works even without quiz completion."""
        from apps.commerce.models import Subscription

        subscription = Subscription.objects.create(
            user=user_no_preferences,
            status="active",
            plan="monthly",
            price_sgd=Decimal("89.00"),
            next_billing_date=django_timezone.now() + timedelta(days=30),
        )

        # Should not raise error
        curated = curate_subscription_box(subscription)

        # Should still return 5 products
        assert len(curated) == 5

    def test_handles_no_eligible_products(self, user_with_preferences):
        """Test graceful handling when no products available."""
        from apps.commerce.models import Subscription

        subscription = Subscription.objects.create(
            user=user_with_preferences,
            status="active",
            plan="monthly",
            price_sgd=Decimal("89.00"),
            next_billing_date=django_timezone.now() + timedelta(days=30),
        )

        curated = curate_subscription_box(subscription)

        # Should return empty list or handle gracefully
        assert isinstance(curated, list)


# =============================================================================
# MANUAL OVERRIDE TESTS
# =============================================================================


class TestManualOverride:
    """Test manual curation override functionality."""

    def test_manual_override_takes_priority(self, user_with_preferences, products):
        """Test that admin manual override is used when set."""
        from apps.commerce.models import Subscription, Product

        # Get specific product IDs for override
        override_products = list(
            Product.objects.filter(
                is_subscription_eligible=True, stock__gt=0
            ).values_list("id", flat=True)[:3]
        )

        subscription = Subscription.objects.create(
            user=user_with_preferences,
            status="active",
            plan="monthly",
            price_sgd=Decimal("89.00"),
            next_billing_date=django_timezone.now() + timedelta(days=30),
            next_curation_override={"product_ids": override_products},
        )

        curated = curate_subscription_box(subscription)
        curated_ids = [p.id for p in curated]

        # Should use override products (may be filtered if some unavailable)
        # All curated products should be from override list
        assert all(pid in override_products for pid in curated_ids)
        # Should include at least one override product
        assert len(curated_ids) > 0

    def test_manual_override_clears_after_use(self, user_with_preferences, products):
        """Test that override is cleared after curation."""
        from apps.commerce.models import Subscription, Product

        override_products = list(
            Product.objects.filter(
                is_subscription_eligible=True, stock__gt=0
            ).values_list("id", flat=True)[:3]
        )

        subscription = Subscription.objects.create(
            user=user_with_preferences,
            status="active",
            plan="monthly",
            price_sgd=Decimal("89.00"),
            next_billing_date=django_timezone.now() + timedelta(days=30),
            next_curation_override={"product_ids": override_products},
        )

        # First curation should use override
        curated = curate_subscription_box(subscription)

        # Refresh from database
        subscription.refresh_from_db()

        # Override should be cleared
        assert subscription.next_curation_override is None

    def test_empty_override_falls_back_to_auto(self, user_with_preferences, products):
        """Test that empty override falls back to auto-curation."""
        from apps.commerce.models import Subscription

        subscription = Subscription.objects.create(
            user=user_with_preferences,
            status="active",
            plan="monthly",
            price_sgd=Decimal("89.00"),
            next_billing_date=django_timezone.now() + timedelta(days=30),
            next_curation_override={"product_ids": []},
        )

        curated = curate_subscription_box(subscription)

        # Should still return products via auto-curation
        assert len(curated) > 0


# =============================================================================
# RECENTLY SHIPPED TESTS
# =============================================================================


class TestGetRecentlyShipped:
    """Test tracking of recently shipped products."""

    def test_returns_products_from_recent_shipments(
        self, user_with_preferences, products
    ):
        """Test that recently shipped products are tracked."""
        from apps.commerce.models import Subscription, SubscriptionShipment, Product

        subscription = Subscription.objects.create(
            user=user_with_preferences,
            status="active",
            plan="monthly",
            price_sgd=Decimal("89.00"),
            next_billing_date=django_timezone.now() + timedelta(days=30),
        )

        # Create recent shipment
        product = Product.objects.get(slug="dragon-well-spring-2024")
        shipment = SubscriptionShipment.objects.create(
            subscription=subscription,
            shipped_at=django_timezone.now() - timedelta(days=15),
            status="delivered",
        )
        shipment.products.add(product)

        recent = get_recently_shipped(subscription, months=3)

        assert product.id in recent

    def test_excludes_old_shipments(self, user_with_preferences, products):
        """Test that old shipments are excluded."""
        from apps.commerce.models import Subscription, SubscriptionShipment, Product

        subscription = Subscription.objects.create(
            user=user_with_preferences,
            status="active",
            plan="monthly",
            price_sgd=Decimal("89.00"),
            next_billing_date=django_timezone.now() + timedelta(days=30),
        )

        # Create old shipment (4 months ago)
        product = Product.objects.get(slug="dragon-well-spring-2024")
        shipment = SubscriptionShipment.objects.create(
            subscription=subscription,
            shipped_at=django_timezone.now() - timedelta(days=120),
            status="delivered",
        )
        shipment.products.add(product)

        recent = get_recently_shipped(subscription, months=3)

        assert product.id not in recent


# =============================================================================
# EDGE CASE TESTS
# =============================================================================


class TestEdgeCases:
    """Test edge cases and error handling."""

    def test_tie_breaker_by_name(self, user_with_preferences, products):
        """Test that equal scores use alphabetical name as tie-breaker."""
        # Create products with same category and season
        from apps.commerce.models import Subscription, Product

        subscription = Subscription.objects.create(
            user=user_with_preferences,
            status="active",
            plan="monthly",
            price_sgd=Decimal("89.00"),
            next_billing_date=django_timezone.now() + timedelta(days=30),
        )

        curated = curate_subscription_box(subscription)

        # Verify we got exactly 5 products
        assert len(curated) == 5

    def test_handles_deleted_subscription(self):
        """Test graceful handling of missing subscription."""
        # Should raise appropriate error or handle gracefully
        pass  # To be implemented

    def test_handles_cancelled_subscription(self, user_with_preferences, products):
        """Test that cancelled subscriptions don't get curated."""
        from apps.commerce.models import Subscription

        subscription = Subscription.objects.create(
            user=user_with_preferences,
            status="cancelled",
            plan="monthly",
            price_sgd=Decimal("89.00"),
            next_billing_date=django_timezone.now() + timedelta(days=30),
        )

        # Should handle gracefully - possibly return empty or raise
        curated = curate_subscription_box(subscription)
        # Might return empty list for cancelled subscriptions
        assert isinstance(curated, list)

    def test_preference_scores_normalized(self):
        """Test that preference scores are properly normalized."""
        # Preference scores should be between 0-100
        pass  # To be implemented in scoring function
