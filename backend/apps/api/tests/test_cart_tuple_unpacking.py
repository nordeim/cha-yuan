"""
TDD Tests for Cart Tuple Unpacking Fix (P0-1)

These tests verify that cart.py endpoints properly unpack get_cart_id_from_request().
"""
import pytest
from unittest.mock import patch, MagicMock


class TestCartTupleUnpacking:
    """Test that cart endpoints properly unpack tuple return values."""

    def test_get_cart_id_from_request_returns_tuple(self):
        """Verify get_cart_id_from_request returns Tuple[str, bool]."""
        from apps.api.v1.cart import get_cart_id_from_request
        from django.contrib.auth.models import AnonymousUser
        
        # Create mock request with no cookies and AnonymousUser auth
        mock_request = MagicMock()
        mock_request.COOKIES = {}
        mock_request.auth = AnonymousUser()
        
        result = get_cart_id_from_request(mock_request)
        
        # Should return tuple of (str, bool)
        assert isinstance(result, tuple)
        assert len(result) == 2
        assert isinstance(result[0], str)  # cart_id
        assert isinstance(result[1], bool)  # is_new

    def test_add_item_to_cart_unpacks_tuple(self):
        """Test that add_item_to_cart properly unpacks tuple."""
        from apps.api.v1.cart import add_item_to_cart
        
        # Read the source code
        import inspect
        source = inspect.getsource(add_item_to_cart)
        
        # Should unpack the tuple: cart_id, is_new = get_cart_id_from_request(request)
        assert "cart_id, is_new = get_cart_id_from_request" in source
        assert "create_cart_response(data, cart_id, is_new)" in source

    def test_update_cart_item_unpacks_tuple(self):
        """Test that update_cart_item_quantity properly unpacks tuple."""
        from apps.api.v1.cart import update_cart_item_quantity
        
        import inspect
        source = inspect.getsource(update_cart_item_quantity)
        
        # Should unpack the tuple
        assert "cart_id, is_new = get_cart_id_from_request" in source
        assert "create_cart_response(data, cart_id, is_new)" in source

    def test_remove_item_from_cart_unpacks_tuple(self):
        """Test that remove_item_from_cart properly unpacks tuple."""
        from apps.api.v1.cart import remove_item_from_cart
        
        import inspect
        source = inspect.getsource(remove_item_from_cart)
        
        # Should unpack the tuple (fixes NameError)
        assert "cart_id, is_new = get_cart_id_from_request" in source
        assert "is_new" in source  # Variable should be defined

    def test_clear_cart_contents_unpacks_tuple(self):
        """Test that clear_cart_contents properly unpacks tuple."""
        from apps.api.v1.cart import clear_cart_contents
        
        import inspect
        source = inspect.getsource(clear_cart_contents)
        
        # Should unpack the tuple
        assert "cart_id, is_new = get_cart_id_from_request" in source


class TestCartCookieResponse:
    """Test that cart endpoints return proper cookie responses."""

    def test_get_cart_returns_cookie_response(self):
        """GET /cart/ uses create_cart_response."""
        from apps.api.v1.cart import get_cart
        
        import inspect
        source = inspect.getsource(get_cart)
        
        assert "create_cart_response(data, cart_id, is_new)" in source

    def test_add_item_returns_cookie_response(self):
        """POST /cart/add/ uses create_cart_response."""
        from apps.api.v1.cart import add_item_to_cart
        
        import inspect
        source = inspect.getsource(add_item_to_cart)
        
        assert "create_cart_response(data, cart_id, is_new)" in source

    def test_update_item_returns_cookie_response(self):
        """PUT /cart/update/ uses create_cart_response."""
        from apps.api.v1.cart import update_cart_item_quantity
        
        import inspect
        source = inspect.getsource(update_cart_item_quantity)
        
        assert "create_cart_response(data, cart_id, is_new)" in source

    def test_remove_item_returns_cookie_response(self):
        """DELETE /cart/remove/ uses create_cart_response."""
        from apps.api.v1.cart import remove_item_from_cart
        
        import inspect
        source = inspect.getsource(remove_item_from_cart)
        
        assert "create_cart_response(data, cart_id, is_new)" in source


class TestNoOldPatterns:
    """Verify old buggy patterns are removed."""

    def test_no_single_assignment_in_add(self):
        """POST /cart/add/ should not have old single assignment pattern."""
        from apps.api.v1.cart import add_item_to_cart
        
        import inspect
        source = inspect.getsource(add_item_to_cart)
        
        # Should NOT have the buggy pattern: cart_id = get_cart_id_from_request(request)
        # (without unpacking)
        lines = source.split('\n')
        for line in lines:
            if 'get_cart_id_from_request' in line and '=' in line:
                # Must be tuple unpacking, not single assignment
                assert ', is_new' in line, f"Line must unpack tuple: {line}"

    def test_no_direct_get_cart_response_return_in_add(self):
        """POST /cart/add/ should wrap response with create_cart_response."""
        from apps.api.v1.cart import add_item_to_cart
        
        import inspect
        source = inspect.getsource(add_item_to_cart)
        
        # Should NOT return get_cart_response directly
        assert "return get_cart_response(cart_id)" not in source
        # Should use create_cart_response
        assert "return create_cart_response(" in source
