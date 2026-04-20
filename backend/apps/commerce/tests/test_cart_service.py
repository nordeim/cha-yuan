"""
Cart Service Tests (TDD RED Phase)

Tests for Redis-based cart operations following TDD methodology.
Write failing tests first, then implement to make them pass.
"""

import pytest
from datetime import timedelta
from unittest.mock import Mock, patch, MagicMock
from decimal import Decimal


# Import will fail initially - that's expected (RED phase)
# After implementing cart.py, these imports will work (GREEN phase)
pytest.importorskip("apps.commerce.cart", reason="Cart module not yet implemented")

from apps.commerce.cart import (
    get_cart_id,
    get_cart_items,
    add_to_cart,
    update_cart_item,
    remove_from_cart,
    clear_cart,
    merge_anonymous_cart,
    validate_stock,
    calculate_cart_totals,
)
from apps.commerce.models import Product


class TestCartService:
    """Test suite for cart service functionality."""

    @pytest.fixture
    def mock_request(self):
        """Create mock request with cookies."""
        request = Mock()
        request.COOKIES = {}
        return request

    @pytest.fixture
    def sample_cart_id(self):
        """Sample cart ID for testing."""
        return "test-cart-12345"

    @pytest.fixture
    def sample_product(self):
        """Sample product for testing."""
        product = Mock(spec=Product)
        product.id = 1
        product.name = "Premium Dragon Well"
        product.slug = "premium-dragon-well"
        product.price_sgd = Decimal("25.00")
        product.price_with_gst = Decimal("27.25")
        product.gst_amount = Decimal("2.25")
        product.stock = 10
        product.is_in_stock = True
        product.image = "products/dragon-well.jpg"
        return product

    # =========================================================================
    # Cart ID Management Tests
    # =========================================================================

    def test_get_cart_id_returns_existing_id(self, mock_request):
        """Should return existing cart_id from cookies."""
        mock_request.COOKIES["cart_id"] = "existing-cart-123"
        result = get_cart_id(mock_request)
        assert result == "existing-cart-123"

    def test_get_cart_id_creates_new_id_when_not_in_cookies(self, mock_request):
        """Should create new UUID when no cart_id in cookies."""
        result = get_cart_id(mock_request)
        assert result is not None
        assert len(result) == 36  # UUID v4 length

    # =========================================================================
    # Add to Cart Tests
    # =========================================================================

    def test_add_to_cart_creates_new_entry(self, sample_cart_id):
        """Adding a new product creates cart entry with quantity."""
        result = add_to_cart(sample_cart_id, product_id=1, quantity=2)
        assert result is True

        items = get_cart_items(sample_cart_id)
        assert len(items) == 1
        assert items[0]["product_id"] == 1
        assert items[0]["quantity"] == 2

    def test_add_to_cart_increments_existing_quantity(self, sample_cart_id):
        """Adding same product increments existing quantity."""
        add_to_cart(sample_cart_id, product_id=1, quantity=2)
        add_to_cart(sample_cart_id, product_id=1, quantity=3)

        items = get_cart_items(sample_cart_id)
        assert items[0]["quantity"] == 5

    def test_add_to_cart_different_products(self, sample_cart_id):
        """Adding different products creates separate entries."""
        add_to_cart(sample_cart_id, product_id=1, quantity=1)
        add_to_cart(sample_cart_id, product_id=2, quantity=2)

        items = get_cart_items(sample_cart_id)
        assert len(items) == 2

    def test_add_to_cart_zero_quantity_invalid(self, sample_cart_id):
        """Adding with quantity 0 should raise ValueError."""
        with pytest.raises(ValueError, match="Quantity must be positive"):
            add_to_cart(sample_cart_id, product_id=1, quantity=0)

    def test_add_to_cart_negative_quantity_invalid(self, sample_cart_id):
        """Adding with negative quantity should raise ValueError."""
        with pytest.raises(ValueError, match="Quantity must be positive"):
            add_to_cart(sample_cart_id, product_id=1, quantity=-1)

    # =========================================================================
    # Get Cart Items Tests
    # =========================================================================

    def test_get_cart_items_returns_empty_list_for_new_cart(self, sample_cart_id):
        """Empty cart should return empty list."""
        items = get_cart_items(sample_cart_id)
        assert items == []

    def test_get_cart_items_returns_product_details(
        self, sample_cart_id, sample_product
    ):
        """Should return items with full product details."""
        add_to_cart(sample_cart_id, product_id=1, quantity=2)

        items = get_cart_items(sample_cart_id)
        assert len(items) == 1
        assert "product_id" in items[0]
        assert "quantity" in items[0]
        assert "subtotal" in items[0]

    # =========================================================================
    # Update Cart Item Tests
    # =========================================================================

    def test_update_cart_item_changes_quantity(self, sample_cart_id):
        """Update should change item quantity."""
        add_to_cart(sample_cart_id, product_id=1, quantity=2)
        result = update_cart_item(sample_cart_id, product_id=1, quantity=5)

        assert result is True
        items = get_cart_items(sample_cart_id)
        assert items[0]["quantity"] == 5

    def test_update_cart_item_to_zero_removes_item(self, sample_cart_id):
        """Updating to quantity 0 removes item from cart."""
        add_to_cart(sample_cart_id, product_id=1, quantity=2)
        result = update_cart_item(sample_cart_id, product_id=1, quantity=0)

        assert result is True
        items = get_cart_items(sample_cart_id)
        assert len(items) == 0

    def test_update_cart_item_not_in_cart_raises_error(self, sample_cart_id):
        """Updating non-existent item should raise ValueError."""
        with pytest.raises(ValueError, match="Item not in cart"):
            update_cart_item(sample_cart_id, product_id=999, quantity=2)

    # =========================================================================
    # Remove from Cart Tests
    # =========================================================================

    def test_remove_from_cart_deletes_item(self, sample_cart_id):
        """Remove should delete item from cart."""
        add_to_cart(sample_cart_id, product_id=1, quantity=2)
        result = remove_from_cart(sample_cart_id, product_id=1)

        assert result is True
        items = get_cart_items(sample_cart_id)
        assert len(items) == 0

    def test_remove_from_cart_not_in_cart_succeeds(self, sample_cart_id):
        """Removing non-existent item should succeed silently."""
        result = remove_from_cart(sample_cart_id, product_id=999)
        assert result is True  # Idempotent operation

    # =========================================================================
    # Clear Cart Tests
    # =========================================================================

    def test_clear_cart_removes_all_items(self, sample_cart_id):
        """Clear should remove all items from cart."""
        add_to_cart(sample_cart_id, product_id=1, quantity=2)
        add_to_cart(sample_cart_id, product_id=2, quantity=1)

        result = clear_cart(sample_cart_id)
        assert result is True

        items = get_cart_items(sample_cart_id)
        assert len(items) == 0

    def test_clear_cart_empty_succeeds(self, sample_cart_id):
        """Clearing empty cart should succeed."""
        result = clear_cart(sample_cart_id)
        assert result is True

    # =========================================================================
    # TTL and Expiration Tests
    # =========================================================================

    @pytest.mark.skip(reason="Redis TTL verification requires integration test")
    def test_cart_has_30_day_ttl(self, sample_cart_id):
        """Cart should expire after 30 days."""
        add_to_cart(sample_cart_id, product_id=1, quantity=2)
        # Verify TTL is approximately 30 days (2592000 seconds)
        # This requires Redis client access

    # =========================================================================
    # Validation Tests
    # =========================================================================

    def test_validate_stock_returns_true_when_sufficient(self, sample_product):
        """Should return True when stock >= requested quantity."""
        result = validate_stock(sample_product.id, quantity=5)
        assert result is True

    def test_validate_stock_returns_false_when_insufficient(self, sample_product):
        """Should return False when stock < requested quantity."""
        # Mock product with low stock
        with patch("commerce.cart.Product") as mock_product_class:
            mock_product = Mock()
            mock_product.stock = 2
            mock_product_class.objects.get.return_value = mock_product

            result = validate_stock(999, quantity=5)
            assert result is False

    def test_validate_quantity_limits_max_99(self, sample_cart_id):
        """Should enforce max quantity of 99 per item."""
        with pytest.raises(ValueError, match="Maximum quantity is 99"):
            add_to_cart(sample_cart_id, product_id=1, quantity=100)

    # =========================================================================
    # Cart Totals Tests
    # =========================================================================

    def test_calculate_cart_totals_with_gst(self, sample_cart_id):
        """Should calculate subtotal, GST, and total correctly."""
        # Add items to cart
        add_to_cart(sample_cart_id, product_id=1, quantity=2)  # $25.00 each = $50.00
        add_to_cart(sample_cart_id, product_id=2, quantity=1)  # $30.00 each = $30.00

        items = get_cart_items(sample_cart_id)
        totals = calculate_cart_totals(items)

        assert "subtotal" in totals
        assert "gst_amount" in totals
        assert "total" in totals
        assert totals["total"] == totals["subtotal"] + totals["gst_amount"]

    def test_calculate_cart_totals_empty_cart(self):
        """Empty cart should return zero totals."""
        totals = calculate_cart_totals([])
        assert totals["subtotal"] == Decimal("0.00")
        assert totals["gst_amount"] == Decimal("0.00")
        assert totals["total"] == Decimal("0.00")


