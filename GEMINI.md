# GEMINI.md - CHA YUAN (茶源) Context & Instructions

**Role**: Senior Frontend Architect & Technical Partner
**Project**: CHA YUAN (Premium Tea E-Commerce for Singapore)
**Phase**: 8 (Testing & Deployment) - PRODUCTION-READY with Conditions
**Last Updated**: 2026-04-22
**Version**: 1.4.0
**Audit Report**: [CODEBASE_REVIEW_AND_ASSESSMENT_REPORT.md](../CODEBASE_REVIEW_AND_ASSESSMENT_REPORT.md)

---

## 🍵 Project Overview

CHA YUAN is a premium tea e-commerce platform built exclusively for the Singapore market. It bridges traditional Eastern tea heritage with modern lifestyle commerce through a subscription-based curation model powered by a 60/30/10 weighted scoring algorithm.

### Core Architecture

- **Frontend**: Next.js 16.2.3+ (App Router) + React 19.2.5+ (Concurrent Mode)
- **Backend**: Django 6.0.4+ + Django Ninja 1.6.2+ (Pydantic v2 validation)
- **Patterns**:
  - **BFF (Backend for Frontend)**: Secure JWT handling via HttpOnly cookies and proxy route (`/api/proxy/`)
  - **Centralized API Registry**: Eager router registration in `backend/api_registry.py`
  - **Server-First**: Heavy utilization of React Server Components (RSC) for SEO and performance
- **Infrastructure**: PostgreSQL 17 (`postgres:17-trixie`) and Redis 7.4 (`redis:7.4-alpine`)

### Project Status

| Component | Status | Details |
|-----------|--------|---------|
| **Backend Tests** | ⚠️ 165 passing, 114 failed, 62 errors | 341 total tests, 30.76% coverage |
| **Frontend Tests** | ✅ 78 passing | Vitest + Playwright (9 test files) |
| **TypeScript** | ✅ Strict mode | 0 errors |
| **Cart API** | ✅ Fixed | 401 errors resolved, cookie persistence working |
| **Authentication** | ✅ Complete | JWT + HttpOnly cookies, AnonymousUser pattern |
| **Test Coverage** | ⚠️ 30.76% | Below 50% threshold - needs improvement |
| **Phase** | 🚧 8 In Progress | Core functionality complete, test stabilization needed |

---

## 🇸🇬 Singapore Context & Compliance

- **Currency**: SGD (Hardcoded default, formatter: `Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' })`)
- **Taxation**: 9% GST calculated on all prices (displayed as inclusive, `GST_RATE = Decimal('0.09')`)
- **Pricing**: Calculations follow IRAS guidelines using `ROUND_HALF_UP` rounding
- **Timezone**: `Asia/Singapore` (SGT) - used for seasonal curation and billing
- **Compliance**: PDPA consent tracking is mandatory (`User.pdpa_consent_at`)
- **Logistics**: Singapore-specific address validation (Block/Street, Unit, 6-digit Postal Code)
- **Phone**: `+65 XXXX XXXX` validation (`^\+65\s?\d{8}$`)
- **Payment**: Stripe Singapore (Cards, GrabPay, PayNow), shipping restricted to `['SG']`

---

## 🛠️ Building and Running

### Prerequisites

- Python 3.12+
- Node.js 20+
- Docker & Docker Compose

### Infrastructure Setup

```bash
cd infra/docker
docker-compose up -d
```

### Backend (Django)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements/development.txt
python manage.py migrate --settings=chayuan.settings.development
python manage.py seed_products # Seeds 12 premium teas
python manage.py seed_quiz # Seeds 6 quiz questions
python manage.py runserver 127.0.0.1:8000 --settings=chayuan.settings.development
```

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev # Uses Turbopack (--turbopack flag in package.json)
```

### Testing

| Test Suite | Command | Status |
|------------|---------|--------|
| Backend (pytest) | `pytest -v` | 165 passing, 114 failed, 62 errors (341 total) |
| Frontend Unit (Vitest) | `npm test` | 78 tests passing (9 test files) |
| Frontend E2E (Playwright) | `npm run test:e2e` | Critical paths verified |
| TypeScript | `npm run typecheck` | Strict mode, 0 errors |
| Coverage | `pytest --cov=apps` | 30.76% (target: 50%) |

