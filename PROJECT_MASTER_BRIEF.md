# PROJECT MASTER BRIEF: CHA YUAN (茶源)

**Version:** 1.0.0 | **Date:** 2026-04-21 | **Status:** FINALIZED

---

## 🍵 1. WHAT: Project Identity & Purpose

**CHA YUAN (茶源)** is a premium tea e-commerce platform exclusively designed for the Singapore market. It bridges traditional Eastern tea heritage with modern lifestyle commerce through a sophisticated subscription model powered by a preference-based curation algorithm.

### Core Problems Solved
- **Overwhelming Selection**: Guidance for consumers facing hundreds of tea varieties.
- **Quality Uncertainty**: Verification of origin authenticity and harvest quality.
- **Personalization Gap**: Tailored recommendations based on taste preferences via a one-time onboarding quiz.
- **Singapore Market Specifics**: Native support for GST (9%), SGD pricing, local address formats, and PDPA compliance.

### Core Solution
- **Preference Quiz**: Weighted scoring determine user taste profiles.
- **Curated Subscription**: Monthly tea boxes (3 tiers) automatically curated based on preferences, season, and inventory.
- **Educational Content**: Brewing guides, tasting notes, and tea culture articles.
- **Singapore-Ready**: Full compliance with local regulations and payment methods (GrabPay, PayNow).

---

## 🎯 2. WHY: Technical & Business Rationale

### Tech Stack Selection
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 16 (App Router) | Server Components for SEO; Optimized for Singapore latency. |
| **Framework** | React 19 | Concurrent features; Server Actions; modern ref handling. |
| **Styling** | Tailwind CSS v4 | CSS-first configuration; OKLCH colors; high performance. |
| **Backend** | Django 6 | Robust ORM; rapid development; async support. |
| **API** | Django Ninja | Pydantic v2 validation; automatic OpenAPI; high performance. |
| **Database** | PostgreSQL 17 | JSONB optimization for metadata; modern vacuum efficiency. |
| **Cache** | Redis 7.4 | Persistent cart storage (30 days); session management. |
| **Payment** | Stripe | Native Singapore support (GrabPay, PayNow); SGD focus. |

---

## 🏗️ 3. HOW: Architecture & Implementation Patterns

### 3.1 BFF (Backend for Frontend) Pattern
- **Location**: `frontend/app/api/proxy/[...path]/route.ts`
- **Purpose**: Secure JWT handling via HttpOnly cookies (tokens never stored in localStorage).
- **Flow**: Client Components → BFF Proxy → Django API; Server Components → `authFetch()` → Django API.

### 3.2 Centralized API Registry
- **Location**: `backend/api_registry.py`
- **Pattern**: Eager router registration at module level (not in `ready()`).
- **Rationale**: Ensures endpoints are registered before Django's URL resolver runs; prevents circular imports.
- **Constraint**: All router endpoints must use RELATIVE paths (e.g., `@router.get("/")`).

### 3.3 Server-First Design
- **RSC (React Server Components)**: Used for product listings, detail pages, and articles to maximize SEO and minimize client-side JS.
- **Client Components**: Reserved for interactive elements like the cart drawer, quiz interface, and filter sidebars.

### 3.4 Next.js 15+ Async Params
- **Standard**: `params` and `searchParams` are Promises and MUST be awaited.
- **Example**: `const { slug } = await params;`

---

## 🇸🇬 4. Singapore Context & Compliance

### GST 9% (Goods and Services Tax)
- **Rate**: `Decimal('0.09')`.
- **Calculation**: Prices are displayed inclusive of GST using `ROUND_HALF_UP` per IRAS guidelines.
- **Logic**: `extract_gst_from_inclusive(total) = total - (total / 1.09)`.

### Singapore Formats
- **Address**: Block/Street, Unit (#XX-XX), 6-digit Postal Code (`^\d{6}$`).
- **Phone**: `+65 XXXX XXXX` validation (`^\+65\s?\d{8}$`).
- **Timezone**: `Asia/Singapore` (SGT) used for all timestamps and seasonal logic.

### PDPA Compliance
- **Consent**: Mandatory tracking of `pdpa_consent_at` timestamp in the User model.
- **Requirement**: Checkbox on signup/quiz submission.

---

## 🍵 5. Core Business Logic

### 5.1 Curation Algorithm (60/30/10)
**Location**: `backend/apps/commerce/curation.py`
Weighted scoring for monthly subscription boxes:
1. **User Preferences (60%)**: Based on quiz scores (0-100 per category).
2. **Seasonality (30%)**: Matches harvest cycles to Singapore seasons (Spring: Mar-May, etc.).
3. **Inventory (10%)**: Boosts products with healthy stock levels.

### 5.2 Redis-Backed Shopping Cart
**Location**: `backend/apps/commerce/cart.py`
- **Persistence**: 30-day TTL in Redis.
- **Merge Logic**: Anonymous carts automatically merge with user accounts upon login.
- **Persistence**: `cart_id` cookie (HttpOnly) ensures cart persistence for guest users.

---

## 🔐 6. Security & Authentication

### JWT with HttpOnly Cookies
- **Strategy**: Access token (15m) and Refresh token (7d) stored in secure cookies.
- **Anti-Pattern**: Tokens are NEVER stored in localStorage to prevent XSS.
- **Refresh**: Automatic rotation handled by the BFF proxy on 401 errors.

---

## 🎨 7. Design System

### Visual Identity
- **Primary Color**: `--color-tea-500` (#5C8A4D).
- **Secondary**: `--color-gold-500` (#B8944D) for CTAs.
- **Background**: `--color-ivory-50` (#FDFBF7) / `--color-ivory-100` (#FAF6EE) for paper texture.
- **Typography**: "Playfair Display" (Serif) for headings; "Inter" (Sans) for body.

### Tailwind v4
- **Configuration**: Managed entirely in `app/globals.css` via the `@theme` block.
- **No Configuration File**: `tailwind.config.js` is NOT used.

---

## 🧪 8. Testing & Validation

### Current Coverage
- **Backend (Pytest)**: 93+ tests passing.
- **Frontend (Vitest)**: 39 tests passing.
- **E2E (Playwright)**: Critical paths (checkout, quiz) verified.

### Execution Commands
- **Backend**: `pytest`
- **Frontend Unit**: `npm test`
- **Frontend E2E**: `npm run test:e2e`

---

## ⚠️ 9. Critical Anti-Patterns (NEVER DO)

1. **NO LocalStorage for JWT**: Always use HttpOnly cookies via BFF.
2. **NO `forwardRef`**: In React 19, treat `ref` as a standard prop.
3. **NO `any` in TypeScript**: Use `unknown` or specific interfaces.
4. **NO Absolute API Paths**: Use relative paths in Django Ninja routers.
5. **NO Missing Trailing Slashes**: Always include trailing slashes in API calls.
6. **NO Un-awaited Params**: Always `await params` in Next.js 15+ pages.
7. **NO Redundant Components**: Use `shadcn/ui` primitives whenever possible.

---

## 🚀 10. Development Workflow

### Quick Start
1. `docker-compose up -d` (Postgres 17 + Redis 7.4)
2. `python manage.py migrate`
3. `python manage.py seed_products` && `python manage.py seed_quiz`
4. `npm run dev` (Frontend on port 3000)

### Access Points
- **Frontend**: http://localhost:3000
- **Django Admin**: http://localhost:8000/admin/
- **API Docs**: http://localhost:8000/docs/

---
**CHA YUAN (茶源) - Brew with intention. Sip with mindfulness.**
