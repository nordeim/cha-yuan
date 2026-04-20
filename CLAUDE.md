---
IMPORTANT: File is read fresh for every conversation. This document contains deep, validated understanding of the CHA YUAN codebase.
Updated: 2026-04-20
Project: cha-yuan (Premium Tea E-Commerce Platform for Singapore)
Phase: 8 (Testing & Deployment)
Version: 1.0.0
---

# CHA YUAN (茶源) - Comprehensive Agent Brief

**Premium Tea E-Commerce Platform for Singapore**

---

## 🎯 Core Identity & Purpose

CHA YUAN (茶源) is a premium tea e-commerce platform exclusively designed for the Singapore market. The platform bridges Eastern tea heritage with modern lifestyle commerce through a sophisticated subscription model powered by a preference-based curation algorithm.

### Problem Solved
- **Overwhelming Selection**: Consumers face hundreds of tea varieties without guidance
- **Quality Uncertainty**: Origin authenticity and harvest quality are hard to verify
- **Personalization Gap**: No tailored recommendations based on taste preferences
- **Singapore Market Needs**: Local GST compliance (9%), SGD pricing, regional delivery

### Solution
- ✨ **Preference Quiz**: One-time onboarding quiz determines tea preferences using weighted scoring
- 🎯 **Curated Subscription**: Monthly tea boxes automatically curated based on preferences + season
- 📚 **Educational Content**: Brewing guides, tasting notes, and tea culture articles
- 🇸🇬 **Singapore-Ready**: GST-inclusive pricing, local address format, PDPA compliance

---

## 🏗️ Technical Architecture

