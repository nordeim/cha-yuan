# CHA YUAN (茶源) - Project Knowledge Base

**Premium Tea E-Commerce Platform for Singapore**  
*The ultimate source-of-truth for project initialization, architecture, and engineering standards.*

---

## 🍵 Project Identity & Context

**CHA YUAN (茶源)** is a premium tea e-commerce platform exclusively designed for the Singapore market. It bridges Eastern tea heritage with modern lifestyle commerce through a subscription model powered by a preference-based curation algorithm.

### Core Problems Solved
- **Guided Selection**: Users navigate tea varieties via an onboarding preference quiz.
- **Personalized Curation**: Monthly tea boxes curated based on taste preferences and current season.
- **Singapore Localization**: Native support for 9% GST, SGD pricing, local address formats, and PDPA compliance.

---

## 🏗️ Technical Architecture

### Tech Stack (2026 Standards)
| Layer | Technology | Version | Key Features |
|-------|-----------|---------|--------------|
| **Frontend** | Next.js | 16.2+ | App Router, Server Components, Async Params |
| **Framework** | React | 19+ | Server Actions, Concurrent features, No `forwardRef` |
| **Backend** | Django | 6.0+ | Python 3.12+, Async support |
| **API** | Django Ninja | 1.6+ | Pydantic v2, Centralized Registry pattern |
| **Database** | PostgreSQL | 17 | JSONB optimization, vacuum efficiency |
| **Cache** | Redis | 7.4 | Cart persistence (30 days), Sessions, Rate limiting |
| **Styling** | Tailwind CSS | v4 | CSS-first, OKLCH colors, NO `tailwind.config.js` |
| **Payment** | Stripe | 14.4+ | Singapore integration (GrabPay, PayNow) |

### High-Level Architecture Patterns
1. **BFF (Backend for Frontend)**: 
   - Frontend uses a proxy route (`/api/proxy/[...path]/route.ts`) to communicate with the backend.
   - Secure JWT handling via HttpOnly cookies (never stored in `localStorage`).
2. **Centralized API Registry**:
   - Backend uses `api_registry.py` for eager router registration at import time.
   - Prevents circular imports and ensures endpoints are registered before the URL resolver runs.
3. **Server-First Design**:
   - Heavy use of React Server Components (RSC) for SEO and initial page loads.
   - Client components used only for interactive elements (Cart, Quiz, Filters).

---

## 📂 File Hierarchy & Critical Files

### Core Structure
```
cha-yuan/
├── backend/
│   ├── api_registry.py          # CRITICAL: Centralized API entrypoint
│   ├── apps/
│   │   ├── api/v1/              # Django Ninja Routers
│   │   ├── commerce/            # Products, Cart, Curation, Subscriptions
│   │   ├── content/             # Quiz, Articles, User Preferences
│   │   └── core/                # Users, Auth, Singapore Utilities
│   └── chayuan/settings/        # Environment-specific settings
├── frontend/
│   ├── app/                     # Next.js App Router
│   │   ├── (routes)/            # Logic-grouped routes
│   │   ├── api/proxy/           # BFF Proxy Route
│   │   └── globals.css          # Tailwind v4 Configuration
│   ├── components/              # UI Components (shadcn + bespoke)
│   ├── lib/                     # API wrappers, Hooks, Types
│   └── public/                  # Assets
└── infra/docker/                # PostgreSQL 17 + Redis 7.4 containers
```

### Critical File Reference
- `backend/api_registry.py`: Where all API routers are registered.
- `backend/apps/commerce/curation.py`: The heart of the recommendation engine.
- `frontend/lib/auth-fetch.ts`: The unified fetcher that handles BFF proxying and JWT.
- `frontend/app/globals.css`: Contains the entire Tailwind v4 theme configuration.

---

## 🇸🇬 Singapore Context & Compliance

### Financial & Regulatory
- **GST 9%**: Hardcoded as `Decimal('0.09')`. All public prices are displayed inclusive of GST.
- **Currency**: SGD is the only supported currency.
- **PDPA**: User model includes `pdpa_consent_at` for tracking compliance.

### Formats
- **Address**: `Block/Street`, `Unit`, `Postal Code` (6-digit validation).
- **Phone**: `+65 XXXX XXXX` validation.
- **Timezone**: All operations use `Asia/Singapore`.

---

## 🍵 Core Business Logic

### Curation Algorithm (60/30/10)
Located in `backend/apps/commerce/curation.py`, it scores products for subscription boxes:
1. **User Preferences (60%)**: Based on one-time onboarding quiz scores (0-100 per category).
2. **Seasonality (30%)**: Matches tea harvest cycles (Spring: Mar-May, Summer: Jun-Aug, etc.).
3. **Inventory (10%)**: Boosts products with healthy stock levels to ensure fulfillment.

### Shopping Cart
- **Persistent**: Stored in Redis with a 30-day TTL.
- **Anonymous to Auth**: Merges local cart with user cart upon login.

---

## 🛠️ Engineering Standards

### Backend (Django Ninja)
- **Endpoint Pattern**: Use relative paths in routers (e.g., `@router.get("/")`). The prefix is added in `api_registry.py`.
- **Trailing Slashes**: Mandatory for all Django Ninja endpoints (e.g., `/api/v1/products/`).

### Frontend (Next.js 16 + React 19)
- **Async Params**: Page `params` and `searchParams` are **Promises**. Must `await params` before accessing properties.
- **No `forwardRef`**: React 19 treats `ref` as a standard prop. Do not use `forwardRef`.
- **Tailwind v4**: Do NOT create a `tailwind.config.js`. Use `@theme` blocks in `globals.css`.
- **Zod 4**: Used for all runtime validation and form schemas.

### Testing Workflow (TDD)
- **Backend**: `pytest` with `pytest-django`. Target 85% coverage.
- **Frontend**: `Vitest` for unit/component tests, `Playwright` for E2E.
- **Requirement**: A change is not "Done" until behavioral correctness is verified with tests.

---

## 🚀 Common Workflows

### Starting Development
```bash
# Infrastructure
cd infra/docker && docker-compose up -d

# Backend
cd backend && source .venv/bin/activate
python manage.py runserver 127.0.0.1:8000 --settings=chayuan.settings.development

# Frontend
cd frontend && npm run dev
```

### Seeding Data
```bash
python manage.py seed_products  # Seeds 12 teas, categories, and origins
python manage.py seed_quiz      # Seeds 6 onboarding questions
```

---

## ⚠️ Anti-Patterns to Avoid
1. **Never** store JWT in `localStorage`. Use the BFF proxy + HttpOnly cookies.
2. **Never** use `any`. Use `unknown` or specific interfaces.
3. **Never** build a custom component if a `shadcn/ui` primitive exists. Wrap it instead.
4. **Never** forget trailing slashes on API calls from the frontend.

---

*Last Updated: 2026-04-20 | Project Phase: 8 (Testing & Deployment)*
