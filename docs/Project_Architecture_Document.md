# CHA YUAN (茶源) - Project Architecture Document

**Premium Tea E-Commerce Platform for Singapore**
**Version**: 1.0.0 | **Last Updated**: 2026-04-20 | **Phase**: 8 (Testing & Deployment)

---

## 📋 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [File Hierarchy](#3-file-hierarchy)
4. [Backend Architecture](#4-backend-architecture)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Database Schema](#6-database-schema)
7. [API Documentation](#7-api-documentation)
8. [Application Flowcharts](#8-application-flowcharts)
9. [Infrastructure](#9-infrastructure)
10. [Singapore-Specific Features](#10-singapore-specific-features)
11. [Security Architecture](#11-security-architecture)
12. [Development Guidelines](#12-development-guidelines)

---

## 1. Executive Summary

**CHA YUAN (茶源)** is a premium tea e-commerce platform exclusively designed for the Singapore market. The architecture implements a modern **BFF (Backend for Frontend)** pattern with clear separation of concerns:

### Key Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **BFF Pattern** | Secure JWT handling via HttpOnly cookies, unified API surface |
| **Django Ninja** | Pydantic v2 validation, automatic OpenAPI docs |
| **Next.js 16 App Router** | Server Components for SEO, Client Components for interactivity |
| **Tailwind CSS v4** | CSS-first configuration, OKLCH color space, Lightning CSS |
| **Redis Cart** | Sub-second cart operations, 30-day persistence |
| **Centralized API Registry** | Eager router registration, clean dependency flow |

### Singapore Context

- **GST**: 9% calculated on all prices (inclusive display)
- **Currency**: SGD (hardcoded)
- **Address Format**: Block/Street, Unit, 6-digit Postal Code
- **Phone Format**: +65 XXXX XXXX
- **Payment**: Stripe Singapore (Cards, GrabPay, PayNow)
- **Compliance**: PDPA consent tracking

### Current Status

- **Backend Tests**: 93+ tests passing (pytest)
- **Frontend Tests**: 39 tests passing (Vitest)
- **TypeScript**: Strict mode, 0 errors
- **Phase**: 8 (Production-ready pending final E2E tests)

---

## 2. System Architecture Overview

```mermaid
flowchart TB
    subgraph Client["Client Layer"]
        Browser["Web Browser"]
    end

    subgraph Frontend["Frontend Layer (Next.js 16)"]
        NextApp["Next.js App"]
        ServerComp["Server Components (RSC)"]
        ClientComp["Client Components"]
        BFF["BFF Proxy Route<br/>/api/proxy/*"]
    end

    subgraph Backend["Backend Layer (Django 6)"]
        NinjaAPI["Django Ninja API"]
        Auth["Authentication<br/>JWT + HttpOnly"]
        CartSvc["Cart Service<br/>(Redis)"]
        Curation["Curation Engine<br/>(60/30/10 Algorithm)"]
        Stripe["Stripe Integration"]
    end

    subgraph Data["Data Layer"]
        Postgres[("PostgreSQL 17<br/>Products, Orders, Users")]
        Redis[("Redis 7.4<br/>Cart, Sessions, Cache")]
    end

    subgraph External["External Services"]
        StripeAPI["Stripe API<br/>(SGD, GrabPay, PayNow)"]
    end

    Browser --> NextApp
    NextApp --> ServerComp
    NextApp --> ClientComp

    ServerComp --> |"Direct API Call<br/>authFetch()"| NinjaAPI
    ClientComp --> |"Proxied Request"| BFF
    BFF --> |"Server-side Forward"| NinjaAPI

    NinjaAPI --> Auth
    NinjaAPI --> CartSvc
    NinjaAPI --> Curation
    NinjaAPI --> Stripe

    Auth --> Postgres
    CartSvc --> Redis
    Curation --> Postgres
    Stripe --> StripeAPI
    NinjaAPI --> Postgres
```

### Architecture Patterns

| Pattern | Implementation | Purpose |
|---------|----------------|---------|
| **BFF (Backend for Frontend)** | `/api/proxy/[...path]/` | Secure JWT handling, unified API |
| **Repository Pattern** | Django Models + Managers | Data access abstraction |
| **Service Layer** | `cart.py`, `curation.py` | Business logic encapsulation |
| **CQRS** | Separate read/write paths | Quiz scoring, curation |
| **CQRS (Cart)** | Redis writes, DB reads | Cart persistence |

---

## 3. File Hierarchy

### Complete Project Structure

```
/home/project/tea-culture/cha-yuan/
│
├── 📁 backend/                    # Django 6 Backend
│   ├── 📄 api_registry.py         # Centralized API router (CRITICAL)
│   ├── 📁 apps/
│   │   ├── 📁 api/
│   │   │   ├── 📁 v1/            # API Version 1 (Django Ninja)
│   │   │   │   ├── 📄 __init__.py
│   │   │   │   ├── 📄 products.py    # Product catalog endpoints
│   │   │   │   ├── 📄 cart.py        # Shopping cart endpoints
│   │   │   │   ├── 📄 checkout.py    # Payment & Stripe integration
│   │   │   │   ├── 📄 content.py     # Articles & culture API
│   │   │   │   ├── 📄 quiz.py        # Quiz & preferences API
│   │   │   │   └── 📄 subscriptions.py   # Subscription management
│   │   │   └── 📁 tests/
│   │   │       ├── 📄 __init__.py
│   │   │       ├── 📄 test_router_registration.py
│   │   │       ├── 📄 test_products_api.py
│   │   │       └── 📄 test_content_api.py
│   │   │
│   │   ├── 📁 commerce/          # Product & Commerce
│   │   │   ├── 📄 __init__.py
│   │   │   ├── 📄 models.py      # Product, Origin, TeaCategory, Subscription, Order
│   │   │   ├── 📄 admin.py       # Django Admin customization
│   │   │   ├── 📄 cart.py        # Redis cart service (418 lines)
│   │   │   ├── 📄 curation.py    # AI curation algorithm (60/30/10)
│   │   │   ├── 📄 stripe_sg.py   # Singapore Stripe integration
│   │   │   ├── 📁 management/
│   │   │   │   └── 📁 commands/
│   │   │   │       ├── 📄 __init__.py
│   │   │   │       └── 📄 seed_products.py   # Seed 12 products
│   │   │   └── 📁 tests/
│   │   │       ├── 📄 __init__.py
│   │   │       ├── 📄 test_models_product.py
│   │   │       ├── 📄 test_cart.py
│   │   │       ├── 📄 test_cart_service.py
│   │   │       ├── 📄 test_cart_validation.py
│   │   │       ├── 📄 test_cart_merge.py
│   │   │       ├── 📄 test_curation.py
│   │   │       ├── 📄 test_stripe_checkout.py
│   │   │       ├── 📄 test_stripe_webhook.py
│   │   │       └── 📄 test_admin_curation.py
│   │   │
│   │   ├── 📁 content/           # Content & Quiz
│   │   │   ├── 📄 __init__.py
│   │   │   ├── 📄 models.py      # QuizQuestion, QuizChoice, UserPreference, Article, ArticleCategory
│   │   │   ├── 📄 admin.py       # Quiz admin with inline choices
│   │   │   ├── 📁 management/
│   │   │   │   └── 📁 commands/
│   │   │   │       ├── 📄 __init__.py
│   │   │   │       └── 📄 seed_quiz.py   # Seed 6 quiz questions
│   │   │   └── 📁 tests/
│   │   │       ├── 📄 __init__.py
│   │   │       ├── 📄 test_models_category.py
│   │   │       ├── 📄 test_models_quiz.py
│   │   │       ├── 📄 test_models_article.py
│   │   │       ├── 📄 test_quiz_api.py
│   │   │       └── 📄 test_quiz_scoring.py
│   │   │
│   │   └── 📁 core/              # Users & Auth
│   │       ├── 📄 __init__.py
│   │       ├── 📄 models.py      # User, Address with SG validation
│   │       ├── 📄 authentication.py  # JWT + HttpOnly cookies
│   │       ├── 📄 admin.py       # User admin
│   │       ├── 📁 sg/            # Singapore utilities
│   │       │   ├── 📄 __init__.py
│   │       │   ├── 📄 validators.py   # Phone, postal code validation
│   │       │   └── 📄 pricing.py    # GST calculation
│   │       └── 📁 tests/
│   │           ├── 📄 __init__.py
│   │           └── 📄 test_models_user.py
│   │
│   ├── 📁 chayuan/               # Django Project Config
│   │   ├── 📄 __init__.py
│   │   ├── 📄 urls.py            # URL configuration (imports from api_registry)
│   │   ├── 📄 wsgi.py
│   │   ├── 📄 asgi.py
│   │   └── 📁 settings/
│   │       ├── 📄 __init__.py
│   │       ├── 📄 base.py        # Base settings
│   │       ├── 📄 development.py
│   │       └── 📄 production.py
│   │
│   ├── 📁 requirements/          # Python Dependencies
│   │   ├── 📄 base.txt           # Core dependencies
│   │   ├── 📄 development.txt
│   │   └── 📄 production.txt
│   │
│   ├── 📄 manage.py
│   ├── 📄 .env.example
│   └── 📄 pytest.ini
│
├── 📁 frontend/                  # Next.js 16 Frontend
│   ├── 📁 app/                   # App Router
│   │   ├── 📁 api/
│   │   │   └── 📁 proxy/
│   │   │       └── 📁 [...path]/
│   │   │           └── 📄 route.ts   # BFF Proxy Route
│   │   │
│   │   ├── 📁 products/
│   │   │   ├── 📄 page.tsx       # Product listing (Server Component)
│   │   │   ├── 📁 [slug]/
│   │   │   │   └── 📄 page.tsx   # Product detail (Dynamic)
│   │   │   └── 📁 components/
│   │   │       └── 📄 product-catalog.tsx
│   │   │
│   │   ├── 📁 culture/
│   │   │   ├── 📄 page.tsx       # Articles listing
│   │   │   ├── 📁 [slug]/
│   │   │   │   └── 📄 page.tsx   # Article detail
│   │   │   └── 📁 components/
│   │   │
│   │   ├── 📁 quiz/
│   │   │   ├── 📄 page.tsx       # Quiz intro page
│   │   │   └── 📁 components/
│   │   │       ├── 📄 quiz-intro.tsx
│   │   │       ├── 📄 quiz-question.tsx
│   │   │       ├── 📄 quiz-results.tsx
│   │   │       ├── 📄 quiz-progress.tsx
│   │   │       ├── 📄 quiz-layout.tsx
│   │   │       ├── 📄 quiz-guard.tsx
│   │   │       └── 📄 index.ts
│   │   │
│   │   ├── 📁 cart/
│   │   │   └── 📄 page.tsx       # Cart page
│   │   │
│   │   ├── 📁 checkout/
│   │   │   ├── 📄 page.tsx
│   │   │   ├── 📁 success/
│   │   │   │   └── 📄 page.tsx
│   │   │   └── 📁 cancel/
│   │   │       └── 📄 page.tsx
│   │   │
│   │   ├── 📁 dashboard/
│   │   │   └── 📁 subscription/
│   │   │       ├── 📄 page.tsx   # Subscription dashboard
│   │   │       └── 📁 components/
│   │   │           ├── 📄 subscription-status.tsx
│   │   │           ├── 📄 next-billing.tsx
│   │   │           ├── 📄 next-box-preview.tsx
│   │   │           ├── 📄 preference-summary.tsx
│   │   │           ├── 📄 cancel-subscription.tsx
│   │   │           └── 📄 index.ts
│   │   │
│   │   ├── 📁 shop/
│   │   │   └── 📄 page.tsx       # Redirects to /products
│   │   │
│   │   ├── 📁 auth/
│   │   │   └── 📄 (login/signup pages)
│   │   │
│   │   ├── 📄 layout.tsx         # Root layout
│   │   ├── 📄 page.tsx           # Home page
│   │   ├── 📄 globals.css        # Tailwind v4 theme
│   │   └── 📄 providers.tsx      # QueryClientProvider
│   │
│   ├── 📁 components/            # React Components
│   │   ├── 📁 ui/                # shadcn primitives
│   │   │   ├── 📄 button.tsx
│   │   │   ├── 📄 input.tsx
│   │   │   ├── 📄 label.tsx
│   │   │   ├── 📄 sheet.tsx
│   │   │   ├── 📄 scroll-area.tsx
│   │   │   └── 📄 separator.tsx
│   │   │
│   │   ├── 📁 sections/          # Page sections
│   │   │   ├── 📄 hero.tsx
│   │   │   ├── 📄 navigation.tsx
│   │   │   ├── 📄 philosophy.tsx
│   │   │   ├── 📄 collection.tsx
│   │   │   ├── 📄 culture.tsx
│   │   │   ├── 📄 shop-cta.tsx
│   │   │   ├── 📄 subscribe.tsx
│   │   │   └── 📄 footer.tsx
│   │   │
│   │   ├── 📄 product-card.tsx
│   │   ├── 📄 product-grid.tsx
│   │   ├── 📄 product-gallery.tsx
│   │   ├── 📄 related-products.tsx
│   │   ├── 📄 filter-sidebar.tsx
│   │   ├── 📄 article-card.tsx
│   │   ├── 📄 article-grid.tsx
│   │   ├── 📄 article-content.tsx
│   │   ├── 📄 category-badge.tsx
│   │   ├── 📄 gst-badge.tsx
│   │   ├── 📄 cart-drawer.tsx
│   │   ├── 📄 sg-address-form.tsx
│   │   └── 📄 providers.tsx
│   │
│   ├── 📁 lib/                   # Utilities
│   │   ├── 📁 api/
│   │   │   ├── 📄 products.ts    # Product API
│   │   │   ├── 📄 quiz.ts        # Quiz API
│   │   │   └── 📄 subscription.ts # Subscription API
│   │   │
│   │   ├── 📁 types/
│   │   │   ├── 📄 product.ts
│   │   │   ├── 📄 quiz.ts
│   │   │   └── 📄 subscription.ts
│   │   │
│   │   ├── 📁 hooks/
│   │   │   └── 📄 use-subscription.ts
│   │   │
│   │   ├── 📁 animations/
│   │   ├── 📄 auth-fetch.ts      # BFF wrapper
│   │   ├── 📄 animations.ts      # Framer Motion variants
│   │   └── 📄 utils.ts
│   │
│   ├── 📁 public/                # Static assets
│   │   └── 📁 images/
│   │
│   ├── 📄 next.config.ts
│   ├── 📄 postcss.config.mjs
│   ├── 📄 tsconfig.json
│   ├── 📄 package.json
│   └── 📄 .env.example
│
├── 📁 infra/                     # Infrastructure
│   └── 📁 docker/
│       ├── 📄 docker-compose.yml
│       ├── 📄 Dockerfile.backend.dev
│       └── 📄 Dockerfile.frontend.dev
│
├── 📁 docs/                      # Documentation
│   ├── 📄 PHASE_0_SUBPLAN.md
│   ├── 📄 PHASE_1_SUBPLAN.md
│   ├── 📄 PHASE_2_SUBPLAN.md
│   ├── 📄 PHASE_3_SUBPLAN.md
│   ├── 📄 PHASE_4_SUBPLAN.md
│   ├── 📄 PHASE_5_SUBPLAN.md
│   ├── 📄 PHASE_6_SUBPLAN.md
│   ├── 📄 PHASE_7_SUBPLAN.md
│   ├── 📄 PHASE_4_REMAINING_SUBPLAN.md
│   └── 📄 Project_Architecture_Document.md
│
├── 📁 plan/                      # Planning documents
│   ├── 📄 MASTER_EXECUTION_PLAN.md
│   └── 📄 Project_Requirements_Document.md
│
├── 📄 README.md
├── 📄 CLAUDE.md
├── 📄 GEMINI.md
├── 📄 AGENTS.md
├── 📄 PROJECT_KNOWLEDGE_BASE.md
├── 📄 CODE_REVIEW_REPORT.md
└── 📄 .env.example
```

---

## 4. Backend Architecture

### 4.1 Centralized API Registry Pattern

**Location**: `backend/api_registry.py`

```python
"""
CHA YUAN API Registry - Centralized Router Registration

CRITICAL PATTERN: Routers registered at IMPORT TIME, NOT in AppConfig.ready()
This ensures routers are attached BEFORE Django's URL resolver runs.
"""

from ninja import NinjaAPI

api = NinjaAPI(
    title="CHA YUAN API",
    version="1.0.0",
    description="Premium Tea E-Commerce API for Singapore",
    docs_url="/docs/",
    openapi_url="/openapi.json",
)

# Eager registration at module level
from apps.api.v1.products import router as products_router
api.add_router("/products/", products_router, tags=["products"])

from apps.api.v1.cart import router as cart_router
api.add_router("/cart/", cart_router, tags=["cart"])

# ... etc
```

**Why This Pattern**:
- Django Ninja routers must be registered before URL resolution
- `AppConfig.ready()` runs too late in the lifecycle
- Centralizes all API registration in one file
- Prevents circular imports

### 4.2 Router Endpoint Pattern

**CRITICAL**: Router endpoints use RELATIVE paths

```python
# backend/apps/api/v1/products.py

router = Router(tags=["products"])
# Router mounted at /products/ in api_registry.py

@router.get("/")  # NOT "/products/" - Results in /api/v1/products/
@paginate(PageNumberPagination, page_size=12)
def list_products(request, filters: ProductFilterSchema = Query(...)):
    """List products - accessible at /api/v1/products/"""
    pass

@router.get("/{slug}/")  # NOT "/products/{slug}/" - Results in /api/v1/products/{slug}/
def get_product_detail(request, slug: str):
    """Product detail - accessible at /api/v1/products/{slug}/"""
    pass
```

### 4.3 App Structure

#### Core App (`apps/core/`)

| File | Purpose | Key Classes |
|------|---------|-------------|
| `models.py` | User & Address | `User`, `Address` |
| `authentication.py` | JWT auth | `JWTAuthentication` |
| `sg/validators.py` | SG validation | Phone (`^\+65\s?\d{8}$`), Postal Code (`^\d{6}$`) |
| `sg/pricing.py` | GST calculation | `calculate_gst()`, `GST_RATE = Decimal('0.09')` |

#### Commerce App (`apps/commerce/`)

| File | Purpose | Key Classes/Functions |
|------|---------|----------------------|
| `models.py` | Product & Order | `Origin`, `TeaCategory`, `Product`, `Subscription`, `Order` |
| `cart.py` | Redis cart | `CartService` - 418 lines, 30-day TTL |
| `curation.py` | AI curation | `curate_for_user()`, `score_products()` - 60/30/10 weights |
| `stripe_sg.py` | Stripe SG | `create_checkout_session()` |
| `admin.py` | Django Admin | Custom ProductAdmin |

#### Content App (`apps/content/`)

| File | Purpose | Key Classes |
|------|---------|-------------|
| `models.py` | Content & Quiz | `Article`, `ArticleCategory`, `QuizQuestion`, `QuizChoice`, `UserPreference` |
| `admin.py` | Admin config | `QuizQuestionAdmin` with inline choices |

---

## 5. Frontend Architecture

### 5.1 Server Components vs Client Components

| Component Type | Location | Data Fetching | Use Case |
|----------------|----------|---------------|----------|
| **Server Component** | `page.tsx`, `layout.tsx` | Direct `authFetch()` | SEO-critical, initial render |
| **Client Component** | `components/*`, `hooks/*` | Via BFF proxy | Interactivity, browser APIs |

### 5.2 Data Flow Pattern

```mermaid
sequenceDiagram
    participant SC as Server Component
    participant CC as Client Component
    participant Proxy as BFF Proxy
    participant Django as Django API
    participant DB as Database

    Note over SC,DB: Server Component Flow
    SC->>Django: authFetch("/api/v1/products/", {skipAuth: true})
    Django->>DB: Query
    DB->>Django: Data
    Django->>SC: JSON Response

    Note over CC,DB: Client Component Flow
    CC->>Proxy: fetch("/api/proxy/products/")
    Proxy->>Django: Forward + JWT from cookie
    Django->>DB: Query
    DB->>Django: Data
    Django->>Proxy: JSON Response
    Proxy->>CC: JSON Response
```

### 5.3 Next.js 15+ Async Params Pattern

**CRITICAL**: Page params are `Promise<>` in Next.js 15+

```typescript
// app/products/page.tsx
interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    origin?: string;
    season?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;  // MUST await before accessing
  const products = await getProducts({
    category: params.category,
    origin: params.origin,
    season: params.season,
    page: params.page ? parseInt(params.page) : undefined,
  });
}

// app/products/[slug]/page.tsx
interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;  // MUST await before accessing
  const product = await getProductBySlug(slug);
}
```

### 5.4 Tailwind CSS v4 Configuration

**Location**: `frontend/app/globals.css` (349 lines)

**Key Points**:
- NO `tailwind.config.js` - all config in CSS
- CSS-first theming with `@theme`
- OKLCH color space for perceptual uniformity
- Lightning CSS for compilation
- Custom animations: `fadeInUp`, `fadeIn`, `slideInLeft`, `leafFloat`, `steamRise`, `reveal`

```css
/* globals.css */
@import "tailwindcss";

@theme {
  /* Custom Colors */
  --color-tea-50: #f4f7f1;
  --color-tea-100: #e6ede0;
  --color-tea-500: #5c8a4d;
  --color-tea-600: #4a7040;
  --color-ivory-50: #fdfbf7;
  --color-ivory-100: #faf6ee;
  --color-bark-900: #2a1d14;
  --color-gold-500: #b8944d;
  --color-terra-400: #c4724b;

  /* Typography */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-serif: "Playfair Display", Georgia, serif;
  --font-chinese: "Noto Serif SC", serif;

  /* Animations */
  --animate-fadeInUp: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  --animate-leafFloat: leafFloat 4s ease-in-out infinite;
}
```

---

## 6. Database Schema

### 6.1 Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Address : has
    User ||--|| UserPreference : has
    User ||--o{ Subscription : subscribes
    User ||--o{ Order : places

    Origin ||--o{ Product : produces
    TeaCategory ||--o{ Product : categorizes

    Product }o--o{ SubscriptionShipment : contained_in
    Subscription ||--o{ SubscriptionShipment : generates

    ArticleCategory ||--o{ Article : categorizes
    QuizQuestion ||--o{ QuizChoice : has

    User {
        int id PK
        string email UK
        string first_name
        string last_name
        string phone "+65 XXXX XXXX"
        string postal_code "6 digits"
        datetime pdpa_consent_at
        boolean is_active
    }

    Address {
        int id PK
        int user_id FK
        string recipient_name
        string block_street
        string unit
        string postal_code
        boolean is_default
    }

    Origin {
        int id PK
        string name
        string slug UK
        string region
        text description
        url image
    }

    TeaCategory {
        int id PK
        string name
        string slug UK
        int fermentation_level "0-100%"
        text description
        int brewing_temp_celsius
        int brewing_time_seconds
    }

    Product {
        int id PK
        string name
        string slug UK
        text description
        decimal price_sgd
        boolean gst_inclusive
        int stock
        boolean is_available
        int origin_id FK
        int category_id FK
        string harvest_season
        int harvest_year
        int weight_grams
        boolean is_new_arrival
        url image
        json images
    }

    Subscription {
        int id PK
        int user_id FK
        string status "active|paused|cancelled"
        string plan "monthly|quarterly|annual"
        decimal price_sgd
        datetime next_billing_date
        json next_curation_override
        string stripe_subscription_id
        string stripe_customer_id
    }

    SubscriptionShipment {
        int id PK
        int subscription_id FK
        string status "preparing|shipped|delivered"
        string tracking_number
        datetime shipped_at
        datetime delivered_at
        string curation_type "auto|manual"
    }

    ArticleCategory {
        int id PK
        string name
        string slug UK
        text description
        string color
        int order
    }

    Article {
        int id PK
        string title
        string slug UK
        text content
        text excerpt
        int category_id FK
        url featured_image
        datetime published_at
        boolean is_featured
        int reading_time_minutes
    }

    QuizQuestion {
        int id PK
        string question_text
        json question_text_i18n
        int order
        boolean is_required
    }

    QuizChoice {
        int id PK
        int question_id FK
        string choice_text
        json preference_weights "{category: weight}"
        int order
    }

    UserPreference {
        int id PK
        int user_id FK "one-to-one"
        json preferences "{category: score}"
        datetime quiz_completed_at
    }
```

### 6.2 Key Models Reference

#### Product Model

```python
class Product(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    price_sgd = models.DecimalField(max_digits=10, decimal_places=2)
    gst_inclusive = models.BooleanField(default=True)
    stock = models.PositiveIntegerField(default=0)
    is_available = models.BooleanField(default=True)

    # Relations
    origin = models.ForeignKey(Origin, on_delete=models.CASCADE)
    category = models.ForeignKey(TeaCategory, on_delete=models.CASCADE)

    # Harvest Info
    harvest_season = models.CharField(choices=SEASON_CHOICES)
    harvest_year = models.PositiveSmallIntegerField()

    # Media
    image = models.ImageField(upload_to="products/")
    images = models.JSONField(default=list)

    # Methods
    def get_price_with_gst(self):
        if self.gst_inclusive:
            return self.price_sgd
        return (self.price_sgd * Decimal("1.09")).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

    def get_gst_amount(self):
        if self.gst_inclusive:
            return self.price_sgd - (self.price_sgd / Decimal("1.09"))
        return self.price_sgd * Decimal("0.09")
```

#### Subscription Model

```python
class Subscription(models.Model):
    PLAN_CHOICES = [
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('annual', 'Annual'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    status = models.CharField(choices=STATUS_CHOICES)
    plan = models.CharField(choices=PLAN_CHOICES)
    price_sgd = models.DecimalField(max_digits=10, decimal_places=2)
    next_billing_date = models.DateTimeField()

    # Curation
    next_curation_override = models.JSONField(null=True, blank=True)

    # Stripe
    stripe_subscription_id = models.CharField(max_length=255)
    stripe_customer_id = models.CharField(max_length=255)
```

---

## 7. API Documentation

### 7.1 Public Endpoints (No Auth Required)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/products/` | GET | List products (paginated, filtered) |
| `/api/v1/products/{slug}/` | GET | Product detail |
| `/api/v1/products/categories/` | GET | Tea categories |
| `/api/v1/products/origins/` | GET | Tea origins |
| `/api/v1/content/articles/` | GET | Articles list |
| `/api/v1/content/articles/{slug}/` | GET | Article detail |
| `/api/v1/content/categories/` | GET | Article categories |
| `/api/v1/quiz/questions/` | GET | Quiz questions |
| `/api/v1/checkout/config/` | GET | Stripe publishable key |

### 7.2 Authenticated Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/cart/` | GET | Get cart |
| `/api/v1/cart/add/` | POST | Add item to cart |
| `/api/v1/cart/update/` | PUT | Update item quantity |
| `/api/v1/cart/remove/{id}/` | DELETE | Remove item from cart |
| `/api/v1/cart/clear/` | DELETE | Clear entire cart |
| `/api/v1/checkout/create-session/` | POST | Create Stripe checkout session |
| `/api/v1/checkout/webhook/` | POST | Stripe webhook handler |
| `/api/v1/quiz/submit/` | POST | Submit quiz answers |
| `/api/v1/quiz/preferences/` | GET | Get user preferences |
| `/api/v1/subscriptions/current/` | GET | Get current subscription |
| `/api/v1/subscriptions/cancel/` | POST | Cancel subscription |
| `/api/v1/subscriptions/pause/` | POST | Pause subscription |
| `/api/v1/subscriptions/resume/` | POST | Resume subscription |

---

## 8. Application Flowcharts

### 8.1 Product Discovery Flow

```mermaid
flowchart LR
    A[User] --> B[Landing Page]
    B --> C{Browse or Quiz?}
    C -->|Browse| D[Product Catalog]
    C -->|Quiz| E[Preference Quiz]

    D --> F[Filter/Search]
    D --> G[Product Detail]

    E --> H[Submit Answers]
    H --> I[Calculate Preferences]
    I --> J[Show Recommendations]

    G --> K[Add to Cart]
    J --> K

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style K fill:#bfb,stroke:#333,stroke-width:2px
```

### 8.2 Shopping Cart Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant BFF
    participant Django
    participant Redis
    participant DB

    User->>Frontend: Click "Add to Cart"
    Frontend->>BFF: POST /api/proxy/cart/add/
    Note over BFF: Extract JWT from cookie
    BFF->>Django: POST /api/v1/cart/add/ Bearer {token}

    Django->>Django: Validate JWT
    Django->>DB: Validate product & stock
    DB->>Django: Product data

    Django->>Redis: HINCRBY cart:{user_id} {product_id} {quantity}
    Redis->>Django: Updated quantity

    Django->>Redis: Get full cart
    Redis->>Django: Cart items
    Django->>DB: Fetch product details
    DB->>Django: Product data

    Django->>BFF: Cart response
    BFF->>Frontend: JSON + Set-Cookie
    Frontend->>User: Update cart UI
```

### 8.3 Checkout Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant BFF
    participant Django
    participant Stripe
    participant Webhook

    User->>Frontend: Click Checkout
    Frontend->>BFF: POST /api/proxy/checkout/create-session/
    BFF->>Django: Forward request

    Django->>Stripe: Create Checkout Session
    Stripe->>Django: Session ID
    Django->>BFF: {sessionId, url}
    BFF->>Frontend: Session data

    Frontend->>Stripe: Redirect to Checkout
    User->>Stripe: Complete Payment
    Stripe->>Webhook: POST /api/v1/checkout/webhook/

    Webhook->>Django: payment_intent.succeeded
    Django->>Django: Create Order
    Django->>Django: Update Inventory
    Django->>Webhook: 200 OK

    Stripe->>Frontend: Redirect to success
    Frontend->>User: Order Confirmation
```

### 8.4 Subscription Curation Flow

```mermaid
flowchart TD
    A[Monthly Trigger] --> B[Get Active Subscriptions]
    B --> C[For Each Subscription]

    C --> D{Manual Override?}
    D -->|Yes| E[Use Override Products]
    D -->|No| F[Run Curation Algorithm]

    F --> G[Get User Preferences]
    F --> H[Get Current Season]
    F --> I[Get Available Products]
    F --> J[Exclude Recent Shipments]

    G --> K[Score Products]
    H --> K
    I --> K
    J --> K

    K -->|60%| L[User Preferences]
    K -->|30%| M[Seasonal Match]
    K -->|10%| N[Inventory Level]

    L --> O[Select Top 5]
    M --> O
    N --> O
    E --> O

    O --> P[Create Shipment]
    P --> Q[Send Notification]
    Q --> R[Schedule Delivery]

    style A fill:#f9f,stroke:#333
    style R fill:#bfb,stroke:#333
```

### 8.5 Quiz Submission Flow

```mermaid
flowchart LR
    A[User] --> B[Answer Questions]
    B --> C[Submit Quiz]

    C --> D[Calculate Scores]
    D --> E{For Each Choice}

    E -->|Extract Weights| F[Add to Category Scores]
    E -->|Normalize| G[0-100 Scale]

    F --> H[Save Preferences]
    G --> H

    H --> I[Store in UserPreference]
    I --> J[Show Results]
    J --> K[Recommend Teas]

    style A fill:#f9f,stroke:#333
    style K fill:#bfb,stroke:#333
```

---

## 9. Infrastructure

### 9.1 Docker Services

```yaml
# infra/docker/docker-compose.yml

services:
  postgres:
    image: postgres:17-trixie
    environment:
      POSTGRES_DB: chayuan_db
      POSTGRES_USER: chayuan_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      TZ: Asia/Singapore
      POSTGRES_INITDB_ARGS: "--locale-provider=icu --icu-locale=en_SG.utf8"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7.4-alpine
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  backend:
    build:
      context: ../..
      dockerfile: infra/docker/Dockerfile.backend.dev
    environment:
      DJANGO_SETTINGS_MODULE: chayuan.settings.development
      DATABASE_URL: postgresql://chayuan_user:${DB_PASSWORD}@postgres:5432/chayuan_db
      REDIS_URL: redis://redis:6379/0
      SECRET_KEY: ${SECRET_KEY}
      DEBUG: "True"
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis

  frontend:
    build:
      context: ../..
      dockerfile: infra/docker/Dockerfile.frontend.dev
    environment:
      NEXT_PUBLIC_BACKEND_URL: http://localhost:8000
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

### 9.2 Redis Database Allocation

| Database | Purpose | TTL | Notes |
|----------|---------|-----|-------|
| DB 0 | Sessions/Cache | - | Django sessions |
| DB 1 | Shopping Carts | 30 days | Hash per user: `cart:{user_id}` |
| DB 2 | Token Blacklist | - | JWT revocation |

### 9.3 Environment Variables

#### Required Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `DB_PASSWORD` | PostgreSQL password | `secure-password` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://...` |
| `REDIS_URL` | Redis connection | `redis://localhost:6379/0` |
| `SECRET_KEY` | Django secret | `django-insecure-...` |
| `STRIPE_PUBLISHABLE_KEY_SG` | Stripe public | `pk_test_...` |
| `STRIPE_SECRET_KEY_SG` | Stripe secret | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET_SG` | Webhook secret | `whsec_...` |

---

## 10. Singapore-Specific Features

### 10.1 Tax & Pricing

```python
# apps/commerce/models.py

GST_RATE = Decimal('0.09')

class Product(models.Model):
    price_sgd = models.DecimalField(max_digits=10, decimal_places=2)
    gst_inclusive = models.BooleanField(default=True)

    def get_price_with_gst(self):
        if self.gst_inclusive:
            return self.price_sgd
        return (self.price_sgd * Decimal("1.09")).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

    def get_gst_amount(self):
        if self.gst_inclusive:
            return self.price_sgd - (self.price_sgd / Decimal("1.09"))
        return self.price_sgd * GST_RATE
```

### 10.2 Address Format

```
Format: Block/Street, Unit, Postal Code

Example:
Blk 123 Jurong East St 13
#04-56
Singapore 600123

Fields:
- block_street: "Blk 123 Jurong East St 13"
- unit: "#04-56"
- postal_code: "600123" (6 digits)

Validation: ^\d{6}$
```

### 10.3 Phone Format

```
Format: +65 XXXX XXXX
Validation: ^\+65\s?\d{8}$

Examples:
✓ +65 9123 4567
✓ +6591234567
✗ 91234567 (missing +65)
```

### 10.4 Stripe Integration

```python
# apps/commerce/stripe_sg.py

import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY_SG

def create_checkout_session(cart_items, user):
    session = stripe.checkout.Session.create(
        payment_method_types=['card', 'grabpay', 'paynow'],
        currency='sgd',
        line_items=[
            {
                'price_data': {
                    'currency': 'sgd',
                    'product_data': {'name': item.name},
                    'unit_amount': int(item.price * 100),  # Cents
                },
                'quantity': item.quantity,
            }
            for item in cart_items
        ],
        shipping_address_collection={
            'allowed_countries': ['SG'],  # Singapore only
        },
        success_url=f"{settings.FRONTEND_URL}/checkout/success",
        cancel_url=f"{settings.FRONTEND_URL}/checkout/cancel",
    )
    return session
```

### 10.5 Season Detection (for Curation)

```python
def get_current_season_sg() -> str:
    """Get current season in Singapore (SGT)."""
    from pytz import timezone
    from datetime import datetime

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
```

---

## 11. Security Architecture

### 11.1 Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant BFF
    participant Django
    participant DB

    User->>Frontend: Login
    Frontend->>BFF: POST /api/proxy/auth/login/
    BFF->>Django: Forward request

    Django->>DB: Validate credentials
    DB->>Django: User data

    Django->>Django: Generate tokens
    Django->>BFF: Return tokens + Set-Cookie
    BFF->>Frontend: Set HttpOnly cookies
    Note over Frontend: access_token, refresh_token
    Frontend->>User: Authenticated

    Note over User,Django: Subsequent requests
    User->>Frontend: Request (cookies auto-sent)
    Frontend->>BFF: Request
    BFF->>BFF: Extract JWT from cookie
    BFF->>Django: Authorization: Bearer {token}
    Django->>Django: Validate token
    Django->>BFF: Response
    BFF->>Frontend: Data
```

### 11.2 Security Measures

| Layer | Measure | Implementation |
|-------|---------|----------------|
| **Auth** | JWT in HttpOnly cookies | Never localStorage |
| **CSRF** | SameSite=Lax | Cookie attribute |
| **XSS** | Content Security Policy | Headers |
| **Rate Limit** | Redis-based | `@ratelimit` decorator |
| **Input** | Pydantic validation | Django Ninja schemas |
| **PDPA** | Consent tracking | `User.pdpa_consent_at` |

---

## 12. Development Guidelines

### 12.1 Code Standards

#### Python (Django)

- Follow PEP 8
- Use Black formatter
- Type hints on all public functions
- Docstrings for all classes/methods

#### TypeScript (Next.js)

- Strict mode enabled
- No `any` type - use `unknown`
- Prefer `interface` over `type` (except unions)
- Explicit return types

### 12.2 Anti-Patterns to Avoid

1. **Never** store JWT in `localStorage` - use HttpOnly cookies
2. **Never** use `any` type in TypeScript
3. **Never** duplicate API paths in router endpoints
4. **Never** skip `await` on Next.js 15+ params
5. **Never** commit secrets (use .env files)
6. **Never** forget trailing slashes on API calls
7. **Never** mix v3 and v4 Tailwind utilities
8. **Never** use `forwardRef` in React 19
9. **Never** build custom component if shadcn/ui primitive exists
10. **Never** skip error handling for backend fetches

### 12.3 Git Workflow

```bash
# Branch naming
feature/product-detail-page
bugfix/cart-404-error
hotfix/security-patch

# Commit format
type(scope): subject

feat(products): add product detail page
fix(api): resolve duplicate router paths
docs(readme): update installation steps
```

### 12.4 Testing Requirements

#### Backend

```bash
# Run tests
pytest
pytest apps/commerce/tests/ -v
pytest apps/content/tests/test_quiz.py -v

# Coverage
pytest --cov=apps --cov-report=html
```

#### Frontend

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e
```

### 12.5 PR Checklist

- [ ] TypeScript check passes (`npm run typecheck`)
- [ ] Build succeeds (`npm run build`)
- [ ] Backend tests pass (`pytest`)
- [ ] Frontend tests pass (`npm test`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Manual testing completed
- [ ] Documentation updated

---

## Appendix A: Quick Reference

### A.1 Common Commands

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
```

### A.2 Key Files Quick Access

| Purpose | File |
|---------|------|
| API Router | `backend/api_registry.py` |
| Product API | `backend/apps/api/v1/products.py` |
| Product Model | `backend/apps/commerce/models.py` |
| Cart Service | `backend/apps/commerce/cart.py` |
| Curation | `backend/apps/commerce/curation.py` |
| Stripe SG | `backend/apps/commerce/stripe_sg.py` |
| Product Page | `frontend/app/products/page.tsx` |
| Product Detail | `frontend/app/products/[slug]/page.tsx` |
| Product Card | `frontend/components/product-card.tsx` |
| API Functions | `frontend/lib/api/products.ts` |
| Types | `frontend/lib/types/product.ts` |

---

*Document generated from meticulous codebase analysis*
*Last updated: 2026-04-20 | Phase: 8 (Testing & Deployment)*
*Version: 1.0.0*
*Total Lines: 1,252*
*Test Status: 93+ backend + 39 frontend tests passing*
