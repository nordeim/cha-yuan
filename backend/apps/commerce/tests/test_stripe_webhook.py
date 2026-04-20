"""
Stripe Webhook Tests (TDD RED Phase)

Tests for Stripe webhook handling.
Verifies payment events and creates orders on success.
"""

import pytest
import json
from decimal import Decimal
from datetime import datetime
from unittest.mock import Mock, patch, MagicMock

pytest.importorskip(
    "apps.commerce.stripe_sg", reason="Stripe module not yet implemented"
)

from apps.commerce.stripe_sg import (
    verify_webhook_signature,
    handle_payment_success,
    handle_payment_failure,
    process_webhook_event,
)


class TestWebhookSignatureVerification:
    """Test webhook signature verification security."""

    def test_verify_valid_signature(self):
        """Should accept valid Stripe signature."""
        payload = b'{"type": "payment_intent.succeeded"}'
        sig_header = "t=1234567890,v1=valid_signature"
        secret = "whsec_test_secret"

        with patch(
            "commerce.stripe_sg.stripe.Webhook.construct_event"
        ) as mock_construct:
            mock_construct.return_value = {"type": "payment_intent.succeeded"}

            result = verify_webhook_signature(payload, sig_header, secret)
            assert result is True

    def test_verify_invalid_signature_raises_error(self):
        """Should reject invalid signature."""
        payload = b'{"type": "payment_intent.succeeded"}'
        sig_header = "t=1234567890,v1=invalid_signature"
        secret = "whsec_test_secret"

        with patch(
            "commerce.stripe_sg.stripe.Webhook.construct_event"
        ) as mock_construct:
            from stripe.error import SignatureVerificationError

            mock_construct.side_effect = SignatureVerificationError(
                "Invalid signature", sig_header
            )

            with pytest.raises(ValueError, match="Invalid signature"):
                verify_webhook_signature(payload, sig_header, secret)

    def test_verify_empty_signature_raises_error(self):
        """Should reject empty signature."""
        payload = b"{}"
        sig_header = ""
        secret = "whsec_test_secret"

        with pytest.raises(ValueError, match="Missing signature"):
            verify_webhook_signature(payload, sig_header, secret)

    def test_verify_empty_secret_raises_error(self):
        """Should reject empty webhook secret."""
        payload = b"{}"
        sig_header = "t=123,v1=sig"
        secret = ""

        with pytest.raises(ValueError, match="Missing webhook secret"):
            verify_webhook_signature(payload, sig_header, secret)


class TestPaymentSuccessHandler:
    """Test order creation on successful payment."""

    @pytest.fixture
    def payment_intent_succeeded(self):
        """Sample payment_intent.succeeded event."""
        return {
            "id": "evt_test_123",
            "type": "payment_intent.succeeded",
            "data": {
                "object": {
                    "id": "pi_test_123",
                    "amount": 10355,  # $103.55 in cents
                    "currency": "sgd",
                    "status": "succeeded",
                    "charges": {
                        "data": [
                            {
                                "receipt_url": "https://pay.stripe.com/receipts/test",
                                "payment_method_details": {
                                    "type": "card",
                                    "card": {"brand": "visa", "last4": "4242"},
                                },
                            }
                        ],
                    },
                    "metadata": {
                        "cart_id": "test-cart-123",
                        "user_id": "42",
                        "gst_rate": "0.09",
                    },
                    "shipping": {
                        "name": "John Tan",
                        "address": {
                            "line1": "Blk 123 Jurong East St 13",
                            "line2": "#04-56",
                            "postal_code": "600123",
                            "country": "SG",
                        },
                    },
                    "receipt_email": "john@example.com",
                },
            },
        }

    def test_handle_success_creates_order(self, payment_intent_succeeded):
        """Should create order on successful payment."""
        with patch("commerce.stripe_sg.Order.objects.create") as mock_create:
            mock_order = Mock()
            mock_order.id = 123
            mock_order.order_number = "CY-20260415-001"
            mock_create.return_value = mock_order

            result = handle_payment_success(payment_intent_succeeded)

            assert result is not None
            assert result["order_id"] == 123
            assert result["order_number"] == "CY-20260415-001"

    def test_handle_success_decrements_stock(self, payment_intent_succeeded):
        """Should decrement product stock after order creation."""
        with patch("commerce.stripe_sg.Order") as mock_order_class:
            mock_order = Mock()
            mock_order.items.all.return_value = [
                Mock(product_id=1, quantity=2),
                Mock(product_id=2, quantity=1),
            ]
            mock_order_class.objects.create.return_value = mock_order

            with patch("commerce.stripe_sg.Product") as mock_product_class:
                mock_products = {1: Mock(stock=10), 2: Mock(stock=5)}
                mock_product_class.objects.get = lambda id: mock_products.get(id)

                handle_payment_success(payment_intent_succeeded)

                # Verify stock decremented
                mock_products[1].save.assert_called()

    def test_handle_success_clears_cart(self, payment_intent_succeeded):
        """Should clear cart after successful order."""
        with patch("commerce.stripe_sg.clear_cart") as mock_clear_cart:
            with patch("commerce.stripe_sg.Order.objects.create") as mock_create:
                mock_create.return_value = Mock(id=123, order_number="CY-001")

                handle_payment_success(payment_intent_succeeded)

                mock_clear_cart.assert_called_once_with("test-cart-123")

    def test_handle_success_extracts_gst_from_metadata(self, payment_intent_succeeded):
        """Should use GST rate from payment metadata."""
        with patch("commerce.stripe_sg.Order.objects.create") as mock_create:
            mock_order = Mock()
            mock_create.return_value = mock_order

            handle_payment_success(payment_intent_succeeded)

            call_args = mock_create.call_args
            # Verify GST rate was extracted
            assert "gst_rate" in str(call_args) or "gst_amount" in str(call_args)

    def test_handle_success_saves_shipping_address(self, payment_intent_succeeded):
        """Should save shipping address from Stripe."""
        with patch("commerce.stripe_sg.Order.objects.create") as mock_create:
            mock_order = Mock()
            mock_create.return_value = mock_order

            handle_payment_success(payment_intent_succeeded)

            call_args = mock_create.call_args
            shipping = call_args.kwargs.get("shipping_address", {})
            assert "600123" in str(shipping) or "Blk 123" in str(shipping)

    def test_handle_success_saves_payment_method_details(
        self, payment_intent_succeeded
    ):
        """Should save payment method details."""
        with patch("commerce.stripe_sg.Order.objects.create") as mock_create:
            mock_order = Mock()
            mock_create.return_value = mock_order

            handle_payment_success(payment_intent_succeeded)

            call_args = mock_create.call_args
            assert "visa" in str(call_args) or "card" in str(call_args)


