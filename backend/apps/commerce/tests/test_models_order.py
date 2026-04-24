"""
Order Model Tests (TDD RED Phase)

Tests for Order and OrderItem models.
These tests should FAIL initially because models don't exist yet.
"""

import pytest
from datetime import datetime
from decimal import Decimal

from django.core.exceptions import ValidationError

# These imports will FAIL initially (models don't exist)
# Implementation comes after tests
pytestmark = pytest.mark.django_db


@pytest.fixture
def user(django_user_model):
    """Create test user."""
    return django_user_model.objects.create(
        email="test@example.com",
        first_name="Test",
        last_name="User",
    )


@pytest.fixture
def tea_category():
    """Create test tea category."""
    from apps.commerce.models import TeaCategory
    return TeaCategory.objects.create(
        name="Green Tea",
        slug="green-tea",
        fermentation_level=5,
        brewing_temp_celsius=80,
        brewing_time_seconds=180,
        description="Delicate green tea",
    )


@pytest.fixture
def origin():
    """Create test origin."""
    from apps.commerce.models import Origin
    return Origin.objects.create(
        name="Fujian",
        slug="fujian",
        region="China",
        description="Famous tea region",
    )


@pytest.fixture
def product(origin, tea_category):
    """Create test product."""
    from apps.commerce.models import Product
    return Product.objects.create(
        name="Test Green Tea",
        slug="test-green-tea",
        description="A fine green tea",
        short_description="Fine green tea",
        price_sgd=Decimal("25.00"),
        stock=100,
        origin=origin,
        category=tea_category,
        weight_grams=50,
        is_available=True,
    )


@pytest.fixture
def order_data(user):
    """Sample order data."""
    return {
        "user": user,
        "customer_email": "test@example.com",
        "customer_name": "Test User",
        "shipping_name": "Test User",
        "shipping_block_street": "Blk 123 Test Street",
        "shipping_unit": "#04-56",
        "shipping_postal_code": "123456",
        "subtotal_sgd": Decimal("50.00"),
        "gst_amount_sgd": Decimal("4.50"),
        "total_sgd": Decimal("54.50"),
        "stripe_payment_intent_id": "pi_test_12345",
        "payment_method": "visa ending in 4242",
        "status": "paid",
    }


