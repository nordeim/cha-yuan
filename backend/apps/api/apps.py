"""
CHA YUAN API App Configuration

Note: Routers are registered eagerly in api_registry.py at import time,
not in the ready() method. This ensures they are available when Django's
URL resolver runs, avoiding race conditions.
"""

from django.apps import AppConfig


class ApiConfig(AppConfig):
    """Configuration for the API app."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.api"
    verbose_name = "API"

    # Router registration moved to api_registry.py for eager loading
