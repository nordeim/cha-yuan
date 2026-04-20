# Phase 2 Sub-Plan: Authentication & BFF Layer

> **Phase:** 2  
> **Duration:** Days 8-12  
> **TDD Principle:** Write auth tests → Implement JWT flow → Validate  
> **Status:** READY FOR EXECUTION

---

## Deep Analysis: Authentication Architecture

### Security Requirements

1. **JWT Token Storage**: HttpOnly cookies (XSS protection)
2. **Token Rotation**: Short-lived access tokens + long-lived refresh tokens
3. **CSRF Protection**: Required for state-changing operations
4. **PDPA Compliance**: Consent required before authentication
5. **Singapore Context**: SG timezone for token expiry, localized error messages

### Architecture Pattern: BFF (Backend for Frontend)

```
┌─────────────────────────────────────────────────────────────┐
│ CLIENT (Browser)                                            │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Next.js 16 (App Router)                              │   │
│ │  ├─ Server Components: fetch via authFetch          │   │
│ │  ├─ Client Components: fetch via /api/proxy         │   │
│ │  └─ BFF Proxy: /api/proxy/[...path]                 │   │
│ └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTPS
┌─────────────────────────────────────────────────────────────┐
│ BFF PROXY (Next.js API Route)                               │
│  ├─ Read JWT from HttpOnly cookie                          │
│  ├─ Validate/refresh token if needed                       │
│  ├─ Forward to Django with Authorization header            │
│  └─ Return Django response to client                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ Internal Network
┌─────────────────────────────────────────────────────────────┐
│ DJANGO API (Django Ninja)                                   │
│  ├─ JWT Authentication (djangorestframework-simplejwt)       │
│  ├─ Protected endpoints validate Bearer token               │
│  └─ Returns JSON response                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Task Breakdown

### Task 2.1: JWT Authentication Backend

**Rationale**: Secure JWT authentication with HttpOnly cookie storage.

**Files to Create (Test-First):**

| Test File | Coverage Target | Test Cases |
|-----------|-----------------|------------|
| `apps/core/tests/test_auth_jwt.py` | 100% | Token generation, validation, expiry, rotation |
| `apps/core/tests/test_auth_login.py` | 100% | Login flow, PDPA consent check, error messages |
| `apps/core/tests/test_auth_middleware.py` | 100% | Token extraction from cookies, validation |

**Implementation Files:**

**File:** `apps/core/authentication.py`

```python
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
    decode_responses=True
)

