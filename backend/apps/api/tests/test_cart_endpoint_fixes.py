"""
TDD Tests for Cart Endpoint Fixes (P0 Issues)

These tests verify that:
1. POST /cart/add/ properly unpacks tuple and returns cookie
2. PUT /cart/update/ properly unpacks tuple and returns cookie
3. DELETE /cart/remove/{id}/ properly unpacks tuple (no NameError)
4. DELETE /cart/clear/ properly unpacks tuple

BEFORE FIX: These tests will FAIL
AFTER FIX: These tests will PASS
"""
import pytest
from django.test import Client


@pytest.mark.django_db
class TestCartEndpointFixes:
    """Test cart endpoints for tuple unpacking and cookie responses."""
    
    def test_post_cart_add_unpacks_tuple_and_sets_cookie(self, client: Client):
        """
        P0-1, P0-2: POST /cart/add/ should:
        1. Properly unpack get_cart_id_from_request() tuple
        2. Return cart_id cookie for new sessions
        
        BEFORE FIX: May fail with TypeError or not set cookie
        """
        response = client.post(
            "/api/v1/cart/add/",
            data={"product_id": 1, "quantity": 1},
            content_type="application/json"
        )
        
        # Should succeed
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Should return cart_id cookie (only with proper unpacking)
        assert "cart_id" in response.cookies, "cart_id cookie should be set for new sessions"
        
        cookie = response.cookies["cart_id"]
        assert cookie["httponly"] is True, "Cookie should be HttpOnly"
        assert cookie["samesite"] == "Lax", "Cookie should have SameSite=Lax"
    
    def test_put_cart_update_unpacks_tuple_and_sets_cookie(self, client: Client):
        """
        P0-1, P0-2: PUT /cart/update/ should:
        1. Properly unpack get_cart_id_from_request() tuple
        2. Return cart_id cookie for new sessions
        """
        response = client.put(
            "/api/v1/cart/update/",
            data={"product_id": 1, "quantity": 2},
            content_type="application/json"
        )
        
        assert response.status_code == 200
        assert "cart_id" in response.cookies, "cart_id cookie should be set for new sessions"
    
    def test_delete_cart_remove_no_name_error(self, client: Client):
        """
        P0-1, P0-3: DELETE /cart/remove/{id}/ should:
        1. Properly unpack get_cart_id_from_request() tuple
        2. Not raise NameError for undefined 'is_new'
        
        BEFORE FIX: Will raise NameError: name 'is_new' is not defined
        """
        # First add an item to cart
        client.post(
            "/api/v1/cart/add/",
            data={"product_id": 1, "quantity": 1},
            content_type="application/json"
        )
        
        # Now remove it - this will raise NameError if is_new not defined
        try:
            response = client.delete("/api/v1/cart/remove/1/")
            assert response.status_code == 200, f"Expected 200, got {response.status_code}"
            # If we get here without exception, the fix is working
        except NameError as e:
            pytest.fail(f"NameError raised - 'is_new' not defined: {e}")
    
    def test_delete_cart_clear_no_tuple_error(self, client: Client):
        """
        P0-1: DELETE /cart/clear/ should:
        1. Properly unpack get_cart_id_from_request() tuple
        2. Not fail when using cart_id
        
        BEFORE FIX: cart_id is tuple, may cause issues in clear_cart
        """
        # First add an item
        client.post(
            "/api/v1/cart/add/",
            data={"product_id": 1, "quantity": 1},
            content_type="application/json"
        )
        
        # Now clear cart
        response = client.delete("/api/v1/cart/clear/")
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Cart cleared successfully"
    
    def test_cart_persists_across_requests(self, client: Client):
        """
        Integration test: Cart should persist when using the same cookie.
        
        This tests the full flow:
        1. Add item (sets cookie)
        2. Use same cookie for second request
        3. Verify item is still in cart
        """
        # First request - add item, get cookie
        response1 = client.post(
            "/api/v1/cart/add/",
            data={"product_id": 1, "quantity": 1},
            content_type="application/json"
        )
        
        assert response1.status_code == 200
        assert "cart_id" in response1.cookies, "First request should set cart_id"
        
        cart_id = response1.cookies["cart_id"].value
        
        # Second request - use same cookie to get cart
        client.cookies["cart_id"] = cart_id
        response2 = client.get("/api/v1/cart/")
        
        assert response2.status_code == 200
        data = response2.json()
        
        # Should have the item we added
        assert len(data["items"]) == 1, f"Expected 1 item, got {len(data['items'])}"
        assert data["items"][0]["product_id"] == 1
        assert data["items"][0]["quantity"] == 1
    
    def test_post_cart_add_returns_proper_response_schema(self, client: Client):
        """
        Verify POST /cart/add/ returns proper CartResponseSchema with all fields.
        """
        response = client.post(
            "/api/v1/cart/add/",
            data={"product_id": 1, "quantity": 1},
            content_type="application/json"
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response schema
        assert "items" in data
        assert "subtotal" in data
        assert "gst_amount" in data
        assert "total" in data
        assert "item_count" in data
        
        # item_count should be 1
        assert data["item_count"] == 1
