"""
CHA YUAN API - Django Ninja

Main API initialization with router aggregation.
"""

from ninja import NinjaAPI


# Create API instance
api = NinjaAPI(
    title="CHA YUAN API",
    version="1.0.0",
    description="Premium Tea E-Commerce API for Singapore",
    docs_url="/api/docs/",
    openapi_url="/api/openapi.json",
)


def register_routers():
    """Register API routers (call this after Django is fully initialized)."""
    # Import routers here to avoid circular imports
    from apps.api.v1.products import router as products_router
    from apps.api.v1.cart import router as cart_router
    from apps.api.v1.checkout import router as checkout_router
    from apps.api.v1.content import router as content_router
    from apps.api.v1.quiz import router as quiz_router
    from apps.api.v1.subscriptions import router as subscriptions_router

    api.add_router("/products/", products_router, tags=["products"])
    api.add_router("/cart/", cart_router, tags=["cart"])
    api.add_router("/checkout/", checkout_router, tags=["checkout"])
    api.add_router("/content/", content_router, tags=["content"])
    api.add_router("/quiz/", quiz_router, tags=["quiz"])
    api.add_router("/subscriptions/", subscriptions_router, tags=["subscriptions"])