### System Architecture Overview
```
┌─────────────────────────────────────────────────────────────────┐
│ CHA YUAN ARCHITECTURE                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌──────────────┐ ┌──────────────────────────────┐            │
│ │ FRONTEND     │────────▶│ BACKEND                     │            │
│ │              │ BFF    │ Django 6 + Ninja API         │            │
│ │ Next.js 16   │────────▶│                             │            │
│ │ React 19     │ /api/  │ PostgreSQL 17 | Redis 7.4   │            │
│ │ Tailwind v4  │ Proxy  │                             │            │
│ └──────────────┘ └──────────────────────────────┘            │
│          │                                              │
│ └───────────────────────────┘                              │
│ JWT + HttpOnly Cookies                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack
| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js | 16.2.3+ | App Router, Server Components, Turbopack |
| **Framework** | React | 19.2.5+ | Concurrent features, Server Actions, No `forwardRef` |
| **Styling** | Tailwind CSS | 4.2.2 | CSS-first theming, OKLCH colors |
| **UI** | Radix UI + shadcn | Latest | Accessible primitives |
| **Animation** | Framer Motion | 12.38.0+ | Smooth micro-interactions |
| **State** | TanStack Query | 5.99.0+ | Server state |
| **Client State** | Zustand | 5.0.12+ | Lightweight state |
| **Backend** | Django | 6.0.4+ | API + Admin |
| **API** | Django Ninja | 1.6.2+ | Pydantic v2 validation |
| **Database** | PostgreSQL | 17 | JSONB optimization |
| **Cache** | Redis | 7.4-alpine | Sessions, cart (30-day TTL) |
| **Payment** | Stripe | 14.4.1 | SGD, GrabPay, PayNow |
| **Testing** | Vitest + Playwright | Latest | Unit + E2E |

### Architecture Patterns

#### 1. BFF (Backend for Frontend)
**Location**: `frontend/app/api/proxy/[...path]/route.ts`
- Secure JWT handling via HttpOnly cookies (never stored in localStorage)
- Client Components → BFF Proxy → Django API
- Server Components → Direct backend call via `authFetch()`

#### 2. Centralized API Registry (CRITICAL)
**Location**: `backend/api_registry.py`
- Eager router registration at import time (NOT in `ready()` method)
- Prevents circular imports and ensures endpoints are registered before URL resolver runs
- Router endpoints use RELATIVE paths: `@router.get("/")` NOT `@router.get("/products/")`

#### 3. Server-First Design
- **Server Components (RSC)**: Product listing, product detail, articles (SEO-critical)
- **Client Components**: Cart drawer, quiz interface, filter sidebar, forms with state

---

## 🗂️ Project Structure

```
cha-yuan/
├── backend/                         # Django 6 Backend
│   ├── api_registry.py              # CRITICAL: Centralized API router (eager registration)
│   ├── apps/
│   │   ├── api/v1/                  # Django Ninja Routers
│   │   │   ├── auth.py              # JWT authentication
│   │   │   ├── products.py          # Product catalog API
│   │   │   ├── cart.py              # Shopping cart API
│   │   │   ├── checkout.py          # Stripe checkout & webhooks
│   │   │   ├── content.py           # Articles & culture API
│   │   │   ├── quiz.py              # Quiz & preferences API
│   │   │   └── subscriptions.py     # Subscription management
│   │   ├── commerce/                # Product & Commerce
│   │   │   ├── models.py            # Product, Origin, TeaCategory, Subscription, Order
│   │   │   ├── cart.py              # Redis cart service (418 lines)
│   │   │   ├── curation.py          # AI curation algorithm (60/30/10)
│   │   │   ├── stripe_sg.py         # Singapore Stripe integration
│   │   │   ├── admin.py             # Django Admin customization
│   │   │   └── management/commands/seed_products.py  # Seed 12 premium teas
│   │   ├── content/                 # Content & Quiz
│   │   │   ├── models.py            # QuizQuestion, QuizChoice, UserPreference, Article
│   │   │   ├── admin.py             # Quiz admin with inline choices
│   │   │   └── management/commands/seed_quiz.py       # Seed 6 quiz questions
│   │   └── core/                    # Users & Auth
│   │       ├── models.py            # User with SG validation
│   │       ├── authentication.py    # JWT + HttpOnly cookies
│   │       └── sg/                  # Singapore utilities
│   │           ├── validators.py    # Phone, postal code validation
│   │           └── pricing.py       # GST calculation
│   ├── chayuan/                     # Django Project Config
│   │   ├── settings/                # Environment-specific settings
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   └── urls.py                  # URL configuration (imports from api_registry)
│   └── requirements/
│       ├── base.txt                 # Production dependencies
│       └── dev.txt                  # Development dependencies
│
├── frontend/                        # Next.js 16 Frontend
│   ├── app/                         # App Router
│   │   ├── (routes)/                # Logic-grouped routes
│   │   │   ├── products/            # Product catalog
│   │   │   │   ├── page.tsx         # Product listing (Server Component)
│   │   │   │   ├── [slug]/
│   │   │   │   │   └── page.tsx     # Product detail (Dynamic)
│   │   │   │   └── components/
│   │   │   │       └── product-catalog.tsx
│   │   │   ├── culture/             # Articles & Tea Culture
│   │   │   ├── quiz/                # Preference Quiz
│   │   │   ├── cart/
│   │   │   ├── checkout/            # Stripe checkout flow
│   │   │   │   ├── success/
│   │   │   │   └── cancel/
│   │   │   ├── dashboard/
│   │   │   │   └── subscription/    # Subscription dashboard
│   │   │   └── shop/
│   │   │       └── page.tsx         # Redirects to /products
│   │   ├── api/
│   │   │   └── proxy/
│   │   │       └── [...path]/
│   │   │           └── route.ts     # BFF Proxy Route
│   │   ├── page.tsx                 # Home page (Hero landing)
│   │   ├── layout.tsx               # Root layout with fonts
│   │   ├── globals.css              # Tailwind v4 theme (349 lines)
│   │   └── providers.tsx            # QueryClientProvider
│   ├── components/
│   │   ├── ui/                      # shadcn primitives (Button, Input, Sheet, etc.)
│   │   ├── sections/                # Page sections (hero, navigation, etc.)
│   │   ├── product-card.tsx
│   │   ├── product-grid.tsx
│   │   ├── product-gallery.tsx
│   │   ├── related-products.tsx
│   │   ├── filter-sidebar.tsx
│   │   ├── article-card.tsx
│   │   ├── article-grid.tsx
│   │   ├── gst-badge.tsx
│   │   └── cart-drawer.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── products.ts
│   │   │   ├── quiz.ts
│   │   │   └── subscription.ts
│   │   ├── types/
│   │   │   ├── product.ts
│   │   │   ├── quiz.ts
│   │   │   └── subscription.ts
│   │   ├── hooks/
│   │   │   └── use-subscription.ts
│   │   ├── auth-fetch.ts            # BFF wrapper (148 lines)
│   │   ├── animations.ts
│   │   └── utils.ts
│   └── public/
│       └── images/
│
├── infra/
│   └── docker/                      # Infrastructure
│       ├── docker-compose.yml       # PostgreSQL 17 + Redis 7.4 + Backend + Frontend
│       ├── Dockerfile.backend.dev
│       └── Dockerfile.frontend.dev
│
└── docs/                            # Documentation
    ├── Project_Architecture_Document.md  # Full architecture (1,409 lines)
    ├── PHASE_0_SUBPLAN.md           # Foundation & Docker
    ├── PHASE_1_SUBPLAN.md           # Backend Models
    ├── PHASE_2_SUBPLAN.md           # JWT Auth + BFF
    ├── PHASE_3_SUBPLAN.md           # Design System
    ├── PHASE_4_SUBPLAN.md           # Product Catalog
    ├── PHASE_5_SUBPLAN.md           # Cart & Checkout
    ├── PHASE_6_SUBPLAN.md           # Tea Culture
    └── PHASE_7_SUBPLAN.md           # Quiz & Subscription
