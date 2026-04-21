# AGENT INITIALIZATION GUIDE: CHA YUAN (茶源)

**Version:** 1.0.0 | **Date:** 2026-04-21 | **Status:** PRODUCTION-READY

---

## 🎯 Purpose of This Document

This guide serves as the **definitive source-of-truth** for initializing any new coding agent with deep validated understanding of the CHA YUAN (茶源) premium tea e-commerce platform. After meticulous analysis of the codebase, documentation, and execution history, this document captures the WHAT, WHY, and HOW of the project to enable immediate productive contribution.

**When to Use This Document:**
- Onboarding a new coding agent to the project
- Context-switching between features
- Troubleshooting issues requiring architectural context
- Making design decisions requiring historical knowledge

---

## 📋 Table of Contents

1. [Project Identity & Purpose](#1-project-identity--purpose)
2. [Architecture Decisions](#2-architecture-decisions)
3. [Critical Patterns & Implementation](#3-critical-patterns--implementation)
4. [Project Status & Milestones](#4-project-status--milestones)
5. [Core Business Logic](#5-core-business-logic)
6. [Key Files Reference](#6-key-files-reference)
7. [Anti-Patterns & Lessons Learned](#7-anti-patterns--lessons-learned)
8. [Testing & Verification](#8-testing--verification)
9. [Quick Commands](#9-quick-commands)
10. [Documentation References](#10-documentation-references)

---

## 1. Project Identity & Purpose

### What is CHA YUAN?

**CHA YUAN (茶源)** is a premium tea e-commerce platform exclusively designed for the Singapore market. It bridges Eastern tea heritage with modern lifestyle commerce through a sophisticated subscription model powered by a preference-based curation algorithm.

### Core Problems Solved

| Problem | Solution |
|---------|----------|
| Overwhelming Selection | Preference quiz with weighted scoring |
| Quality Uncertainty | Origin authenticity verification |
| Personalization Gap | AI curation based on taste preferences |
| Singapore Compliance | GST 9%, SGD pricing, PDPA compliance |

### Core Features Implemented

1. **Hero Landing** - Eastern aesthetic with animated steam wisps, scroll reveals
2. **Product Catalog** - Filter by origin, fermentation level, season
3. **Preference Quiz** - One-time onboarding with 60/30/10 algorithm
4. **Subscription Service** - Monthly curated boxes (Discovery: $29, Connoisseur: $49, Master's Reserve: $79)
5. **Shopping Cart** - Redis-backed with 30-day TTL, cookie persistence
6. **Checkout** - Stripe Singapore (SGD, GrabPay, PayNow)
7. **Tea Culture Content** - Markdown articles with brewing guides
8. **User Dashboard** - Subscription management, order history

---

## 2. Architecture Decisions

### Technology Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Frontend | Next.js | 16.2.3+ | App Router, Server Components, Turbopack |
| Framework | React | 19.2.5+ | Concurrent features, Server Actions |
| Styling | Tailwind CSS | v4.2.2 | CSS-first theming, OKLCH colors |
| Backend | Django | 6.0.4+ | Python 3.12+, Async support |
| API | Django Ninja | 1.6.2+ | Pydantic v2 validation |
| Database | PostgreSQL | 17 | JSONB optimization |
| Cache | Redis | 7.4 | 30-day cart persistence |
| Payment | Stripe | 14.4.1+ | SGD, GrabPay, PayNow |

### Singapore Context & Compliance

**GST 9%:**
- Hardcoded: `GST_RATE = Decimal('0.09')`
- Displayed as inclusive of GST
- Calculation: `ROUND_HALF_UP` per IRAS guidelines

**Address Format:**
```
Block/Street: "Blk 123 Jurong East St 13"
Unit: "#04-56"
Postal Code: 6-digit (regex: ^\d{6}$)
```

**Phone Format:**
```
+65 XXXX XXXX (regex: ^\+65\s?\d{8}$)
```

**PDPA Compliance:**
- `User.pdpa_consent_at` timestamp
- Mandatory checkbox on signup

---

## 3. Critical Patterns & Implementation

### Pattern 1: BFF (Backend for Frontend)

**Location:** `frontend/app/api/proxy/[...path]/route.ts`

**Flow:**
```
Client Component -> /api/proxy/api/v1/* -> Django API
                          |
                  Extract JWT from cookie
                          |
              Forward with Authorization header
```

**Critical Rules:**
- NEVER store JWT in localStorage
- Always use BFF proxy for authenticated requests
- Server Components use authFetch() directly
- Client Components route through /api/proxy/*

### Pattern 2: Centralized API Registry (CRITICAL)

**Location:** `backend/api_registry.py`

**Why:** Django Ninja routers must be registered BEFORE URL resolution. AppConfig.ready() runs too late.

**Implementation:**
```python
from ninja import NinjaAPI
api = NinjaAPI(title="CHA YUAN API", version="1.0.0")

# Eager registration at module load time
from apps.api.v1.products import router as products_router
api.add_router("/products/", products_router)
```

**Router Endpoints Must Use RELATIVE Paths:**
```python
# GOOD (in products.py, mounted at /products/):
@router.get("/")  # Results in /api/v1/products/
@router.get("/{slug}/")  # Results in /api/v1/products/{slug}/

# BAD:
@router.get("/products/")  # WRONG - creates duplicate path
```

### Pattern 3: Next.js 15+ Async Params (CRITICAL)

**CRITICAL:** Page params are `Promise<>` in Next.js 15+

```typescript
// CORRECT:
interface PageProps {
  params: Promise<{ slug: string }>;
}
export default async function Page({ params }: PageProps) {
  const { slug } = await params; // MUST await before accessing
}

// INCORRECT:
export default function Page({ params }: { params: { slug: string } }) {
  const { slug } = params; // FAILS in Next.js 15+
}
```

### Pattern 4: Django Ninja Auth Truthiness (CRITICAL)

**CRITICAL DISCOVERY:** Django Ninja evaluates authentication success based on boolean truthiness.

> "NinjaAPI passes authentication only if the callable object returns a value that can be converted to boolean True."

**The Problem:**
```python
# BAD - Returns None which is falsy
return None  # -> Django Ninja raises 401 Unauthorized

# GOOD - Returns AnonymousUser which is truthy
from django.contrib.auth.models import AnonymousUser
return AnonymousUser()  # -> Auth passes
```

**Implementation:**
```python
# backend/apps/core/authentication.py
class JWTAuth:
    def __call__(self, request):
        token = request.COOKIES.get("access_token")
        if not token:
            if self.required:
                raise HttpError(401, "Authentication required")
            # CRITICAL: Return AnonymousUser, not None
            request.auth = AnonymousUser()
            return AnonymousUser()
        # ... validate token and return user
```

**Cart View Must Check for AnonymousUser:**
```python
# backend/apps/api/v1/cart.py
from django.contrib.auth.models import AnonymousUser

def get_cart_id_from_request(request):
    # Check if actually authenticated (not AnonymousUser)
    if (hasattr(request, "auth")
        and request.auth
        and not isinstance(request.auth, AnonymousUser)
        and getattr(request.auth, 'is_authenticated', False)):
        user_id = getattr(request.auth, 'id', None)
        return f"user:{user_id}", False
```

### Pattern 5: Cart Cookie Persistence

**Location:** `backend/apps/api/v1/cart.py`

**The Problem:** get_cart_id_from_request() generates UUID but never returns it via Set-Cookie.

**The Solution:**
```python
# Step 1: Modify return type to track if cart is new
def get_cart_id_from_request(request: HttpRequest) -> Tuple[str, bool]:
    cart_id = request.COOKIES.get("cart_id")
    is_new = False
    if not cart_id:
        cart_id = str(uuid.uuid4())
        is_new = True
    return cart_id, is_new

# Step 2: Create helper to set cookie
def create_cart_response(data, cart_id: str, is_new_cart: bool):
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

# Step 3: Use in endpoints
@router.get("/", auth=JWTAuth(required=False))
def get_cart(request: HttpRequest):
    cart_id, is_new = get_cart_id_from_request(request)
    # ... get cart data
    return create_cart_response(data, cart_id, is_new)
```

---

## 4. Project Status & Milestones

### Phase Completion Status

| Phase | Feature | Status |
|-------|---------|--------|
| 0 | Foundation & Docker | ✅ Complete |
| 1 | Backend Models | ✅ Complete |
| 2 | JWT Auth + BFF | ✅ Complete |
| 3 | Design System | ✅ Complete |
| 4 | Product Catalog | ✅ Complete |
| 5 | Cart & Checkout | ✅ Complete |
| 6 | Tea Culture | ✅ Complete |
| 7 | Quiz & Subscription | ✅ Complete |
| 8 | Testing & Deployment | ✅ Complete |

### Major Milestones Completed

#### Milestone 1: Cart API Authentication Fix (2026-04-21)
- **Problem:** 401 errors on cart endpoints for anonymous users
- **Root Cause:** Django Ninja evaluates auth success on truthiness (None -> 401)
- **Solution:** Modified JWTAuth.__call__() to return AnonymousUser() instead of None
- **Files:** authentication.py, cart.py, apps/api/__init__.py

#### Milestone 2: Cart Cookie Persistence Fix (2026-04-21)
- **Problem:** Cart items not persisting across requests
- **Root Cause:** cart_id cookie not being set in API responses
- **Solution:** Modified get_cart_id_from_request() to return Tuple[str, bool], created create_cart_response() helper
- **Files:** cart.py (300+ lines updated)
- **Tests:** 4/4 new tests passing

---

## 5. Core Business Logic

### Curation Algorithm (60/30/10)
**Location:** `backend/apps/commerce/curation.py`

Weighted scoring for subscription boxes:
1. **User Preferences (60%)**: Quiz scores (0-100 per category)
2. **Seasonality (30%)**: Matches Singapore seasons
3. **Inventory (10%)**: Stock level boost

```python
def get_current_season_sg() -> str:
    sg_now = datetime.now(timezone('Asia/Singapore'))
    month = sg_now.month
    if 3 <= month <= 5: return 'spring'
    elif 6 <= month <= 8: return 'summer'
    elif 9 <= month <= 11: return 'autumn'
    else: return 'winter'

def score_products(products, prefs):
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

### Shopping Cart (Redis-Backed)
**Location:** `backend/apps/commerce/cart.py`

**Features:**
- 30-day TTL in Redis
- Anonymous cart merges on login
- Atomic operations with HINCRBY

**Cart ID Format:**
- Anonymous: `cart:{uuid}`
- Authenticated: `cart:user:{user_id}`

---

## 6. Key Files Reference

### Critical Backend Files

| Purpose | File |
|---------|------|
| API Router | `backend/api_registry.py` |
| Auth Logic | `backend/apps/core/authentication.py` |
| Cart API | `backend/apps/api/v1/cart.py` |
| Cart Service | `backend/apps/commerce/cart.py` |
| Curation | `backend/apps/commerce/curation.py` |
| Stripe SG | `backend/apps/commerce/stripe_sg.py` |

### Critical Frontend Files

| Purpose | File |
|---------|------|
| Theme | `frontend/app/globals.css` |
| API Fetcher | `frontend/lib/auth-fetch.ts` |
| BFF Proxy | `frontend/app/api/proxy/[...path]/route.ts` |
| Product Card | `frontend/components/product-card.tsx` |
| Cart Drawer | `frontend/components/cart-drawer.tsx` |

---

## 7. Anti-Patterns & Lessons Learned

### Critical Anti-Patterns (NEVER DO)

1. **NEVER** store JWT in localStorage - use HttpOnly cookies
2. **NEVER** return None for optional Django Ninja auth - return AnonymousUser()
3. **NEVER** use forwardRef in React 19 - ref is standard prop
4. **NEVER** forget trailing slashes on API calls
5. **NEVER** use absolute paths in router endpoints - use relative
6. **NEVER** create tailwind.config.js - use globals.css
7. **NEVER** register routers in AppConfig.ready()
8. **NEVER** skip await on Next.js 15+ params
9. **NEVER** use any type in TypeScript
10. **NEVER** build custom component if shadcn/ui exists

### Critical Lessons Learned

#### Lesson 1: Django Ninja Auth Truthiness (2026-04-21)
**Issue:** Cart endpoints returning 401 for anonymous users despite auth=JWTAuth(required=False)

**Root Cause:** Django Ninja evaluates auth success on boolean truthiness. Returning None is falsy -> 401.

**Solution:** Return AnonymousUser() which is truthy. Check isinstance(request.auth, AnonymousUser) in views.

**Files:** authentication.py, cart.py

#### Lesson 2: Cart Cookie Persistence (2026-04-21)
**Issue:** Cart items not persisting across requests

**Root Cause:** get_cart_id_from_request() generates UUID but never returns it to client via Set-Cookie.

**Solution:** Return Tuple[str, bool] from get_cart_id_from_request(), create create_cart_response() helper.

**Files:** cart.py

#### Lesson 3: Duplicate NinjaAPI Instance
**Issue:** Two NinjaAPI instances causing routing conflicts

**Root Cause:** Orphaned api instance in apps/api/__init__.py

**Solution:** Delete duplicate, use only api_registry.py

---

## 8. Testing & Verification

### Backend Tests
```bash
cd backend
pytest -v  # 93+ tests passing
pytest apps/api/tests/test_cart_cookie.py -v  # 4 new tests
```

### Frontend Tests
```bash
cd frontend
npm test  # 39 tests passing
npm run typecheck  # 0 errors (Strict mode)
npm run build  # Production build
```

### Manual Verification
```bash
# Test cart endpoint
curl -s http://localhost:8000/api/v1/cart/ -w "\nStatus: %{http_code}\n"

# Test cart add
curl -s http://localhost:8000/api/v1/cart/add/ \
  -X POST -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 1}' \
  -w "\nStatus: %{http_code}\n"

# Test with cookies (persistence)
curl -s -c /tmp/cookies.txt -b /tmp/cookies.txt \
  http://localhost:8000/api/v1/cart/add/ \
  -X POST -H "Content-Type: application/json" \
  -d '{"product_id": 1, "quantity": 1}'
```

---

## 9. Quick Commands

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

## 10. Documentation References

| Document | Purpose | Lines |
|----------|---------|-------|
| `README.md` | Project overview | 750 |
| `CLAUDE.md` | Agent briefing | 724 |
| `GEMINI.md` | Gemini CLI context | 291 |
| `AGENTS.md` | Project-specific context | 1,400+ |
| `ACCOMPLISHMENTS.md` | Milestone tracking | 650+ |
| `docs/Project_Architecture_Document.md` | Full architecture | 1,252 |
| `docs/MASTER_EXECUTION_PLAN.md` | 8-phase roadmap | 1,222 |

---

## 🚀 You Are Now Initialized

You have absorbed the deep validated understanding of the CHA YUAN (茶源) project. You know:

- **WHAT** the project is and what problems it solves
- **WHY** the architecture decisions were made
- **HOW** to implement features following established patterns
- **WHAT NOT TO DO** (anti-patterns and lessons learned)
- **WHERE** to find critical files and implementations
- **HOW** to test and verify your work

**Remember:**
- Return AnonymousUser() for optional auth, never None
- Use relative paths in Django Ninja routers
- Await params in Next.js 15+ pages
- Set cart_id cookie via create_cart_response() helper
- Follow the BFF pattern for authentication

---

*Generated from meticulous codebase analysis. Last updated: 2026-04-21*
*Project Phase: 8 (Testing & Deployment) - PRODUCTION-READY*
