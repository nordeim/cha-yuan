"""
JWT Authentication with HttpOnly cookies for Singapore market.
"""

from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
import redis

# Redis client for token blacklist
redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=2,  # Token database
    decode_responses=True,
)


class JWTTokenManager:
    """Manager for JWT tokens with cookie-based storage."""

    @staticmethod
    def generate_tokens_for_user(user):
        """Generate access and refresh tokens."""
        refresh = RefreshToken.for_user(user)

        # Add Singapore timezone to token
        refresh.payload["sg_timezone"] = "Asia/Singapore"
        refresh.payload["sg_locale"] = "en-SG"

        return {
            "refresh_token": str(refresh),
            "access_token": str(refresh.access_token),
            "expires_at": timezone.now() + timedelta(minutes=15),
        }

    @staticmethod
    def validate_access_token(token):
        """Validate access token and return user."""
        try:
            from rest_framework_simplejwt.tokens import AccessToken

            access_token = AccessToken(token)

            # Check if token is blacklisted
            if redis_client.get(f"blacklist:{token}"):
                raise TokenError("Token has been blacklisted")

            user_id = access_token.payload.get("user_id")
            return user_id
        except TokenError:
            return None

    @staticmethod
    def blacklist_token(token):
        """Blacklist a token on logout."""
        try:
            from rest_framework_simplejwt.tokens import RefreshToken

            refresh_token = RefreshToken(token)
            refresh_token.blacklist()
        except TokenError:
            pass

    @staticmethod
    def rotate_refresh_token(refresh_token_str):
        """Rotate refresh token for security."""
        try:
            refresh = RefreshToken(refresh_token_str)
            # Blacklist old token
            refresh.blacklist()

            # Generate new token pair
            user_id = refresh.payload.get("user_id")
            from apps.core.models import User

            user = User.objects.get(id=user_id)
            return JWTTokenManager.generate_tokens_for_user(user)
        except (TokenError, User.DoesNotExist):
            return None


def set_auth_cookies(response, tokens, domain=None):
    """Set HttpOnly authentication cookies."""
    cookie_settings = {
        "httponly": True,
        "secure": not settings.DEBUG,  # Secure in production
        "samesite": "Lax",
        "domain": domain or ("localhost" if settings.DEBUG else ".cha-yuan.sg"),
    }

    # Access token - short lived (15 min)
    response.set_cookie(
        "access_token",
        tokens["access_token"],
        max_age=900,  # 15 minutes
        **cookie_settings,
    )

    # Refresh token - long lived (7 days)
    response.set_cookie(
        "refresh_token",
        tokens["refresh_token"],
        max_age=604800,  # 7 days
        path="/api/v1/auth/refresh",  # Only sent to refresh endpoint
        **cookie_settings,
    )


def clear_auth_cookies(response, domain=None):
    """Clear authentication cookies on logout."""
    cookie_settings = {
        "domain": domain or ("localhost" if settings.DEBUG else ".cha-yuan.sg"),
        "httponly": True,
        "secure": not settings.DEBUG,
        "samesite": "Lax",
    }

    response.delete_cookie("access_token", **cookie_settings)
    response.delete_cookie(
        "refresh_token", path="/api/v1/auth/refresh", **cookie_settings
    )


class JWTAuth:
    """
    JWT Authentication class for Django Ninja.

    Usage:
        @router.get("/", auth=JWTAuth(required=False))
        def my_endpoint(request):
            ...
    """

    def __init__(self, required=True):
        """
        Initialize JWTAuth.

        Args:
            required: If True, authentication is mandatory. If False, optional.
        """
        self.required = required

    def __call__(self, request):
        """
        Authenticate the request.

        Returns:
            User instance if authenticated, None if not required and no token.
            Raises AuthenticationError if required and no valid token.
        """
        token = request.COOKIES.get("access_token")
        if not token:
            if self.required:
                from ninja.errors import HttpError

                raise HttpError(401, "Authentication required")
            return None

        user_id = JWTTokenManager.validate_access_token(token)
        if user_id:
            from apps.core.models import User

            try:
                return User.objects.get(id=user_id, is_active=True)
            except User.DoesNotExist:
                pass

        if self.required:
            from ninja.errors import HttpError

            raise HttpError(401, "Invalid or expired token")
        return None


# Backwards compatibility alias
JWTCookieAuthentication = JWTAuth