class JWTTokenManager:
    """Manager for JWT tokens with cookie-based storage."""
    
    @staticmethod
    def generate_tokens_for_user(user):
        """Generate access and refresh tokens."""
        refresh = RefreshToken.for_user(user)
        
        # Add Singapore timezone to token
        refresh.payload['sg_timezone'] = 'Asia/Singapore'
        refresh.payload['sg_locale'] = 'en-SG'
        
        return {
            'refresh_token': str(refresh),
            'access_token': str(refresh.access_token),
            'expires_at': timezone.now() + timedelta(minutes=15)
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
            
            user_id = access_token.payload.get('user_id')
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
            user_id = refresh.payload.get('user_id')
            from apps.core.models import User
            user = User.objects.get(id=user_id)
            return JWTTokenManager.generate_tokens_for_user(user)
        except (TokenError, User.DoesNotExist):
            return None


def set_auth_cookies(response, tokens, domain=None):
    """Set HttpOnly authentication cookies."""
    cookie_settings = {
        'httponly': True,
        'secure': not settings.DEBUG,  # Secure in production
        'samesite': 'Lax',
        'domain': domain or ('localhost' if settings.DEBUG else '.cha-yuan.sg')
    }
    
    # Access token - short lived (15 min)
    response.set_cookie(
        'access_token',
        tokens['access_token'],
        max_age=900,  # 15 minutes
        **cookie_settings
    )
    
    # Refresh token - long lived (7 days)
    response.set_cookie(
        'refresh_token',
        tokens['refresh_token'],
        max_age=604800,  # 7 days
        path='/api/v1/auth/refresh',  # Only sent to refresh endpoint
        **cookie_settings
    )


def clear_auth_cookies(response, domain=None):
    """Clear authentication cookies on logout."""
    cookie_settings = {
        'domain': domain or ('localhost' if settings.DEBUG else '.cha-yuan.sg'),
        'httponly': True,
        'secure': not settings.DEBUG,
        'samesite': 'Lax'
    }
    
    response.delete_cookie('access_token', **cookie_settings)
    response.delete_cookie('refresh_token', path='/api/v1/auth/refresh', **cookie_settings)


class JWTCookieAuthentication:
    """Custom authentication class for Django Ninja."""
    
    @staticmethod
    def authenticate(request):
        """Authenticate request using JWT from cookie."""
        from apps.core.models import User
        
        token = request.COOKIES.get('access_token')
        if not token:
            return None
        
        user_id = JWTTokenManager.validate_access_token(token)
        if user_id:
            try:
                return User.objects.get(id=user_id, is_active=True)
            except User.DoesNotExist:
                return None
        return None
```

**File:** `apps/api/v1/auth.py` (Django Ninja)

```python
"""
Authentication API endpoints using Django Ninja.
"""

from ninja import Router, Schema
from ninja.security import django_auth
from django.contrib.auth import authenticate
from django.http import JsonResponse
from pydantic import EmailStr

from apps.core.models import User
from apps.core.authentication import (
    JWTTokenManager,
    set_auth_cookies,
    clear_auth_cookies,
    JWTCookieAuthentication
)

router = Router(tags=["Authentication"])


class LoginSchema(Schema):
    email: EmailStr
    password: str
    pdpa_consent: bool = False


class RegisterSchema(Schema):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: str = ""
    postal_code: str = ""
    pdpa_consent: bool
    pdpa_consent_version: str = "1.0"


class TokenResponse(Schema):
    success: bool
    message: str
    user: dict = None


class UserProfileSchema(Schema):
    email: str
    first_name: str
    last_name: str
    phone: str
    postal_code: str
    has_pdpa_consent: bool


@router.post("/login", response={200: TokenResponse, 401: TokenResponse})
def login(request, payload: LoginSchema):
    """
    Authenticate user and return JWT tokens in HttpOnly cookies.
    Requires PDPA consent for Singapore compliance.
    """
    # Authenticate user
    user = authenticate(email=payload.email, password=payload.password)
    
    if not user:
        return 401, TokenResponse(
            success=False,
            message="Invalid email or password"
        )
    
    # Check PDPA consent for Singapore users
    if not user.has_pdpa_consent():
        return 401, TokenResponse(
            success=False,
            message="PDPA consent required. Please review and accept our privacy policy."
        )
    
    # Generate tokens
    tokens = JWTTokenManager.generate_tokens_for_user(user)
    
    # Create response
    response = JsonResponse({
        "success": True,
        "message": "Login successful",
        "user": {
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name
        }
    })
    
    # Set HttpOnly cookies
    set_auth_cookies(response, tokens)
    
    return response


@router.post("/register", response={201: TokenResponse, 400: TokenResponse})
def register(request, payload: RegisterSchema):
    """
    Register new user with Singapore validation.
    Requires PDPA consent.
    """
    # Validate PDPA consent
    if not payload.pdpa_consent:
        return 400, TokenResponse(
            success=False,
            message="PDPA consent is required to create an account"
        )
    
    # Check if user exists
    if User.objects.filter(email=payload.email).exists():
        return 400, TokenResponse(
            success=False,
            message="An account with this email already exists"
        )
    
    # Create user
    try:
        user = User.objects.create_user(
            email=payload.email,
            password=payload.password,
            first_name=payload.first_name,
            last_name=payload.last_name,
            phone=payload.phone,
            postal_code=payload.postal_code,
            pdpa_consent_at=timezone.now(),
            pdpa_consent_version=payload.pdpa_consent_version
        )
    except ValueError as e:
        return 400, TokenResponse(
            success=False,
            message=str(e)
        )
    
    # Generate tokens
    tokens = JWTTokenManager.generate_tokens_for_user(user)
    
    # Create response
    response = JsonResponse({
        "success": True,
        "message": "Account created successfully",
        "user": {
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name
        }
    }, status=201)
    
    # Set HttpOnly cookies
    set_auth_cookies(response, tokens)
    
    return response


@router.post("/logout", response={200: TokenResponse})
def logout(request):
    """Logout user and clear authentication cookies."""
    refresh_token = request.COOKIES.get('refresh_token')
    
    if refresh_token:
        JWTTokenManager.blacklist_token(refresh_token)
    
    response = JsonResponse({
        "success": True,
        "message": "Logged out successfully"
    })
    
    clear_auth_cookies(response)
    return response


@router.post("/refresh", response={200: TokenResponse, 401: TokenResponse})
def refresh_token(request):
    """Refresh access token using refresh token."""
    refresh_token = request.COOKIES.get('refresh_token')
    
    if not refresh_token:
        return 401, TokenResponse(
            success=False,
            message="Refresh token required"
        )
    
    # Rotate tokens
    new_tokens = JWTTokenManager.rotate_refresh_token(refresh_token)
    
    if not new_tokens:
        return 401, TokenResponse(
            success=False,
            message="Invalid or expired refresh token"
        )
    
    response = JsonResponse({
        "success": True,
        "message": "Token refreshed successfully"
    })
    
    set_auth_cookies(response, new_tokens)
    return response


@router.get("/me", response=UserProfileSchema, auth=JWTCookieAuthentication)
def get_current_user(request):
    """Get current authenticated user profile."""
    return {
        "email": request.auth.email,
        "first_name": request.auth.first_name,
        "last_name": request.auth.last_name,
        "phone": request.auth.phone,
        "postal_code": request.auth.postal_code,
        "has_pdpa_consent": request.auth.has_pdpa_consent()
    }
```

**Checklist:**
- [ ] Write JWT authentication tests first (should FAIL)
- [ ] Implement JWTTokenManager class
- [ ] Implement cookie setting/clearing utilities
- [ ] Implement Django Ninja auth endpoints
- [ ] Run tests - should PASS
- [ ] Test login flow manually

---

### Task 2.2: Next.js BFF Proxy

**Rationale**: Secure proxy that hides Django API URL and handles JWT tokens.

**Test Files (Write First):**

| Test File | Coverage Target | Test Cases |
|-----------|-----------------|------------|
| `frontend/app/api/proxy/__tests__/route.test.ts` | 80% | Proxy forwarding, JWT extraction, error handling |

**Implementation File:**

**File:** `frontend/app/api/proxy/[...path]/route.ts`

```typescript
"""
BFF (Backend for Frontend) Proxy Route
Forwards requests to Django API with JWT authentication.
"""

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Backend API configuration
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

/**
 * Handle all HTTP methods for the proxy route
 */
export async function ALL(
  request: NextRequest,
  { params }: { params: { path: string[] } }
): Promise<NextResponse> {
  // Build target URL
  const path = params.path.join("/");
  const targetUrl = new URL(`/api/v1/${path}`, BACKEND_URL);
  
  // Copy query parameters
  const searchParams = request.nextUrl.searchParams;
  searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });
  
  // Get JWT token from HttpOnly cookie
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  
  // Build headers
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Request-ID": crypto.randomUUID(),
    "X-SG-Timezone": "Asia/Singapore",
    "Accept-Language": "en-SG",
  };
  
  // Add Authorization header if token exists
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  
  // Copy client headers (excluding sensitive ones)
  const clientHeaders = request.headers;
  const forwardedHeaders = ["x-forwarded-for", "user-agent"];
  forwardedHeaders.forEach((header) => {
    const value = clientHeaders.get(header);
    if (value) {
      headers[header] = value;
    }
  });
  
  try {
    // Forward request to backend
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
    };
    
    // Add body for non-GET requests
    if (request.method !== "GET" && request.method !== "HEAD") {
      const body = await request.text();
      if (body) {
        fetchOptions.body = body;
      }
    }
    
    // Make request to backend
    const backendResponse = await fetch(targetUrl.toString(), fetchOptions);
    
    // Handle token refresh on 401
    if (backendResponse.status === 401 && accessToken) {
      // Try to refresh token
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        // Retry request with new token
        return retryRequest(request, params);
      }
    }
    
    // Create response
    const responseBody = await backendResponse.text();
    const response = new NextResponse(responseBody, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
    });
    
    // Copy response headers (excluding sensitive ones)
    backendResponse.headers.forEach((value, key) => {
      if (!["set-cookie", "content-encoding"].includes(key.toLowerCase())) {
        response.headers.set(key, value);
      }
    });
    
    // Set cache headers
    response.headers.set("Cache-Control", "private, no-store");
    
    return response;
    
  } catch (error) {
    console.error("BFF Proxy Error:", error);
    
    return NextResponse.json(
      {
        error: "Service unavailable",
        message: "Unable to connect to backend service. Please try again later.",
      },
      { status: 503 }
    );
  }
}

