"""
URL configuration for chayuan project.

Uses Centralized API Registry pattern for Django Ninja.
Routers are registered at import time in api_registry.py.
"""

from django.contrib import admin
from django.urls import path

# Import from centralized API registry
# Routers are registered at import time (eager registration)
from api_registry import api

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", api.urls),
]
