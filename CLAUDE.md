---
IMPORTANT: This file provides project-specific context for Claude Code agents.
Read fresh for every conversation. Updated: 2026-04-20
project: cha-yuan
version: 1.0.0
phase: 8 (Testing & Deployment)
---

# CHA YUAN (茶源) - AI Agent Briefing

**Premium Tea E-Commerce Platform for Singapore**

---

## 🎯 Core Identity & Purpose

CHA YUAN (茶源) is a premium tea e-commerce platform exclusively designed for the Singapore market. The platform bridges Eastern tea heritage with modern lifestyle commerce through a sophisticated subscription model powered by a preference-based curation algorithm.

**Problem Solved**: Consumers face overwhelming tea selections without guidance, quality uncertainty, and lack of personalized recommendations.

**Solution**: 
- One-time preference quiz with weighted scoring
- Monthly curated tea boxes based on preferences + season
- Educational content (brewing guides, tasting notes)
- Singapore-compliant (GST 9%, SGD, PDPA)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CHA YUAN ARCHITECTURE                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐         ┌──────────────────────────────┐  │
│  │   FRONTEND   │────────▶│         BACKEND               │  │
│  │              │  BFF    │                              │  │
│  │ Next.js 16   │────────▶│ Django 6 + Ninja API        │  │
│  │ React 19     │ /api/   │                              │  │
│  │ Tailwind v4  │ Proxy   │ PostgreSQL 17 | Redis 7.4    │  │
│  └──────────────┘         └──────────────────────────────┘  │
│         │                           │                         │
│         └───────────────────────────┘                         │
│                    JWT + HttpOnly Cookies                     │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js | 16.2.3+ | App Router, Server Components |
| **Framework** | React | 19.2.5+ | Concurrent features |
| **Styling** | Tailwind CSS | 4.2.2 | CSS-first, OKLCH colors |
| **UI** | Radix UI + shadcn | Latest | Accessible primitives |
| **Animation** | Framer Motion | 12.38.0+ | Smooth micro-interactions |
| **State** | TanStack Query | 5.99.0+ | Server state |
| **Backend** | Django | 6.0.4+ | API + Admin |
| **API** | Django Ninja | 1.6.2+ | Pydantic v2 |
| **Database** | PostgreSQL | 17 | JSONB optimization |
| **Cache** | Redis | 7.4-alpine | Sessions, cart, rate limit |
| **Payment** | Stripe | 14.4.1 | SGD, GrabPay, PayNow |
| **Testing** | Vitest + Playwright | Latest | Unit + E2E |

---

## 📁 Project Structure

```
/home/project/tea-culture/cha-yuan/
├── 📁 backend/              # Django 6 Backend
│   ├── 📄 api_registry.py   # Centralized API router (CRITICAL)
│   ├── 📁 apps/
│   │   ├── 📁 api/v1/      # API endpoints
│   │   │   ├── products.py
│   │   │   ├── cart.py
│   │   │   ├── checkout.py
│   │   │   ├── quiz.py
│   │   │   ├── subscriptions.py
│   │   │   └── content.py
│   │   ├── 📁 commerce/    # Product, Order, Subscription models
│   │   │   ├── models.py
│   │   │   ├── curation.py     # AI curation algorithm
│   │   │   └── management/commands/seed_products.py
│   │   ├── 📁 content/     # Quiz, Articles, User Preferences
│   │   │   └── models.py
│   │   └── 📁 core/        # User, Auth, SG utilities
│   │       ├── models.py
│   │       ├── authentication.py  # JWT + HttpOnly cookies
│   │       └── sg/         # GST, address validation
│   └── 📁 chayuan/         # Settings
│       └── settings/
│
├── 📁 frontend/            # Next.js 16 Frontend
│   ├── 📁 app/             # App Router
│   │   ├── 📁 (routes)/
│   │   │   ├── 📁 products/
│   │   │   │   ├── page.tsx          # Product listing
│   │   │   │   └── 📁 [slug]/
│   │   │   │       └── page.tsx      # Product detail (Dynamic)
│   │   │   ├── 📁 culture/
│   │   │   │   ├── page.tsx
│   │   │   │   └── 📁 [slug]/
│   │   │   │       └── page.tsx
│   │   │   ├── 📁 quiz/
│   │   │   ├── 📁 cart/
│   │   │   ├── 📁 checkout/
│   │   │   └── 📁 dashboard/
│   │   ├── 📁 api/proxy/[...path]/   # BFF proxy
│   │   │   └── route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── 📁 components/
│   │   ├── 📁 ui/          # shadcn primitives
│   │   ├── product-card.tsx
│   │   ├── product-grid.tsx
│   │   ├── product-gallery.tsx
│   │   ├── related-products.tsx
│   │   ├── filter-sidebar.tsx
│   │   ├── gst-badge.tsx
│   │   ├── navigation.tsx
│   │   └── ...
│   └── 📁 lib/
│       ├── 📁 api/         # API functions
│       │   └── products.ts
│       ├── 📁 types/       # TypeScript interfaces
│       ├── auth-fetch.ts   # BFF wrapper
│       └── utils.ts
│
├── 📁 infra/               # Docker Infrastructure
│   └── 📁 docker/
│       ├── docker-compose.yml
│       ├── Dockerfile.backend.dev
│       └── Dockerfile.frontend.dev
│
└── 📁 docs/                # Documentation
    ├── PHASE_7_SUBPLAN.md
    └── TASK_*.md
```

