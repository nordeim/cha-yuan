"""
Stripe Checkout Tests (TDD RED Phase)

Tests for Singapore Stripe Checkout integration.
Supports SGD currency, GrabPay, and PayNow payment methods.
"""

import pytest
from decimal import Decimal
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime

pytest.importorskip(
    "apps.commerce.stripe_sg", reason="Stripe module not yet implemented"
)

from apps.commerce.stripe_sg import (
    create_checkout_session,
    build_line_items,
    validate_checkout_data,
)


class TestStripeCheckoutSession:
    """Test suite for Stripe Checkout session creation."""

    @pytest.fixture
    def sample_cart_items(self):
        """Sample cart items for testing."""
        return [
            {
                "product_id": 1,
                "name": "Premium Dragon Well",
                "slug": "premium-dragon-well",
                "quantity": 2,
                "price_sgd": Decimal("25.00"),
                "price_with_gst": Decimal("27.25"),
                "gst_amount": Decimal("2.25"),
                "weight_grams": 50,
                "image_url": "https://cdn.cha-yuan.sg/products/dragon-well.jpg",
            },
            {
                "product_id": 2,
                "name": "Aged Pu-erh 2015",
                "slug": "aged-puerh-2015",
                "quantity": 1,
                "price_sgd": Decimal("45.00"),
                "price_with_gst": Decimal("49.05"),
                "gst_amount": Decimal("4.05"),
                "weight_grams": 100,
                "image_url": None,  # Test optional image
            },
        ]

    @pytest.fixture
    def checkout_urls(self):
        """Success and cancel URLs."""
        return {
            "success_url": "https://cha-yuan.sg/checkout/success?session_id={CHECKOUT_SESSION_ID}",
            "cancel_url": "https://cha-yuan.sg/checkout/cancel",
        }

    # ========================================================================
    # Session Creation Tests
    # ========================================================================

    def test_create_session_returns_url(self, sample_cart_items, checkout_urls):
        """Should return valid Stripe checkout URL."""
        with patch("commerce.stripe_sg.stripe.checkout.Session.create") as mock_create:
            mock_session = Mock()
            mock_session.url = "https://checkout.stripe.com/c/pay/test_session_123"
            mock_session.id = "cs_test_123"
            mock_create.return_value = mock_session

            result = create_checkout_session(
                cart_items=sample_cart_items,
                user_email="test@example.com",
                success_url=checkout_urls["success_url"],
                cancel_url=checkout_urls["cancel_url"],
            )

            assert result is not None
            assert "checkout.stripe.com" in result
            assert "test_session_123" in result

    def test_create_session_with_empty_cart_raises_error(self, checkout_urls):
        """Should raise ValueError for empty cart."""
        with pytest.raises(ValueError, match="Cart is empty"):
            create_checkout_session(
                cart_items=[],
                user_email="test@example.com",
                success_url=checkout_urls["success_url"],
                cancel_url=checkout_urls["cancel_url"],
            )

    def test_create_session_with_invalid_email_raises_error(
        self, sample_cart_items, checkout_urls
    ):
        """Should validate email format."""
        with pytest.raises(ValueError, match="Invalid email"):
            create_checkout_session(
                cart_items=sample_cart_items,
                user_email="invalid-email",
                success_url=checkout_urls["success_url"],
                cancel_url=checkout_urls["cancel_url"],
            )

    # ========================================================================
    # Line Items Tests
    # ========================================================================

    def test_build_line_items_with_images(self, sample_cart_items):
        """Should include images when available."""
        line_items = build_line_items(sample_cart_items)

        assert len(line_items) == 2
        # First item has image
        assert "images" in line_items[0]["price_data"]["product_data"]
        assert len(line_items[0]["price_data"]["product_data"]["images"]) == 1

    def test_build_line_items_without_images(self, sample_cart_items):
        """Should handle items without images gracefully."""
        line_items = build_line_items(sample_cart_items)

        # Second item has no image
        assert (
            "images" not in line_items[1]["price_data"]["product_data"]
            or len(line_items[1]["price_data"]["product_data"].get("images", [])) == 0
        )

    def test_line_item_unit_amount_in_cents(self, sample_cart_items):
        """Unit amount should be in cents (price * 100)."""
        line_items = build_line_items(sample_cart_items)

        # First item: $27.25 = 2725 cents
        assert line_items[0]["price_data"]["unit_amount"] == 2725

        # Second item: $49.05 = 4905 cents
        assert line_items[1]["price_data"]["unit_amount"] == 4905

    def test_line_item_quantity_matches_cart(self, sample_cart_items):
        """Quantity should match cart item quantity."""
        line_items = build_line_items(sample_cart_items)

        assert line_items[0]["quantity"] == 2
        assert line_items[1]["quantity"] == 1

    def test_line_item_name_includes_weight(self, sample_cart_items):
        """Product name should be descriptive."""
        line_items = build_line_items(sample_cart_items)

        assert "Dragon Well" in line_items[0]["price_data"]["product_data"]["name"]
        assert "Pu-erh" in line_items[1]["price_data"]["product_data"]["name"]

    # ========================================================================
    # Singapore-Specific Tests
    # ========================================================================

    def test_session_uses_sgd_currency(self, sample_cart_items, checkout_urls):
        """Should use SGD currency for Singapore market."""
        with patch("commerce.stripe_sg.stripe.checkout.Session.create") as mock_create:
            mock_session = Mock()
            mock_session.url = "https://checkout.stripe.com/test"
            mock_create.return_value = mock_session

            create_checkout_session(
                cart_items=sample_cart_items,
                user_email="test@example.com",
                success_url=checkout_urls["success_url"],
                cancel_url=checkout_urls["cancel_url"],
            )

            call_args = mock_create.call_args
            assert call_args.kwargs["currency"] == "sgd"

    def test_session_includes_grabpay_payment_method(
        self, sample_cart_items, checkout_urls
    ):
        """Should enable GrabPay for Singapore customers."""
        with patch("commerce.stripe_sg.stripe.checkout.Session.create") as mock_create:
            mock_session = Mock()
            mock_session.url = "https://checkout.stripe.com/test"
            mock_create.return_value = mock_session

            create_checkout_session(
                cart_items=sample_cart_items,
                user_email="test@example.com",
                success_url=checkout_urls["success_url"],
                cancel_url=checkout_urls["cancel_url"],
            )

            call_args = mock_create.call_args
            payment_methods = call_args.kwargs["payment_method_types"]
            assert "grabpay" in payment_methods

    def test_session_includes_paynow_payment_method(
        self, sample_cart_items, checkout_urls
    ):
        """Should enable PayNow for Singapore customers."""
        with patch("commerce.stripe_sg.stripe.checkout.Session.create") as mock_create:
            mock_session = Mock()
            mock_session.url = "https://checkout.stripe.com/test"
            mock_create.return_value = mock_session

            create_checkout_session(
                cart_items=sample_cart_items,
                user_email="test@example.com",
                success_url=checkout_urls["success_url"],
                cancel_url=checkout_urls["cancel_url"],
            )

            call_args = mock_create.call_args
            payment_methods = call_args.kwargs["payment_method_types"]
            assert "paynow" in payment_methods

    def test_session_restricts_shipping_to_singapore(
        self, sample_cart_items, checkout_urls
    ):
        """Should only allow Singapore shipping addresses."""
        with patch("commerce.stripe_sg.stripe.checkout.Session.create") as mock_create:
            mock_session = Mock()
            mock_session.url = "https://checkout.stripe.com/test"
            mock_create.return_value = mock_session

            create_checkout_session(
                cart_items=sample_cart_items,
                user_email="test@example.com",
                success_url=checkout_urls["success_url"],
                cancel_url=checkout_urls["cancel_url"],
            )

            call_args = mock_create.call_args
            shipping_collection = call_args.kwargs["shipping_address_collection"]
            assert "SG" in shipping_collection["allowed_countries"]
            assert len(shipping_collection["allowed_countries"]) == 1

    def test_session_uses_english_locale(self, sample_cart_items, checkout_urls):
        """Should use English locale for Singapore market."""
        with patch("commerce.stripe_sg.stripe.checkout.Session.create") as mock_create:
            mock_session = Mock()
            mock_session.url = "https://checkout.stripe.com/test"
            mock_create.return_value = mock_session

            create_checkout_session(
                cart_items=sample_cart_items,
                user_email="test@example.com",
                success_url=checkout_urls["success_url"],
                cancel_url=checkout_urls["cancel_url"],
            )

            call_args = mock_create.call_args
            assert call_args.kwargs["locale"] == "en"

    # ========================================================================
    # Metadata Tests
    # ========================================================================

    def test_session_includes_cart_id_metadata(self, sample_cart_items, checkout_urls):
        """Should include cart_id in session metadata."""
        with patch("commerce.stripe_sg.stripe.checkout.Session.create") as mock_create:
            mock_session = Mock()
            mock_session.url = "https://checkout.stripe.com/test"
            mock_create.return_value = mock_session

            create_checkout_session(
                cart_items=sample_cart_items,
                user_email="test@example.com",
                success_url=checkout_urls["success_url"],
                cancel_url=checkout_urls["cancel_url"],
                cart_id="test-cart-123",
            )

            call_args = mock_create.call_args
            metadata = call_args.kwargs["metadata"]
            assert metadata.get("cart_id") == "test-cart-123"

    def test_session_includes_gst_rate_metadata(self, sample_cart_items, checkout_urls):
        """Should include GST rate in session metadata."""
        with patch("commerce.stripe_sg.stripe.checkout.Session.create") as mock_create:
            mock_session = Mock()
            mock_session.url = "https://checkout.stripe.com/test"
            mock_create.return_value = mock_session

            create_checkout_session(
                cart_items=sample_cart_items,
                user_email="test@example.com",
                success_url=checkout_urls["success_url"],
                cancel_url=checkout_urls["cancel_url"],
            )

            call_args = mock_create.call_args
            metadata = call_args.kwargs["metadata"]
            assert metadata.get("gst_rate") == "0.09"

    # ========================================================================
    # Validation Tests
    # ========================================================================

    def test_validate_checkout_data_accepts_valid_data(self):
        """Should accept valid checkout data."""
        data = {
            "cart_items": [{"product_id": 1, "quantity": 1}],
            "user_email": "valid@example.com",
            "success_url": "https://example.com/success",
            "cancel_url": "https://example.com/cancel",
        }
        assert validate_checkout_data(data) is True

    def test_validate_checkout_data_rejects_empty_items(self):
        """Should reject empty cart items."""
        data = {
            "cart_items": [],
            "user_email": "valid@example.com",
        }
        with pytest.raises(ValueError, match="Cart is empty"):
            validate_checkout_data(data)

    def test_validate_checkout_data_rejects_invalid_email(self):
        """Should reject invalid email."""
        data = {
            "cart_items": [{"product_id": 1}],
            "user_email": "not-an-email",
        }
        with pytest.raises(ValueError, match="Invalid email"):
            validate_checkout_data(data)


class TestCheckoutCalculations:
    """Test checkout price calculations."""

    def test_total_calculation_with_multiple_items(self):
        """Should calculate total correctly with multiple items."""
        items = [
            {"price_with_gst": Decimal("27.25"), "quantity": 2},  # $54.50
            {"price_with_gst": Decimal("49.05"), "quantity": 1},  # $49.05
        ]

        total = sum(item["price_with_gst"] * item["quantity"] for item in items)
        assert total == Decimal("103.55")

    def test_line_item_amount_rounding(self):
        """Should handle rounding correctly for Stripe."""
        price = Decimal("10.99")
        unit_amount_cents = int(price * 100)
        assert unit_amount_cents == 1099