/**
 * Try to refresh the access token using the refresh token
 */
async function tryRefreshToken(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;
    
    if (!refreshToken) {
      return false;
    }
    
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    
    return response.ok;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return false;
  }
}

/**
 * Retry the original request after token refresh
 */
async function retryRequest(
  request: NextRequest,
  params: { path: string[] }
): Promise<NextResponse> {
  // Get new token
  const cookieStore = await cookies();
  const newToken = cookieStore.get("access_token")?.value;
  
  const path = params.path.join("/");
  const targetUrl = new URL(`/api/v1/${path}`, BACKEND_URL);
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-SG-Timezone": "Asia/Singapore",
  };
  
  if (newToken) {
    headers["Authorization"] = `Bearer ${newToken}`;
  }
  
  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
  };
  
  if (request.method !== "GET" && request.method !== "HEAD") {
    const body = await request.clone().text();
    if (body) {
      fetchOptions.body = body;
    }
  }
  
  const response = await fetch(targetUrl.toString(), fetchOptions);
  const responseBody = await response.text();
  
  return new NextResponse(responseBody, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store",
    },
  });
}

// Export specific HTTP method handlers
export { ALL as GET, ALL as POST, ALL as PUT, ALL as DELETE, ALL as PATCH };
```

**Checklist:**
- [ ] Write proxy route tests first
- [ ] Implement BFF proxy route
- [ ] Implement token refresh logic
- [ ] Test proxy forwarding
- [ ] Test error handling

---

### Task 2.3: Auth Fetch Utility

**Rationale**: Isomorphic fetch utility that works in both Server and Client Components.

**Test Files (Write First):**

| Test File | Coverage Target | Test Cases |
|-----------|-----------------|------------|
| `frontend/lib/__tests__/auth-fetch.test.ts` | 80% | Server/Client detection, token handling, error cases |

**Implementation File:**

**File:** `frontend/lib/auth-fetch.ts`

```typescript
"""
Isomorphic authentication fetch utility
Works in both Server Components and Client Components
"""

