# MASTER EXECUTION PLAN: CHA YUAN Premium Tea E-Commerce

> **Version:** 1.0  
> **Date:** April 14, 2026  
> **Status:** READY FOR APPROVAL  
> **Mode:** Build (Implementation Authorized)

---

## Executive Summary

This Master Execution Plan provides a comprehensive, phased approach to building CHA YUAN (茶源) — a premium tea e-commerce platform exclusively for the Singapore market. The plan follows the **Meticulous Approach** with Test-Driven Development (TDD) methodology, ensuring production-ready code from day one.

**Scope Confirmation:**
- ✅ Exclusively Singapore market (single-region)
- ✅ One-time onboarding preference quiz (not editable)
- ✅ Django Admin only for content management (no headless CMS)
- ✅ PostgreSQL 17 (`postgres:17-trixie`) and Redis 7.4 (`redis:7.4-alpine`)
- ✅ 8-phase, 6-week timeline

---

## Table of Contents

1. [Project Understanding](#phase-1-project-understanding)
2. [Draft Plan Critique](#phase-2-draft-plan-critique--gap-analysis)
3. [Phase 0: Foundation](#phase-0-foundation--environment-setup)
4. [Phase 1: Backend Foundation](#phase-1-backend-foundation--models)
5. [Phase 2: Authentication](#phase-2-authentication--bff-layer)
6. [Phase 3: Design System](#phase-3-design-system--frontend-foundation)
7. [Phase 4: Product Catalog](#phase-4-product-catalog--api)
8. [Phase 5: Cart & Checkout](#phase-5-cart--checkout)
9. [Phase 6: Tea Culture](#phase-6-tea-culture-content)
10. [Phase 7: Subscription & Quiz](#phase-7-subscription--preference-quiz)
11. [Phase 8: Testing & Deployment](#phase-8-testing-optimization--deployment)
12. [TODO Tracker](#todo-tracker)
13. [Validation & Approval](#validation--approval)

---

## Phase 1: Project Understanding

### WHAT: Project Definition

CHA YUAN (茶源) is a premium tea e-commerce platform blending Eastern tea heritage with modern lifestyle commerce for the Singapore market.

| Component | Specification |
|-----------|---------------|
| **Frontend** | Next.js 16 + React 19 + TypeScript 5.9 + Tailwind CSS v4 |
| **Backend** | Django 6 + PostgreSQL 17 + Redis 7.4 |
| **Payment** | Stripe (Singapore) with SGD currency |
| **Compliance** | Singapore PDPA + 9% GST |
| **Scope** | Exclusively Singapore market (single-region) |

**Core Features:**
1. Hero storytelling with Eastern aesthetic
2. Product catalog (by origin, fermentation level, season)
3. Tea culture content (brewing guides, tasting notes, history)
4. Subscription service with monthly curated boxes
5. One-time onboarding preference quiz
6. Secure checkout with Stripe

### WHY: Business & Technical Rationale

| Driver | Justification |
|--------|---------------|
| **Next.js 16 + React 19** | Server Components for SEO-heavy content; Edge functions for Singapore latency |
| **Django 6 + Django Ninja** | Rapid API development with Pydantic v2 integration; async I/O for scale |
| **PostgreSQL 17** | JSONB optimization for product metadata; vacuum improvements for high-write loads |
| **Redis 7.4** | Session management, cart persistence, rate limiting |
| **Tailwind v4 CSS-first** | Performance via Lightning CSS; OKLCH color space for tea palette |
| **Singapore Focus** | PDPA compliance mandatory; GST 9% required; SGD pricing standard |

### HOW: Architecture Approach

**Pattern: BFF-First with Server Components**

```
┌─────────────────────────────────────────────────────────────┐
│ CLIENT LAYER                                                │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ Next.js 16 (App Router)                              │   │
│ │  ├─ Server Components: Hero, Philosophy, Culture     │   │
│ │  ├─ Client Components: Cart, Quiz, Product Tabs    │   │
│ │  └─ BFF Proxy: /api/proxy/* → Django API           │   │
│ └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND LAYER                                               │
│ ┌──────────────────────────────────────────────────────┐     │
│ │ Django 6 + Django Ninja (Async)                    │     │
│ │  ├─ API: /api/v1/* (RESTful JSON)                  │     │
│ │  ├─ Auth: JWT in HttpOnly cookies                  │     │
│ │  ├─ Curation: Auto + Manual override engine        │     │
│ │  └─ Admin: Custom curation UI for tea masters      │     │
│ └──────────────────────────────────────────────────────┘     │
│ ┌──────────────────────────────────────────────────────┐     │
│ │ PostgreSQL 17 (Official: postgres:17-trixie)         │     │
│ │  └─ Models: Product, Order, Subscription, User       │     │
│ └──────────────────────────────────────────────────────┘     │
│ ┌──────────────────────────────────────────────────────┐     │
│ │ Redis 7.4 (Official: redis:7.4-alpine)                │     │
│ │  └─ Cart sessions, JWT blacklists, rate limiting      │     │
│ └──────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 2: Draft Plan Critique & Gap Analysis

### Strengths of Draft Plan

| Area | Strength |
|------|----------|
| **Architecture** | BFF pattern correctly aligns with Next.js 16 + Django 6 stack |
| **State Management** | TanStack Query + Zustand separation prevents "dual-source" anti-pattern |
| **Auth Security** | HttpOnly cookies + BFF proxy prevents XSS token exposure |
| **Singapore Context** | PDPA consent, GST calculation, SGD formatting well-addressed |
| **Curation Engine** | Auto-curation with manual admin override is elegant |

### Critical Gaps Identified & Resolved

| Gap | Severity | Resolution in This Plan |
|-----|----------|------------------------|
| **PostgreSQL version** | HIGH | Fixed to 17 (postgres:17-trixie) - not 18 as mentioned in draft |
| **Redis version** | MEDIUM | Specified as 7.4-alpine |
| **TDD Approach** | HIGH | Added test-first workflow to each phase |
| **Docker Configuration** | MEDIUM | Detailed compose files for local dev |
| **CSS-first Tailwind v4** | HIGH | No tailwind.config.js; pure @theme blocks |
| **Component Library Discipline** | HIGH | Explicit Shadcn/Radix usage patterns |

### Technical Debt Prevention

1. **React 19 forwardRef**: All components must NOT use forwardRef
2. **Radix asChild**: Document workarounds for serialization issues
3. **TypeScript strictInference**: Enable from day one
4. **Zod 4 + Server Actions**: End-to-end type safety

---

## Docker Configuration Standards

### PostgreSQL 17 Container

```yaml
services:
  postgres:
    image: postgres:17-trixie
    environment:
      POSTGRES_DB: chayuan
      POSTGRES_USER: chayuan
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      TZ: Asia/Singapore
      PGDATA: /var/lib/postgresql/data/pgdata
    command: >
      postgres
      -c lc_collate=en_SG.utf8
      -c lc_ctype=en_SG.utf8
      -c timezone=Asia/Singapore
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U chayuan"]
      interval: 10s
      timeout: 5s
      retries: 5
```

### Redis 7.4 Container

```yaml
services:
  redis:
    image: redis:7.4-alpine
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru --appendonly yes --save 60 1000
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
```

---

## Phase 0: Foundation & Environment Setup

**Duration:** Days 1-3  
**TDD Principle:** Write test infrastructure before implementation

### 0.1 Directory Structure Setup

| File/Directory | Description | Checklist |
|----------------|-------------|-----------|
| `/cha-yuan` | Monorepo root | [ ] Git initialized |
| `/cha-yuan/backend` | Django 6 project | [ ] Python 3.12+ virtual env |
| `/cha-yuan/frontend` | Next.js 16 project | [ ] Node.js 20+ installed |
| `/cha-yuan/infra` | Docker, deployment configs | [ ] docker-compose.yml |
| `/cha-yuan/docs` | Architecture, API docs | [ ] ADRs committed |

### 0.2 Docker Compose Configuration

**File:** `infra/docker-compose.yml`

**Features:**
- PostgreSQL 17 (postgres:17-trixie) with Singapore locale
- Redis 7.4 (redis:7.4-alpine) with persistence
- Health checks for both services
- Named volumes for data persistence
- Environment variable injection

**Interfaces:**
- Postgres: `localhost:5432`
- Redis: `localhost:6379`

**Checklist:**
- [ ] `docker-compose up` starts successfully
- [ ] Health checks pass
- [ ] `pg_isready` returns accepting connections
- [ ] `redis-cli ping` returns PONG
- [ ] TZ=Asia/Singapore verified in both containers

### 0.3 Test Infrastructure

**Files to Create:**

| File | Purpose | TDD Checklist |
|------|---------|---------------|
| `/backend/pytest.ini` | Django test configuration | [ ] Coverage target: 85% |
| `/frontend/vitest.config.ts` | Frontend unit tests | [ ] Component testing ready |
| `/frontend/playwright.config.ts` | E2E testing | [ ] Critical paths defined |

**TDD Workflow:**
```bash
# Write test → Run (fails) → Implement → Run (passes) → Refactor
```

---

## Phase 1: Backend Foundation & Models

**Duration:** Days 4-7  
**TDD Principle:** Write model tests → Define models → Run tests → Pass

### 1.1 Django Project Structure

**File:** `/backend/chayuan/settings.py`

**Features:**
- PostgreSQL 17 connection
- Redis cache backend
- Singapore timezone (Asia/Singapore)
- GST rate configuration (0.09)
- PDPA middleware

**Checklist:**
- [ ] `DATABASES` configured for postgres:17-trixie
- [ ] `CACHES` configured for redis:7.4-alpine
- [ ] `TIME_ZONE = 'Asia/Singapore'`
- [ ] `GST_RATE = Decimal('0.09')`

### 1.2 Core Models (Test-First)

**Test Files (Write First):**

| Test File | Coverage Target |
|-----------|-----------------|
| `/backend/core/tests/test_models_user.py` | User creation, postal code validation |
| `/backend/core/tests/test_models_product.py` | Product lifecycle, pricing |
| `/backend/commerce/tests/test_models_order.py` | Order creation, GST calculation |
| `/backend/content/tests/test_models_quiz.py` | Quiz scoring algorithm |

**Model Files (Implement After Tests):**

**File:** `/backend/core/models.py`

| Model | Key Fields | Interfaces |
|-------|------------|------------|
| `User` | email, phone (+65 format), postal_code (6-digit), pdpa_consent_at | `get_full_name()`, `get_sg_address()` |
| `Address` | user (FK), block_street, unit, postal_code, is_default | `format_sg_address()` |

**File:** `/backend/commerce/models.py`

| Model | Key Fields | Interfaces |
|-------|------------|------------|
| `Origin` | name, region, description, image | `__str__()` |
| `TeaCategory` | name, fermentation_level (0-100%), brewing_guide | `get_brewing_temp_c()` |
| `Product` | name, slug, price_sgd, gst_inclusive, stock, origin (FK), category (FK), harvest_season | `get_price_with_gst()`, `is_in_stock_sg()` |
| `Order` | user (FK), status, total_sgd, gst_amount_sgd, stripe_payment_intent_id | `calculate_gst()`, `get_receipt_url()` |
| `OrderItem` | order (FK), product (FK), quantity, price_sgd_at_time | `get_subtotal()` |

**File:** `/backend/content/models.py`

| Model | Key Fields | Interfaces |
|-------|------------|------------|
| `QuizQuestion` | question_text_i18n (JSON), question_type, order | `get_text(locale)` |
| `QuizChoice` | question (FK), choice_text_i18n (JSON), preference_weight (JSON) | `get_text(locale)`, `get_weights()` |
| `UserPreference` | user (FK), preferences (JSON), quiz_completed_at | `get_top_preferences(n)` |
| `Article` | title_i18n (JSON), slug, content_i18n (JSON), category | `get_content(locale)` |

### 1.3 Singapore Utilities

**File:** `/backend/core/sg/gst.py`

```python
from decimal import Decimal, ROUND_HALF_UP

GST_RATE = Decimal('0.09')

def calculate_gst_inclusive_price(base_price: Decimal) -> Decimal:
    """Calculate price with GST included per IRAS guidelines."""
    return (base_price * (Decimal('1') + GST_RATE)).quantize(
        Decimal('0.01'), rounding=ROUND_HALF_UP
    )

def extract_gst_from_inclusive(total: Decimal) -> Decimal:
    """Extract GST amount from inclusive price."""
    base = total / Decimal('1.09')
    return (total - base).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
```

**Test File:** `/backend/core/tests/test_gst.py`

**Test Cases:**
- [ ] `calculate_gst_inclusive_price(Decimal('10.00'))` → `Decimal('10.90')`
- [ ] Edge case: 1-cent rounding per IRAS
- [ ] GST extraction accuracy

---

## Phase 2: Authentication & BFF Layer

**Duration:** Days 8-12  
**TDD Principle:** Write auth tests → Implement JWT flow → Validate

### 2.1 JWT Authentication Backend

**Test Files (Write First):**
- `/backend/api/tests/test_auth_jwt.py` - Token generation, validation
- `/backend/api/tests/test_auth_proxy.py` - BFF proxy functionality

**File:** `/backend/api/v1/auth.py` (Django Ninja)

**Endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/login` | POST | Email + password → JWT in HttpOnly cookies |
| `/api/v1/auth/logout` | POST | Clear cookies |
| `/api/v1/auth/refresh` | POST | Rotate refresh token |
| `/api/v1/auth/me` | GET | Current user profile |

**Cookie Configuration:**
- `access_token`: HttpOnly, Secure, SameSite=Lax, 15min expiry
- `refresh_token`: HttpOnly, Secure, SameSite=Lax, 7 days expiry
- Domain: `.cha-yuan.sg` (production) or `localhost` (dev)

### 2.2 Next.js BFF Proxy

**Test File (Write First):**
- `/frontend/app/api/proxy/__tests__/route.test.ts`

**File:** `/frontend/app/api/proxy/[...path]/route.ts`

**Features:**
- Catch-all route handler
- Forwards to Django with JWT from cookies
- Adds Singapore context headers
- Error handling with SG-localized messages

**Interfaces:**
```
Request: /api/proxy/api/v1/products/
Headers: Authorization: Bearer {access_token}
         X-SG-Timezone: Asia/Singapore
         Accept-Language: en-SG
Response: <Django API Response>
```

### 2.3 Auth Fetch Utility

**File:** `/frontend/lib/auth-fetch.ts`

**Features:**
- Works in Server Components
- Works in Client Components
- Automatic token refresh on 401
- Error messages in en-SG locale

---

## Phase 3: Design System & Frontend Foundation

**Duration:** Days 13-16  
**TDD Principle:** Visual regression tests → Component implementation

### 3.1 Tailwind v4 Configuration

**File:** `/frontend/app/globals.css`

```css
@import "tailwindcss";

@theme {
  /* Tea Brand Color Tokens */
  --color-tea-50: #f4f7f1;
  --color-tea-100: #e6ede0;
  --color-tea-500: #5C8A4d;
  --color-tea-600: #4a7040;
  --color-tea-900: #2a3d26;
  --color-ivory-50: #FDFBF7;
  --color-ivory-100: #FAF6EE;
  --color-ivory-300: #EDE5D8;
  --color-terra-300: #D99068;
  --color-terra-400: #C4724B;
  --color-terra-500: #B5613F;
  --color-bark-700: #4A3728;
  --color-bark-800: #3D2B1F;
  --color-bark-900: #2A1D14;
  --color-gold-300: #D4B96A;
  --color-gold-400: #C5A55A;
  --color-gold-500: #B8944D;
  --color-gold-600: #A07E3C;
  
  /* Typography */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-serif: "Playfair Display", "Noto Serif SC", serif;
  
  /* Spacing */
  --spacing-18: 4.5rem;
  --spacing-88: 22rem;
  
  /* Animations */
  --animate-fade-in-up: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  --animate-leaf-float: leafFloat 4s ease-in-out infinite;
  
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes leafFloat {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-12px) rotate(5deg); }
  }
}
```

**Checklist:**
- [ ] No `tailwind.config.js` file exists
- [ ] `@import "tailwindcss"` at top of globals.css
- [ ] All tea-brand colors defined
- [ ] Fonts loaded via Next.js localFont

### 3.2 Shadcn UI Components

**Install Pattern:**
```bash
npx shadcn@latest add button card input dialog sheet
```

**Required Components:**

| Component | Usage | Customization |
|-----------|-------|---------------|
| `Button` | CTAs, form submission | Tea green/gold variants |
| `Card` | Product cards, article previews | Paper texture styling |
| `Input` | Form fields | SG address validation |
| `Dialog` | Quick view modals | Eastern aesthetic |
| `Sheet` | Mobile navigation | Slide from right |

**Important:** All components must NOT use `forwardRef` (React 19 standard)

### 3.3 Animation System

**File:** `/frontend/lib/animations.ts`

```typescript
import { Variants } from "framer-motion";

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};
```

---

## Phase 4: Product Catalog & API

**Duration:** Days 17-22  
**TDD Principle:** API contract tests → Endpoint implementation → Integration tests

### 4.1 Django Ninja API Endpoints

**Test Files (Write First):**
- `/backend/api/tests/test_products_api.py`
- `/backend/api/tests/test_categories_api.py`

**File:** `/backend/api/v1/products.py`

**Endpoints:**

| Endpoint | Method | Response Schema |
|----------|--------|-----------------|
| `/api/v1/products/` | GET | Paginated product list with filters |
| `/api/v1/products/{slug}/` | GET | Product detail with related |
| `/api/v1/categories/` | GET | Category list with counts |
| `/api/v1/origins/` | GET | Origin list |

**Query Parameters:**
- `category`: Filter by tea category
- `origin`: Filter by origin region
- `fermentation`: Filter by fermentation level
- `season`: Filter by harvest season
- `price_min`/`price_max`: Price range in SGD

### 4.2 Frontend Product Pages

**File:** `/frontend/app/products/page.tsx` (Server Component)

**Features:**
- Server-side data fetching via `authFetch`
- Filter sidebar (Client Component)
- Product grid with Framer Motion animations
- SEO metadata generation

**File:** `/frontend/app/products/[slug]/page.tsx` (Server Component)

**Features:**
- Dynamic route for product detail
- Image gallery
- Brewing guide (°C for Singapore)
- Add to cart functionality
- Related products

**Components:**

| Component | File | Features |
|-----------|------|----------|
| `ProductCard` | `/components/product-card.tsx` | Image, name, price (SGD), stock indicator |
| `ProductGrid` | `/components/product-grid.tsx` | Responsive grid with animations |
| `FilterSidebar` | `/components/filter-sidebar.tsx` | Category, origin, fermentation filters |
| `BrewingGuide` | `/components/brewing-guide.tsx` | Temperature, time, steps |

### 4.3 GST Price Display

**File:** `/frontend/components/gst-badge.tsx`

```typescript
export function GstBadge({ price, gstInclusive }: { price: number, gstInclusive: boolean }) {
  const formatter = new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
  });
  
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-xl font-semibold text-gold-600">
        {formatter.format(price)}
      </span>
      {gstInclusive && (
        <span className="text-xs text-bark-700/50">incl. GST</span>
      )}
    </div>
  );
}
```

---

## Phase 5: Cart & Checkout

**Duration:** Days 23-28  
**TDD Principle:** Cart state tests → Redis implementation → Stripe integration tests

### 5.1 Redis Cart Service

**Test Files (Write First):**
- `/backend/commerce/tests/test_cart_service.py`
- `/backend/commerce/tests/test_cart_merge.py`

**File:** `/backend/commerce/cart.py`

```python
import redis
import uuid
from datetime import timedelta
from django.conf import settings

redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=1,  # Cart database
    decode_responses=True
)

CART_TTL = timedelta(days=30)

def get_cart_id(request) -> str:
    cart_id = request.COOKIES.get('cart_id')
    if not cart_id:
        cart_id = str(uuid.uuid4())
    return cart_id

def get_cart_items(cart_id: str) -> list[dict]:
    """Fetch cart items with SG pricing."""
    cart_data = redis_client.hgetall(f"cart:{cart_id}")
    # Transform to items with product details
    return items

def add_to_cart(cart_id: str, product_id: int, quantity: int) -> bool:
    """Add item to Redis cart with atomic operations."""
    key = f"cart:{cart_id}"
    current = redis_client.hincrby(key, product_id, quantity)
    if current == quantity:  # First addition
        redis_client.expire(key, CART_TTL)
    return True

def merge_anonymous_cart(anonymous_id: str, user_id: int) -> str:
    """Merge anonymous cart with user cart on login."""
    anon_key = f"cart:{anonymous_id}"
    user_key = f"cart:user:{user_id}"
    # Atomic merge using Redis Lua script
    return user_key
```

**File:** `/backend/api/v1/cart.py` (Django Ninja)

**Endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/cart/` | GET | Get current cart items |
| `/api/v1/cart/add/` | POST | Add item to cart |
| `/api/v1/cart/update/` | PUT | Update item quantity |
| `/api/v1/cart/remove/` | DELETE | Remove item from cart |
| `/api/v1/cart/clear/` | DELETE | Clear entire cart |

### 5.2 Frontend Cart State

**File:** `/frontend/lib/hooks/use-cart.ts`

```typescript
export function useCart() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await authFetch('/api/proxy/api/v1/cart/');
      return res.json();
    },
    staleTime: 1000 * 60, // 1 minute
  });

  const addItem = useMutation({
    mutationFn: async ({ productId, quantity }) => {
      return authFetch('/api/proxy/api/v1/cart/add/', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, quantity }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  return { cart: data, isLoading, error, addItem };
}
```

### 5.3 Stripe Checkout (Singapore)

**Test Files (Write First):**
- `/backend/commerce/tests/test_stripe_checkout.py`
- `/backend/commerce/tests/test_stripe_webhook.py`

**File:** `/backend/commerce/stripe_sg.py`

```python
import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY_SG
stripe.api_version = "2026-02-01.acacia"

def create_checkout_session(cart_items: list, user_email: str, success_url: str, cancel_url: str):
    line_items = []
    for item in cart_items:
        line_items.append({
            'price_data': {
                'currency': 'sgd',
                'product_data': {
                    'name': item['name'],
                    'images': [item['image_url']] if item.get('image_url') else [],
                },
                'unit_amount': int(item['price_with_gst_sgd'] * 100),  # Cents
            },
            'quantity': item['quantity'],
        })

    return stripe.checkout.Session.create(
        payment_method_types=['card', 'grabpay', 'paynow'],
        line_items=line_items,
        mode='payment',
        success_url=success_url,
        cancel_url=cancel_url,
        customer_email=user_email,
        locale='en',
        currency='sgd',
        shipping_address_collection={
            'allowed_countries': ['SG'],
        },
        metadata={
            'cart_id': item.get('cart_id'),
            'gst_rate': str(settings.GST_RATE),
        }
    )
```

**File:** `/frontend/app/checkout/page.tsx` (Client Component)

**Features:**
- Cart summary with GST breakdown
- Singapore address form
- Stripe Checkout redirect
- Loading states

**File:** `/frontend/components/sg-address-form.tsx`

```typescript
export function SgAddressForm() {
  return (
    <div className="space-y-4">
      <Input name="recipient_name" label="Recipient Name" required />
      <Input name="block_street" label="Block / Street" required 
             placeholder="e.g., Blk 123 Jurong East St 13" />
      <Input name="unit" label="Unit Number" placeholder="#04-56" />
      <Input name="postal_code" label="Postal Code" required 
             pattern="^\d{6}$" placeholder="600123" />
    </div>
  );
}
```

---

## Phase 6: Tea Culture Content

**Duration:** Days 29-32  
**TDD Principle:** Content model tests → Article rendering tests → Implementation

### 6.1 Content Management

**File:** `/backend/content/admin.py`

**Features:**
- Markdown editor for article content
- Image upload for featured images
- Category management (Brewing, Tasting, History)
- Publish scheduling

**File:** `/backend/api/v1/content.py` (Django Ninja)

**Endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/articles/` | GET | List published articles |
| `/api/v1/articles/{slug}/` | GET | Article detail with full content |

### 6.2 Frontend Culture Pages

**File:** `/frontend/app/culture/page.tsx` (Server Component)

**Features:**
- Article grid with Eastern aesthetic
- Category filtering
- Pagination

**File:** `/frontend/app/culture/[slug]/page.tsx` (Server Component)

**Features:**
- Article rendering with markdown
- Typography hierarchy (serif headings)
- Related articles

**Components:**

| Component | File | Features |
|-----------|------|----------|
| `ArticleCard` | `/components/article-card.tsx` | Image, title, excerpt, date |
| `ArticleContent` | `/components/article-content.tsx` | Markdown rendering |
| `BrewingGuideWidget` | `/components/brewing-guide-widget.tsx` | Temperature chart |

---

## Phase 7: Subscription & Preference Quiz

**Duration:** Days 33-38  
**TDD Principle:** Quiz scoring tests → Curation algorithm tests → Implementation

### 7.1 Quiz System

**Test Files (Write First):**
- `/backend/content/tests/test_quiz_scoring.py`
- `/backend/content/tests/test_preference_algorithm.py`

**File:** `/backend/api/v1/quiz.py`

**Endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/quiz/questions/` | GET | Get quiz questions (en-SG) |
| `/api/v1/quiz/submit/` | POST | Submit answers, get preferences |

**File:** `/frontend/app/quiz/page.tsx` (Client Component)

**Features:**
- Multi-step quiz interface
- Progress indicator
- Animated transitions (Framer Motion)
- One-time completion guard

### 7.2 Subscription Curation Engine

**File:** `/backend/commerce/curation.py`

```python
from datetime import datetime
from pytz import timezone

def get_current_season_sg() -> str:
    """Determine harvest season based on Singapore timezone."""
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

def curate_subscription_box(user_subscription) -> list[Product]:
    """Curate monthly tea box with manual override support."""
    # Check for manual override from Django Admin
    if user_subscription.next_curation_override:
        product_ids = user_subscription.next_curation_override.get('product_ids', [])
        products = Product.objects.filter(
            id__in=product_ids,
            is_subscription_eligible=True,
            stock__gt=0
        )[:5]
        # Clear override after use
        user_subscription.next_curation_override = None
        user_subscription.save()
        return list(products)

    # Auto-curation logic with preference scoring
    user = user_subscription.user
    prefs = user.userpreference.preferences if hasattr(user, 'userpreference') else {}
    
    current_season = get_current_season_sg()
    candidates = Product.objects.filter(
        is_subscription_eligible=True,
        stock__gt=0,
        harvest_season=current_season
    ).exclude(id__in=get_recently_shipped(user_subscription))
    
    scored = score_products(candidates, prefs)
    return [p for p, _ in scored[:4]]

def score_products(products, prefs):
    """Score products based on user preferences."""
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

**File:** `/backend/commerce/admin.py` (Curation Override UI)

```python
class CurationOverrideForm(forms.ModelForm):
    override_products = forms.ModelMultipleChoiceField(
        queryset=Product.objects.filter(
            is_subscription_eligible=True,
            stock__gt=0
        ),
        widget=forms.CheckboxSelectMultiple,
        required=False,
        help_text="Select teas to include in next month's box"
    )

class UserSubscriptionAdmin(admin.ModelAdmin):
    form = CurationOverrideForm
    list_display = ['user', 'plan', 'status', 'curation_override_active']
```

### 7.3 Subscription Frontend

**File:** `/frontend/app/dashboard/subscription/page.tsx` (Client Component)

**Features:**
- Current subscription status
- Next billing date (SG time)
- Next box preview
- Cancel subscription option

---

## Phase 8: Testing, Optimization & Deployment

**Duration:** Days 39-42  
**TDD Principle:** Performance budgets → Load tests → Security audit

### 8.1 Testing Strategy

| Test Type | Tools | Coverage Target |
|-----------|-------|-----------------|
| Unit Tests | pytest (backend), Vitest (frontend) | 85%+ |
| Integration | pytest-django | API endpoints |
| E2E | Playwright | Critical user journeys |
| Visual | Storybook + Chromatic | Component consistency |

**Critical User Journeys (E2E):**
1. Browse products → Add to cart → Checkout → Order confirmation
2. Sign up → Complete quiz → View personalized recommendations
3. Subscribe → View subscription → Cancel subscription

### 8.2 Performance Optimization

| Metric | Target | Tools |
|--------|--------|-------|
| LCP | < 2.5s | Lighthouse |
| CLS | < 0.1 | Web Vitals |
| TTI | < 3.5s | Lighthouse |
| API Response | < 200ms | Django Silk |

**Optimizations:**
- [ ] Next.js Image optimization with proper `sizes`
- [ ] React Server Components for static content
- [ ] Redis caching for product catalog
- [ ] Database query optimization
- [ ] CDN for static assets

### 8.3 Deployment Configuration

**File:** `/infra/deploy/vercel.json`

```json
{
  "regions": ["sin1"],
  "env": {
    "NEXT_PUBLIC_SITE_URL": "https://cha-yuan.sg",
    "NEXT_PUBLIC_GST_RATE": "0.09"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000" }
      ]
    }
  ]
}
```

**File:** `/infra/deploy/docker-compose.prod.yml`

```yaml
version: '3.8'
services:
  web:
    build: ./backend
    environment:
      - DJANGO_SETTINGS_MODULE=chayuan.settings_production
      - DATABASE_URL=postgres://chayuan:${DB_PASSWORD}@postgres:5432/chayuan
      - REDIS_URL=redis://redis:6379/0
      - STRIPE_SECRET_KEY_SG=${STRIPE_SECRET_KEY_SG}
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:17-trixie
    environment:
      POSTGRES_DB: chayuan
      POSTGRES_USER: chayuan
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_prod:/var/lib/postgresql/data
  
  redis:
    image: redis:7.4-alpine
    command: redis-server --maxmemory-policy allkeys-lru --appendonly yes
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

### 8.4 Security Checklist

- [ ] JWT tokens in HttpOnly cookies only
- [ ] CSRF protection enabled
- [ ] Rate limiting on API endpoints (Redis-based)
- [ ] SQL injection prevention (Django ORM)
- [ ] XSS prevention (Output encoding)
- [ ] Content Security Policy headers
- [ ] Stripe webhook signature verification
- [ ] PDPA compliance audit

---

## TODO Tracker

### Phase 0: Foundation
- [ ] 0.1 Create monorepo directory structure
- [ ] 0.2 Write docker-compose.yml with PostgreSQL 17 and Redis 7.4
- [ ] 0.3 Set up pytest configuration
- [ ] 0.4 Set up Vitest and Playwright configuration
- [ ] 0.5 Verify all containers start with health checks

### Phase 1: Backend Foundation
- [ ] 1.1 Create Django project structure
- [ ] 1.2 Write model tests for User, Product, Order
- [ ] 1.3 Implement User model with SG validation
- [ ] 1.4 Implement Product, Order models
- [ ] 1.5 Write GST calculation utilities
- [ ] 1.6 Run all tests - ensure 85%+ coverage

### Phase 2: Authentication
- [ ] 2.1 Write auth tests
- [ ] 2.2 Implement JWT authentication endpoints
- [ ] 2.3 Implement BFF proxy route
- [ ] 2.4 Create authFetch utility
- [ ] 2.5 Test login flow end-to-end

### Phase 3: Design System
- [ ] 3.1 Configure Tailwind v4 with @theme
- [ ] 3.2 Install Shadcn UI components (React 19 compatible)
- [ ] 3.3 Create animation utilities
- [ ] 3.4 Set up Storybook
- [ ] 3.5 Run visual regression tests

### Phase 4: Product Catalog
- [ ] 4.1 Write API contract tests
- [ ] 4.2 Implement product API endpoints
- [ ] 4.3 Create product listing page (Server Component)
- [ ] 4.4 Create product detail page
- [ ] 4.5 Build ProductCard component
- [ ] 4.6 Implement GST display

### Phase 5: Cart & Checkout
- [ ] 5.1 Write cart service tests
- [ ] 5.2 Implement Redis cart service
- [ ] 5.3 Create cart API endpoints
- [ ] 5.4 Build cart UI with hooks
- [ ] 5.5 Implement Stripe Checkout
- [ ] 5.6 Test full checkout flow

### Phase 6: Tea Culture
- [ ] 6.1 Write content model tests
- [ ] 6.2 Create Article models
- [ ] 6.3 Build content API
- [ ] 6.4 Create culture listing page
- [ ] 6.5 Create article detail page
- [ ] 6.6 Test markdown rendering

### Phase 7: Subscription & Quiz
- [ ] 7.1 Write quiz scoring tests
- [ ] 7.2 Implement quiz models and API
- [ ] 7.3 Build quiz frontend
- [ ] 7.4 Write curation algorithm tests
- [ ] 7.5 Implement curation engine
- [ ] 7.6 Build subscription dashboard
- [ ] 7.7 Create admin curation override UI

### Phase 8: Testing & Deployment
- [ ] 8.1 Achieve 85%+ test coverage
- [ ] 8.2 Run E2E tests on critical paths
- [ ] 8.3 Optimize performance (Lighthouse ≥90)
- [ ] 8.4 Security audit
- [ ] 8.5 PDPA compliance review
- [ ] 8.6 Deploy to production
- [ ] 8.7 Monitoring setup

---

## Validation & Approval

### Phase Completion Gates

| Phase | Success Criteria | Verification Method |
|-------|-----------------|---------------------|
| **0** | `docker-compose up` healthy; all tests pass | `docker-compose ps`, `pytest --version` |
| **1** | Models migrated; SG utilities tested | `python manage.py migrate`, `pytest core/tests/` |
| **2** | Login flow works; cookies set correctly | Postman collection, browser dev tools |
| **3** | Storybook displays components; visual tests pass | Chromatic build |
| **4** | API returns products; filters work | `pytest api/tests/`, manual testing |
| **5** | Cart persists in Redis; checkout creates Stripe session | E2E test: full purchase flow |
| **6** | Articles render; markdown parsed | Manual content review |
| **7** | Quiz submits; curation runs; override works | Admin panel test, user flow test |
| **8** | Lighthouse ≥90; security scan pass | Lighthouse CI, OWASP ZAP |

### TDD Workflow Summary

Each phase follows the Red-Green-Refactor cycle:

1. **RED**: Write failing test that defines expected behavior
2. **GREEN**: Write minimal code to make test pass
3. **REFACTOR**: Improve code while keeping tests green

**Example Workflow:**
```bash
# Phase 5: Cart Service TDD
# 1. Write test
cat > backend/commerce/tests/test_cart_service.py << 'EOF'
def test_add_to_cart_creates_cart():
    cart_id = "test-cart-123"
    result = add_to_cart(cart_id, product_id=1, quantity=2)
    assert result is True
    items = get_cart_items(cart_id)
    assert len(items) == 1
    assert items[0]['quantity'] == 2
EOF

# 2. Run test (fails)
pytest backend/commerce/tests/test_cart_service.py -v
# EXPECTED: FAILED

# 3. Implement minimal code
cat > backend/commerce/cart.py << 'EOF'
def add_to_cart(cart_id: str, product_id: int, quantity: int) -> bool:
    key = f"cart:{cart_id}"
    redis_client.hincrby(key, product_id, quantity)
    return True
EOF

# 4. Run test (passes)
pytest backend/commerce/tests/test_cart_service.py -v
# EXPECTED: PASSED

# 5. Refactor and add more tests
```

### Critical Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **No tailwind.config.js** | Tailwind v4 uses CSS-first @theme blocks |
| **No forwardRef** | React 19 treats ref as standard prop |
| **Native fetch over Axios** | Next.js 16 optimized for fetch; automatic memoization |
| **PostgreSQL 17** | JSONB improvements, vacuum efficiency |
| **Redis 7.4** | Session management, cart persistence |
| **HttpOnly cookies** | XSS protection for JWT tokens |
| **BFF Proxy Pattern** | Secure API communication; hides backend URL |
| **One-time Quiz** | Simpler UX; stored preferences for curation |

### File Inventory Summary

| Category | Count | Key Files |
|----------|-------|-----------|
| Docker Config | 3 | docker-compose.yml, docker-compose.prod.yml, Dockerfile |
| Backend Models | 12 | User, Product, Order, Subscription, Quiz, etc. |
| API Endpoints | 15+ | auth, products, cart, checkout, subscriptions |
| Frontend Pages | 10+ | Home, Products, Product Detail, Cart, Checkout, Culture, Quiz, Dashboard |
| Components | 20+ | ProductCard, CartDrawer, SgAddressForm, GstBadge, etc. |
| Tests | 30+ | Model tests, API tests, E2E tests |
| Utilities | 10+ | GST calc, authFetch, cart service, curation engine |

---

## Approval Request

This Master Execution Plan has been meticulously reviewed and validated against:

1. ✅ **Project Requirements Document** - All features covered
2. ✅ **Draft Implementation Plan** - Gaps identified and resolved
3. ✅ **Tech Stack Considerations** - Compatibility verified
4. ✅ **Scope Confirmation** - Singapore-only, one-time quiz, Django Admin

**Ready for Approval:**

> `✅ CONFIRM: Proceed with Master Implementation Plan`

Upon confirmation, I will begin Phase 0 implementation immediately, following the TDD approach with daily progress updates via the TODO tracker.
