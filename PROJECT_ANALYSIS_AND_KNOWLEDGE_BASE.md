# CHA YUAN (茶源) - Project Analysis & Knowledge Base

**Comprehensive Agent Initialization Document**

| Attribute | Value |
|-----------|-------|
| **Project** | CHA YUAN (茶源) - Premium Tea E-Commerce Platform |
| **Market** | Singapore (Single-region, exclusive) |
| **Phase** | 8 (Testing & Deployment) - PRODUCTION-READY |
| **Version** | 2.0.0 |
| **Last Updated** | 2026-04-21 |
| **Document Purpose** | Definitive source-of-truth for agent initialization |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Identity & Purpose](#2-project-identity--purpose)
3. [Architecture Overview](#3-architecture-overview)
4. [Technical Stack](#4-technical-stack)
5. [Critical Patterns & Implementation](#5-critical-patterns--implementation)
6. [Project Status & Milestones](#6-project-status--milestones)
7. [Core Business Logic](#7-core-business-logic)
8. [File Structure & Key Files](#8-file-structure--key-files)
9. [Singapore Compliance](#9-singapore-compliance)
10. [Anti-Patterns & Lessons Learned](#10-anti-patterns--lessons-learned)
11. [Testing & Verification](#11-testing--verification)
12. [Troubleshooting Guide](#12-troubleshooting-guide)
13. [Documentation References](#13-documentation-references)

---

## 1. Executive Summary

CHA YUAN is a premium tea e-commerce platform exclusively designed for the Singapore market, bridging Eastern tea heritage with modern lifestyle commerce. The platform implements a sophisticated subscription model powered by a 60/30/10 weighted curation algorithm and features a complete BFF (Backend for Frontend) architecture.

### Key Achievements

| Component | Status | Details |
|-----------|--------|---------|
| **Backend Tests** | ✅ 97+ passing | pytest with cart cookie persistence tests |
| **Frontend Tests** | ✅ 39 passing | Vitest + Playwright |
| **TypeScript** | ✅ Strict mode | 0 errors |
| **Cart API** | ✅ Fixed | 401 errors resolved, cookie persistence working |
| **Authentication** | ✅ Complete | JWT + HttpOnly cookies, AnonymousUser pattern |
| **Phase Status** | ✅ Phase 8 Complete | Production-ready |

---

## 2. Project Identity & Purpose

### WHAT: Project Definition

CHA YUAN (茶源) means "Tea Source" - a premium tea e-commerce platform that:

- Curates premium teas from heritage gardens across China, Taiwan, Japan, and India
- Provides personalized recommendations through a one-time preference quiz
- Offers monthly subscription boxes with AI-powered curation
- Delivers educational content (brewing guides, tasting notes, tea culture)

### Problems Solved

| Problem | Solution |
|---------|----------|
| **Overwhelming Selection** | Preference quiz with weighted scoring (60/30/10 algorithm) |
| **Quality Uncertainty** | Origin authenticity verification from heritage gardens |
| **Personalization Gap** | AI curation based on taste preferences + seasonality |
| **Singapore Market Needs** | GST 9% compliance, SGD pricing, PDPA compliance, local address format |

### Core Features

1. **Hero Landing Page** - Eastern aesthetic with animated steam wisps, scroll reveals
2. **Product Catalog** - Filter by origin, fermentation level, season
3. **Preference Quiz** - One-time onboarding with weighted scoring algorithm
4. **Subscription Service** - Monthly curated boxes with 3 tiers:
   - Discovery Box: $29/mo (3 teas)
   - Connoisseur Box: $49/mo (4 teas)
   - Master's Reserve: $79/mo (5 teas, aged & limited)
5. **Shopping Cart** - Redis-backed persistent cart with 30-day TTL
6. **Checkout** - Stripe Singapore integration (SGD, GrabPay, PayNow)
7. **Tea Culture Content** - Markdown articles with brewing guides
8. **User Dashboard** - Subscription management, order history, preferences

---

## 3. Architecture Overview

### System Architecture

```
Client Layer                    Frontend Layer (Next.js 16)
├─ Web Browser                  ├─ Next.js App
│                               ├─ Server Components (RSC)
│                               ├─ Client Components
│                               └─ BFF Proxy Route (/api/proxy/*)
│                                        ↓
│                               Backend Layer (Django 6)
│                               ├─ Django Ninja API
│                               ├─ JWT Authentication (HttpOnly Cookies)
│                               ├─ Cart Service (Redis + Cookie Persistence)
│                               ├─ Curation Engine (60/30/10 Algorithm)
│                               └─ Stripe Integration
│                                        ↓
│                               Data Layer
│                               ├─ PostgreSQL 17 (Products, Orders, Users)
│                               └─ Redis 7.4 (Cart, Sessions, Cache)
│
└─────────────────────────────────────────────────────────────────────→
     External: Stripe API (SGD, GrabPay, PayNow)
```

### Architecture Patterns

| Pattern | Implementation | Purpose |
|---------|----------------|---------|
| **BFF (Backend for Frontend)** | `/api/proxy/[...path]/` | Secure JWT handling via HttpOnly cookies |
| **Centralized API Registry** | `backend/api_registry.py` | Eager router registration at import time |
| **Server-First** | RSC for SEO-critical pages | Product catalog, articles render server-side |
| **CQRS (Cart)** | Redis writes, PostgreSQL reads | 30-day cart persistence with cookie tracking |
| **Auth Truthiness** | `AnonymousUser()` return | Django Ninja optional auth pattern |
| **Cookie Persistence** | `create_cart_response()` | Guest cart tracking with secure cookies |

---

## 4. Technical Stack

### Complete Technology Matrix

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js | 16.2.3+ | App Router, Server Components, Turbopack |
| **Framework** | React | 19.2.5+ | Concurrent features, Server Actions, No `forwardRef` |
| **Styling** | Tailwind CSS | 4.2.2 | CSS-first theming, OKLCH colors, Lightning CSS |
| **UI** | Radix UI + shadcn | Latest | Accessible primitives |
| **Animation** | Framer Motion | 12.38.0+ | Smooth micro-interactions |
| **State** | TanStack Query | 5.99.0+ | Server state management |
| **Client State** | Zustand | 5.0.12+ | Lightweight state |
| **Backend** | Django | 6.0.4+ | Python 3.12+, Async support |
| **API** | Django Ninja | 1.6.2+ | Pydantic v2 validation |
| **Database** | PostgreSQL | 17 | JSONB optimization |
| **Cache** | Redis | 7.4-alpine | Sessions, cart (30-day TTL) |
| **Payment** | Stripe | 14.4.1+ | SGD, GrabPay, PayNow |
| **Testing** | Vitest + Playwright | Latest | Unit + E2E test coverage |

### Singapore Context & Compliance

- **Currency**: SGD (Hardcoded default)
- **Taxation**: 9% GST calculated on all prices (displayed as inclusive, `GST_RATE = Decimal('0.09')`)
- **Timezone**: `Asia/Singapore` (SGT) - used for seasonal curation and billing
- **PDPA Compliance**: User consent tracked in `User.pdpa_consent_at`
- **Payment**: Stripe Singapore (Cards, GrabPay, PayNow), shipping restricted to `['SG']`

---

## 5. Critical Patterns & Implementation

### Pattern 1: BFF (Backend for Frontend)

**Location**: `frontend/app/api/proxy/[...path]/route.ts`

**Flow:**
```
Client Component → /api/proxy/api/v1/* → Django API
                      ↓
                Extract JWT from cookie
                      ↓
                Forward with Authorization header
```

**Critical Rules:**
- Frontend NEVER stores JWT in localStorage
- Always uses BFF proxy for authenticated requests
- Server Components can call backend directly via `authFetch`
- Client Components must route through `/api/proxy/*`

### Pattern 2: Centralized API Registry (CRITICAL)

**Location**: `backend/api_registry.py`

**Why This Pattern:**
- Django Ninja routers must be registered before URL resolution
- `AppConfig.ready()` runs too late in the lifecycle
- Prevents circular imports
- Ensures endpoints registered when Django starts

**Implementation:**
```python
# backend/api_registry.py - Eager registration at module level
from ninja import NinjaAPI

api = NinjaAPI(
    title="CHA YUAN API",
    version="1.0.0",
    description="Premium Tea E-Commerce API for Singapore",
    docs_url="/docs/",
    openapi_url="/openapi.json",
)

# Import and register at module load time
from apps.api.v1.products import router as products_router
api.add_router("/products/", products_router, tags=["products"])
```

**CRITICAL FIX - Duplicate API Instance Removed:**
The `backend/apps/api/__init__.py` file (containing a duplicate NinjaAPI instance) was deleted to prevent routing conflicts.

### Pattern 3: Django Ninja Auth Truthiness (CRITICAL)

**Location**: `backend/apps/core/authentication.py`

**The Problem:**
Django Ninja evaluates authentication success based on boolean truthiness:
> "NinjaAPI passes authentication only if the callable object returns a value that can be converted to boolean True."

**The Solution:**
```python
from django.contrib.auth.models import AnonymousUser
from ninja.errors import HttpError

class JWTAuth:
    def __call__(self, request):
        token = request.COOKIES.get("access_token")
        if not token:
            if self.required:
                raise HttpError(401, "Authentication required")
            # CRITICAL: Return AnonymousUser (truthy), not None (falsy)
            request.auth = AnonymousUser()
            return AnonymousUser()  # ✅ Auth passes
```

**Cart View Must Check for AnonymousUser:**
```python
from django.contrib.auth.models import AnonymousUser

def get_cart_id_from_request(request):
    # Check if actually authenticated (not AnonymousUser)
    if (hasattr(request, "auth") and request.auth and
        not isinstance(request.auth, AnonymousUser) and
        getattr(request.auth, 'is_authenticated', False)):
        user_id = getattr(request.auth, 'id', None)
        return f"user:{user_id}", False
```

### Pattern 4: Cart Cookie Persistence (CRITICAL)

**Location**: `backend/apps/api/v1/cart.py`

**Step 1: Track if Cart is New**
```python
from typing import Tuple
from django.contrib.auth.models import AnonymousUser

def get_cart_id_from_request(request: HttpRequest) -> Tuple[str, bool]:
    """
    Get cart ID from request.
    Returns: Tuple[str, bool]: (cart_id, is_new)
    """
    cart_id = request.COOKIES.get("cart_id")
    is_new = False

    # Check if authenticated (not AnonymousUser)
    if (hasattr(request, "auth") and request.auth and
        not isinstance(request.auth, AnonymousUser) and
        getattr(request.auth, 'is_authenticated', False)):
        user_id = getattr(request.auth, 'id', None)
        if user_id:
            return f"user:{user_id}", False

    # Anonymous cart
    if not cart_id:
        cart_id = str(uuid.uuid4())
        is_new = True

    return cart_id, is_new
```

**Step 2: Create Response with Cookie**
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

**Step 3: Use in All Cart Endpoints**
```python
@router.get("/", response=CartResponseSchema, auth=JWTAuth(required=False))
def get_cart(request: HttpRequest):
    """Get current cart contents."""
    cart_id, is_new = get_cart_id_from_request(request)
    data = get_cart_response_data(cart_id)
    return create_cart_response(data, cart_id, is_new)
```

**Security Attributes:**
| Attribute | Value | Purpose |
|-----------|-------|---------|
| `httponly=True` | XSS protection | Prevents JavaScript access |
| `secure=not DEBUG` | HTTPS only | Production-only flag |
| `samesite="Lax"` | CSRF protection | Allows normal navigation |
| `path="/"` | Site-wide | Available on all routes |
| `max_age=30 days` | Persistence | Matches Redis TTL |

### Pattern 5: Next.js 15+ Async Params

**CRITICAL:** Page params are `Promise<>` in Next.js 15+

```typescript
// ✅ CORRECT (Next.js 15+)
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;  // MUST await before accessing
  const product = await getProductBySlug(slug);
}

// ❌ INCORRECT (pre-Next.js 15)
export default function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;  // This will fail in Next.js 15+
}
```

### Pattern 6: Hydration-Safe Animated Links

**Problem:** Wrapping `<Link>` inside `<motion.div>` causes SSR/CSR mismatches.

**Solution:** Use `motion.create(Link)`:
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
```

---

## 6. Project Status & Milestones

### Phase Completion Status

| Phase | Feature | Status | Notes |
|-------|---------|--------|-------|
| **0** | Foundation & Docker | ✅ Complete | PostgreSQL 17, Redis 7.4 |
| **1** | Backend Models | ✅ Complete | Product, Order, Subscription, User |
| **2** | JWT Auth + BFF | ✅ Complete | HttpOnly cookies, BFF proxy, JWT |
| **3** | Design System | ✅ Complete | Tailwind v4, shadcn, Eastern aesthetic |
| **4** | Product Catalog | ✅ Complete | Listing + Detail pages, filtering |
| **5** | Cart & Checkout | ✅ Complete | Redis cart, cookie persistence, Stripe SG |
| **6** | Tea Culture | ✅ Complete | Articles, brewing guides |
| **7** | Quiz & Subscription | ✅ Complete | Curation algorithm, dashboard |
| **8** | Testing & Deployment | ✅ Complete | 97+ backend + 39 frontend tests |

### Major Milestones Completed

#### Milestone 1: Cart API Authentication Fix (2026-04-21)

**Problem:** 401 errors on cart endpoints for anonymous users despite `auth=JWTAuth(required=False)`

**Root Cause:** Django Ninja evaluates auth success on truthiness (None → 401)

**Solution:** Modified `JWTAuth.__call__()` to return `AnonymousUser()` instead of `None`

**Files Modified:**
- `backend/apps/core/authentication.py` - Added AnonymousUser import, fixed __call__
- `backend/apps/api/v1/cart.py` - Added isinstance check for AnonymousUser
- `backend/apps/api/__init__.py` - Removed duplicate NinjaAPI instance

**Test Results:**
```
✅ GET /api/v1/cart/ (anonymous): 200 OK (was 401)
✅ POST /api/v1/cart/add/ (anonymous): 200 OK
✅ Products endpoint: 200 OK
```

#### Milestone 2: Cart Cookie Persistence Fix (2026-04-21)

**Problem:** Cart items not persisting across requests for anonymous users

**Root Cause:** `get_cart_id_from_request()` generated new UUID but never returned it via `Set-Cookie`

**Solution:** Implemented three-step pattern with `Tuple[str, bool]` return and `create_cart_response()` helper

**Files Modified:**
- `backend/apps/api/v1/cart.py` (300+ lines updated)
- `backend/apps/api/tests/test_cart_cookie.py` (NEW - 120 lines)

**Test Results:**
```
✅ test_get_cart_sets_cookie_for_new_session: PASSED
✅ test_cart_persists_via_cookie: PASSED
✅ test_cart_cookie_has_correct_attributes: PASSED
✅ test_post_cart_add_sets_cookie: PASSED
```

### Working Features (Verified)

- ✅ Product catalog with filtering (category, origin, season, fermentation)
- ✅ Product detail pages with brewing guides, image gallery, related products
- ✅ Quiz system with weighted preference scoring (60/30/10 algorithm)
- ✅ Shopping cart (Redis-backed, persistent with cookies)
- ✅ Stripe checkout with SGD currency
- ✅ User authentication (JWT + HttpOnly cookies)
- ✅ Subscription dashboard with status, billing, box preview
- ✅ Article content system with markdown
- ✅ GST calculation (9%)
- ✅ Singapore address format validation
- ✅ PDPA compliance tracking

---

## 7. Core Business Logic

### Curation Algorithm (60/30/10)

**Location**: `backend/apps/commerce/curation.py`

Weighted scoring for subscription boxes:
1. **User Preferences (60%)**: Based on one-time onboarding quiz scores (0-100 per category)
2. **Seasonality (30%)**: Matches tea harvest cycles to current Singapore season
3. **Inventory (10%)**: Boosts products with healthy stock levels

```python
def get_current_season_sg() -> str:
    """Get current season in Singapore (SGT)."""
    sg_now = datetime.now(timezone('Asia/Singapore'))
    month = sg_now.month
    if 3 <= month <= 5:
        return 'spring'
    elif 6 <= month <= 8:
        return 'summer'
    elif 9 <= month <= 11:
        return 'autumn'
    else:
        return 'winter'

def score_products(products, prefs):
    """Score products based on user preferences."""
    scored = []
    for product in products:
        score = 1.0
        if prefs:
            cat_pref = prefs.get(product.category.slug, 0)
            score += cat_pref * 0.6  # 60% preference weight
        if product.is_new_arrival:
            score += 0.3  # New arrival boost
        scored.append((product, score))
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored
```

### Shopping Cart (Redis-Backed)

**Location**: `backend/apps/commerce/cart.py`

**Features:**
- Persistent storage in Redis with 30-day TTL
- Anonymous cart merges with authenticated cart on login
- Atomic operations using Redis HINCRBY

**Cart ID Format:**
- Anonymous: `cart:{uuid}` (e.g., `cart:a1b2c3d4-...`)
- Authenticated: `cart:user:{user_id}` (e.g., `cart:user:42`)

**Redis Data Structure:**
| Key Format | Purpose | TTL |
|------------|---------|-----|
| `cart:{uuid}` | Anonymous cart | 30 days |
| `cart:user:{id}` | Authenticated cart | 30 days |

---

## 8. File Structure & Key Files

### Complete Project Structure

```
cha-yuan/
├── 📁 backend/                 # Django 6 Backend
│   ├── 📄 api_registry.py      # Centralized API router (CRITICAL)
│   ├── 📁 apps/
│   │   ├── 📁 api/v1/          # Django Ninja API endpoints
│   │   │   ├── 📄 products.py  # Product catalog API
│   │   │   ├── 📄 cart.py      # Shopping cart with cookie persistence
│   │   │   ├── 📄 checkout.py  # Payment & Stripe integration
│   │   │   ├── 📄 content.py   # Articles & culture API
│   │   │   ├── 📄 quiz.py      # Quiz & preferences API
│   │   │   └── 📄 subscriptions.py  # Subscription management
│   │   │   └── 📁 tests/
│   │   │       ├── 📄 test_cart_cookie.py  # Cart persistence TDD tests
│   │   │       └── 📄 ...
│   │   ├── 📁 commerce/        # Product & Commerce
│   │   │   ├── 📄 models.py    # Product, Origin, TeaCategory, Subscription, Order
│   │   │   ├── 📄 cart.py      # Redis cart service (418 lines)
│   │   │   ├── 📄 curation.py  # AI curation algorithm (60/30/10)
│   │   │   └── 📄 stripe_sg.py # Singapore Stripe integration
│   │   ├── 📁 content/         # Content & Quiz
│   │   │   ├── 📄 models.py    # QuizQuestion, QuizChoice, UserPreference, Article
│   │   │   └── 📄 admin.py     # Quiz admin with inline choices
│   │   └── 📁 core/            # Users & Auth
│   │       ├── 📄 models.py    # User with SG validation
│   │       ├── 📄 authentication.py  # JWT + AnonymousUser pattern
│   │       └── 📁 sg/           # Singapore utilities
│   │           ├── 📄 validators.py    # Phone, postal code validation
│   │           └── 📄 pricing.py     # GST calculation
│   └── 📁 chayuan/             # Django Project Config
│
├── 📁 frontend/                # Next.js 16 Frontend
│   ├── 📁 app/                 # App Router
│   │   ├── 📁 api/proxy/[...path]/  # BFF Proxy Route
│   │   ├── 📁 products/        # Product catalog
│   │   ├── 📁 culture/         # Articles & Tea Culture
│   │   ├── 📁 quiz/            # Preference Quiz
│   │   ├── 📁 checkout/        # Stripe checkout flow
│   │   ├── 📁 dashboard/subscription/  # Subscription dashboard
│   │   ├── 📄 page.tsx         # Home page
│   │   ├── 📄 layout.tsx       # Root layout with fonts
│   │   └── 📄 globals.css        # Tailwind v4 theme (349 lines)
│   ├── 📁 components/          # React Components
│   │   ├── 📁 ui/              # shadcn primitives
│   │   ├── 📁 sections/        # Page sections (hero, navigation, etc.)
│   │   ├── 📄 product-card.tsx
│   │   ├── 📄 cart-drawer.tsx
│   │   └── 📄 ...
│   └── 📁 lib/                 # Utilities & API
│       ├── 📄 auth-fetch.ts     # BFF wrapper (148 lines)
│       └── 📄 animations.ts      # Framer Motion variants
│
├── 📁 infra/docker/            # Infrastructure
│   └── 📄 docker-compose.yml   # PostgreSQL 17 + Redis 7.4
│
└── 📁 docs/                    # Documentation
    └── 📄 Project_Architecture_Document.md
```

### Critical Files Quick Reference

| Purpose | File |
|---------|------|
| API Router | `backend/api_registry.py` |
| Auth Logic | `backend/apps/core/authentication.py` |
| Cart API | `backend/apps/api/v1/cart.py` |
| Cart Service | `backend/apps/commerce/cart.py` |
| Curation | `backend/apps/commerce/curation.py` |
| Theme | `frontend/app/globals.css` |
| API Fetcher | `frontend/lib/auth-fetch.ts` |

---

## 9. Singapore Compliance

### GST 9% (Goods and Services Tax)

All prices displayed inclusive of GST. Calculated with `ROUND_HALF_UP` following IRAS guidelines:

```python
GST_RATE = Decimal('0.09')

def get_price_with_gst(self):
    return self.price_sgd  # Already GST-inclusive

def get_gst_amount(self):
    return self.price_sgd - (self.price_sgd / Decimal('1.09'))
```

### Address Format

```
Block/Street: "Blk 123 Jurong East St 13"
Unit: "#04-56"
Postal Code: "600123" (6 digits, validated with ^\d{6}$)
```

### Phone Format

```
Format: +65 XXXX XXXX
Validation: ^\+65\s?\d{8}$
```

### Stripe Integration

```python
stripe.checkout.Session.create(
    payment_method_types=['card', 'grabpay', 'paynow'],
    currency='sgd',
    shipping_address_collection={'allowed_countries': ['SG']},
    # ...
)
```

---

## 10. Anti-Patterns & Lessons Learned

### Critical Anti-Patterns (NEVER DO)

1. **NEVER** store JWT in localStorage - use HttpOnly cookies
2. **NEVER** return None for optional Django Ninja auth - return `AnonymousUser()`
3. **NEVER** use `forwardRef` in React 19 - ref is standard prop
4. **NEVER** forget trailing slashes on API calls
5. **NEVER** duplicate API paths in router endpoints
6. **NEVER** skip `await` on Next.js 15+ params
7. **NEVER** commit secrets (use .env files)
8. **NEVER** mix v3 and v4 Tailwind utilities
9. **NEVER** create `tailwind.config.js` - use `globals.css`
10. **NEVER** register routers in `AppConfig.ready()`
11. **NEVER** wrap `<motion.div>` with `<Link>` - use `motion.create(Link)`

### Critical Lessons Learned

#### Lesson 1: Django Ninja Auth Truthiness (2026-04-21)

**Issue:** Cart endpoints returning 401 for anonymous users despite `auth=JWTAuth(required=False)`

**Root Cause:** Django Ninja evaluates auth success on boolean truthiness. Returning `None` (falsy) triggers 401.

**Solution:** Return `AnonymousUser()` (truthy) instead of `None`.

#### Lesson 2: Cart Cookie Persistence (2026-04-21)

**Issue:** Cart items not persisting across requests

**Root Cause:** `get_cart_id_from_request()` generates UUID but never returns it via `Set-Cookie` header.

**Solution:** Return `Tuple[str, bool]` and use `create_cart_response()` helper.

#### Lesson 3: Duplicate NinjaAPI Instance

**Issue:** Two NinjaAPI instances causing routing conflicts

**Root Cause:** Orphaned api instance in `apps/api/__init__.py`

**Solution:** Delete duplicate, use only `api_registry.py`

---

## 11. Testing & Verification

### Backend Tests

```bash
cd backend
pytest -v                      # Run all tests
pytest apps/api/tests/test_cart_cookie.py -v  # Cart persistence tests
pytest --cov=apps --cov-report=html  # With coverage
```

**Test Status:**
- Backend: 93+ tests passing
- New Cart Tests: 4/4 tests passing

### Frontend Tests

```bash
cd frontend
npm test                       # Unit tests
npm run typecheck              # TypeScript check (0 errors)
npm run build                  # Production build
```

**Test Status:**
- Unit tests: 39/39 tests passing
- TypeScript strict mode: Clean (0 errors)
- Production build: Successful

### Manual Verification

```bash
# Test cart endpoint
curl -s http://localhost:8000/api/v1/cart/ \
  -w "\nStatus: %{http_code}\n"

# Test cart add for anonymous user
curl -s http://localhost:8000/api/v1/cart/add/ \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 1}' \
  -w "\nStatus: %{http_code}\n"

# Test cart persistence with cookies
curl -s -c /tmp/cookies.txt -b /tmp/cookies.txt \
  http://localhost:8000/api/v1/cart/add/ \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 1}' \
  -w "\nStatus: %{http_code}\n"

curl -s -c /tmp/cookies.txt -b /tmp/cookies.txt \
  http://localhost:8000/api/v1/cart/ \
  -w "\nStatus: %{http_code}\n"
```

---

## 12. Troubleshooting Guide

### API 401 "Unauthorized" Errors

**Symptoms:** Cart endpoints return 401 even with `auth=JWTAuth(required=False)`

**Diagnosis:**
1. Check JWTAuth.__call__() is returning AnonymousUser(), not None
2. Verify `from django.contrib.auth.models import AnonymousUser` is imported
3. Check isinstance(request.auth, AnonymousUser) in cart views

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

**Fix:**
```python
# Ensure create_cart_response is being called
cart_id, is_new = get_cart_id_from_request(request)
return create_cart_response(data, cart_id, is_new)  # ✅ Not just Response(data)
```

### Product Detail Page 404

**Symptoms:** Product detail page returns 404

**Causes:**
1. Next.js 15 async params not awaited: `const { slug } = await params`
2. Frontend calling wrong URL: Ensure trailing slash `/api/v1/products/{slug}/`
3. Product not in database: Check slug exists

---

## 13. Documentation References

| Document | Purpose | Lines |
|----------|---------|-------|
| `README.md` | Project overview | 579 |
| `CLAUDE.md` | Agent briefing | 724 |
| `GEMINI.md` | Technical context | 650 |
| `AGENTS.md` | Project-specific context | 1,400+ |
| `ACCOMPLISHMENTS.md` | Milestone tracking | 650+ |
| `docs/Project_Architecture_Document.md` | Full architecture | 1,800+ |
| `docs/MASTER_EXECUTION_PLAN.md` | 8-phase roadmap | 1,222 |

---

## Quick Commands Reference

### Environment Setup

```bash
# Start infrastructure
cd infra/docker && docker-compose up -d

# Backend
cd backend
python manage.py runserver 127.0.0.1:8000 --settings=chayuan.settings.development
python manage.py migrate --settings=chayuan.settings.development
python manage.py seed_products --settings=chayuan.settings.development

# Frontend
cd frontend
npm run dev
npm run build
npm run typecheck
```

### Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Django Admin | http://localhost:8000/admin/ |
| API Docs | http://localhost:8000/docs/ |
| OpenAPI Schema | http://localhost:8000/openapi.json |

---

*Document generated from meticulous analysis of README.md, MASTER_EXECUTION_PLAN.md, and status.md*
*Last updated: 2026-04-21*
*Version: 2.0.0 - Comprehensive Knowledge Base*
*Status: PRODUCTION-READY*
