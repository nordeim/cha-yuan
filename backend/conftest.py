"""
pytest configuration for CHA YUAN backend.
"""

import os
import sys
import django
from django.conf import settings

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configure Django settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "chayuan.settings.test")

# Setup Django
django.setup()