class TestPaymentFailureHandler:
    """Test payment failure handling."""

    @pytest.fixture
    def payment_intent_failed(self):
        """Sample payment_intent.payment_failed event."""
        return {
            "id": "evt_test_failed",
            "type": "payment_intent.payment_failed",
            "data": {
                "object": {
                    "id": "pi_test_failed",
                    "status": "requires_payment_method",
                    "last_payment_error": {
                        "code": "card_declined",
                        "decline_code": "insufficient_funds",
                        "message": "Your card was declined.",
                    },
                    "metadata": {
                        "cart_id": "test-cart-123",
                        "user_id": "42",
                    },
                },
            },
        }

    def test_handle_failure_logs_event(self, payment_intent_failed):
        """Should log payment failure."""
        with patch("commerce.stripe_sg.logger") as mock_logger:
            handle_payment_failure(payment_intent_failed)

            mock_logger.error.assert_called()

    def test_handle_failure_does_not_create_order(self, payment_intent_failed):
        """Should NOT create order on failed payment."""
        with patch("commerce.stripe_sg.Order.objects.create") as mock_create:
            handle_payment_failure(payment_intent_failed)

            mock_create.assert_not_called()

    def test_handle_failure_preserves_cart(self, payment_intent_failed):
        """Should preserve cart on payment failure."""
        with patch("commerce.stripe_sg.clear_cart") as mock_clear_cart:
            handle_payment_failure(payment_intent_failed)

            mock_clear_cart.assert_not_called()


class TestWebhookEventProcessing:
    """Test webhook event routing."""

    def test_process_success_event(self):
        """Should route succeeded events to success handler."""
        event = {"type": "payment_intent.succeeded"}

        with patch("commerce.stripe_sg.handle_payment_success") as mock_success:
            with patch("commerce.stripe_sg.handle_payment_failure") as mock_failure:
                process_webhook_event(event)

                mock_success.assert_called_once_with(event)
                mock_failure.assert_not_called()

    def test_process_failed_event(self):
        """Should route failed events to failure handler."""
        event = {"type": "payment_intent.payment_failed"}

        with patch("commerce.stripe_sg.handle_payment_success") as mock_success:
            with patch("commerce.stripe_sg.handle_payment_failure") as mock_failure:
                process_webhook_event(event)

                mock_success.assert_not_called()
                mock_failure.assert_called_once_with(event)

    def test_process_unknown_event_logs_warning(self):
        """Should log warning for unknown event types."""
        event = {"type": "invoice.payment_succeeded"}

        with patch("commerce.stripe_sg.logger") as mock_logger:
            process_webhook_event(event)

            mock_logger.warning.assert_called()


class TestCheckoutSessionCompleted:
    """Test checkout.session.completed webhook."""

    @pytest.fixture
    def checkout_session_completed(self):
        """Sample checkout.session.completed event."""
        return {
            "id": "evt_session_complete",
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": "cs_test_session",
                    "payment_intent": "pi_test_123",
                    "amount_total": 10355,
                    "currency": "sgd",
                    "payment_status": "paid",
                    "customer_details": {
                        "email": "john@example.com",
                        "name": "John Tan",
                    },
                    "shipping_details": {
                        "name": "John Tan",
                        "address": {
                            "line1": "Blk 123 Jurong East St 13",
                            "line2": "#04-56",
                            "postal_code": "600123",
                            "country": "SG",
                        },
                    },
                    "metadata": {
                        "cart_id": "test-cart-123",
                        "gst_rate": "0.09",
                    },
                },
            },
        }

    def test_handle_checkout_session_completed_creates_order(
        self, checkout_session_completed
    ):
        """Should create order on completed checkout session."""
        with patch("commerce.stripe_sg.Order.objects.create") as mock_create:
            mock_order = Mock()
            mock_order.id = 123
            mock_create.return_value = mock_order

            from commerce.stripe_sg import handle_checkout_session_completed

            result = handle_checkout_session_completed(checkout_session_completed)

            assert result is not None
            assert result["status"] == "success"


class TestIdempotency:
    """Test webhook idempotency."""

    def test_duplicate_webhook_prevented(self):
        """Should prevent duplicate order creation."""
        event = {
            "id": "evt_duplicate_123",
            "type": "payment_intent.succeeded",
            "data": {"object": {"id": "pi_123", "metadata": {"cart_id": "cart_123"}}},
        }

        with patch("commerce.stripe_sg.Order.objects.filter") as mock_filter:
            # Simulate existing order with this payment intent
            mock_filter.return_value.exists.return_value = True

            result = handle_payment_success(event)

            # Should return existing order, not create new
            assert result is not None
