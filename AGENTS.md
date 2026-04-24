# CHA YUAN (茶源) — Agent Brief
*Premium Tea E-Commerce Platform for Singapore*

---

## 🎯 Project Identity

**Purpose**: Premium tea e-commerce platform exclusively for Singapore, bridging Eastern tea heritage with modern subscription commerce via preference-based curation.

**Core Problems Solved**:
- Overwhelming tea selection without guidance
- Quality/origin authenticity uncertainty
- Lack of personalized recommendations
- Singapore market needs: GST (9%), SGD pricing, regional delivery, PDPA compliance

**Core Solution**:
- ✨ One-time preference quiz with weighted scoring
- 🎯 Monthly curated subscription boxes (60/30/10 algorithm)
- 📚 Educational content: brewing guides, tasting notes, tea culture
- 🇸🇬 Singapore-ready: GST-inclusive pricing, local address/phone validation, PDPA tracking

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────┐
│ CHA YUAN ARCHITECTURE                   │
├─────────────────────────────────────────┤
│ FRONTEND (Next.js 16 + React 19)        │
│   ↓ BFF Proxy (/api/proxy/*)            │
│ BACKEND (Django 6 + Ninja API)          │
│   ↓                                     │
│ PostgreSQL 17 | Redis 7.4               │
│ JWT + HttpOnly Cookies                  │
└─────────────────────────────────────────┘
```

### Key Patterns

**1. BFF (Backend for Frontend)**
- Location: `frontend/app/api/proxy/[...path]/route.ts`
- Secure JWT handling via HttpOnly cookies (never localStorage)
- Client Components → BFF Proxy → Django API
- Server Components → Direct backend via `authFetch()`

**2. Centralized API Registry (CRITICAL)**
- Location: `backend/api_registry.py`
- Eager router registration at import time (NOT in `ready()`)
- Prevents circular imports; ensures endpoints registered before URL resolver
- Router endpoints use RELATIVE paths: `@router.get("/")` NOT `@router.get("/products/")`

**3. Server-First Design**
- Server Components (RSC): Product listing/detail, articles (SEO-critical)
- Client Components: Cart drawer, quiz interface, filter sidebar, forms with state

**4. Django Ninja Auth Truthiness (CRITICAL)**
- Optional auth callables must return truthy value (`AnonymousUser()`), NOT `None`
- `None` triggers 401 even with `auth=JWTAuth(required=False)`

**5. Cart Cookie Persistence Pattern**
- `get_cart_id_from_request()` returns `Tuple[str, bool]` → `(cart_id, is_new)`
- `create_cart_response()` sets `Set-Cookie` header for new anonymous carts
- Cookie attributes: `HttpOnly`, `Secure` (prod), `SameSite=Lax`, `path=/`, `max_age=30 days`

**6. Next.js 15+ Async Params**
```typescript
interface PageProps {
  params: Promise<{ slug: string }>;
}
export default async function Page({ params }: PageProps) {
  const { slug } = await params; // MUST await
}
```

**7. Tailwind CSS v4 CSS-First**
- NO `tailwind.config.js` — all config in `globals.css` via `@theme`
- OKLCH colors, Lightning CSS compilation

**8. Hydration-Safe Animated Links**
```tsx
// ✅ Use motion.create(Link)
const MotionLink = motion.create(Link);
<MotionLink href="/product" whileHover="hover">...</MotionLink>
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16 + React 19 | App Router, Server Components, Turbopack |
| Styling | Tailwind CSS v4 | CSS-first theming, OKLCH colors |
| UI | Radix UI + shadcn | Accessible primitives |
| Animation | Framer Motion 12+ | Micro-interactions, `useReducedMotion()` |
| State | TanStack Query 5 + Zustand 5 | Server state + lightweight client state |
| Backend | Django 6 + Django Ninja 1.6 | API + Admin, Pydantic v2 validation |
| Database | PostgreSQL 17 | JSONB optimization |
| Cache | Redis 7.4 | Cart (30-day TTL), sessions, rate limiting |
| Payment | Stripe 14.4 | SGD, GrabPay, PayNow |
| Testing | Vitest + Playwright | Unit + E2E coverage |

---

## 🗂️ Project Structure (Condensed)

```
cha-yuan/
├── backend/
│   ├── api_registry.py          # Centralized router registration (CRITICAL)
│   ├── apps/
│   │   ├── api/v1/              # Django Ninja routers (products, cart, checkout, etc.)
│ │ ├── commerce/ # Product, Origin, TeaCategory, Subscription models + curation.py
│   │   ├── content/             # Quiz, Articles, UserPreference
│   │   └── core/                # User model, JWT auth, SG validators
│   └── chayuan/settings/        # Environment-specific configs
│
├── frontend/
│   ├── app/
│   │   ├── (routes)/            # Logic-grouped: products/, culture/, quiz/, cart/, etc.
│   │   ├── api/proxy/[...path]/ # BFF proxy route
│   │   ├── page.tsx, layout.tsx, globals.css
│   ├── components/              # UI primitives + sections + feature components
│   ├── lib/
│   │   ├── api/                 # Typed API functions
│   │   ├── auth-fetch.ts        # BFF wrapper (cookie handling, token refresh)
│   │   └── types/, hooks/, utils/
│   └── public/images/
│
├── infra/docker/                # docker-compose.yml, Dockerfiles
└── docs/                        # Architecture docs, phase plans
```

---

## 🍵 Core Business Logic

### Curation Algorithm (60/30/10)
Location: `backend/apps/commerce/curation.py`

```python
def score_products(products, prefs):
    scored = []
    for product in products:
        score = 1.0
        if prefs:
            cat_pref = prefs.get(product.category.slug, 0)
            score += cat_pref * 0.6  # 60% user preferences
        if product.is_new_arrival:
            score += 0.3  # 30% seasonality boost
        # 10% inventory level factored separately
        scored.append((product, score))
    return sorted(scored, key=lambda x: x[1], reverse=True)
```

### Singapore Season Detection
```python
def get_current_season_sg() -> str:
    month = datetime.now(timezone('Asia/Singapore')).month
    if 3 <= month <= 5: return 'spring'
    elif 6 <= month <= 8: return 'summer'
    elif 9 <= month <= 11: return 'autumn'
    else: return 'winter'
```

### Shopping Cart (Redis-Backed)
- Key format: `cart:{uuid}` (anonymous) or `cart:user:{id}` (authenticated)
- 30-day TTL, atomic `HINCRBY` operations, anonymous→auth merge on login
- Stock validation with error handling

### GST & Pricing (9%)
```python
GST_RATE = Decimal('0.09')

def get_price_with_gst(self):
    if self.gst_inclusive:
        return self.price_sgd
    return (self.price_sgd * Decimal('1.09')).quantize(
        Decimal('0.01'), rounding=ROUND_HALF_UP)
```

---

## 🇸🇬 Singapore Compliance

| Requirement | Implementation |
|-------------|---------------|
| **GST 9%** | `GST_RATE = Decimal('0.09')`; all prices displayed inclusive; IRAS-compliant rounding |
| **Currency** | SGD only; `Intl.NumberFormat('en-SG', { currency: 'SGD' })` |
| **Address** | Block/Street + Unit (`#XX-XX`) + 6-digit postal code (`^\d{6}$`) |
| **Phone** | `+65 XXXX XXXX` format (`^\+65\s?\d{8}$`) |
| **PDPA** | `User.pdpa_consent_at` timestamp mandatory; checkbox on signup |
| **Timezone** | `Asia/Singapore` (SGT) everywhere |
| **Stripe** | `payment_method_types=['card','grabpay','paynow']`; `currency='sgd'`; `allowed_countries=['SG']` |

---

## 🔌 API Reference (Condensed)

### Public Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/products/` | GET | List products (paginated, filtered) |
| `/api/v1/products/{slug}/` | GET | Product detail |
| `/api/v1/products/categories/` | GET | Tea categories |
| `/api/v1/content/articles/` | GET | Articles list |
| `/api/v1/quiz/questions/` | GET | Quiz questions |
| `/api/v1/checkout/config/` | GET | Stripe publishable key |

### Authenticated Endpoints (JWT via HttpOnly cookies)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/cart/*` | GET/POST/PUT/DELETE | Cart operations (optional auth) |
| `/api/v1/checkout/create-session/` | POST | Create Stripe session |
| `/api/v1/quiz/submit/` | POST | Submit quiz answers |
| `/api/v1/subscriptions/*` | GET/POST | Subscription management |
| `/api/v1/auth/*` | POST/GET | Login/logout/refresh/me |

> ⚠️ **All Django Ninja endpoints require trailing slashes** (e.g., `/api/v1/products/`)

---

## 🧪 Testing & Development

### Commands
```bash
# Infrastructure
cd infra/docker && docker-compose up -d

# Backend
cd backend
python manage.py migrate --settings=chayuan.settings.development
python manage.py seed_products --settings=chayuan.settings.development
python manage.py seed_quiz --settings=chayuan.settings.development
python manage.py runserver 127.0.0.1:8000 --settings=chayuan.settings.development
pytest -v  # Backend tests

# Frontend
cd frontend
npm install && npm run dev  # Port 3000
npm run typecheck && npm run lint && npm test  # Quality checks
npm run test:e2e  # Playwright
```

### Access Points
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Django Admin | http://localhost:8000/admin/ |
| API Docs | http://localhost:8000/docs/ |
| OpenAPI Schema | http://localhost:8000/openapi.json |

---

## 🔐 Security & Authentication

### Auth Flow
1. Login → Django issues JWT → Sets HttpOnly cookies (`access_token`, `refresh_token`)
2. Client requests → BFF proxy extracts JWT from cookie → Forwards with `Authorization: Bearer`
3. Token refresh automatic on 401 via BFF

### Cookie Attributes
- `HttpOnly`: Prevents XSS access
- `Secure`: HTTPS only in production
- `SameSite=Lax`: CSRF protection
- Access token: 15min expiry; Refresh token: 7 days

### Security Measures
- JWT never in localStorage
- Pydantic v2 validation on all API inputs
- Rate limiting via Redis
- PDPA consent tracking mandatory
- Singapore-only shipping enforcement in Stripe

---

## 🐛 Troubleshooting Guide

### API 401 on Optional Auth Endpoints
**Cause**: Auth callable returns `None` (falsy) instead of `AnonymousUser()` (truthy)
**Fix**:
```python
if not token and not self.required:
    from django.contrib.auth.models import AnonymousUser
    request.auth = AnonymousUser()
    return AnonymousUser()  # ✅ Truthy
```

### Cart Not Persisting (Anonymous)
**Cause**: `Set-Cookie` header not returned when generating new cart UUID
**Fix**: Use `create_cart_response(data, cart_id, is_new)` in all cart endpoints

### Product Detail 404
**Causes**:
1. Next.js 15 params not awaited: `const { slug } = await params`
2. Missing trailing slash in API call: `/api/v1/products/{slug}/`
3. Slug not in database

### BFF Proxy POST/PUT/DELETE 500 Errors
**Cause**: Trailing slash stripped in URL construction; Django CommonMiddleware can't redirect POST with data
**Fix** (`frontend/app/api/proxy/[...path]/route.ts`):
```ts
const targetUrl = new URL(`/api/v1/${pathString}/`, BACKEND_URL); // Append trailing slash
```

### Hydration Errors with Framer Motion + Link
**Cause**: `<Link>` inside `<motion.div>` causes SSR/CSR DOM mismatch
**Fix**: Use `motion.create(Link)` or wrap `<Link>` inside `<motion.div>` (not vice versa)

---

## ⚠️ Anti-Patterns to Avoid

| Anti-Pattern | Correct Approach |
|-------------|-----------------|
| Store JWT in `localStorage` | Use BFF proxy + HttpOnly cookies |
| Return `None` for optional Django Ninja auth | Return `AnonymousUser()` |
| Use `any` in TypeScript | Use `unknown` or specific interfaces |
| Duplicate API paths in router endpoints | Use relative paths: `@router.get("/")` |
| Skip `await` on Next.js 15+ `params` | Always `await params` before accessing |
| Use `forwardRef` in React 19 | Treat `ref` as standard prop |
| Create `tailwind.config.js` | Configure `@theme` in `globals.css` only |
| Register routers in `AppConfig.ready()` | Use eager registration in `api_registry.py` |
| Wrap `<Link>` inside `<motion.div>` | Use `motion.create(Link)` |
| Commit secrets | Use `.env` files + environment variables |

---

## 📚 Documentation References

| Document | Purpose |
|----------|---------|
| `README.md` | Project overview, setup instructions |
| `CLAUDE.md` / `GEMINI.md` | Concise agent briefings |
| `docs/Project_Architecture_Document.md` | Full architecture with diagrams |
| `docs/PHASE_*_SUBPLAN.md` | Phase-specific implementation plans |
| `plan/MASTER_EXECUTION_PLAN.md` | Full 8-phase roadmap |
| `CODEBASE_REVIEW_AND_ASSESSMENT_REPORT.md` | Audit findings & remediation |

---

## ✅ Working Features (Verified)

- ✅ Product catalog with filtering (category, origin, season, fermentation)
- ✅ Product detail pages with brewing guides, gallery, related products
- ✅ Preference quiz with 60/30/10 scoring algorithm
- ✅ Redis-backed shopping cart with 30-day persistence + cookie tracking
- ✅ Stripe checkout (SGD, GrabPay, PayNow) with Singapore shipping restriction
- ✅ JWT authentication via HttpOnly cookies + BFF proxy
- ✅ Subscription dashboard with status, billing, box preview
- ✅ Article content system with markdown
- ✅ GST 9% calculation & inclusive pricing display
- ✅ Singapore address/phone validation + PDPA consent tracking

---

## 📊 Codebase Metrics

| Metric | Value | Status |
|--------|-------|--------|
| **Backend Test Coverage** | 29.41% | 🔴 Below 50% target |
| **Backend Tests** | 165 passed / 228 failed / 124 errors | 🔴 Only 32% pass rate |
| **Frontend Tests** | 78/78 passing | ✅ All passing |
| **TypeScript** | 0 errors (strict mode) | ✅ Perfect |
| **Security** | HttpOnly cookies ✅ | 🔴 Infra needs hardening (see audit report) |
| **Lines of Code** | ~29,000 | 11,790 backend + 16,996 frontend |
| **Last Audit** | 2026-04-24 | See CODEBASE_REVIEW_AND_ASSESSMENT_REPORT.md |

---

## 🔗 Important File References

| Purpose | File Path | Lines |
|---------|-----------|-------|
| API Registry | `backend/api_registry.py` | 64 |
| Cart Service | `backend/apps/commerce/cart.py` | 419 |
| Curation Engine | `backend/apps/commerce/curation.py` | 294 |
| Authentication | `backend/apps/core/authentication.py` | 190 |
| BFF Proxy | `frontend/app/api/proxy/[...path]/route.ts` | 257 |
| Auth Fetch | `frontend/lib/auth-fetch.ts` | 148 |
| Design System | `frontend/app/globals.css` | 349 |
| User Model | `backend/apps/core/models.py` | 133 |
| Product Model | `backend/apps/commerce/models.py` | 343 |
| Quiz Models | `backend/apps/content/models.py` | 255 |

