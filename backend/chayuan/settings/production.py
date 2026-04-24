"""
Production settings for CHA YUAN.

Security-first configuration for production deployment.
All sensitive values must be set via environment variables.
"""

import os
import sentry_sdk
from pathlib import Path
from sentry_sdk.integrations.django import DjangoIntegration

from .base import *

# ============================================================================
# Core Security Settings
# ============================================================================

DEBUG = False

# Allow production domain(s) only
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")
ALLOWED_HOSTS = [host.strip() for host in ALLOWED_HOSTS if host.strip()]

if not ALLOWED_HOSTS:
    raise ImproperlyConfigured(
        "ALLOWED_HOSTS environment variable is required. "
        "Set to your production domain(s), e.g., 'cha-yuan.sg,www.cha-yuan.sg'"
    )

# ============================================================================
# Secret Key
# ============================================================================

SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise ImproperlyConfigured(
        "SECRET_KEY environment variable is required in production. "
        "Generate a secure key: python -c 'import secrets; print(secrets.token_urlsafe(50))'"
    )

if len(SECRET_KEY) < 50:
    import warnings
    warnings.warn(
        "SECRET_KEY should be at least 50 characters for security",
        RuntimeWarning,
    )

# ============================================================================
# HTTPS Enforcement
# ============================================================================

SECURE_SSL_REDIRECT = os.getenv("SECURE_SSL_REDIRECT", "True").lower() in ("true", "1", "yes")
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# HSTS (HTTP Strict Transport Security)
SECURE_HSTS_SECONDS = int(os.getenv("SECURE_HSTS_SECONDS", "31536000"))  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Cookie security
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"

# ============================================================================
# Security Headers
# ============================================================================

SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# ============================================================================
# Content Security Policy (django-csp 4.0+ format)
# ============================================================================

INSTALLED_APPS += ["csp"]

CONTENT_SECURITY_POLICY = {
    "DIRECTIVES": {
        "default-src": ("'self'",),
        "script-src": (
            "'self'",
            "https://js.stripe.com",
            "https://hooks.stripe.com",
        ),
        "style-src": (
            "'self'",
            "'unsafe-inline'",  # Required for some admin styles
        ),
        "img-src": (
            "'self'",
            "data:",
            "https:",
            "blob:",
        ),
        "connect-src": (
            "'self'",
            "https://api.stripe.com",
            "https://r.stripe.com",
        ),
        "font-src": ("'self'", "https:"),
        "frame-src": (
            "'self'",
            "https://js.stripe.com",
            "https://hooks.stripe.com",
        ),
        "frame-ancestors": ("'none'",),  # Prevent framing
        "base-uri": ("'self'",),
        "form-action": ("'self'",),
    }
}

# ============================================================================
# Database (Production)
# ============================================================================

POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_HOST = os.getenv("POSTGRES_HOST")

if not POSTGRES_PASSWORD:
    raise ImproperlyConfigured("POSTGRES_PASSWORD environment variable is required")

if not POSTGRES_HOST:
    raise ImproperlyConfigured("POSTGRES_HOST environment variable is required")

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB", "chayuan_db"),
        "USER": os.getenv("POSTGRES_USER", "chayuan_user"),
        "PASSWORD": POSTGRES_PASSWORD,
        "HOST": POSTGRES_HOST,
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
        "OPTIONS": {
            "connect_timeout": 10,
            "options": "-c timezone=Asia/Singapore",
        },
        "CONN_MAX_AGE": 60,  # Connection pooling: 60 seconds
        "CONN_HEALTH_CHECKS": True,
    }
}

# ============================================================================
# Redis Cache (Production)
# ============================================================================

REDIS_URL = os.getenv("REDIS_URL")

if not REDIS_URL:
    raise ImproperlyConfigured(
        "REDIS_URL environment variable is required. "
        "Format: redis://:password@host:6379/0"
    )

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": REDIS_URL,
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "CONNECTION_POOL_KWARGS": {
                "max_connections": 50,
                "retry_on_timeout": True,
            },
            "SOCKET_CONNECT_TIMEOUT": 5,
            "SOCKET_TIMEOUT": 5,
        },
        "KEY_PREFIX": "chayuan_prod",
        "TIMEOUT": 300,  # 5 minutes default
    }
}

# Use Redis for sessions
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "default"

# Session TTL (2 weeks)
SESSION_COOKIE_AGE = 1209600

# ============================================================================
# Static Files (WhiteNoise)
# ============================================================================

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# WhiteNoise storage with compression and manifest file
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Insert WhiteNoise middleware after SecurityMiddleware
MIDDLEWARE.insert(
    MIDDLEWARE.index("django.middleware.security.SecurityMiddleware") + 1,
    "whitenoise.middleware.WhiteNoiseMiddleware"
)

