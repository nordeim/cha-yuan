# Production Settings Design Document
## CHA YUAN Django Backend

### Purpose
Production configuration for secure, performant deployment. Extends base.py with security hardening, logging, and infrastructure settings.

### Design Principles
1. **Security-first**: All security headers enabled, debug disabled, secrets from environment
2. **Performance**: Connection pooling, static file compression, caching
3. **Observability**: Structured logging, error reporting, metrics
4. **Singapore compliance**: Timezone, locale, GST settings preserved

---

## Required Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SECRET_KEY` | ✅ Yes | Django secret key | 50+ char random string |
| `ALLOWED_HOSTS` | ✅ Yes | Comma-separated domains | `cha-yuan.sg,www.cha-yuan.sg` |
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string | `postgres://user:pass@host:5432/db` |
| `REDIS_URL` | ✅ Yes | Redis connection string | `redis://:password@host:6379/0` |
| `STRIPE_SECRET_KEY_SG` | ✅ Yes | Stripe secret key | `sk_live_...` |
| `STRIPE_PUBLISHABLE_KEY_SG` | ✅ Yes | Stripe publishable key | `pk_live_...` |
| `STRIPE_WEBHOOK_SECRET_SG` | ✅ Yes | Stripe webhook secret | `whsec_...` |
| `SECURE_SSL_REDIRECT` | ❌ No | Force HTTPS (default: True) | `True` or `False` |
| `SECURE_HSTS_SECONDS` | ❌ No | HSTS max-age (default: 31536000) | `31536000` |
| `EMAIL_HOST` | ❌ No | SMTP server | `smtp.sendgrid.net` |
| `EMAIL_PORT` | ❌ No | SMTP port | `587` |
| `EMAIL_HOST_USER` | ❌ No | SMTP username | `apikey` |
| `EMAIL_HOST_PASSWORD` | ❌ No | SMTP password | `SG.xxx` |
| `DEFAULT_FROM_EMAIL` | ❌ No | From address | `orders@cha-yuan.sg` |
| `SENTRY_DSN` | ❌ No | Sentry error tracking | `https://...@sentry.io/...` |

---

## Security Configuration

### Django Security Middleware Settings

```python
# HTTPS enforcement
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# HSTS (HTTP Strict Transport Security)
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Cookie security
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"

# Content Security Policy (via django-csp if installed)
# CSP_DEFAULT_SRC = ("'self'",)
# CSP_SCRIPT_SRC = ("'self'", "https://js.stripe.com")
# CSP_STYLE_SRC = ("'self'", "'unsafe-inline'")
# CSP_IMG_SRC = ("'self'", "data:", "https:")
# CSP_CONNECT_SRC = ("'self'", "https://api.stripe.com")

# Security headers
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# Clickjacking protection for iframes
X_FRAME_OPTIONS = "DENY"
```

### Password Validation (Strengthened)

```python
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
```

---

## Database Configuration

```python
# Production PostgreSQL with connection pooling
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB", "chayuan_db"),
        "USER": os.getenv("POSTGRES_USER", "chayuan_user"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD"),
        "HOST": os.getenv("POSTGRES_HOST"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
        "OPTIONS": {
            "connect_timeout": 10,
            "options": "-c timezone=Asia/Singapore",
        },
        "CONN_MAX_AGE": 60,  # Connection pooling (60 seconds)
        "CONN_HEALTH_CHECKS": True,
    }
}

# Require environment variables for sensitive data
if not os.getenv("POSTGRES_PASSWORD"):
    raise ImproperlyConfigured("POSTGRES_PASSWORD environment variable is required")
if not os.getenv("POSTGRES_HOST"):
    raise ImproperlyConfigured("POSTGRES_HOST environment variable is required")
```

---

## Cache Configuration (Redis)

```python
# Production Redis cache
redis_url = os.getenv("REDIS_URL")
if not redis_url:
    raise ImproperlyConfigured("REDIS_URL environment variable is required")

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": redis_url,
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "CONNECTION_POOL_KWARGS": {
                "max_connections": 50,
            },
        },
        "KEY_PREFIX": "chayuan_prod",
        "TIMEOUT": 300,  # 5 minutes default
    }
}

# Session cache (use Redis)
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "default"

# Cart cache settings (30-day TTL)
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
```

---

## Static Files (WhiteNoise)

```python
# Static files via WhiteNoise (middleware already in base.py)
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# WhiteNoise compression and caching
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Ensure collectstatic runs during deployment
# Docker CMD: python manage.py collectstatic --noinput
```

---

## Email Configuration (Production SMTP)

```python
# Production email via SMTP (SendGrid, AWS SES, etc.)
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = os.getenv("EMAIL_HOST", "localhost")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "orders@cha-yuan.sg")
SERVER_EMAIL = os.getenv("SERVER_EMAIL", "errors@cha-yuan.sg")
```

---

## Logging Configuration

```python
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
        "json": {
            "class": "pythonjsonlogger.jsonlogger.JsonFormatter",
            "format": "%(asctime)s %(levelname)s %(name)s %(message)s",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": BASE_DIR / "logs" / "django.log",
            "maxBytes": 10485760,  # 10 MB
            "backupCount": 5,
            "formatter": "verbose",
        },
        "error_file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": BASE_DIR / "logs" / "error.log",
            "maxBytes": 10485760,  # 10 MB
            "backupCount": 5,
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
            "handlers": ["error_file"],
            "level": "ERROR",
            "propagate": False,
        },
        "django.security": {
            "handlers": ["error_file"],
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
    },
}
```

---

## Error Handling (Sentry Optional)

```python
# Sentry error tracking (optional)
sentry_dsn = os.getenv("SENTRY_DSN")
if sentry_dsn:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration

    sentry_sdk.init(
        dsn=sentry_dsn,
        integrations=[DjangoIntegration()],
        traces_sample_rate=0.1,  # 10% of requests traced
        profiles_sample_rate=0.1,
        send_default_pii=True,  # Include user context
        environment="production",
    )
```

---

## Rate Limiting (API)

```python
# Django Ratelimit (if installed)
# RATELIMIT_ENABLE = True
# RATELIMIT_USE_CACHE = "default"
# RATELIMIT_KEY_FUNCTION = "apps.core.utils.get_client_ip"
```

---

## File Structure

```
backend/
├── chayuan/
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py          # Shared settings
│   │   ├── development.py   # Dev overrides
│   │   ├── production.py    # NEW: Production settings
│   │   ├── test.py          # Test overrides
│   │   └── production_design.md  # This document
```

---

## Deployment Checklist

- [ ] Set `DJANGO_SETTINGS_MODULE=chayuan.settings.production`
- [ ] Configure all required environment variables
- [ ] Run `python manage.py check --deploy` (Django security check)
- [ ] Run `python manage.py migrate`
- [ ] Run `python manage.py collectstatic --noinput`
- [ ] Verify `SECRET_KEY` is strong (50+ chars, random)
- [ ] Verify `ALLOWED_HOSTS` includes production domain
- [ ] Configure SSL certificate
- [ ] Set up log directory (`mkdir -p logs`)
- [ ] Configure backup strategy for database
- [ ] Test Stripe webhook endpoints with production keys

---

## Validation Commands

```bash
# Test settings load
DJANGO_SETTINGS_MODULE=chayuan.settings.production python -c "from django.conf import settings; print('Settings loaded:', settings.DEBUG)"

# Django deployment check
python manage.py check --deploy --settings=chayuan.settings.production

# Verify static files
python manage.py collectstatic --noinput --settings=chayuan.settings.production
```
