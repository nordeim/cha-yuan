# GEMINI.md - CHA YUAN (茶源) Context & Instructions

**Role**: Senior Frontend Architect & Technical Partner
**Project**: CHA YUAN (Premium Tea E-Commerce for Singapore)
**Phase**: 8 (Testing & Deployment)
**Last Updated**: 2026-04-21
**Version**: 1.2.0

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

- **Total Tests**: 93+ backend (pytest) + 43+ tests total (including new Cart persistence tests) passing
- **TypeScript**: Strict mode, 0 errors
- **Cart API**: Fixed 401 errors for anonymous users; implemented `Set-Cookie` persistence for guest carts
- **Phase**: 8 - Production-ready pending final E2E verification

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
python manage.py seed_products  # Seeds 12 premium teas
python manage.py seed_quiz      # Seeds 6 quiz questions
python manage.py runserver 127.0.0.1:8000 --settings=chayuan.settings.development
```

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev  # Uses Turbopack (--turbopack flag in package.json)
```

### Testing

- **Backend**: `pytest` (Target: 85%+ coverage, current: 97+ tests passing)
- **Frontend Unit**: `npm test` (Vitest, 39 tests passing)
- **Frontend E2E**: `npm run test:e2e` (Playwright)
- **TypeScript**: `npm run typecheck` (Strict mode, 0 errors)

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
5. **Auth Success Truthiness**: Django Ninja auth callables must return a truthy value (e.g., `AnonymousUser()`) even for optional auth to succeed. Returning `None` triggers a 401.
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
**Lesson**: Django Ninja interprets `None` from an auth callable as "Authentication Failed" (401), even if `auth=JWTAuth(required=False)`.
**Solution**: Auth callables must return `AnonymousUser()` instead of `None` for optional authentication to work correctly.

### 2. Cart Cookie Persistence
**Lesson**: Anonymous carts were being reset because `cart_id` was generated but not returned to the client in the response headers.
**Solution**: Use the `create_cart_response(response, cart_id, is_new)` helper in `backend/apps/api/v1/cart.py` to ensure `Set-Cookie` is sent for new sessions.

### 3. Hydration-Safe Animated Links
**Lesson**: Wrapping Next.js `<Link>` components with `<motion.div>` often causes SSR/CSR mismatches.
**Solution**: Use `motion.create(Link)` to create a hydration-safe animated link component that merges props correctly.

### 4. Next.js 15+ Async Params
**Lesson**: Accessing `params.slug` directly in server components now throws errors or returns undefined.
**Solution**: Always `await params` before accessing properties.

### 5. BFF Proxy Cookie Forwarding
**Lesson**: The Next.js BFF proxy at `frontend/app/api/proxy/[...path]/route.ts` may strip `set-cookie` headers by default.
**Solution**: Ensure the proxy is configured to allow `set-cookie` and `content-encoding` through if guest cart persistence is required.

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
    score = 0
    score += 0.6 * normalized_user_preference
    score += 0.3 if seasonal_match else 0
    score += 0.1 * inventory_factor
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

---

## 📂 Key File Reference

### Critical Files

| Purpose | File | Description |
|---------|------|-------------|
| API Router | `backend/api_registry.py` | Central router registration (eager import) |
| Auth Logic | `backend/apps/core/authentication.py` | JWT cookie handling & AnonymousUser logic |
| Cart API | `backend/apps/api/v1/cart.py` | Cookie-aware cart endpoints |
| Curation | `backend/apps/commerce/curation.py` | 60/30/10 scoring algorithm |
| Cart Svc | `backend/apps/commerce/cart.py` | Redis cart service (418 lines) |
| Stripe SG | `backend/apps/commerce/stripe_sg.py` | Singapore Stripe integration |
| Theme | `frontend/app/globals.css` | Tailwind v4 theme (349 lines) |
| API Fetcher | `frontend/lib/auth-fetch.ts` | BFF wrapper (148 lines) |
| Animations | `frontend/lib/animations.ts` | Framer Motion variants |

---

## ⚠️ Anti-Patterns to Avoid

1. **Never** store JWT in `localStorage`. Use the BFF proxy + HttpOnly cookies.
2. **Never** use `any` in TypeScript. Use `unknown` or specific interfaces.
3. **Never** build a custom component if a `shadcn/ui` primitive exists. Wrap it instead.
4. **Never** forget trailing slashes on API calls to Django Ninja.
5. **Never** use `forwardRef` in React 19. Treat `ref` as a standard prop.
6. **Never** create `tailwind.config.js`. Use CSS-first configuration in `globals.css`.
7. **Never** register routers in `AppConfig.ready()`. Use eager registration in `api_registry.py`.
8. **Never** use absolute paths in Django Ninja router endpoints. Use relative paths.
9. **Never** return `None` for optional authentication in Django Ninja.

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

- `PROJECT_MASTER_BRIEF.md` - Definitive project source-of-truth
- `ACCOMPLISHMENTS.md` - Milestone tracking & detailed fix records
- `README.md` - Comprehensive project overview
- `CLAUDE.md` - Concise agent briefing (724 lines)
- `AGENTS.md` - Project-specific context
- `PROJECT_KNOWLEDGE_BASE.md` - Technical knowledge base
- `docs/Project_Architecture_Document.md` - Full architecture (1,252 lines)

---

*Generated by Gemini CLI. Last updated: 2026-04-21*