```

---

## 🍵 Core Business Logic

### Curation Algorithm (60/30/10)
**Location**: `backend/apps/commerce/curation.py`

Scores products for subscription boxes based on three weighted factors:

1. **User Preferences (60%)**: Based on one-time onboarding quiz scores (0-100 per category)
2. **Seasonality (30%)**: Matches tea harvest cycles to current Singapore season
   - Spring: March-May
   - Summer: June-August
   - Autumn: September-November
   - Winter: December-February
3. **Inventory (10%)**: Boosts products with healthy stock levels to ensure fulfillment

```python
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
**Location**: `backend/apps/commerce/cart.py` (418 lines)

- Persistent storage in Redis with 30-day TTL
- Anonymous cart merges with authenticated cart on login
- Atomic operations using Redis HINCRBY
- Stock validation with error handling

---

## 🇸🇬 Singapore Context & Compliance

### GST 9% (Goods and Services Tax)
**Location**: `backend/apps/commerce/models.py`

```python
GST_RATE = Decimal('0.09')

def get_price_with_gst(self):
    """Return price including GST."""
    if self.gst_inclusive:
        return self.price_sgd
    return (self.price_sgd * Decimal("1.09")).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )

def get_gst_amount(self):
    """Calculate GST amount for display."""
    if self.gst_inclusive:
        return self.price_sgd - (self.price_sgd / Decimal("1.09"))
    return self.price_sgd * GST_RATE
```

### Singapore Address Format
```
Block/Street: "Blk 123 Jurong East St 13"
Unit: "#04-56"
Postal Code: "600123" (6 digits, validated with ^\d{6}$)
```

### Singapore Phone Format
```
Format: +65 XXXX XXXX
Validation: ^\+65\s?\d{8}$
Examples: +65 9123 4567, +6591234567
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

### PDPA Compliance
- User model includes `pdpa_consent_at` timestamp
- Consent tracking mandatory for all users
- Checkbox on signup: "I consent to PDPA terms"

### Timezone
All operations use `Asia/Singapore` (SGT)
- Django: `TIME_ZONE = "Asia/Singapore"`
- JavaScript: `Intl.DateTimeFormat("en-SG", { timeZone: "Asia/Singapore" })`

---

## 🎨 Design System

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-tea-500` | `#5C8A4D` | Primary brand color |
| `--color-tea-600` | `#4A7040` | Primary hover state |
| `--color-ivory-50` | `#FDFBF7` | Page background |
| `--color-ivory-100` | `#FAF6EE` | Paper texture background |
| `--color-terra-400` | `#C4724B` | Warm accents |
| `--color-bark-900` | `#2A1D14` | Text primary |
| `--color-gold-500` | `#B8944D` | Accent, prices, CTAs |