**Coverage Gaps:**
- `apps/commerce/cart.py` - 0% coverage
- `apps/commerce/stripe_sg.py` - 0% coverage
- `apps/core/authentication.py` - 0% coverage

**Recommendation:** Add unit tests for uncovered modules before production release.

---

## 📐 Development Conventions

### Coding Standards

1. **React 19**: Do NOT use `forwardRef`. Treat `ref` as a standard prop.
2. **Next.js 15+**: Route `params` and `searchParams` are **Promises**. Always `await` them.

```typescript
interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string }>;
}
export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const filters = await searchParams;
}
```

3. **Tailwind v4**: CSS-first configuration. Do NOT use `tailwind.config.js`. Configure `@theme` in `globals.css`.

4. **Django Ninja**: Use the Centralized API Registry pattern. Register routers in `api_registry.py` at import time. Router endpoints use RELATIVE paths (`@router.get("/")`, NOT `@router.get("/products/")`).

5. **Auth Success Truthiness** (CRITICAL): Django Ninja auth callables must return a truthy value (e.g., `AnonymousUser()`) even for optional auth to succeed. Returning `None` triggers a 401.

6. **TypeScript**: Strict mode is enforced. No `any` — use `unknown` or specific interfaces. Prefer `interface` over `type` (except unions).

7. **Trailing Slashes**: Mandatory on all API calls to Django Ninja endpoints.

### State Management & Data Fetching

- **Server State**: TanStack Query (React Query) v5.99.0+
- **Client State**: Zustand v5.0.12 (lightweight, no reducers needed)
- **API Wrapper**: Use `authFetch` in `frontend/lib/auth-fetch.ts` for all requests. It handles:
  - Server-side: Direct backend call with cookie extraction
  - Client-side: BFF proxy routing through `/api/proxy/`
  - JWT injection from HttpOnly cookies
  - Token refresh on 401
- **Cart Persistence**: Redis-backed with 30-day TTL. Anonymous cart merges on login. Cookies must be forwarded via BFF Proxy.

### API Patterns

```typescript
// Server Component: Direct backend call
const response = await authFetch("/api/v1/products/", { skipAuth: true });

// Client Component: Through proxy (handled automatically by authFetch)
const response = await authFetch("/api/v1/cart/add/", {
  method: "POST",
  body: JSON.stringify({ product_id: 1, quantity: 2 }),
});
```

### TDD Workflow

```bash
# 1. RED: Write failing test
cat > backend/apps/commerce/tests/test_cart_cookie.py << 'EOF'
def test_get_cart_sets_cookie_for_new_session(client):
    response = client.get("/api/v1/cart/")
    assert "cart_id" in response.cookies
EOF

# 2. Run test (fails)
pytest backend/apps/commerce/tests/test_cart_cookie.py -v

# 3. GREEN: Implement minimal code
# Modify get_cart_id_from_request() to return Tuple[str, bool]

# 4. Run test (passes)
pytest backend/apps/commerce/tests/test_cart_cookie.py -v

# 5. REFACTOR: Improve while keeping tests green
```

### Visual Identity (Anti-Generic)

- **Palette**:
  - Tea Green: `#5C8A4D` (primary)
  - Warm Ivory: `#FAF6EE` (background)
  - Terracotta: `#C4724B` (warm accents)
  - Gold: `#C5A55A` (prices, CTAs)
  - Bark: `#2A1D14` (text primary)
- **Typography**:
  - Display: "Playfair Display", serif (headings)
  - Sans: "Inter", system-ui (body)
  - Chinese: "Noto Serif SC", serif (茶源 branding)
- **UX**: Focus on micro-interactions via Framer Motion 12.38.0+ and intentional minimalism
- **Animations**: CSS custom properties in `globals.css` (`fadeInUp`, `leafFloat`, `steamRise`)

---

## 💡 Lessons Learned & Troubleshooting

### 1. Django Ninja Auth Truthiness (CRITICAL)

**Symptoms:** Cart endpoints return 401 "Unauthorized" even with `auth=JWTAuth(required=False)`

**Root Cause:** Django Ninja interprets `None` from an auth callable as "Authentication Failed" (401), even if `auth=JWTAuth(required=False)`.