---

## 🔄 Development Workflow

### Environment Setup

```bash
# 1. Start Infrastructure (PostgreSQL + Redis)
cd cha-yuan/infra/docker
docker-compose up -d

# 2. Backend Setup
cd cha-yuan/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements/development.txt
python manage.py migrate
python manage.py seed_products  # Seed sample products
python manage.py seed_quiz      # Seed quiz questions
python manage.py runserver 127.0.0.1:8000 --settings=chayuan.settings.development

# 3. Frontend Setup
cd cha-yuan/frontend
npm install
npm run dev  # Port 3000
```

### Build Commands

| Command | Purpose | Location |
|---------|---------|----------|
| `npm run dev` | Start dev server | frontend/ |
| `npm run build` | Production build | frontend/ |
| `npm run typecheck` | TypeScript check | frontend/ |
| `npm test` | Run tests | frontend/ |
| `python manage.py runserver` | Django dev | backend/ |
| `pytest` | Backend tests | backend/ |
| `docker-compose up -d` | Start services | infra/docker/ |

---

## 🧪 Testing Strategy

### Backend Tests (Pytest)
```bash
cd backend
pytest -v                              # Run all tests
pytest apps/content/tests/ -v         # Quiz tests
pytest apps/commerce/tests/ -v        # Product/Order tests
```

### Frontend Tests
```bash
cd frontend
npm test                              # Vitest unit tests
npm run test:e2e                      # Playwright E2E
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
```

---

## 🎨 Implementation Standards

### Backend (Django + Django Ninja)

**API Router Registration (CRITICAL)**
- Use Centralized API Registry pattern in `api_registry.py`
- Register routers at import time (NOT in `ready()` method)
- Router URLs should NOT include the base path twice

```python
# api_registry.py
api.add_router("/products/", products_router)

# products.py - ENDPOINTS USE RELATIVE PATHS
@router.get("/")              # NOT "/products/"
@router.get("/{slug}/")       # NOT "/products/{slug}/"
```

**Singapore Context**
- GST 9%: `product.get_price_with_gst()` and `get_gst_amount()`
- SGD currency: Hardcoded as default
- Address format: Block/Street, Unit, Postal Code (6 digits)
- Phone: +65 validation
- Timezone: Asia/Singapore

**Model Patterns**
- Use `select_related()` for FK relations
- Use `prefetch_related()` for reverse FKs
- Add `is_available=True` filters for public APIs

### Frontend (Next.js + React 19)

**Next.js 15+ Async Params**
- Page params are now `Promise<>` in Next.js 15+
- Must `await params` before accessing slug

```typescript
// CORRECT (Next.js 15+)
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const data = await fetchData(slug);
}
```

**TypeScript Strict Mode**
- No `any` - use `unknown` instead
- Prefer `interface` over `type` (except unions)
- Explicit return types on public functions
- Handle `undefined` in filter types: `category?: string | undefined`

**Tailwind CSS v4 (CSS-first)**
- Theme configured in `globals.css` with `@theme`
- NO `tailwind.config.js` - all config in CSS
- Use `cn()` utility for conditional classes

**BFF Pattern (Backend for Frontend)**
```typescript
// Server Component: Direct backend call
const response = await authFetch(`/api/v1/products/`, { skipAuth: true });

// Client Component: Through proxy
const response = await authFetch(`/api/v1/products/`, { skipAuth: true });
// auth-fetch.ts automatically routes through /api/proxy/*
```

**API Error Handling**
- Backend API returns 404 with message for not found
- Frontend must handle network errors gracefully
- Categories/Origins endpoints can return empty arrays

### UI Components

**shadcn/ui Usage (REQUIRED)**
- Use shadcn primitives: Button, Input, Sheet, Dialog
- Wrap/modify for bespoke styling, don't rebuild
- GST Badge is custom: `components/gst-badge.tsx`

**Animation**
- Framer Motion for transitions
- Respect `prefers-reduced-motion`
- Use `useReducedMotion()` hook

```typescript
const prefersReducedMotion = useReducedMotion();
initial={prefersReducedMotion ? {} : { opacity: 0 }}
```

---

## 🔐 Security & Compliance

