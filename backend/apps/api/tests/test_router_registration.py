"""
Test API router registration and endpoint accessibility.

TDD Approach:
1. Write test that expects endpoints to be accessible
2. Run test (should fail with current implementation)
3. Implement fix
4. Run test (should pass)
5. Refactor if needed
"""

import pytest
from django.test import Client
from django.urls import reverse, resolve


@pytest.mark.django_db
def test_products_endpoint_is_registered():
    """
    Test that /api/v1/products/ endpoint is accessible.

    This test validates the Django Ninja router registration is working
    at import time, not just in the ready() method.
    """
    client = Client()
    # Products endpoint is at /api/v1/products/products/ (router adds /products/ prefix)
    response = client.get("/api/v1/products/products/", HTTP_HOST="testserver")

    # Should not return 404 (Not Found) if router is properly registered
    # Note: May return 401 (Unauthorized) or 200 (OK) depending on auth
    assert response.status_code != 404, (
        f"Products endpoint should be registered, got {response.status_code}"
    )
    assert response.status_code != 500, "Products endpoint should not error"


@pytest.mark.django_db
def test_subscriptions_endpoint_is_registered():
    """
    Test that /api/v1/subscriptions/current endpoint is accessible.

    This validates the subscriptions router was properly registered.
    """
    client = Client()
    # Django Ninja requires trailing slash
    response = client.get("/api/v1/subscriptions/current/", HTTP_HOST="testserver")

    # Should not return 404 (Not Found) if router is properly registered
    # Subscriptions endpoint returns 401 (Unauthorized) when not authenticated, which is expected
    assert response.status_code != 404, (
        f"Subscriptions endpoint should be registered, got {response.status_code}"
    )
    assert response.status_code != 500, "Subscriptions endpoint should not error"
    # Should return 401 (Unauthorized) not 404 (Not Found)
    assert response.status_code == 401, (
        f"Expected 401 Unauthorized, got {response.status_code}"
    )


@pytest.mark.django_db
def test_api_docs_endpoint_is_registered():
    """
    Test that /api/v1/docs/ endpoint is accessible.

    This validates the Django Ninja docs are properly configured.
    """
    client = Client()
    response = client.get("/api/v1/docs/", HTTP_HOST="testserver")

    # Docs should return 200 OK
    assert response.status_code == 200, (
        f"API docs endpoint should be accessible, got {response.status_code}"
    )


@pytest.mark.django_db
def test_all_routers_registered_at_import_time():
    """
    Test that all API routers are registered when the module is imported.

    This validates the eager registration pattern is working correctly.
    """
    # Import from the centralized registry - routers should already be attached
    from api_registry import api

    # Check that routers are attached (api.urls should contain paths)
    urls = api.urls

    # The api.urls should not be empty if routers are registered
    assert urls is not None, "API URLs should be defined"

    # Get the URL patterns
    url_patterns = getattr(urls, "urlpatterns", urls)

    # Should have multiple routes registered
    assert len(url_patterns) > 0, "At least one router should be registered"

    # Check specific routers are registered
    from api_registry import api as registry_api

    # The api object should have _routers attribute with registered routers
    assert hasattr(registry_api, "_routers") or hasattr(registry_api, "routers"), (
        "API should have registered routers"
    )

    # Check subscriptions router is registered specifically
    router_patterns = [str(p.pattern) for p in url_patterns]
    assert any("subscription" in p for p in router_patterns), (
        f"Subscriptions router should be registered. Found patterns: {router_patterns}"
    )
