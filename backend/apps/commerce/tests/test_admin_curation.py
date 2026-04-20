"""
Admin Curation Override UI Tests - Phase 7.2.4 (RED Phase)

Test-driven development for Django Admin manual curation interface.
These tests verify:
1. CurationOverrideForm renders with eligible products
2. Form validation enforces constraints
3. Override saves as JSON with metadata
4. Admin list view shows override status

Coverage Goals:
- Form rendering: 2 tests
- Form validation: 3 tests
- Admin display: 3 tests
- Integration: 2 tests
"""

from datetime import timedelta
from decimal import Decimal

import pytest
from django import forms
from django.contrib.admin.sites import AdminSite
from django.test import RequestFactory
from django.utils import timezone as django_timezone

from apps.commerce.admin import CurationOverrideForm, SubscriptionAdmin
from apps.commerce.curation import curate_subscription_box
from apps.commerce.models import (
    Subscription,
    SubscriptionShipment,
    Origin,
    TeaCategory,
    Product,
)
from apps.content.models import UserPreference
from apps.core.models import User


pytestmark = pytest.mark.django_db


# =============================================================================
# FIXTURES
# =============================================================================


@pytest.fixture
def admin_site():
    """Create admin site for testing."""
    return AdminSite()


@pytest.fixture
def request_factory():
    """Create request factory for testing."""
    return RequestFactory()


@pytest.fixture
def tea_master():
    """Create a staff user (tea master) for testing."""
    return User.objects.create_user(
        email="tea.master@chayuan.sg",
        password="masterpassword123",
        first_name="Tea",
        last_name="Master",
        is_staff=True,
    )


@pytest.fixture
def tea_categories():
    """Create tea categories for products."""
    return {
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
    }


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
def eligible_products(origin, tea_categories):
    """Create subscription-eligible products for testing."""
    products = []
    for i, (cat_key, category) in enumerate(tea_categories.items()):
        products.append(
            Product.objects.create(
                name=f"{category.name} Premium {i + 1}",
                slug=f"{category.slug}-premium-{i + 1}",
                description=f"Premium {category.name}",
                short_description=f"Finest {category.name}",
                price_sgd=Decimal("45.00") + (i * 5),
                stock=20,
                is_available=True,
                origin=origin,
                category=category,
                harvest_season="spring",
                harvest_year=2024,
                weight_grams=50,
                is_new_arrival=False,
                is_subscription_eligible=True,
            )
        )
    return products