class TestCartMerge:
    """Test suite for anonymous to user cart merge."""

    @pytest.fixture
    def anon_cart_id(self):
        return "anon-cart-12345"

    @pytest.fixture
    def user_id(self):
        return 42

    def test_merge_anonymous_to_user_creates_user_cart(self, anon_cart_id, user_id):
        """Merge should create user cart from anonymous cart."""
        # Add items to anonymous cart
        add_to_cart(anon_cart_id, product_id=1, quantity=2)

        result = merge_anonymous_cart(anon_cart_id, user_id)
        assert result is not None

        # Verify user cart exists with items
        user_cart_id = f"user:{user_id}"
        items = get_cart_items(user_cart_id)
        assert len(items) == 1
        assert items[0]["quantity"] == 2

    def test_merge_sums_quantities_for_duplicate_items(self, anon_cart_id, user_id):
        """Duplicate items should have quantities summed."""
        # Add same product to both carts
        add_to_cart(anon_cart_id, product_id=1, quantity=2)

        # Pre-populate user cart with same product
        user_cart_id = f"user:{user_id}"
        add_to_cart(user_cart_id, product_id=1, quantity=3)

        result = merge_anonymous_cart(anon_cart_id, user_id)

        items = get_cart_items(user_cart_id)
        assert len(items) == 1
        assert items[0]["quantity"] == 5  # 2 + 3

    def test_merge_preserves_distinct_items(self, anon_cart_id, user_id):
        """Different products should be preserved separately."""
        # Different products in each cart
        add_to_cart(anon_cart_id, product_id=1, quantity=1)  # Anon only

        user_cart_id = f"user:{user_id}"
        add_to_cart(user_cart_id, product_id=2, quantity=1)  # User only

        result = merge_anonymous_cart(anon_cart_id, user_id)

        items = get_cart_items(user_cart_id)
        assert len(items) == 2

    def test_merge_deletes_anonymous_cart(self, anon_cart_id, user_id):
        """After merge, anonymous cart should be deleted."""
        add_to_cart(anon_cart_id, product_id=1, quantity=2)

        merge_anonymous_cart(anon_cart_id, user_id)

        # Anonymous cart should be empty
        items = get_cart_items(anon_cart_id)
        assert len(items) == 0