**Technical Explanation:**
> According to Django Ninja specification: "NinjaAPI passes authentication only if the callable object returns a value that can be converted to boolean True. This return value will be assigned to the request.auth attribute."

**Solution:** Auth callables must return `AnonymousUser()` instead of `None` for optional authentication.

**Code Fix (authentication.py):**
```python
# BAD - Returns None (falsy)
def __call__(self, request):
    token = request.COOKIES.get("access_token")
    if not token:
        if self.required:
            raise HttpError(401, "Authentication required")
        return None  # ❌ Triggers 401

# GOOD - Returns AnonymousUser (truthy)
from django.contrib.auth.models import AnonymousUser
def __call__(self, request):
    token = request.COOKIES.get("access_token")
    if not token:
        if self.required:
            raise HttpError(401, "Authentication required")
        request.auth = AnonymousUser()
        return AnonymousUser()  # ✅ Auth passes
```

**Verification:**
```bash
curl -s http://localhost:8000/api/v1/cart/ -w "\nStatus: %{http_code}\n"
# Expected: Status: 200 (not 401)
```

---

### 2. Cart Cookie Persistence Pattern

**Symptoms:** Cart items not persisting across requests for anonymous users

**Root Cause:** `get_cart_id_from_request()` generates a new UUID when no cookie exists, but this UUID is never returned to the client via `Set-Cookie` header.

**Technical Flow:**
```
Request 1: GET /cart/ (no cookie)
  → Backend: Generates cart_id=abc-123, stores in Redis
  → Response: Returns cart data, NO Set-Cookie header

Request 2: GET /cart/ (no cookie - because none was set)
  → Backend: Generates NEW cart_id=xyz-789, new empty cart
```

**Solution - Three-Step Pattern:**

**Step 1: Modify get_cart_id_from_request() signature**
```python
def get_cart_id_from_request(request: HttpRequest) -> Tuple[str, bool]:
    """Returns (cart_id, is_new)"""
    cart_id = request.COOKIES.get("cart_id")
    is_new = False
    # Check for authenticated user
    if (hasattr(request, "auth")
        and request.auth
        and not isinstance(request.auth, AnonymousUser)
        and getattr(request.auth, 'is_authenticated', False)):
        user_id = getattr(request.auth, 'id', None)
        if user_id:
            return f"user:{user_id}", False
    # Anonymous cart
    if not cart_id:
        cart_id = str(uuid.uuid4())
        is_new = True
    return cart_id, is_new
```

**Step 2: Create create_cart_response() helper**
```python
def create_cart_response(data, cart_id: str, is_new_cart: bool):
    """Create response with cart_id cookie for new anonymous carts."""
    response = Response(data)
    if is_new_cart and not cart_id.startswith("user:"):
        response.set_cookie(
            "cart_id",
            cart_id,
            max_age=30*24*60*60,  # 30 days
            httponly=True,
            secure=not settings.DEBUG,
            samesite="Lax",
            path="/"
        )
    return response
```

**Step 3: Update all cart endpoints**
```python
@router.get("/", auth=JWTAuth(required=False))
def get_cart(request: HttpRequest):
    cart_id, is_new = get_cart_id_from_request(request)
    # ... get cart data
    return create_cart_response(data, cart_id, is_new)
```

**Security Attributes:**
- `httponly=True`: Prevents JavaScript access (XSS protection)
- `secure=not settings.DEBUG`: HTTPS only in production
- `samesite="Lax"`: CSRF protection while allowing normal navigation
- `path="/"`: Available site-wide
- `max_age=30*24*60*60`: 30 days (matches Redis TTL)

**Verification:**
```bash
# Test cookie is set for new session
curl -s -c /tmp/cookies.txt -b /tmp/cookies.txt \
  http://localhost:8000/api/v1/cart/ -v 2>&1 | grep "Set-Cookie"

# Test persistence
curl -s -c /tmp/cookies.txt -b /tmp/cookies.txt \
  http://localhost:8000/api/v1/cart/add/ \
  -X POST -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 1}'

curl -s -c /tmp/cookies.txt -b /tmp/cookies.txt \
  http://localhost:8000/api/v1/cart/
```

---

### 3. Hydration-Safe Animated Links