class TestOrderModel:
    """Test Order model creation and properties."""

    def test_order_exists_in_module(self):
        """Order model should be importable from commerce.models."""
        from apps.commerce.models import Order
        assert Order is not None

    def test_order_creation_with_user(self, user):
        """Should create order with linked user."""
        from apps.commerce.models import Order

        order = Order.objects.create(
            user=user,
            customer_email=user.email,
            customer_name=user.get_full_name(),
            shipping_name=user.get_full_name(),
            shipping_block_street="Blk 123",
            shipping_postal_code="123456",
            subtotal_sgd=Decimal("50.00"),
            gst_amount_sgd=Decimal("4.50"),
            total_sgd=Decimal("54.50"),
            stripe_payment_intent_id="pi_test_user",
            status="paid",
        )

        assert order.id is not None
        assert order.order_number is not None
        assert order.order_number.startswith("CY-")
        assert order.user == user
        assert order.customer_email == user.email

    def test_order_creation_guest_checkout(self):
        """Should create order without user (guest checkout)."""
        from apps.commerce.models import Order

        order = Order.objects.create(
            user=None,
            customer_email="guest@example.com",
            customer_name="Guest User",
            shipping_name="Guest User",
            shipping_block_street="Blk 456",
            shipping_postal_code="654321",
            subtotal_sgd=Decimal("30.00"),
            gst_amount_sgd=Decimal("2.70"),
            total_sgd=Decimal("32.70"),
            stripe_payment_intent_id="pi_test_guest",
            status="paid",
        )

        assert order.id is not None
        assert order.user is None
        assert order.customer_email == "guest@example.com"

    def test_order_number_generation(self, user):
        """Should generate unique order numbers."""
        from apps.commerce.models import Order

        order1 = Order.objects.create(
            user=user,
            customer_email="test1@example.com",
            customer_name="Test User",
            shipping_name="Test User",
            shipping_block_street="Blk 111",
            shipping_postal_code="111111",
            subtotal_sgd=Decimal("10.00"),
            gst_amount_sgd=Decimal("0.90"),
            total_sgd=Decimal("10.90"),
            stripe_payment_intent_id="pi_test_001",
            status="paid",
        )

        order2 = Order.objects.create(
            user=user,
            customer_email="test2@example.com",
            customer_name="Test User",
            shipping_name="Test User",
            shipping_block_street="Blk 222",
            shipping_postal_code="222222",
            subtotal_sgd=Decimal("20.00"),
            gst_amount_sgd=Decimal("1.80"),
            total_sgd=Decimal("21.80"),
            stripe_payment_intent_id="pi_test_002",
            status="paid",
        )

        assert order1.order_number != order2.order_number
        assert order1.order_number.startswith("CY-")
        assert order2.order_number.startswith("CY-")

    def test_stripe_payment_intent_id_unique(self, user):
        """Should enforce unique stripe_payment_intent_id."""
        from apps.commerce.models import Order
        from django.db.utils import IntegrityError

        Order.objects.create(
            user=user,
            customer_email="test1@example.com",
            customer_name="Test User",
            shipping_name="Test User",
            shipping_block_street="Blk 111",
            shipping_postal_code="111111",
            subtotal_sgd=Decimal("10.00"),
            gst_amount_sgd=Decimal("0.90"),
            total_sgd=Decimal("10.90"),
            stripe_payment_intent_id="pi_duplicate",
            status="paid",
        )

        with pytest.raises(IntegrityError):
            Order.objects.create(
                user=user,
                customer_email="test2@example.com",
                customer_name="Test User",
                shipping_name="Test User",
                shipping_block_street="Blk 222",
                shipping_postal_code="222222",
                subtotal_sgd=Decimal("20.00"),
                gst_amount_sgd=Decimal("1.80"),
                total_sgd=Decimal("21.80"),
                stripe_payment_intent_id="pi_duplicate",  # Same ID
                status="paid",
            )

    def test_order_status_choices(self, user):
        """Should validate status against choices."""
        from apps.commerce.models import Order

        order = Order.objects.create(
            user=user,
            customer_email="test@example.com",
            customer_name="Test User",
            shipping_name="Test User",
            shipping_block_street="Blk 123",
            shipping_postal_code="123456",
            subtotal_sgd=Decimal("50.00"),
            gst_amount_sgd=Decimal("4.50"),
            total_sgd=Decimal("54.50"),
            stripe_payment_intent_id="pi_status_test",
            status="processing",
        )

        assert order.status == "processing"

    def test_order_str_representation(self, user):
        """Should have meaningful string representation."""
        from apps.commerce.models import Order

        order = Order.objects.create(
            user=user,
            customer_email="test@example.com",
            customer_name="Test User",
            shipping_name="Test User",
            shipping_block_street="Blk 123",
            shipping_postal_code="123456",
            subtotal_sgd=Decimal("50.00"),
            gst_amount_sgd=Decimal("4.50"),
            total_sgd=Decimal("54.50"),
            stripe_payment_intent_id="pi_str_test",
            status="paid",
        )

        assert str(order) == f"{order.order_number} - test@example.com"

    def test_order_ordering(self, user):
        """Orders should be ordered by created_at desc."""
        from apps.commerce.models import Order

        order1 = Order.objects.create(
            user=user,
            customer_email="old@example.com",
            customer_name="Old",
            shipping_name="Old",
            shipping_block_street="Blk 111",
            shipping_postal_code="111111",
            subtotal_sgd=Decimal("10.00"),
            gst_amount_sgd=Decimal("0.90"),
            total_sgd=Decimal("10.90"),
            stripe_payment_intent_id="pi_old",
            status="paid",
        )

        order2 = Order.objects.create(
            user=user,
            customer_email="new@example.com",
            customer_name="New",
            shipping_name="New",
            shipping_block_street="Blk 222",
            shipping_postal_code="222222",
            subtotal_sgd=Decimal("20.00"),
            gst_amount_sgd=Decimal("1.80"),
            total_sgd=Decimal("21.80"),
            stripe_payment_intent_id="pi_new",
            status="paid",
        )

        orders = list(Order.objects.all())
        assert orders[0] == order2  # Newest first
        assert orders[1] == order1