# ============================================================================
# Media Files
# ============================================================================

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ============================================================================
# Email (Production SMTP)
# ============================================================================

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = os.getenv("EMAIL_HOST", "localhost")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "orders@cha-yuan.sg")
SERVER_EMAIL = os.getenv("SERVER_EMAIL", "errors@cha-yuan.sg")
EMAIL_SUBJECT_PREFIX = "[CHA YUAN] "

# ============================================================================
# Password Validation (Strengthened)
# ============================================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 10},
    },
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ============================================================================
# Logging
# ============================================================================

# Ensure log directory exists
LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": LOG_DIR / "django.log",
            "maxBytes": 10485760,  # 10 MB
            "backupCount": 10,
            "formatter": "verbose",
        },
        "error_file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": LOG_DIR / "error.log",
            "maxBytes": 10485760,  # 10 MB
            "backupCount": 10,
            "formatter": "verbose",
            "level": "ERROR",
        },
    },
    "root": {
        "handlers": ["console", "file"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "django.request": {
            "handlers": ["console", "file", "error_file"],
            "level": "WARNING",
            "propagate": False,
        },
        "django.security": {
            "handlers": ["console", "file", "error_file"],
            "level": "WARNING",
            "propagate": False,
        },
        "commerce": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "commerce.stripe": {
            "handlers": ["console", "file", "error_file"],
            "level": "INFO",
            "propagate": False,
        },
        "commerce.cart": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
    },
}

# ============================================================================
# Sentry Error Tracking (Optional)
# ============================================================================

SENTRY_DSN = os.getenv("SENTRY_DSN")

if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration()],
        traces_sample_rate=0.1,  # 10% of requests traced
        profiles_sample_rate=0.1,
        send_default_pii=True,  # Include user context for better debugging
        environment="production",
        release=os.getenv("GIT_COMMIT", "unknown"),  # Track deployments
    )

# ============================================================================
# Rate Limiting (django-ratelimit)
# ============================================================================

RATELIMIT_ENABLE = True
RATELIMIT_USE_CACHE = "default"

# ============================================================================
# Stripe Keys (Production)
# ============================================================================

STRIPE_SECRET_KEY_SG = os.getenv("STRIPE_SECRET_KEY_SG")
STRIPE_PUBLISHABLE_KEY_SG = os.getenv("STRIPE_PUBLISHABLE_KEY_SG")
STRIPE_WEBHOOK_SECRET_SG = os.getenv("STRIPE_WEBHOOK_SECRET_SG")

if not STRIPE_SECRET_KEY_SG:
    raise ImproperlyConfigured("STRIPE_SECRET_KEY_SG environment variable is required")

if not STRIPE_PUBLISHABLE_KEY_SG:
    raise ImproperlyConfigured("STRIPE_PUBLISHABLE_KEY_SG environment variable is required")

if not STRIPE_WEBHOOK_SECRET_SG:
    raise ImproperlyConfigured("STRIPE_WEBHOOK_SECRET_SG environment variable is required")

# Validate Stripe keys are not test keys in production
if STRIPE_SECRET_KEY_SG.startswith("sk_test_"):
    import warnings
    warnings.warn(
        "Using Stripe test keys in production! "
        "Set STRIPE_SECRET_KEY_SG to a live key (sk_live_...)",
        RuntimeWarning,
    )

# ============================================================================
# Additional Security Middleware
# ============================================================================

# Add CSP middleware
MIDDLEWARE.insert(
    MIDDLEWARE.index("django.middleware.security.SecurityMiddleware") + 1,
    "csp.middleware.CSPMiddleware"
)

# ============================================================================
# Admin Settings
# ============================================================================

# Admin URL (change from default /admin/ in production for obscurity)
ADMIN_URL = os.getenv("ADMIN_URL", "admin/")

# ============================================================================
# Production Checks
# ============================================================================

def check_database_connection():
    """Verify database is accessible."""
    from django.db import connections
    from django.db.utils import OperationalError
    
    try:
        connections["default"].cursor()
    except OperationalError as e:
        raise ImproperlyConfigured(f"Database connection failed: {e}")

def check_redis_connection():
    """Verify Redis is accessible."""
    from django.core.cache import cache
    from redis.exceptions import ConnectionError
    
    try:
        cache.set("_health_check", "ok", timeout=10)
        assert cache.get("_health_check") == "ok"
    except ConnectionError as e:
        raise ImproperlyConfigured(f"Redis connection failed: {e}")

# Run checks on startup (optional, can be disabled)
if os.getenv("RUN_STARTUP_CHECKS", "True").lower() == "true":
    check_database_connection()
    check_redis_connection()