import { cookies } from "next/headers";

interface AuthFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Make authenticated API requests
 * Works in both Server and Client Components
 */
export async function authFetch(
  url: string,
  options: AuthFetchOptions = {}
): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options;
  
  // Detect if we're on the server
  const isServer = typeof window === "undefined";
  
  if (isServer) {
    // Server-side: Use direct backend URL with cookie
    return serverFetch(url, fetchOptions, skipAuth);
  } else {
    // Client-side: Use BFF proxy
    return clientFetch(url, fetchOptions, skipAuth);
  }
}

/**
 * Server-side fetch with direct backend access
 */
async function serverFetch(
  url: string,
  options: RequestInit,
  skipAuth: boolean
): Promise<Response> {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
  const targetUrl = url.startsWith("http") ? url : `${backendUrl}${url}`;
  
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  headers.set("X-SG-Timezone", "Asia/Singapore");
  headers.set("Accept-Language", "en-SG");
  
  // Get token from cookie on server
  if (!skipAuth) {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("access_token")?.value;
      
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    } catch (error) {
      // Cookies not available (e.g., during static generation)
      console.warn("Could not access cookies:", error);
    }
  }
  
  return fetch(targetUrl, {
    ...options,
    headers,
  });
}

/**
 * Client-side fetch via BFF proxy
 */
async function clientFetch(
  url: string,
  options: RequestInit,
  skipAuth: boolean
): Promise<Response> {
  // Client-side: Route through BFF proxy
  const proxyUrl = `/api/proxy${url.replace("/api/v1", "")}`;
  
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  headers.set("X-SG-Timezone", "Asia/Singapore");
  headers.set("Accept-Language", "en-SG");
  
  const response = await fetch(proxyUrl, {
    ...options,
    headers,
    credentials: "include", // Send cookies
  });
  
  // Handle token refresh on 401
  if (response.status === 401 && !skipAuth) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Retry the request
      return fetch(proxyUrl, {
        ...options,
        headers,
        credentials: "include",
      });
    }
  }
  
  return response;
}