### Authentication (BFF Pattern)
- JWT tokens stored in HttpOnly cookies
- Frontend uses BFF proxy (`/api/proxy/*`) to Django
- Never store tokens in localStorage

### Singapore Compliance
- **PDPA**: User consent tracked in `User.has_pdpa_consent`
- **GST 9%**: All prices displayed as inclusive
- **Address Format**: Block/Street, Unit, Postal Code
- **Phone**: +65 prefix validation

### Stripe Integration
- Test keys: Use `pk_test_*` and `sk_test_*`
- Webhook endpoint: `/api/v1/checkout/webhook/`
- Currency: SGD only
- Payment methods: Cards, GrabPay, PayNow

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
**Fix**: `BASE_URL = /api/v1/products` (not `/api/v1`)

### Issue: Build Fails - Categories Not Found
**Cause**: Static generation without backend  
**Fix**: Add error handling in page.tsx
```typescript
const categories = await getCategories().catch(() => []);
```

### Issue: TypeScript Errors
**Common**: `Type 'string | undefined' is not assignable`  
**Fix**: Add explicit union: `category?: string | undefined`

### Issue: Trailing Slash Redirects
**Observation**: Django Ninja returns 308 redirect for URLs without trailing slash  
**Solution**: Always include trailing slash in API calls

---

## 📊 Phase Status

| Phase | Feature | Status | Notes |
|-------|---------|--------|-------|
| 0 | Foundation & Docker | ✅ Complete | PostgreSQL 17, Redis 7.4 |
| 1 | Backend Models | ✅ Complete | Product, Order, Subscription |
| 2 | JWT Auth + BFF | ✅ Complete | HttpOnly cookies, proxy |
| 3 | Design System | ✅ Complete | Tailwind v4, shadcn |
| 4 | Product Catalog | ✅ Complete | Listing + Detail pages |
| 5 | Cart & Checkout | ✅ Complete | Stripe SG integration |
| 6 | Tea Culture | ✅ Complete | Articles, content |
| 7 | Quiz & Subscription | ✅ Complete | Curation algorithm |
| 8 | Testing & Deploy | 🚧 In Progress | E2E tests, prod verification |

**Working Features**:
- Product catalog with filtering (category, origin, season, fermentation)
- Product detail pages with brewing guides
- Quiz system with weighted preference scoring
- Shopping cart (Redis-backed)
- Stripe checkout with SGD
- User authentication (JWT)
- Subscription dashboard
- Article content system

**Current Gap**: None critical - project is functional

---

## 🔗 Key API Endpoints

### Public Endpoints (No Auth)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/products/` | GET | List products with filters |
| `/api/v1/products/{slug}/` | GET | Product detail |
| `/api/v1/products/categories/` | GET | Tea categories |
| `/api/v1/products/origins/` | GET | Tea origins |
| `/api/v1/quiz/questions/` | GET | Quiz questions |
| `/api/v1/content/articles/` | GET | Articles list |
| `/api/v1/content/articles/{slug}/` | GET | Article detail |

### Authenticated Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/cart/` | GET | Cart contents |
| `/api/v1/cart/add/` | POST | Add to cart |
| `/api/v1/cart/update/` | PUT | Update quantity |
| `/api/v1/checkout/create-session/` | POST | Stripe checkout |
| `/api/v1/subscriptions/current/` | GET | Current subscription |
| `/api/v1/quiz/submit/` | POST | Submit quiz |

---

## 📚 Documentation References

- `README.md` - Comprehensive project overview
- `docs/PHASE_7_SUBPLAN.md` - Phase 7 implementation plan
- `docs/TASK_*.md` - Task-specific sub-plans
- `/tea-culture/MASTER_EXECUTION_PLAN.md` - Full roadmap
- `/tea-culture/status_new.md` - Current status

---

## 🎯 Success Criteria

You are successful when:

1. **Code Quality**
   - TypeScript strict mode passes
   - No ESLint errors
   - All tests passing

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

## ⚠️ Anti-Patterns to Avoid

1. **Never** store JWT in localStorage - use HttpOnly cookies
2. **Never** use `any` type in TypeScript
3. **Never** duplicate API paths in router endpoints
4. **Never** skip `await` on Next.js 15+ params
5. **Never** commit secrets (use .env files)
6. **Never** forget trailing slashes on API calls
7. **Never** mix v3 and v4 Tailwind utilities

---

## 🚀 Next Steps (Phase 8)

1. **E2E Testing**: Playwright tests for critical flows
2. **Production Build**: Verify static export
3. **Performance**: Lighthouse audit
4. **Security Scan**: Dependency audit
5. **Documentation**: API documentation update

---

*Generated from meticulous codebase analysis. Last updated: 2026-04-20*
*Project Phase: 8 (Testing & Deployment)*
*Status: Core functionality complete, production-ready pending final tests*