class TestOrderItemModel:
    """Test OrderItem model creation and properties."""

    def test_order_item_exists_in_module(self):
        """OrderItem model should be importable."""
        from apps.commerce.models import OrderItem
        assert OrderItem is not None

    def test_order_item_creation(self, user, product):
        """Should create order item linked to order and product."""
        from apps.commerce.models import Order, OrderItem

        order = Order.objects.create(
            user=user,
            customer_email=user.email,
            customer_name="Test User",
            shipping_name="Test User",
            shipping_block_street="Blk 123",
            shipping_postal_code="123456",
            subtotal_sgd=Decimal("25.00"),
            gst_amount_sgd=Decimal("2.25"),
            total_sgd=Decimal("27.25"),
            stripe_payment_intent_id="pi_item_test",
            status="paid",
        )

        item = OrderItem.objects.create(
            order=order,
            product=product,
            product_name=product.name,
            product_slug=product.slug,
            product_weight_grams=product.weight_grams,
            unit_price_sgd=product.get_price_with_gst(),
            quantity=2,
        )

        assert item.id is not None
        assert item.order == order
        assert item.product == product
        assert item.product_name == product.name
        assert item.subtotal_sgd == Decimal("50.00")  # 2 x 25.00

    def test_order_item_without_product(self, user):
        """Should allow order item without product (deleted product)."""
        from apps.commerce.models import Order, OrderItem

        order = Order.objects.create(
            user=user,
            customer_email=user.email,
            customer_name="Test User",
            shipping_name="Test User",
            shipping_block_street="Blk 123",
            shipping_postal_code="123456",
            subtotal_sgd=Decimal("50.00"),
            gst_amount_sgd=Decimal("4.50"),
            total_sgd=Decimal("54.50"),
            stripe_payment_intent_id="pi_no_product",
            status="paid",
        )

        item = OrderItem.objects.create(
            order=order,
            product=None,  # No product link
            product_name="Deleted Product",
            product_slug="deleted-product",
            product_weight_grams=50,
            unit_price_sgd=Decimal("25.00"),
            quantity=1,
        )

        assert item.id is not None
        assert item.product is None

    def test_order_items_related_name(self, user, product):
        """Should access items via order.items."""
        from apps.commerce.models import Order, OrderItem

        order = Order.objects.create(
            user=user,
            customer_email=user.email,
            customer_name="Test User",
            shipping_name="Test User",
            shipping_block_street="Blk 123",
            shipping_postal_code="123456",
            subtotal_sgd=Decimal("75.00"),
            gst_amount_sgd=Decimal("6.75"),
            total_sgd=Decimal("81.75"),
            stripe_payment_intent_id="pi_related_test",
            status="paid",
        )

        item1 = OrderItem.objects.create(
            order=order,
            product=product,
            product_name=product.name,
            product_slug=product.slug,
            product_weight_grams=product.weight_grams,
            unit_price_sgd=product.get_price_with_gst(),
            quantity=1,
        )

        item2 = OrderItem.objects.create(
            order=order,
            product=product,
            product_name=product.name,
            product_slug=product.slug,
            product_weight_grams=product.weight_grams,
            unit_price_sgd=product.get_price_with_gst(),
            quantity=2,
        )

        assert order.items.count() == 2
        assert item1 in order.items.all()
        assert item2 in order.items.all()

    def test_order_item_frozen_product_data(self, user, product):
        """Should preserve product data at time of purchase."""
        from apps.commerce.models import Order, OrderItem

        order = Order.objects.create(
            user=user,
            customer_email=user.email,
            customer_name="Test User",
            shipping_name="Test User",
            shipping_block_street="Blk 123",
            shipping_postal_code="123456",
            subtotal_sgd=Decimal("25.00"),
            gst_amount_sgd=Decimal("2.25"),
            total_sgd=Decimal("27.25"),
            stripe_payment_intent_id="pi_frozen_test",
            status="paid",
        )

        original_name = product.name
        original_price = product.get_price_with_gst()

        item = OrderItem.objects.create(
            order=order,
            product=product,
            product_name=original_name,
            product_slug=product.slug,
            product_weight_grams=product.weight_grams,
            unit_price_sgd=original_price,
            quantity=1,
        )

        # Update product after order
        product.name = "New Name"
        product.price_sgd = Decimal("100.00")
        product.save()

        # Order item should still have original data
        assert item.product_name == original_name
        assert item.unit_price_sgd == original_price