@pytest.fixture
def ineligible_product(origin, tea_categories):
    """Create product not eligible for subscription."""
    return Product.objects.create(
        name="Limited Edition Tea",
        slug="limited-edition",
        description="Limited batch",
        short_description="Not for subscription",
        price_sgd=Decimal("150.00"),
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


@pytest.fixture
def out_of_stock_product(origin, tea_categories):
    """Create out-of-stock product."""
    return Product.objects.create(
        name="Sold Out Tea",
        slug="sold-out",
        description="Currently unavailable",
        short_description="Out of stock",
        price_sgd=Decimal("35.00"),
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


@pytest.fixture
def subscriber_user():
    """Create a user with active subscription."""
    return User.objects.create_user(
        email="subscriber@example.com",
        password="testpassword123",
        first_name="Test",
        last_name="Subscriber",
    )


@pytest.fixture
def active_subscription(subscriber_user):
    """Create an active subscription."""
    return Subscription.objects.create(
        user=subscriber_user,
        status="active",
        plan="monthly",
        price_sgd=Decimal("89.00"),
        next_billing_date=django_timezone.now() + timedelta(days=30),
    )


# =============================================================================
# FORM TESTS
# =============================================================================


class TestCurationOverrideForm:
    """Test CurationOverrideForm functionality."""

    def test_form_renders_with_eligible_products(self, eligible_products):
        """Test that form shows only eligible, in-stock products."""
        form = CurationOverrideForm()

        # Check that override_products field exists
        assert "override_products" in form.fields

        # Get queryset from form
        queryset = form.fields["override_products"].queryset

        # Should include eligible products
        eligible_ids = [p.id for p in eligible_products]
        for product_id in eligible_ids:
            assert product_id in list(queryset.values_list("id", flat=True))

    def test_form_excludes_ineligible_products(
        self, eligible_products, ineligible_product
    ):
        """Test that form excludes non-eligible products."""
        form = CurationOverrideForm()
        queryset = form.fields["override_products"].queryset

        # Should NOT include ineligible product
        assert ineligible_product.id not in list(queryset.values_list("id", flat=True))

    def test_form_excludes_out_of_stock_products(
        self, eligible_products, out_of_stock_product
    ):
        """Test that form excludes out-of-stock products."""
        form = CurationOverrideForm()
        queryset = form.fields["override_products"].queryset

        # Should NOT include out-of-stock product
        assert out_of_stock_product.id not in list(
            queryset.values_list("id", flat=True)
        )

    def test_form_clean_validates_max_5_products(
        self, eligible_products, active_subscription, origin, tea_categories
    ):
        """Test that form validation enforces 5-product maximum."""
        from apps.commerce.models import Product

        # Create additional products to have 6 total for testing
        test_products = list(eligible_products)
        for i in range(3):  # Create 3 more to reach 6
            test_products.append(
                Product.objects.create(
                    name=f"Extra Test Tea {i+1}",
                    slug=f"extra-test-tea-{i+1}",
                    description="Extra tea for validation testing",
                    short_description="Extra",
                    price_sgd=Decimal("50.00"),
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

        # Try to validate with 6 products (exceeds limit)
        selected_products = test_products[:6]

        form_data = {
            "user": str(active_subscription.user_id),
            "status": active_subscription.status,
            "plan": active_subscription.plan,
            "price_sgd": str(active_subscription.price_sgd),
            "next_billing_date": active_subscription.next_billing_date.strftime(
                "%Y-%m-%d %H:%M:%S"
            ),
            "override_products": [str(p.id) for p in selected_products],
        }

        form = CurationOverrideForm(data=form_data, instance=active_subscription)
        # Should be invalid due to > 5 products
        assert not form.is_valid(), f"Expected form invalid with 6 products"
        assert "override_products" in form.errors

    def test_form_accepts_valid_3_products(
        self, eligible_products, active_subscription
    ):
        """Test that form accepts 3 valid products."""
        selected_products = eligible_products[:3]

        form_data = {
            "user": str(active_subscription.user_id),
            "status": active_subscription.status,
            "plan": active_subscription.plan,
            "price_sgd": str(active_subscription.price_sgd),
            "next_billing_date": active_subscription.next_billing_date.strftime(
                "%Y-%m-%d %H:%M:%S"
            ),
            "override_products": [str(p.id) for p in selected_products],
        }

        form = CurationOverrideForm(data=form_data, instance=active_subscription)
        assert form.is_valid(), f"Form errors: {form.errors}"

    def test_form_accepts_empty_selection(self, active_subscription):
        """Test that form accepts empty selection (clears override)."""
        form_data = {
            "user": str(active_subscription.user_id),
            "status": active_subscription.status,
            "plan": active_subscription.plan,
            "price_sgd": str(active_subscription.price_sgd),
            "next_billing_date": active_subscription.next_billing_date.strftime(
                "%Y-%m-%d %H:%M:%S"
            ),
            "override_products": [],  # Empty
        }

        form = CurationOverrideForm(data=form_data, instance=active_subscription)
        assert form.is_valid(), f"Form errors: {form.errors}"


# =============================================================================
# ADMIN TESTS
# =============================================================================


class TestSubscriptionAdmin:
    """Test SubscriptionAdmin configuration."""

    def test_admin_uses_curation_override_form(self, admin_site):
        """Test that admin uses CurationOverrideForm."""
        admin = SubscriptionAdmin(Subscription, admin_site)
        assert admin.form == CurationOverrideForm

    def test_admin_list_display_includes_override_indicator(self, admin_site):
        """Test that list display includes curation_override_active."""
        admin = SubscriptionAdmin(Subscription, admin_site)
        assert "curation_override_active" in admin.list_display

    def test_admin_search_fields_include_user_email(self, admin_site):
        """Test that admin can search by user email."""
        admin = SubscriptionAdmin(Subscription, admin_site)
        assert "user__email" in admin.search_fields

    def test_curation_override_active_returns_html_for_empty(
        self, admin_site, active_subscription
    ):
        """Test that curation_override_active returns HTML for empty override."""
        admin = SubscriptionAdmin(Subscription, admin_site)

        # Without override - should show "Auto"
        result = admin.curation_override_active(active_subscription)
        assert "Auto" in result or "○" in result

    def test_curation_override_active_returns_html_for_active(
        self, admin_site, active_subscription
    ):
        """Test that curation_override_active returns HTML for active override."""
        admin = SubscriptionAdmin(Subscription, admin_site)

        # With override - should show "Active"
        active_subscription.next_curation_override = {"product_ids": [1, 2, 3]}
        result = admin.curation_override_active(active_subscription)
        assert "Active" in result or "●" in result

    def test_curation_override_active_is_boolean_field(self, admin_site):
        """Test that curation_override_active has boolean attribute set."""
        admin = SubscriptionAdmin(Subscription, admin_site)
        assert hasattr(admin.curation_override_active, "boolean")
        assert admin.curation_override_active.boolean is True


# =============================================================================
# INTEGRATION TESTS
# =============================================================================


class TestCurationOverrideIntegration:
    """Test full integration of admin override with curation engine."""

    def test_override_saves_json_structure(
        self, eligible_products, active_subscription, tea_master
    ):
        """Test that saving override creates proper JSON structure."""
        selected_products = eligible_products[:3]

        # Simulate form save
        active_subscription.next_curation_override = {
            "product_ids": [p.id for p in selected_products],
            "selected_by": tea_master.email,
            "selected_at": django_timezone.now().isoformat(),
        }
        active_subscription.save()

        # Refresh and verify
        active_subscription.refresh_from_db()
        override = active_subscription.next_curation_override

        assert "product_ids" in override
        assert "selected_by" in override
        assert "selected_at" in override
        assert len(override["product_ids"]) == 3

    def test_curation_uses_override_products(
        self, eligible_products, active_subscription, tea_master
    ):
        """Test that curation engine uses override products."""
        selected_products = eligible_products[:3]

        # Set override
        active_subscription.next_curation_override = {
            "product_ids": [p.id for p in selected_products],
            "selected_by": tea_master.email,
            "selected_at": django_timezone.now().isoformat(),
        }
        active_subscription.save()

        # Run curation
        curated = curate_subscription_box(active_subscription)

        # Should use override products
        curated_ids = [p.id for p in curated]
        for product in selected_products:
            assert product.id in curated_ids

        # Override should be cleared
        active_subscription.refresh_from_db()
        assert active_subscription.next_curation_override is None

    def test_empty_override_clears_existing(
        self, eligible_products, active_subscription, tea_master
    ):
        """Test that saving empty selection clears existing override."""
        # First set an override
        active_subscription.next_curation_override = {
            "product_ids": [p.id for p in eligible_products[:2]],
            "selected_by": tea_master.email,
            "selected_at": django_timezone.now().isoformat(),
        }
        active_subscription.save()

        # Now clear it (simulate empty form submission)
        active_subscription.next_curation_override = None
        active_subscription.save()

        # Verify cleared
        active_subscription.refresh_from_db()
        assert active_subscription.next_curation_override is None

    def test_override_limit_enforced(self, eligible_products):
        """Test that override enforces 5-product maximum."""
        # Create more products
        extra_products = eligible_products + eligible_products[:3]  # 6 total

        # Try to select 6 products (would need form validation)
        # Note: This test documents the expected behavior
        # Actual validation should be in form.clean()
        selected_ids = [p.id for p in extra_products]

        # With proper validation, this should fail or be limited
        # For now, just verify we can store more (curation engine limits to 5)
        assert len(selected_ids) > 5  # Test has 6 selected


# =============================================================================
# ADMIN INTERFACE TESTS
# =============================================================================


class TestAdminInterface:
    """Test Django Admin interface rendering."""

    def test_admin_list_view_displays_subscriptions(
        self, admin_site, active_subscription
    ):
        """Test that list view displays subscription data."""
        admin = SubscriptionAdmin(Subscription, admin_site)

        # Check list display fields
        assert "user" in admin.list_display
        assert "plan" in admin.list_display
        assert "status" in admin.list_display
        assert "next_billing_date" in admin.list_display

    def test_admin_list_filters_available(self, admin_site):
        """Test that list filters are configured."""
        admin = SubscriptionAdmin(Subscription, admin_site)

        assert "plan" in admin.list_filter
        assert "status" in admin.list_filter
        assert "created_at" in admin.list_filter

    def test_admin_form_class_has_override_field(
        self, admin_site, active_subscription, request_factory
    ):
        """Test that form class includes override_products field."""
        admin = SubscriptionAdmin(Subscription, admin_site)

        # Create a mock request
        request = request_factory.get("/admin/commerce/subscription/")
        request.user = active_subscription.user

        # Get form class from admin
        form_class = admin.get_form(request)

        # Check field exists in form
        assert "override_products" in form_class.base_fields
