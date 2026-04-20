"""
Cart Merge Tests - Detailed TDD

Tests for anonymous cart to user cart merge functionality.
This is critical for guest → registered user conversion.
"""

import pytest
from unittest.mock import Mock, patch

pytest.importorskip("apps.commerce.cart", reason="Cart module not yet implemented")

from apps.commerce.cart import (
    add_to_cart,
    get_cart_items,
    merge_anonymous_cart,
    clear_cart,
)


class TestCartMergeIntegration:
    """Integration tests for cart merge scenarios."""

    @pytest.fixture
    def setup_carts(self):
        """Setup anonymous and user cart for testing."""
        anon_id = "anon-test-123"
        user_id = 100

        # Clear any existing data
        clear_cart(anon_id)
        clear_cart(f"user:{user_id}")

        return anon_id, user_id

    def test_merge_basic_anonymous_to_user(self, setup_carts):
        """Basic merge: anon cart → user cart."""
        anon_id, user_id = setup_carts

        # Add product to anonymous cart
        add_to_cart(anon_id, product_id=1, quantity=2)

        # Merge
        result = merge_anonymous_cart(anon_id, user_id)

        # Verify
        user_cart_id = f"user:{user_id}"
        items = get_cart_items(user_cart_id)
        assert len(items) == 1
        assert items[0]["product_id"] == 1
        assert items[0]["quantity"] == 2

    def test_merge_multiple_items(self, setup_carts):
        """Merge with multiple items in anonymous cart."""
        anon_id, user_id = setup_carts

        add_to_cart(anon_id, product_id=1, quantity=1)
        add_to_cart(anon_id, product_id=2, quantity=2)
        add_to_cart(anon_id, product_id=3, quantity=3)

        merge_anonymous_cart(anon_id, user_id)

        user_cart_id = f"user:{user_id}"
        items = get_cart_items(user_cart_id)
        assert len(items) == 3

    def test_merge_empty_anonymous_cart(self, setup_carts):
        """Merging empty anonymous cart leaves user cart unchanged."""
        anon_id, user_id = setup_carts

        # Pre-populate user cart
        user_cart_id = f"user:{user_id}"
        add_to_cart(user_cart_id, product_id=5, quantity=1)

        # Merge empty anon cart
        merge_anonymous_cart(anon_id, user_id)

        items = get_cart_items(user_cart_id)
        assert len(items) == 1
        assert items[0]["product_id"] == 5

    def test_merge_into_empty_user_cart(self, setup_carts):
        """Merging into empty user cart populates it."""
        anon_id, user_id = setup_carts

        add_to_cart(anon_id, product_id=1, quantity=2)
        add_to_cart(anon_id, product_id=2, quantity=1)

        merge_anonymous_cart(anon_id, user_id)

        user_cart_id = f"user:{user_id}"
        items = get_cart_items(user_cart_id)
        assert len(items) == 2

    def test_merge_quantity_summation(self, setup_carts):
        """Same product in both carts: quantities should sum."""
        anon_id, user_id = setup_carts
        user_cart_id = f"user:{user_id}"

        # Same product in both carts
        add_to_cart(anon_id, product_id=1, quantity=3)
        add_to_cart(user_cart_id, product_id=1, quantity=2)

        merge_anonymous_cart(anon_id, user_id)

        items = get_cart_items(user_cart_id)
        assert len(items) == 1
        assert items[0]["quantity"] == 5  # 3 + 2

    def test_merge_quantity_exceeds_max(self, setup_carts):
        """If merged quantity exceeds max (99), cap at max."""
        anon_id, user_id = setup_carts
        user_cart_id = f"user:{user_id}"

        # User has 90, anon has 20 → should cap at 99
        add_to_cart(user_cart_id, product_id=1, quantity=90)
        add_to_cart(anon_id, product_id=1, quantity=20)

        merge_anonymous_cart(anon_id, user_id)

        items = get_cart_items(user_cart_id)
        assert items[0]["quantity"] == 99  # Capped at max

    def test_merge_anon_cart_deleted_after_merge(self, setup_carts):
        """Anonymous cart should be cleared after successful merge."""
        anon_id, user_id = setup_carts

        add_to_cart(anon_id, product_id=1, quantity=2)

        merge_anonymous_cart(anon_id, user_id)

        anon_items = get_cart_items(anon_id)
        assert len(anon_items) == 0

    def test_merge_preserves_user_cart_items(self, setup_carts):
        """User cart items not in anonymous cart should be preserved."""
        anon_id, user_id = setup_carts
        user_cart_id = f"user:{user_id}"

        # Anon has product 1
        add_to_cart(anon_id, product_id=1, quantity=2)

        # User has product 2
        add_to_cart(user_cart_id, product_id=2, quantity=1)

        merge_anonymous_cart(anon_id, user_id)

        items = get_cart_items(user_cart_id)
        product_ids = [item["product_id"] for item in items]
        assert 1 in product_ids
        assert 2 in product_ids

    def test_merge_returns_user_cart_key(self, setup_carts):
        """Merge should return the user cart Redis key."""
        anon_id, user_id = setup_carts

        add_to_cart(anon_id, product_id=1, quantity=2)

        result = merge_anonymous_cart(anon_id, user_id)

        assert result == f"cart:user:{user_id}"

    def test_merge_complex_scenario(self, setup_carts):
        """Complex merge: multiple items, some overlap."""
        anon_id, user_id = setup_carts
        user_cart_id = f"user:{user_id}"

        # Anon cart: products 1, 2, 3
        add_to_cart(anon_id, product_id=1, quantity=2)  # Overlap
        add_to_cart(anon_id, product_id=2, quantity=1)  # Overlap
        add_to_cart(anon_id, product_id=3, quantity=1)  # Anon only

        # User cart: products 1, 2, 4
        add_to_cart(user_cart_id, product_id=1, quantity=3)  # Overlap
        add_to_cart(user_cart_id, product_id=2, quantity=2)  # Overlap
        add_to_cart(user_cart_id, product_id=4, quantity=1)  # User only

        merge_anonymous_cart(anon_id, user_id)

        items = get_cart_items(user_cart_id)
        assert len(items) == 4

        # Check merged quantities
        by_id = {item["product_id"]: item["quantity"] for item in items}
        assert by_id[1] == 5  # 2 + 3
        assert by_id[2] == 3  # 1 + 2
        assert by_id[3] == 1  # Anon only
        assert by_id[4] == 1  # User only


class TestCartMergeEdgeCases:
    """Edge cases and error scenarios."""

    def test_merge_with_invalid_user_id(self):
        """Should handle invalid user_id gracefully."""
        with pytest.raises(ValueError):
            merge_anonymous_cart("anon-123", user_id=-1)

    def test_merge_with_invalid_anon_id(self):
        """Should handle invalid anonymous cart ID."""
        # Should succeed silently (idempotent)
        result = merge_anonymous_cart("", user_id=1)
        assert result is not None