### Typography
- **Display**: "Playfair Display", serif (headings)
- **Sans**: "Inter", system-ui (body)
- **Chinese**: "Noto Serif SC", serif (茶源 branding)

### Tailwind CSS v4 Configuration
**Location**: `frontend/app/globals.css`

```css
@import "tailwindcss";

@theme {
  --color-tea-50: #f4f7f1;
  --color-tea-500: #5c8a4d;
  --color-tea-600: #4a7040;
  --color-ivory-50: #fdfbf7;
  --color-ivory-100: #faf6ee;
  --color-terra-400: #c4724b;
  --color-bark-900: #2a1d14;
  --color-gold-500: #b8944d;
  
  --font-sans: "Inter", system-ui, sans-serif;
  --font-serif: "Playfair Display", Georgia, serif;
  --font-chinese: "Noto Serif SC", serif;
}
```

**CRITICAL**: No `tailwind.config.js` - all configuration in CSS via `@theme`.

---

## 🔐 Security & Authentication

### BFF Pattern (Backend for Frontend)
**Location**: `frontend/lib/auth-fetch.ts`

```typescript
// Server Component: Direct backend call
const response = await authFetch("/api/v1/products/", { skipAuth: true });

// Client Component: Through proxy (handled automatically by authFetch)
const response = await authFetch("/api/v1/cart/add/", {
  method: "POST",
  body: JSON.stringify({ product_id: 1, quantity: 2 }),
});
```

### Authentication Flow
1. **Login**: Django issues JWT tokens → Sets HttpOnly cookies
2. **Client Requests**: Frontend → BFF Proxy → Extracts JWT from cookie → Forwards to Django
3. **Never Store in localStorage**: Always use HttpOnly cookies via BFF
4. **Token Refresh**: Automatic on 401 via BFF proxy

### Cookie Attributes
- `HttpOnly`: Prevents XSS access
- `Secure`: HTTPS only in production
- `SameSite=Lax`: CSRF protection
- Access token: 15min expiry
- Refresh token: 7 days expiry

---

## 🧪 Testing Strategy

### Backend Tests (Pytest)
**Test Status**: 93+ tests passing

```bash
cd backend
pytest -v                           # Run all tests
pytest apps/content/tests/ -v       # Quiz tests
pytest apps/commerce/tests/ -v      # Product/Order tests
pytest --cov=apps --cov-report=html # With coverage
```

### Frontend Tests (Vitest + Playwright)
**Test Status**: 39 tests passing

```bash
cd frontend
npm test                           # Unit tests
npm run test:coverage              # Coverage report
npm run test:e2e                   # Playwright E2E
npm run test:e2e:ui                # Playwright with UI
```

### TypeScript Strict Mode
```bash
npm run typecheck  # 0 errors expected
```

### Pre-Commit Checklist
```bash
# Backend
black .
isort .
mypy .
pytest

# Frontend
npm run typecheck
npm run lint
npm run build
npm test
```

---

## 🚀 Development Workflow

### Environment Setup

#### 1. Start Infrastructure (PostgreSQL 17 + Redis 7.4)
```bash
cd infra/docker
docker-compose up -d

# Verify services
pg_isready -h 127.0.0.1 -p 5432    # Should return "accepting connections"
redis-cli -h 127.0.0.1 -p 6379 ping  # Should return "PONG"
```

#### 2. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements/dev.txt

# Database setup
python manage.py migrate --settings=chayuan.settings.development

# Seed test data
python manage.py seed_products --settings=chayuan.settings.development  # 12 products
python manage.py seed_quiz --settings=chayuan.settings.development      # 6 quiz questions

# Start Django server
python manage.py runserver 127.0.0.1:8000 --settings=chayuan.settings.development
```

#### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Port 3000
```

### Access Points
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Django Admin | http://localhost:8000/admin/ |
| API Documentation | http://localhost:8000/docs/ |
| OpenAPI Schema | http://localhost:8000/openapi.json |

---

## 📋 Implementation Standards

### Backend (Django + Django Ninja)

