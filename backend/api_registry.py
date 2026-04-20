"""
CHA YUAN API Registry - Centralized Router Registration

This module implements the Centralized API Registry pattern for Django Ninja.
All routers are registered at import time, ensuring they are available when
Django's URL resolver runs.

Pattern: App Router → Central API Entrypoint → URLs (one-way dependency flow)

References:
- https://django-ninja.dev/guides/routers/
- https://github.com/vitalik/django-ninja/issues/436
"""

from ninja import NinjaAPI

# Create API instance with Singapore context
api = NinjaAPI(
    title="CHA YUAN API",
    version="1.0.0",
    description="Premium Tea E-Commerce API for Singapore",
    docs_url="/docs/",
    openapi_url="/openapi.json",
)

# Import and register routers at module level (eager registration)
# This ensures routers are attached BEFORE Django's URL resolver runs

# Product catalog
from apps.api.v1.products import router as products_router

api.add_router("/products/", products_router, tags=["products"])

# Shopping cart
from apps.api.v1.cart import router as cart_router

api.add_router("/cart/", cart_router, tags=["cart"])

# Checkout and payments
from apps.api.v1.checkout import router as checkout_router

api.add_router("/checkout/", checkout_router, tags=["checkout"])

# Content (articles, culture)
from apps.api.v1.content import router as content_router

api.add_router("/content/", content_router, tags=["content"])

# Quiz and preferences
from apps.api.v1.quiz import router as quiz_router

api.add_router("/quiz/", quiz_router, tags=["quiz"])

# Subscriptions (newly added)
from apps.api.v1.subscriptions import router as subscriptions_router

api.add_router("/subscriptions/", subscriptions_router, tags=["subscriptions"])
