"""
Authentication API Endpoints - Django Ninja

Handles login, logout, token refresh, and user profile.
"""

from ninja import Router, Schema
from ninja.errors import HttpError
from django.http import HttpRequest
from django.contrib.auth import authenticate
from apps.core.authentication import (
    JWTTokenManager,
    set_auth_cookies,
    clear_auth_cookies,
)
from apps.core.models import User

router = Router(tags=["auth"])


# ============================================================================
# Schemas
# ============================================================================


class LoginRequestSchema(Schema):
    """Login request body."""

    email: str
    password: str


class LoginResponseSchema(Schema):
    """Login response."""

    message: str
    user: dict


class UserProfileSchema(Schema):
    """User profile response."""

    id: int
    email: str
    first_name: str
    last_name: str
    phone: str
    postal_code: str
    has_pdpa_consent: bool


class TokenRefreshResponseSchema(Schema):
    """Token refresh response."""

    message: str


class MessageSchema(Schema):
    """Generic message response."""

    message: str


# ============================================================================
# Endpoints
# ============================================================================


@router.post("/login/", response=LoginResponseSchema)
def login(request: HttpRequest, data: LoginRequestSchema):
    """
    Authenticate user and set JWT cookies.

    Returns user profile on success, 401 on failure.
    """
    user = authenticate(request, email=data.email, password=data.password)

    if not user:
        raise HttpError(401, "Invalid email or password")

    if not user.is_active:
        raise HttpError(401, "Account is disabled")

    # Generate tokens
    tokens = JWTTokenManager.generate_tokens_for_user(user)

    # Build response with cookies
    from django.http import JsonResponse

    response_data = {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": user.phone,
            "postal_code": user.postal_code,
            "has_pdpa_consent": bool(user.pdpa_consent_at),
        },
    }

    response = JsonResponse(response_data)
    set_auth_cookies(response, tokens)

    return response


@router.post("/logout/", response=MessageSchema)
def logout(request: HttpRequest):
    """
    Logout user and clear authentication cookies.

    Also blacklists the refresh token.
    """
    from django.http import JsonResponse

    # Blacklist refresh token if present
    refresh_token = request.COOKIES.get("refresh_token")
    if refresh_token:
        JWTTokenManager.blacklist_token(refresh_token)

    response = JsonResponse({"message": "Logout successful"})
    clear_auth_cookies(response)

    return response


@router.post("/refresh/", response=TokenRefreshResponseSchema)
def refresh_token(request: HttpRequest):
    """
    Refresh access token using refresh token.

    Rotates the refresh token for security.
    """
    refresh_token_str = request.COOKIES.get("refresh_token")

    if not refresh_token_str:
        raise HttpError(401, "No refresh token provided")

    # Rotate tokens
    new_tokens = JWTTokenManager.rotate_refresh_token(refresh_token_str)

    if not new_tokens:
        raise HttpError(401, "Invalid or expired refresh token")

    # Build response with new cookies
    from django.http import JsonResponse

    response = JsonResponse({"message": "Token refreshed successfully"})
    set_auth_cookies(response, new_tokens)

    return response


@router.get("/me/", response=UserProfileSchema)
def get_current_user(request: HttpRequest):
    """
    Get current authenticated user profile.

    Requires valid access token.
    """
    # Get token from cookie
    token = request.COOKIES.get("access_token")
    if not token:
        raise HttpError(401, "Authentication required")

    # Validate token
    user_id = JWTTokenManager.validate_access_token(token)
    if not user_id:
        raise HttpError(401, "Invalid or expired token")

    # Get user
    try:
        user = User.objects.get(id=user_id, is_active=True)
    except User.DoesNotExist:
        raise HttpError(401, "User not found")

    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
        "postal_code": user.postal_code,
        "has_pdpa_consent": bool(user.pdpa_consent_at),
    }


# ============================================================================
# Public user registration (optional)
# ============================================================================


class RegisterRequestSchema(Schema):
    """Registration request body."""

    email: str
    password: str
    first_name: str
    last_name: str
    phone: str
    postal_code: str
    pdpa_consent: bool = False


class RegisterResponseSchema(Schema):
    """Registration response."""

    message: str
    user: dict


@router.post("/register/", response=RegisterResponseSchema)
def register(request: HttpRequest, data: RegisterRequestSchema):
    """
    Register a new user account.

    Creates user and logs them in automatically.
    """
    from django.db import IntegrityError
    from django.utils import timezone

    # Validate PDPA consent
    if not data.pdpa_consent:
        raise HttpError(400, "PDPA consent is required for registration")

    # Check if email exists
    if User.objects.filter(email=data.email).exists():
        raise HttpError(400, "Email already registered")

    try:
        # Create user
        user = User.objects.create_user(
            email=data.email,
            password=data.password,
            first_name=data.first_name,
            last_name=data.last_name,
            phone=data.phone,
            postal_code=data.postal_code,
            pdpa_consent_at=timezone.now() if data.pdpa_consent else None,
        )

        # Generate tokens
        tokens = JWTTokenManager.generate_tokens_for_user(user)

        # Build response
        from django.http import JsonResponse

        response_data = {
            "message": "Registration successful",
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "phone": user.phone,
                "postal_code": user.postal_code,
                "has_pdpa_consent": bool(user.pdpa_consent_at),
            },
        }

        response = JsonResponse(response_data)
        set_auth_cookies(response, tokens)

        return response

    except IntegrityError:
        raise HttpError(400, "Registration failed. Please try again.")