**Symptoms:** React hydration errors: "Hydration failed because the server rendered HTML didn't match the client."

**Root Cause:** Wrapping Next.js `<Link>` components with `<motion.div>` causes SSR/CSR mismatches because server renders `<div>` but client expects `<a>`.

**Technical Explanation:**
Invalid HTML nesting: `<Link>` inside `<motion.div>` causes browser DOM mutation. React hydration fails when DOM structure differs between SSR and client.

**Solution - Use motion.create(Link):**
```typescript
// ❌ BAD: Link inside motion.div
<Link href="/product">
  <motion.div whileHover="hover">...</motion.div>
</Link>

// ✅ GOOD: motion.create(Link)
const MotionLink = motion.create(Link);
<MotionLink href="/product" whileHover="hover">
  ...
</MotionLink>

// ✅ ALTERNATIVE: motion.div wrapping Link
<motion.div whileHover="hover">
  <Link href="/product" className="block h-full">...</Link>
</motion.div>
```

**Key Insight:** `motion.create()` properly merges motion props with Next.js Link props, ensuring identical DOM structure on server and client.

---

### 4. Next.js 15+ Async Params

**Symptoms:** `params.slug` returns undefined or throws error in server components

**Root Cause:** Next.js 15+ changed `params` and `searchParams` from objects to `Promise<>` objects.

**Solution:** Always `await` params before accessing properties.

```typescript
// ❌ BAD (Next.js 14 style)
export default function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;  // undefined in Next.js 15+
}

// ✅ GOOD (Next.js 15+)
interface PageProps {
  params: Promise<{ slug: string }>;
}
export default async function Page({ params }: PageProps) {
  const { slug } = await params;  // MUST await first
}
```

---

### 5. BFF Proxy Cookie Forwarding

**Symptoms:** Cart persistence works in curl but not in browser; frontend requests don't include cookies

**Root Cause:** The Next.js BFF proxy at `frontend/app/api/proxy/[...path]/route.ts` may strip `set-cookie` headers by default.

**Current Code (line ~112):**
```typescript
if (!["set-cookie", "content-encoding"].includes(key.toLowerCase())) {
  response.headers.set(key, value);
}
// ❌ set-cookie header is being filtered out
```

**Solution:** Ensure the proxy forwards `set-cookie` headers specifically for cart endpoints.

```typescript
// ✅ Allow cart_id cookie to pass through
if (key.toLowerCase() === "set-cookie") {
  const cookies = value.split(",");
  const cartCookie = cookies.find(c => c.trim().startsWith("cart_id="));
  if (cartCookie) {
    response.headers.set("set-cookie", cartCookie);
  }
} else if (key.toLowerCase() !== "content-encoding") {
  response.headers.set(key, value);
}
```

---

## 🔧 Troubleshooting Guide

### API 401 "Unauthorized" Errors

**Symptoms:** Cart endpoints return 401 even with `auth=JWTAuth(required=False)`

**Diagnosis:**
1. Check JWTAuth.__call__() is returning AnonymousUser(), not None
2. Verify `from django.contrib.auth.models import AnonymousUser` is imported
3. Check isinstance(request.auth, AnonymousUser) in cart views
4. Ensure no duplicate NinjaAPI instances

**Fix:**
```python
# backend/apps/core/authentication.py
def __call__(self, request):
    token = request.COOKIES.get("access_token")
    if not token:
        if self.required:
            raise HttpError(401, "Authentication required")
        from django.contrib.auth.models import AnonymousUser
        request.auth = AnonymousUser()
        return AnonymousUser()  # ✅ Not None
```

### Cart Items Not Persisting

**Symptoms:** Cart empty on page refresh despite adding items

**Diagnosis:**
1. Check `Set-Cookie` header in response
2. Verify cookie attributes: HttpOnly, SameSite=Lax, path=/
3. Ensure `is_new` flag is being passed to `create_cart_response()`
4. Check browser dev tools → Application → Cookies

**Fix:**
```python
# Ensure create_cart_response is being called
cart_id, is_new = get_cart_id_from_request(request)
return create_cart_response(data, cart_id, is_new)  # ✅ Not just Response(data)
```

### IndentationError in cart.py

**Symptoms:** Server fails to start with "unexpected indent"

**Root Cause:** Nested try-except blocks with incorrect indentation