#### API Router Registration (CRITICAL)
**Location**: `backend/api_registry.py`

```python
# Centralized registration at import time
api.add_router("/products/", products_router)

# Router endpoints use RELATIVE paths:
@router.get("/")           # Accessible at /api/v1/products/
@router.get("/{slug}/")    # Accessible at /api/v1/products/{slug}/
```

#### Model Patterns
- Use `select_related()` for FK relations
- Use `prefetch_related()` for reverse FKs
- Add `is_available=True` filters for public APIs
- Use `GST_RATE = Decimal('0.09')` for pricing

### Frontend (Next.js 16 + React 19)

#### Next.js 15+ Async Params (CRITICAL)
Page `params` and `searchParams` are **Promises**. Must `await` them.

```typescript
// CORRECT (Next.js 15+)
interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string }>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params;           // MUST await before accessing
  const filters = await searchParams;
}
```

#### TypeScript Strict Mode
- No `any` - use `unknown` instead
- Prefer `interface` over `type` (except unions)
- Explicit return types on public functions
- Handle `undefined` in filter types: `category?: string | undefined`

#### React 19 (No forwardRef)
```typescript
// CORRECT (React 19) - ref is standard prop
function MyComponent({ ref, ...props }: { ref: React.Ref<HTMLDivElement> }) {
  return <div ref={ref} {...props} />;
}

// INCORRECT (pre-React 19) - DON'T use forwardRef
const MyComponent = forwardRef((props, ref) => { ... });
```

#### Tailwind CSS v4 (CSS-first)
- Theme in `globals.css` with `@theme`
- NO `tailwind.config.js`
- Use `cn()` utility for conditional classes

#### Animation (Framer Motion)
```typescript
const prefersReducedMotion = useReducedMotion();
initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
```

#### Hydration-Safe Animated Links
```typescript
// ❌ INVALID: Link inside motion.div causes hydration errors
<Link href="/product"><motion.div>...</motion.div></Link>

// ✅ VALID: motion.create(Link)
const MotionLink = motion.create(Link);
<MotionLink href="/product" whileHover="hover">...</MotionLink>
```

---

## 🔗 Key API Endpoints

### Public Endpoints (No Auth Required)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/products/` | GET | List products (paginated, filtered) |
| `/api/v1/products/{slug}/` | GET | Product detail |
| `/api/v1/products/categories/` | GET | Tea categories |
| `/api/v1/products/origins/` | GET | Tea origins |
| `/api/v1/content/articles/` | GET | Articles list |
| `/api/v1/content/articles/{slug}/` | GET | Article detail |
| `/api/v1/quiz/questions/` | GET | Quiz questions |
| `/api/v1/checkout/config/` | GET | Stripe publishable key |

### Authenticated Endpoints (JWT Required)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/cart/` | GET/POST/PUT/DELETE | Shopping cart operations |
| `/api/v1/checkout/create-session/` | POST | Create Stripe checkout session |
| `/api/v1/checkout/webhook/` | POST | Stripe webhook handler |
| `/api/v1/quiz/submit/` | POST | Submit quiz answers |
| `/api/v1/quiz/preferences/` | GET | Get user preferences |
| `/api/v1/subscriptions/current/` | GET | Get current subscription |
| `/api/v1/subscriptions/cancel/` | POST | Cancel subscription |
| `/api/v1/auth/me/` | GET | Current user profile |
| `/api/v1/auth/login/` | POST | Login (sets HttpOnly cookies) |
| `/api/v1/auth/logout/` | POST | Logout (clears cookies) |

**NOTE**: All API calls to Django Ninja MUST include trailing slashes (e.g., `/api/v1/products/`).

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
9. **Never** skip `await` on Next.js 15+ params.
10. **Never** commit secrets (use .env files).

---

## 🐛 Common Issues & Solutions

### Issue: API 404 "Not Found"
**Cause**: Duplicate path in router registration
**Fix**: Use relative paths in router endpoints
```python
# BAD
@router.get("/products/{slug}/")

# GOOD
@router.get("/{slug}/")
```

### Issue: Product Detail Page 404
**Cause 1**: Next.js 15 async params not awaited
**Fix**: `const { slug } = await params`

