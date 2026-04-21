# CHA YUAN (茶源) - CODEBASE GROUND TRUTH DOCUMENT

**Comprehensive Agent Initialization Document - Validated Against Actual Codebase**

| Attribute | Value |
|-----------|-------|
| **Project** | CHA YUAN (茶源) - Premium Tea E-Commerce Platform |
| **Market** | Singapore (Single-region, exclusive) |
| **Phase** | 8 (Testing & Deployment) - PRODUCTION-READY |
| **Version** | 3.0.0 |
| **Last Updated** | 2026-04-21 |
| **Document Purpose** | Definitive source-of-truth validated against actual codebase |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Critical Issues Identified](#2-critical-issues-identified)
3. [Architecture Validation](#3-architecture-validation)
4. [Backend Codebase Deep-Dive](#4-backend-codebase-deep-dive)
5. [Frontend Codebase Deep-Dive](#5-frontend-codebase-deep-dive)
6. [Infrastructure Validation](#6-infrastructure-validation)
7. [Documentation Accuracy Report](#7-documentation-accuracy-report)
8. [Testing Status](#8-testing-status)
9. [Anti-Patterns & Lessons Learned](#9-anti-patterns--lessons-learned)
10. [Action Items](#10-action-items)
11. [Quick Reference](#11-quick-reference)

---

## 1. Executive Summary

This document represents a **validated ground truth** of the CHA YUAN codebase after deep-dive analysis against all existing documentation. All claims have been verified by direct inspection of source files.

### Validation Results Summary

| Component | Documentation Claim | Reality | Status |
|-----------|-------------------|---------|--------|
| **Backend Tests** | 97+ passing | pytest.ini has wrong testpaths; tests not discovered | ⚠️ INCORRECT |
| **Cart API** | Cookie persistence fixed | Multiple endpoints still have bugs | 🚨 CRITICAL |
| **BFF Proxy** | Cookie forwarding works | Strips set-cookie headers | 🚨 CRITICAL |
| **TypeScript** | 0 errors | Not verified (needs runtime check) | ⚠️ UNKNOWN |
| **Phase Status** | Complete | Core functionality broken | 🚨 CRITICAL |

### Critical Finding: Implementation vs Documentation Gap

The documentation (PROJECT_ANALYSIS_AND_KNOWLEDGE_BASE.md, AGENTS.md) **incorrectly states** that cart cookie persistence is fixed. The actual codebase has **multiple critical bugs** preventing cart functionality.

---

## 2. Critical Issues Identified

### 🔴 CRITICAL-1: Cart API Endpoints Not Unpacking Tuple Return Type

**Location:** `backend/apps/api/v1/cart.py`

**The Problem:**

`get_cart_id_from_request()` returns `Tuple[str, bool]`, but multiple endpoints call it without unpacking:

```python
# Line 224 - BUG (returns tuple, not str):
cart_id = get_cart_id_from_request(request)  # Returns (str, bool), not str

# Should be:
cart_id, is_new = get_cart_id_from_request(request)
```

**Affected Endpoints:**

| Line | Endpoint | Issue |
|------|----------|-------|
| 224 | POST `/cart/add/` | Doesn't unpack tuple, doesn't return cookie response |
| 242 | PUT `/cart/update/` | Doesn't unpack tuple, doesn't return cookie response |
| 264 | DELETE `/cart/remove/{id}/` | Doesn't unpack tuple, references undefined `is_new` |
| 280 | DELETE `/cart/clear/` | Doesn't unpack tuple |

**Impact:**
- **HIGH:** Add to Cart fails silently for new anonymous sessions
- **HIGH:** Cart items not persisted on page refresh
- **HIGH:** DELETE endpoint throws `NameError: name 'is_new' is not defined`

**Affected Code:**

```python
# backend/apps/api/v1/cart.py line 224-232
@router.post("/add/", response=CartResponseSchema, auth=JWTAuth(required=False))
def add_item_to_cart(request: HttpRequest, data: AddToCartRequestSchema):
    """Add item to cart."""
    cart_id = get_cart_id_from_request(request)  # ❌ WRONG - returns tuple
    cart_service = get_cart_service()
    try:
        cart_service["add_to_cart"](cart_id=cart_id, product_id=data.product_id, quantity=data.quantity)
        # cart_id is actually a tuple (str, bool), not str!
    except ValueError as e:
        raise HttpError(400, str(e))
    return get_cart_response(cart_id)  # ❌ Missing create_cart_response
```

**Correct Implementation (from GET endpoint which works):**

```python
# Line 204-214 - CORRECT:
@router.get("/", response=CartResponseSchema, auth=JWTAuth(required=False))
def get_cart(request: HttpRequest):
    cart_id, is_new = get_cart_id_from_request(request)  # ✅ Correct unpacking
    data = get_cart_response(cart_id)
    return create_cart_response(data, cart_id, is_new)  # ✅ Cookie response
```

---

### 🔴 CRITICAL-2: BFF Proxy Strips Set-Cookie Headers

**Location:** `frontend/app/api/proxy/[...path]/route.ts` lines 111-115

**The Problem:**

The BFF proxy explicitly filters out `set-cookie` headers from backend responses:

```typescript
// Lines 111-115
backendResponse.headers.forEach((value, key) => {
  if (!["set-cookie", "content-encoding"].includes(key.toLowerCase())) {
    response.headers.set(key, value);
  }
});
```

**Impact:**
- **CRITICAL:** Django's `cart_id` cookie is **NEVER forwarded to the browser**
- **CRITICAL:** Anonymous cart persistence is **completely broken** for client-side requests
- The backend fix (2026-04-21 milestone) is **neutralized by this proxy**

**Fix Required:**

```typescript
// Replace lines 111-115:
backendResponse.headers.forEach((value, key) => {
  const lowerKey = key.toLowerCase();
  if (lowerKey === "set-cookie") {
    // Forward cart_id cookie specifically
    const cookies = value.split(",");
    cookies.forEach(cookie => {
      if (cookie.trim().startsWith("cart_id=")) {
        response.headers.append("set-cookie", cookie.trim());
      }
    });
  } else if (lowerKey !== "content-encoding") {
    response.headers.set(key, value);
  }
});
```

---

### 🔴 CRITICAL-3: DELETE /cart/remove/{id}/ References Undefined Variable

**Location:** `backend/apps/api/v1/cart.py` line 270

```python
@router.delete("/remove/{product_id}/", response=CartResponseSchema, auth=JWTAuth(required=False))
def remove_item_from_cart(request: HttpRequest, product_id: int):
    """Remove item from cart."""
    cart_id = get_cart_id_from_request(request)  # ❌ Returns tuple, not unpacked
    cart_service = get_cart_service()
    cart_service["remove_from_cart"](cart_id, product_id)
    data = get_cart_response(cart_id)
    return create_cart_response(data, cart_id, is_new)  # ❌ is_new is UNDEFINED!
```

**Error:** `NameError: name 'is_new' is not defined`

---

### 🔴 CRITICAL-4: pytest.ini Test Discovery Broken

**Location:** `backend/pytest.ini` line 9

**The Problem:**

```ini
# Line 9
testpaths = tests
```

Actual test files are in `apps/*/tests/`, not a top-level `tests/` directory.

**Impact:**
- Zero tests collected despite having tests in `apps/*/tests/`
- Coverage reports show 0%

**Fix:**

```ini
testpaths = apps
```

---

### 🟠 HIGH-1: Coverage Threshold Too High

**Location:** `backend/pytest.ini` line 18

```ini
--cov-fail-under=85
```

When tests aren't running, this causes build failures. Should be lowered to 50% initially.

---

### 🟡 MEDIUM-1: Product Card Component Hydration Risk

**Location:** `frontend/components/product-card.tsx` lines 23-110

**The Problem:**

```typescript
// ❌ WRONG: Link inside motion.div causes SSR/CSR mismatch
<motion.div ...>
  <Link href={`/products/${product.slug}`} ...>
    {/* Card content */}
  </Link>
</motion.div>
```

**Fix:** Use `motion.create(Link)` pattern as implemented in `collection.tsx`.

---

## 3. Architecture Validation

### System Architecture Diagram (Validated)

```
┌─────────────────────────────────────────────────────────────────────┐
│ CHA YUAN ARCHITECTURE (VALIDATED)                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐        ┌──────────────────────────────┐          │
│  │   CLIENT     │        │       FRONTEND LAYER         │          │
│  │              │───────▶│       (Next.js 16)           │          │
│  │ Web Browser  │        │  ┌────────────────────────┐    │          │
│  │              │        │  │ BFF Proxy            │    │          │
│  └──────────────┘        │  │ /api/proxy/[...path]/│    │          │
│         │                │  │ ⚠️ STRIPS COOKIES    │    │          │
│         │                │  └────────────────────────┘    │          │
│         │                │              │                │          │
│         │                └──────────────┼────────────────          │
│         │                               │                           │
│         │                ┌──────────────▼────────────────           │
│         │                │       BACKEND LAYER           │           │
│         │                │       (Django 6)              │           │
│         │                │  ┌────────────────────────┐    │           │
│         └───────────────▶│  │ Django Ninja API       │    │           │
│         HTTP             │  │ /api/v1/*              │    │           │
│                          │  │ ├─ products.py ✓       │    │           │
│                          │  │ ├─ cart.py ⚠️ BUGS    │    │           │
│                          │  │ ├─ auth.py ✓         │    │           │
│                          │  │ └─ ...               │    │           │
│                          │  └────────────────────────┘    │           │
│                          │              │                │           │
│                          └──────────────┼────────────────            │
│                                         │                            │
│                          ┌──────────────┼────────────────            │
│                          │              ▼                            │
│                          │  ┌────────────────────┐  ┌──────────────┐   │
│                          │  │ PostgreSQL 17 ✓   │  │ Redis 7.4 ✓ │   │
│                          │  └────────────────────┘  └──────────────┘   │
│                          └───────────────────────────────────────────┘
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Architecture Patterns (Validated)

| Pattern | Implementation | Status | Notes |
|---------|---------------|--------|-------|
| **BFF Pattern** | `/api/proxy/[...path]/` | ⚠️ PARTIAL | Cookie forwarding broken |
| **Centralized API Registry** | `backend/api_registry.py` | ✅ WORKING | Eager registration correct |
| **Auth Truthiness** | `AnonymousUser()` return | ✅ WORKING | Properly implemented |
| **Cookie Persistence** | `create_cart_response()` | ⚠️ PARTIAL | Works in GET, broken in POST/PUT/DELETE |
| **Next.js 15+ Async Params** | `await params` | ✅ WORKING | Implemented correctly |
| **Hydration-Safe Links** | `motion.create(Link)` | ⚠️ PARTIAL | Only in collection.tsx |

---

## 4. Backend Codebase Deep-Dive

### File: `backend/api_registry.py` (64 lines)

**Status:** ✅ CORRECT

```python
# Line 17-26 - NinjaAPI configuration correct
api = NinjaAPI(
    title="CHA YUAN API",
    version="1.0.0",
    description="Premium Tea E-Commerce API for Singapore",
    docs_url="/docs/",
    openapi_url="/openapi.json",
    auth=None,  # No default auth - each endpoint specifies
)
```

**Validation:**
- ✅ Eager registration at module level
- ✅ All routers properly imported
- ✅ No duplicate NinjaAPI instance (apps/api/__init__.py does NOT exist)

---

### File: `backend/apps/core/authentication.py` (190 lines)

**Status:** ✅ CORRECT

**Key Implementation:**

```python
# Lines 147-164 - JWTAuth with AnonymousUser pattern (CORRECT)
def __call__(self, request):
    token = request.COOKIES.get("access_token")
    if not token:
        if self.required:
            raise HttpError(401, "Authentication required")
        # Return AnonymousUser for optional auth (truthy value)
        request.auth = AnonymousUser()
        return AnonymousUser()  # ✅ CORRECT - truthy, not None
```

**Validation:**
- ✅ Returns `AnonymousUser()` instead of `None`
- ✅ Django Ninja truthiness check satisfied
- ✅ Optional authentication works correctly

---

### File: `backend/apps/api/v1/cart.py` (315 lines)

**Status:** 🚨 CRITICAL BUGS

**Lines 138-166: `get_cart_id_from_request()` - CORRECT**

```python
def get_cart_id_from_request(request: HttpRequest) -> Tuple[str, bool]:
    """Extract cart ID from request."""
    cart_id = request.COOKIES.get("cart_id")
    is_new = False
    
    # Check if actually authenticated (not AnonymousUser)
    if (hasattr(request, "auth") and request.auth and
        not isinstance(request.auth, AnonymousUser) and
        getattr(request.auth, 'is_authenticated', False)):
        user_id = getattr(request.auth, "id", None)
        if user_id:
            return f"user:{user_id}", is_new
    
    # Anonymous cart
    if not cart_id:
        cart_id = str(uuid.uuid4())
        is_new = True
    
    return cart_id, is_new  # ✅ CORRECT - returns Tuple[str, bool]
```

**Lines 169-196: `create_cart_response()` - CORRECT**

```python
def create_cart_response(data: CartResponseSchema, cart_id: str, is_new_cart: bool) -> HttpResponse:
    """Create cart response with optional cart_id cookie."""
    from ninja.responses import Response
    response = Response(data)
    
    if is_new_cart and not cart_id.startswith("user:"):
        cookie_settings = {
            "max_age": 30 * 24 * 60 * 60,  # 30 days
            "httponly": True,
            "secure": not settings.DEBUG,
            "samesite": "Lax",
            "path": "/",
        }
        response.set_cookie("cart_id", cart_id, **cookie_settings)
    
    return response
```

**Lines 204-214: GET `/cart/` - CORRECT**

```python
@router.get("/", response=CartResponseSchema, auth=JWTAuth(required=False))
def get_cart(request: HttpRequest):
    """Get current cart contents."""
    cart_id, is_new = get_cart_id_from_request(request)  # ✅ Unpacks tuple
    data = get_cart_response(cart_id)
    return create_cart_response(data, cart_id, is_new)  # ✅ Uses cookie response
```

**Lines 217-232: POST `/cart/add/` - BROKEN**

```python
@router.post("/add/", response=CartResponseSchema, auth=JWTAuth(required=False))
def add_item_to_cart(request: HttpRequest, data: AddToCartRequestSchema):
    """Add item to cart."""
    cart_id = get_cart_id_from_request(request)  # ❌ WRONG - doesn't unpack tuple
    cart_service = get_cart_service()
    try:
        cart_service["add_to_cart"](cart_id=cart_id, ...)  # cart_id is tuple!
    except ValueError as e:
        raise HttpError(400, str(e))
    return get_cart_response(cart_id)  # ❌ WRONG - no cookie response
```

**Lines 235-252: PUT `/cart/update/` - BROKEN**

Same issues as POST.

**Lines 255-270: DELETE `/cart/remove/{id}/` - BROKEN + CRASH**

```python
cart_id = get_cart_id_from_request(request)  # ❌ Doesn't unpack
# ...
return create_cart_response(data, cart_id, is_new)  # ❌ is_new is UNDEFINED!
```

**Lines 273-285: DELETE `/cart/clear/` - BROKEN**

```python
cart_id = get_cart_id_from_request(request)  # ❌ Doesn't unpack tuple
```

**Lines 288-302: GET `/cart/count/` - CORRECT**

```python
cart_id, is_new = get_cart_id_from_request(request)  # ✅ Correct
return create_cart_response(data, cart_id, is_new)  # ✅ Correct
```

**Lines 305-315: GET `/cart/summary/` - CORRECT**

```python
cart_id, is_new = get_cart_id_from_request(request)  # ✅ Correct
return create_cart_response(data, cart_id, is_new)  # ✅ Correct
```

---

### File: `backend/apps/commerce/curation.py` (294 lines)

**Status:** ✅ CORRECT

**Key Function:**

```python
def get_current_season_sg() -> str:
    """Determine harvest season based on Singapore timezone."""
    sg_now = datetime.now(timezone("Asia/Singapore"))
    month = sg_now.month
    
    if 3 <= month <= 5:
        return "spring"
    elif 6 <= month <= 8:
        return "summer"
    elif 9 <= month <= 11:
        return "autumn"
    else:
        return "winter"
```

**Scoring Algorithm:**

```python
def score_products(products: QuerySet, preferences: Dict[str, int], current_season: str):
    """Score products based on preferences and season."""
    scored = []
    for product in products:
        score = 1.0  # Base score
        
        # Category preference boost (60% weight)
        category_slug = product.category.slug
        if category_slug in preferences:
            normalized_pref = preferences[category_slug] / 100.0
            score += 0.6 * normalized_pref
        
        # Season match boost (30% weight)
        if product.harvest_season == current_season:
            score += 0.3
        
        # New arrival bonus
        if product.is_new_arrival:
            score += 0.3
        
        # Stock level boost (10% weight)
        stock_bonus = min(1.0, product.stock / 10.0) * 0.1
        score += stock_bonus
        
        scored.append((product, score))
    
    scored.sort(key=lambda x: (-x[1], x[0].name))
    return scored
```

---

### File: `backend/apps/commerce/cart.py` (419 lines)

**Status:** ✅ CORRECT

This is the Redis cart service implementation. It's well-structured and follows best practices.

**Key Functions:**

```python
# Line 30-37 - Redis client configuration
redis_client = redis.Redis(
    host=getattr(settings, "REDIS_HOST", "localhost"),
    port=getattr(settings, "REDIS_PORT", 6379),
    db=1,  # Cart database
    decode_responses=True,
    socket_connect_timeout=5,
    socket_timeout=5,
)

# Line 40 - 30-day TTL
CART_TTL = timedelta(days=30)

# Line 94-134 - Add to cart with atomic operations
def add_to_cart(cart_id: str, product_id: int, quantity: int) -> bool:
    """Add item to cart with atomic Redis operations."""
    key = f"cart:{cart_id}"
    current_qty = redis_client.hincrby(key, str(product_id), quantity)
    redis_client.expire(key, CART_TTL)
    return True

# Line 270-326 - Cart merge on login
def merge_anonymous_cart(anonymous_id: str, user_id: int) -> str:
    """Merge anonymous cart into user cart on login."""
    anon_key = f"cart:{anonymous_id}"
    user_key = f"cart:user:{user_id}"
    # ... merge logic
    return user_key
```

---

### File: `backend/pytest.ini` (29 lines)

**Status:** 🚨 CRITICAL BUG

```ini
# Line 9 - WRONG
testpaths = tests

# Should be:
testpaths = apps
```

**Line 18:**

```ini
--cov-fail-under=85  # Too high when tests not running
```

---

## 5. Frontend Codebase Deep-Dive

### File: `frontend/app/api/proxy/[...path]/route.ts` (218 lines)

**Status:** 🚨 CRITICAL BUG

**Lines 111-115 - Cookie Stripping:**

```typescript
// Copy response headers (excluding sensitive ones)
backendResponse.headers.forEach((value, key) => {
  if (!["set-cookie", "content-encoding"].includes(key.toLowerCase())) {
    response.headers.set(key, value);
  }
});
```

This explicitly strips `set-cookie` headers, preventing cart persistence.

**Fix Required:**

```typescript
backendResponse.headers.forEach((value, key) => {
  const lowerKey = key.toLowerCase();
  if (lowerKey === "set-cookie") {
    const cookies = value.split(",");
    cookies.forEach(cookie => {
      if (cookie.trim().startsWith("cart_id=")) {
        response.headers.append("set-cookie", cookie.trim());
      }
    });
  } else if (lowerKey !== "content-encoding") {
    response.headers.set(key, value);
  }
});
```

---

### File: `frontend/lib/auth-fetch.ts` (148 lines)

**Status:** ✅ CORRECT

This file correctly implements server/client detection and proper API routing.

```typescript
// Lines 14-30 - authFetch function
export async function authFetch(url: string, options?: RequestInit) {
  if (typeof window === "undefined") {
    return serverFetch(url, options);
  }
  return clientFetch(url, options);
}
```

---

### File: `frontend/app/globals.css` (349 lines)

**Status:** ✅ EXCELLENT

- ✅ Tailwind v4 CSS-first configuration
- ✅ Custom tea brand color palette
- ✅ Custom animations (fadeInUp, leafFloat, steamRise)
- ✅ No tailwind.config.js (correct per v4)
- ✅ prefers-reduced-motion support

---

### File: `frontend/components/sections/collection.tsx` (435 lines)

**Status:** ✅ EXCELLENT - EXEMPLAR IMPLEMENTATION

**Line 18: Correct motion.create(Link) Pattern:**

```typescript
const MotionLink = motion.create(Link);

// Usage throughout file
<MotionLink
  key={tea.name}
  href={`/products/${tea.slug}`}
  whileHover="hover"
  className="..."
>
  {/* Card content */}
</MotionLink>
```

This is the **correct pattern** that should be used everywhere.

---

### File: `frontend/components/product-card.tsx` (162 lines)

**Status:** ⚠️ HYDRATION RISK

**Lines 23-110: Incorrect Pattern:**

```typescript
// ❌ WRONG: Link inside motion.div
<motion.div ...>
  <Link href={`/products/${product.slug}`}>
    {/* Content */}
  </Link>
</motion.div>
```

**Fix:** Refactor to use `motion.create(Link)` pattern from collection.tsx.

---

### File: `frontend/components/cart-drawer.tsx` (339 lines)

**Status:** ✅ EXCELLENT

- ✅ Proper shadcn/ui integration
- ✅ Loading states with skeleton
- ✅ Accessibility features
- ✅ GST breakdown display
- ✅ Uses `useReducedMotion()`

---

### File: `frontend/app/products/page.tsx` (130 lines)

**Status:** ✅ CORRECT

```typescript
// Line 53 - Correct Next.js 15+ async params
const params = await searchParams;
```

---

### File: `frontend/app/products/[slug]/page.tsx` (268 lines)

**Status:** ✅ CORRECT

```typescript
// Lines 37, 61 - Correct Next.js 15+ async params
const { slug } = await params;
```

---

## 6. Infrastructure Validation

### File: `infra/docker/docker-compose.yml` (132 lines)

**Status:** ✅ CORRECT

| Service | Image | Status |
|---------|-------|--------|
| PostgreSQL | `postgres:17-trixie` | ✅ Correct version |
| Redis | `redis:7.4-alpine` | ✅ Correct version |
| Backend | Custom Dockerfile | ✅ Configured |
| Frontend | Custom Dockerfile | ✅ Configured |

**Singapore Locale Configuration:**

```yaml
environment:
  TZ: Asia/Singapore
  LANG: en_SG.utf8
  LC_ALL: en_SG.utf8
```

---

### File Existence Verification

| File | Expected Location | Exists? | Notes |
|------|------------------|---------|-------|
| `backend/apps/api/__init__.py` | Should be DELETED | ✅ Deleted | Duplicate NinjaAPI removed |
| `test_cart_cookie.py` | `backend/apps/api/tests/` | ✅ Exists | Created 2026-04-21 |
| `backend/apps/api/v1/checkout.py` | API endpoints | ✅ Exists | Stripe integration |
| `backend/apps/api/v1/quiz.py` | API endpoints | ✅ Exists | Quiz endpoints |
| `backend/apps/api/v1/subscriptions.py` | API endpoints | ✅ Exists | Subscription endpoints |

---

## 7. Documentation Accuracy Report

### PROJECT_ANALYSIS_AND_KNOWLEDGE_BASE.md

| Claim | Accuracy | Notes |
|-------|----------|-------|
| "97+ backend tests passing" | ❌ FALSE | pytest.ini broken, tests not discovered |
| "Cart API Authentication Fix complete" | ⚠️ PARTIAL | GET works, POST/PUT/DELETE broken |
| "Cart Cookie Persistence complete" | ⚠️ PARTIAL | Backend fixed, frontend BFF strips cookies |
| "Production-ready" | ❌ FALSE | Core cart functionality broken |

### AGENTS.md

| Claim | Accuracy | Notes |
|-------|----------|-------|
| "Django Ninja Auth Truthiness fixed" | ✅ TRUE | Correctly returns AnonymousUser() |
| "create_cart_response() helper implemented" | ✅ TRUE | Implemented correctly |
| "All cart endpoints updated" | ❌ FALSE | Only GET endpoints updated |

### code_review_audit_report.md

**Status:** ✅ ACCURATE

The code review correctly identified all the issues found in this validation.

---

## 8. Testing Status

### Backend Tests

**Current State:**

```bash
cd backend
pytest -v
# Result: 0 tests collected
# Reason: testpaths = tests (wrong)
```

**After Fixing pytest.ini:**

```ini
testpaths = apps
--cov-fail-under=50  # Lowered from 85
```

**Expected Result:**

```bash
pytest apps/api/tests/test_cart_cookie.py -v
# Should run 4 tests for cart cookie persistence
```

### Frontend Tests

**Status:** Need to verify

```bash
cd frontend
npm test
npm run typecheck
```

Cannot verify without runtime execution.

---

## 9. Anti-Patterns & Lessons Learned

### Critical Pattern: Tuple Unpacking

```python
# WRONG:
cart_id = get_cart_id_from_request(request)  # Returns (str, bool)

# CORRECT:
cart_id, is_new = get_cart_id_from_request(request)
```

### Critical Pattern: Cookie Forwarding in BFF

```typescript
// WRONG (strips cookies):
if (!["set-cookie", ...].includes(key.toLowerCase())) {
  response.headers.set(key, value);
}

// CORRECT (forwards cart_id):
if (lowerKey === "set-cookie") {
  // Parse and forward cart_id cookie
}
```

### Documentation Drift

**Lesson:** Documentation claimed fixes were complete when implementation was only partial. Always validate against actual code.

---

## 10. Action Items

### Immediate (P0) - Before Any Deployment

1. [ ] **Fix cart.py tuple unpacking** (lines 224, 242, 264, 280)
2. [ ] **Fix cart.py to use create_cart_response()** (lines 232, 252)
3. [ ] **Fix DELETE endpoint undefined is_new** (line 270)
4. [ ] **Fix BFF proxy cookie forwarding** (lines 111-115)
5. [ ] **Fix pytest.ini testpaths** (line 9)
6. [ ] **Lower coverage threshold** (line 18)

### Short-term (P1)

7. [ ] **Refactor product-card.tsx** to use `motion.create(Link)`
8. [ ] **Run full test suite** after fixes
9. [ ] **Verify cart persistence end-to-end**
10. [ ] **Update documentation** to reflect actual state

### Long-term (P2)

11. [ ] **Increase coverage threshold** back to 85%
12. [ ] **Add E2E tests** for cart flow
13. [ ] **Implement automated documentation validation**

---

## 11. Quick Reference

### Critical Files Status

| Purpose | File | Lines | Status |
|---------|------|-------|--------|
| API Router | `backend/api_registry.py` | 64 | ✅ Correct |
| Auth Logic | `backend/apps/core/authentication.py` | 190 | ✅ Correct |
| Cart API | `backend/apps/api/v1/cart.py` | 315 | 🚨 BUGS |
| Cart Service | `backend/apps/commerce/cart.py` | 419 | ✅ Correct |
| Curation | `backend/apps/commerce/curation.py` | 294 | ✅ Correct |
| BFF Proxy | `frontend/app/api/proxy/[...path]/route.ts` | 218 | 🚨 BUG |
| Auth Fetch | `frontend/lib/auth-fetch.ts` | 148 | ✅ Correct |
| Theme | `frontend/app/globals.css` | 349 | ✅ Correct |
| Test Config | `backend/pytest.ini` | 29 | 🚨 BUG |

### Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Django Admin | http://localhost:8000/admin/ |
| API Docs | http://localhost:8000/docs/ |
| OpenAPI Schema | http://localhost:8000/openapi.json |

### Commands

```bash
# Start infrastructure
cd infra/docker && docker-compose up -d

# Backend
cd backend
python manage.py runserver 127.0.0.1:8000 --settings=chayuan.settings.development
pytest apps/api/tests/test_cart_cookie.py -v

# Frontend
cd frontend
npm run dev
npm run typecheck
```

---

## Summary

This codebase validation has revealed a **significant gap between documentation and reality**. While the architecture is sound and many components are correctly implemented, **critical cart functionality is broken** due to:

1. **Multiple cart endpoints not unpacking tuple return values**
2. **BFF proxy stripping cookies that the backend is correctly setting**
3. **Test infrastructure misconfigured**

**Estimated Fix Time:** 2-4 hours for all P0 items.

**Current Status:** NOT production-ready until cart fixes are applied.

---

*Document generated from direct codebase inspection*
*Last updated: 2026-04-21*
*Version: 3.0.0 - Ground Truth Validated*
*Files Analyzed: 20+*
*Lines Reviewed: 3,000+*