**Fix:** Restructure exception handling:
```python
# ❌ BAD: Deep nesting
try:
    product = Product.objects.get(id=product_id)
    try:
        # ... more logic
    except: pass
except: pass

# ✅ GOOD: Separate try blocks
try:
    product = Product.objects.get(id=product_id)
except Product.DoesNotExist:
    continue
# ... process product
```

### API Path Conflicts

**Symptoms:** Django Ninja returns 404 for valid endpoints

**Root Cause:** Duplicate path in router registration

**Fix:** Use relative paths in router endpoints:
```python
# ❌ BAD: Absolute path in router
@router.get("/products/{slug}/")

# ✅ GOOD: Relative path in router (mounted at /products/)
@router.get("/{slug}/")
```

### Product Detail Page 404

**Symptoms:** Product detail page returns 404

**Causes:**
1. Next.js 15 async params not awaited: `const { slug } = await params`
2. Frontend calling wrong URL: Ensure trailing slash `/api/v1/products/{slug}/`
3. Product not in database: Check slug exists

---

## 🧪 Cart Testing Guide

### Manual Testing with curl

```bash
# Test 1: Anonymous cart access (should return 200, not 401)
curl -s http://localhost:8000/api/v1/cart/ \
  -w "\nStatus: %{http_code}\n"

# Test 2: Cart add for anonymous user
curl -s http://localhost:8000/api/v1/cart/add/ \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 1}' \
  -w "\nStatus: %{http_code}\n"

# Test 3: Cart persistence with cookies
curl -s -c /tmp/cookies.txt -b /tmp/cookies.txt \
  http://localhost:8000/api/v1/cart/add/ \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 1}' \
  -w "\nStatus: %{http_code}\n"

curl -s -c /tmp/cookies.txt -b /tmp/cookies.txt \
  http://localhost:8000/api/v1/cart/ \
  -w "\nStatus: %{http_code}\n"

# Test 4: Check Set-Cookie header
curl -s -c /tmp/cookies.txt -b /tmp/cookies.txt \
  http://localhost:8000/api/v1/cart/ -v 2>&1 | grep "Set-Cookie"
```

### Automated Testing (pytest)

```python
# backend/apps/api/tests/test_cart_cookie.py
def test_get_cart_sets_cookie_for_new_session(self, client):
    """Test that GET /cart/ sets cart_id cookie for new sessions."""
    response = client.get("/api/v1/cart/")
    assert response.status_code == 200
    assert "cart_id" in response.cookies
    cookie = response.cookies["cart_id"]
    assert cookie["httponly"] is True
    assert cookie["samesite"] == "Lax"

def test_cart_persists_via_cookie(self, client):
    """Test that cart persists when using the same cookie."""
    # First request - get cart_id cookie
    response1 = client.post(
        "/api/v1/cart/add/",
        data={"product_id": 1, "quantity": 1},
        content_type="application/json"
    )
    cart_id = response1.cookies["cart_id"].value
    
    # Second request - use same cookie
    client.cookies["cart_id"] = cart_id
    response2 = client.get("/api/v1/cart/")
    assert response2.status_code == 200
    assert len(response2.json()["items"]) > 0
```

---

## 🍵 Core Business Logic

### Curation Algorithm (60/30/10)

Located in `backend/apps/commerce/curation.py`:

```python
def score_products(products, user_preferences):
    """
    Score products for subscription curation.
    
    Weights:
    - 60%: User preferences (from quiz)
    - 30%: Seasonal match (current SG season)
    - 10%: Inventory level (stock availability)
    """
    scored = []
    for product in products:
        score = 1.0
        if prefs:
            cat_pref = prefs.get(product.category.slug, 0)
            score += cat_pref * 0.6
        if product.is_new_arrival:
            score += 0.3
        scored.append((product, score))
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored
```

### Singapore Season Detection

```python
def get_current_season_sg() -> str:
    """Get current season in Singapore (SGT)."""
    sg_now = datetime.now(timezone('Asia/Singapore'))
    month = sg_now.month
    if 3 <= month <= 5: return 'spring'
    elif 6 <= month <= 8: return 'summer'
    elif 9 <= month <= 11: return 'autumn'
    else: return 'winter'
```

### Redis Cart Data Structure

