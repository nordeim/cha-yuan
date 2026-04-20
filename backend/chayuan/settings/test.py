"""
Test settings for CHA YUAN.
Uses PostgreSQL test database for consistency with production.
"""

from .base import *

# Use PostgreSQL test database (separate from production)
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "chayuan_test_db",
        "USER": os.getenv("POSTGRES_USER", "chayuan_user"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", "chayuan_dev_password"),
        "HOST": os.getenv("POSTGRES_HOST", "localhost"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
    }
}

# Use dummy cache for tests
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.dummy.DummyCache",
    }
}

# Faster password hashing
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

DEBUG = True
SECRET_KEY = "test-secret-key"

# Allow testserver for Django test client
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "[::1]", "testserver"]

# Disable logging during tests
LOGGING = {}