**Cause 2**: Frontend calling wrong URL
**Fix**: Ensure trailing slash: `/api/v1/products/{slug}/`

### Issue: Build Fails - Categories Not Found
**Cause**: Static generation without backend
**Fix**: Add error handling in page.tsx
```typescript
const categories = await getCategories().catch(() => []);
```

### Issue: TypeScript Errors
**Common**: `Type 'string | undefined' is not assignable`
**Fix**: Add explicit union: `category?: string | undefined`

### Issue: Hydration Mismatches with Framer Motion + Next.js Link
**Cause**: `<Link>` inside `<motion.div>` causes SSR mismatch
**Fix**: Use `motion.create(Link)` for hydration-safe animated links

---

## 📚 Documentation References

| Document | Purpose |
|----------|---------|
| `README.md` | Comprehensive project overview (579 lines) |
| `CLAUDE.md` | This document - concise agent briefing |
| `GEMINI.md` | Gemini CLI context (291 lines) |
| `AGENTS.md` | Project-specific context (1,400+ lines) |
| `PROJECT_KNOWLEDGE_BASE.md` | Technical knowledge base (156 lines) |
| `CODE_REVIEW_REPORT.md` | Code review findings (223 lines) |
| `docs/Project_Architecture_Document.md` | Full architecture with diagrams (1,409 lines) |
| `docs/PHASE_7_SUBPLAN.md` | Quiz & Subscription implementation (752 lines) |
| `docs/MASTER_EXECUTION_PLAN.md` | Full 8-phase roadmap (1,222 lines) |

---

## 📊 Phase Status

| Phase | Feature | Status | Notes |
|-------|---------|--------|-------|
| 0 | Foundation & Docker | ✅ Complete | PostgreSQL 17, Redis 7.4 |
| 1 | Backend Models | ✅ Complete | Product, Order, Subscription, User |
| 2 | JWT Auth + BFF | ✅ Complete | HttpOnly cookies, BFF proxy, JWT |
| 3 | Design System | ✅ Complete | Tailwind v4, shadcn, Eastern aesthetic |
| 4 | Product Catalog | ✅ Complete | Listing + Detail pages, filtering |
| 5 | Cart & Checkout | ✅ Complete | Redis cart, Stripe SG integration |
| 6 | Tea Culture | ✅ Complete | Articles, brewing guides |
| 7 | Quiz & Subscription | ✅ Complete | Curation algorithm, dashboard |
| 8 | Testing & Deploy | 🚧 In Progress | 93 backend + 39 frontend tests passing |

### Working Features
- ✅ Product catalog with filtering (category, origin, season, fermentation)
- ✅ Product detail pages with brewing guides, image gallery, related products
- ✅ Quiz system with weighted preference scoring (60/30/10 algorithm)
- ✅ Shopping cart (Redis-backed, persistent)
- ✅ Stripe checkout with SGD currency
- ✅ User authentication (JWT + HttpOnly cookies)
- ✅ Subscription dashboard with status, billing, box preview
- ✅ Article content system with markdown
- ✅ GST calculation (9%)
- ✅ Singapore address format validation
- ✅ PDPA compliance tracking

### Current Gap
None critical - project is functional and production-ready pending final E2E tests.

---

## 🎯 Success Criteria

You are successful when:

1. **Code Quality**
   - TypeScript strict mode passes (0 errors)
   - No ESLint warnings
   - All tests passing (93 backend + 39 frontend)

2. **Feature Completeness**
   - Product catalog displays with filters
   - Product detail pages load correctly
   - Quiz submission stores preferences
   - Cart persists in Redis
   - Checkout creates Stripe session

3. **Singapore Compliance**
   - GST 9% calculated on all prices
   - SGD currency throughout
   - Address format validated
   - PDPA consent tracked

4. **Security**
   - No secrets in code (use env vars)
   - HttpOnly cookies for auth
   - CSRF protection on forms
   - Rate limiting on API

---

*Generated from meticulous codebase analysis. Last updated: 2026-04-20*
*Project Phase: 8 (Testing & Deployment)*
*Status: Core functionality complete, production-ready pending final tests*