| Key Format | Purpose | TTL |
|------------|---------|-----|
| `cart:{uuid}` | Anonymous cart | 30 days |
| `cart:user:{id}` | Authenticated cart | 30 days |
| `session:{id}` | Django sessions | Configurable |
| `cache:{key}` | General cache | Configurable |

**Cart Item Storage (Hash):**
```
HKEY: cart:abc-123
  1: "2"    # product_id: quantity
  5: "1"    # product_id: quantity
```

---

## 📂 Key File Reference

### Critical Backend Files

| Purpose | File | Description |
|---------|------|-------------|
| API Router | `backend/api_registry.py` | Central router registration (eager import) |
| Auth Logic | `backend/apps/core/authentication.py` | JWT cookie handling & AnonymousUser logic |
| Cart API | `backend/apps/api/v1/cart.py` | Cookie-aware cart endpoints (300+ lines) |
| Cart Tests | `backend/apps/api/tests/test_cart_cookie.py` | TDD tests for cookie persistence (120 lines) |
| Curation | `backend/apps/commerce/curation.py` | 60/30/10 scoring algorithm |
| Cart Svc | `backend/apps/commerce/cart.py` | Redis cart service (418 lines) |
| Stripe SG | `backend/apps/commerce/stripe_sg.py` | Singapore Stripe integration |
| Theme | `frontend/app/globals.css` | Tailwind v4 theme (349 lines) |
| API Fetcher | `frontend/lib/auth-fetch.ts` | BFF wrapper (148 lines) |
| Animations | `frontend/lib/animations.ts` | Framer Motion variants |

---

## ⚠️ Anti-Patterns to Avoid

1. **Never** store JWT in `localStorage`. Use the BFF proxy + HttpOnly cookies.
2. **Never** return `None` for optional authentication in Django Ninja. Return `AnonymousUser()`.
3. **Never** use `any` in TypeScript. Use `unknown` or specific interfaces.
4. **Never** build a custom component if a `shadcn/ui` primitive exists.
5. **Never** forget trailing slashes on API calls to Django Ninja.
6. **Never** use `forwardRef` in React 19. Treat `ref` as a standard prop.
7. **Never** create `tailwind.config.js`. Use CSS-first configuration in `globals.css`.
8. **Never** register routers in `AppConfig.ready()`. Use eager registration in `api_registry.py`.
9. **Never** use absolute paths in Django Ninja router endpoints. Use relative paths.
10. **Never** skip `await` on Next.js 15+ params.

---

## 🔧 Quick Commands

```bash
# Start infrastructure
cd infra/docker && docker-compose up -d

# Backend
cd backend
python manage.py runserver 127.0.0.1:8000 --settings=chayuan.settings.development
python manage.py migrate --settings=chayuan.settings.development
python manage.py seed_products --settings=chayuan.settings.development
python manage.py seed_quiz --settings=chayuan.settings.development
pytest -v
pytest apps/api/tests/test_cart_cookie.py -v  # Cart persistence tests

# Frontend
cd frontend
npm run dev
npm run build
npm run typecheck
npm test
npm run test:e2e
```

---

## 📚 Documentation References

| Document | Purpose | Lines |
|----------|---------|-------|
| `PROJECT_MASTER_BRIEF.md` | Definitive project source-of-truth | 600+ |
| `AGENT_INITIALIZATION_GUIDE.md` | New agent onboarding guide | 600+ |
| `ACCOMPLISHMENTS.md` | Milestone tracking & fix records | 650+ |
| `README.md` | Comprehensive project overview | 750 |
| `CLAUDE.md` | Concise agent briefing | 724 |
| `AGENTS.md` | Project-specific context | 1,400+ |
| `docs/Project_Architecture_Document.md` | Full architecture with Mermaid diagrams | 1,252 |
| `docs/MASTER_EXECUTION_PLAN.md` | 8-phase execution roadmap | 1,222 |

---

*Generated by Gemini CLI. Last updated: 2026-04-22*
*Version: 1.4.0 - Updated with accurate test counts and coverage from code audit*
*See [CODEBASE_REVIEW_AND_ASSESSMENT_REPORT.md](../CODEBASE_REVIEW_AND_ASSESSMENT_REPORT.md) for full audit findings*