/**
 * Try to refresh the access token
 */
async function tryRefreshToken(): Promise<boolean> {
  try {
    const response = await fetch("/api/proxy/auth/refresh/", {
      method: "POST",
      credentials: "include",
    });
    
    return response.ok;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return false;
  }
}

/**
 * Check if user is authenticated
 * Client-side only
 */
export async function isAuthenticated(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false; // Can't determine auth status on server
  }
  
  try {
    const response = await authFetch("/api/v1/auth/me", {
      method: "GET",
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Get current user profile
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const response = await authFetch("/api/v1/auth/me", {
      method: "GET",
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    return null;
  } catch (error) {
    console.error("Failed to get user:", error);
    return null;
  }
}

interface UserProfile {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  postal_code: string;
  has_pdpa_consent: boolean;
}
```

**Checklist:**
- [ ] Write authFetch tests first
- [ ] Implement server-side fetch
- [ ] Implement client-side fetch
- [ ] Implement token refresh logic
- [ ] Test in both environments

---

## Phase 2 Success Criteria

| Criteria | Verification Method | Expected Result |
|----------|---------------------|-----------------|
| JWT tokens generated | `POST /api/v1/auth/login` | Access + refresh tokens in HttpOnly cookies |
| Login requires PDPA consent | Login without consent | Error message returned |
| Token refresh works | `POST /api/v1/auth/refresh` | New tokens issued |
| Logout clears cookies | `POST /api/v1/auth/logout` | Cookies cleared, token blacklisted |
| BFF proxy forwards requests | `GET /api/proxy/products/` | Django API response returned |
| authFetch works server-side | Server Component fetch | Data fetched with JWT |
| authFetch works client-side | Client Component fetch | Data fetched via proxy |
| Singapore context headers | Check request headers | `X-SG-Timezone: Asia/Singapore` present |

---

## Phase 2 Execution Order

1. **Write JWT auth tests** (45 min)
2. **Implement JWTTokenManager** (60 min)
3. **Implement Django Ninja auth endpoints** (60 min)
4. **Write BFF proxy tests** (30 min)
5. **Implement BFF proxy route** (45 min)
6. **Write authFetch tests** (30 min)
7. **Implement authFetch utility** (45 min)
8. **Manual testing** (30 min)
9. **Integration testing** (30 min)

**Total Estimated Time:** ~5.75 hours

---

## TDD Commitment for Phase 2

```typescript
// Example TDD workflow for authFetch

// 1. RED - Write failing test
describe("authFetch", () => {
  it("should add Authorization header when token exists", async () => {
    // Setup mock
    // Call authFetch
    // Assert header is present
  });
});

// 2. Run test - FAILS

// 3. GREEN - Implement minimal code
export async function authFetch(url: string, options = {}) {
  const token = await getToken();
  const headers = { ...options.headers };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
}

// 4. Run test - PASSES

// 5. REFACTOR - Improve while tests pass
```

---

## Next Steps After Phase 2

Upon Phase 2 completion:
1. Verify authentication flow end-to-end
2. Test token refresh in browser
3. Proceed to **Phase 3: Design System & Frontend Foundation**
4. Implement Tailwind v4 configuration
5. Install Shadcn UI components

---

## Validation Checklist Against Master Plan

| Master Plan Requirement | Phase 2 Implementation | Status |
|-------------------------|----------------------|--------|
| JWT in HttpOnly cookies | ✅ JWTTokenManager + set_auth_cookies | Planned |
| BFF Proxy pattern | ✅ /api/proxy/[...path]/route.ts | Planned |
| authFetch utility | ✅ Isomorphic fetch for Server/Client | Planned |
| Token refresh | ✅ Automatic refresh on 401 | Planned |
| Singapore context | ✅ X-SG-Timezone header | Planned |
| PDPA consent check | ✅ Required for login | Planned |
| Logout clears cookies | ✅ clear_auth_cookies function | Planned |

**Ready to execute Phase 2?**

> `✅ CONFIRM: Proceed with Phase 2 Implementation`