class TestOrderFulfillment:
    """Test order status transitions."""

    def test_order_status_transition_paid_to_shipped(self, user):
        """Should update status from paid to shipped."""
        from apps.commerce.models import Order

        order = Order.objects.create(
            user=user,
            customer_email=user.email,
            customer_name="Test User",
            shipping_name="Test User",
            shipping_block_street="Blk 123",
            shipping_postal_code="123456",
            subtotal_sgd=Decimal("50.00"),
            gst_amount_sgd=Decimal("4.50"),
            total_sgd=Decimal("54.50"),
            stripe_payment_intent_id="pi_ship_test",
            status="paid",
        )

        order.status = "shipped"
        order.tracking_number = "SG123456789"
        order.shipped_at = datetime.now()
        order.save()

        assert order.status == "shipped"
        assert order.tracking_number == "SG123456789"

    def test_order_status_transition_shipped_to_delivered(self, user):
        """Should update status to delivered."""
        from apps.commerce.models import Order

        order = Order.objects.create(
            user=user,
            customer_email=user.email,
            customer_name="Test User",
            shipping_name="Test User",
            shipping_block_street="Blk 123",
            shipping_postal_code="123456",
            subtotal_sgd=Decimal("50.00"),
            gst_amount_sgd=Decimal("4.50"),
            total_sgd=Decimal("54.50"),
            stripe_payment_intent_id="pi_deliver_test",
            status="shipped",
            shipped_at=datetime.now(),
            tracking_number="SG123456789",
        )

        order.status = "delivered"
        order.delivered_at = datetime.now()
        order.save()

        assert order.status == "delivered"


class TestOrderUserRelationship:
    """Test order-user relationship."""

    def test_user_orders_related_name(self, user):
        """Should access orders via user.orders."""
        from apps.commerce.models import Order

        order1 = Order.objects.create(
            user=user,
            customer_email=user.email,
            customer_name=user.get_full_name(),
            shipping_name=user.get_full_name(),
            shipping_block_street="Blk 111",
            shipping_postal_code="111111",
            subtotal_sgd=Decimal("50.00"),
            gst_amount_sgd=Decimal("4.50"),
            total_sgd=Decimal("54.50"),
            stripe_payment_intent_id="pi_user_rel_1",
            status="paid",
        )

        order2 = Order.objects.create(
            user=user,
            customer_email=user.email,
            customer_name=user.get_full_name(),
            shipping_name=user.get_full_name(),
            shipping_block_street="Blk 222",
            shipping_postal_code="222222",
            subtotal_sgd=Decimal("100.00"),
            gst_amount_sgd=Decimal("9.00"),
            total_sgd=Decimal("109.00"),
            stripe_payment_intent_id="pi_user_rel_2",
            status="paid",
        )

        assert user.orders.count() == 2
        assert order1 in user.orders.all()
        assert order2 in user.orders.all()
