# 茶源 CHA YUAN

<div align="center">

![CHA YUAN Logo](https://img.shields.io/badge/茶源-CHA%20YUAN-tea?style=for-the-badge&color=5C8A4D&labelColor=2A3D26)

**Premium Tea E-Commerce Platform for Singapore**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Django](https://img.shields.io/badge/Django-6.0-092E20?logo=django)](https://www.djangoproject.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7.4-DC382D?logo=redis)](https://redis.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)

[![GST](https://img.shields.io/badge/GST-9%25-gold?logo=singapore)](#singapore-market-context)
[![Currency](https://img.shields.io/badge/Currency-SGD-darkgreen)](https://www.mas.gov.sg/)
[![Timezone](https://img.shields.io/badge/Timezone-Asia%2FSingapore-blue)](https://en.wikipedia.org/wiki/Singapore_Time)

</div>

---

## 🍵 Overview

**CHA YUAN (茶源)** is a premium tea e-commerce platform exclusively designed for the Singapore market. We bridge Eastern tea heritage with modern lifestyle commerce, offering a curated selection of premium teas from heritage gardens across China, Taiwan, Japan, and India.

### The Tea Commerce Problem

- **Overwhelming Selection**: Consumers face hundreds of tea varieties without guidance
- **Quality Uncertainty**: Origin authenticity and harvest quality are hard to verify
- **Personalization Gap**: No tailored recommendations based on taste preferences
- **Singapore Market Needs**: Local GST compliance (9%), SGD pricing, regional delivery

### Our Solution

- ✨ **Preference Quiz**: One-time onboarding quiz determines tea preferences using weighted scoring
- 🎯 **Curated Subscription**: Monthly tea boxes automatically curated based on preferences + season
- 📚 **Educational Content**: Brewing guides, tasting notes, and tea culture articles
- 🇸🇬 **Singapore-Ready**: GST-inclusive pricing, local address format, PDPA compliance

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 + React 19 | Server Components for SEO, Edge functions |
| **Styling** | Tailwind CSS v4 (CSS-first) | OKLCH color space, Lightning CSS |
| **Animations** | Framer Motion | Smooth micro-interactions |
| **State** | TanStack Query v5 | Server state management |
| **Backend** | Django 6 + Django Ninja | Rapid API with Pydantic v2 |
| **Database** | PostgreSQL 17 | JSONB optimization, vacuum efficiency |
| **Cache** | Redis 7.4 | Sessions, cart persistence, rate limiting |
| **Auth** | JWT + HttpOnly Cookies | XSS protection via BFF pattern |
| **Payment** | Stripe Singapore | SGD currency, GrabPay, PayNow |
| **Testing** | Vitest + Playwright | Unit + E2E test coverage |

---

## 🗂️ Application Architecture

### File Hierarchy

```
cha-yuan/
├── 📁 backend/                          # Django 6 Backend
│   ├── 📄 api_registry.py               # Centralized API router registration
│   ├── 📁 apps/
│   │   ├── 📁 api/v1/                     # API endpoints (Django Ninja)
│   │   │   ├── 📄 products.py             # Product catalog API
│   │   │   ├── 📄 quiz.py                 # Preference quiz API
│   │   │   ├── 📄 cart.py                 # Shopping cart API
│   │   │   ├── 📄 checkout.py             # Stripe checkout API
│   │   │   ├── 📄 subscriptions.py        # Subscription management API
│   │   │   └── 📄 content.py              # Articles & culture content
│   │   ├── 📁 commerce/
│   │   │   ├── 📄 models.py               # Product, Order, Subscription models
│   │   │   ├── 📄 curation.py             # AI curation algorithm
│   │   │   ├── 📄 admin.py                # Django Admin customization
│   │   │   └── 📁 management/commands/      # Seed data scripts
│   │   ├── 📁 content/
│   │   │   ├── 📄 models.py               # Quiz, Article, UserPreference models
│   │   │   ├── 📄 admin.py                # Quiz admin with inline choices
│   │   │   └── 📄 seed_quiz.py            # Quiz data seeder
│   │   └── 📁 core/
│   │       ├── 📄 models.py               # User model with SG validation
│   │       ├── 📄 authentication.py       # JWT + HttpOnly cookies
│   │       └── 📁 sg/                     # Singapore utilities (GST, etc.)
│   ├── 📁 chayuan/                        # Django project config
│   │   ├── 📄 settings/                   # Environment-specific settings
│   │   └── 📄 urls.py                       # URL configuration
│   └── 📁 requirements/                   # Python dependencies
│
├── 📁 frontend/                           # Next.js 16 Frontend
│   ├── 📁 app/                            # Next.js App Router
│   │   ├── 📄 page.tsx                      # Home page (Hero)
│   │   ├── 📄 layout.tsx                    # Root layout, fonts
│   │   ├── 📄 globals.css                   # Tailwind v4 theme config
│   │   ├── 📁 api/proxy/[...path]/          # BFF proxy to Django
│   │   ├── 📁 products/
│   │   │   ├── 📄 page.tsx                    # Product catalog (Server Component)
│   │   │   └── 📁 components/
│   │   │       └── 📄 product-catalog.tsx     # Interactive catalog (Client)
│   │   ├── 📁 products/[slug]/
│   │   │   └── 📄 page.tsx                    # Product detail page
│   │   ├── 📁 quiz/
│   │   │   └── 📄 page.tsx                    # Preference quiz
│   │   ├── 📁 dashboard/subscription/
│   │   │   └── 📄 page.tsx                    # Subscription dashboard
│   │   ├── 📁 culture/
│   │   │   ├── 📄 page.tsx                    # Article listing
│   │   │   └── 📁 [slug]/
│   │   │       └── 📄 page.tsx                # Article detail
│   │   └── 📁 checkout/
│   │       └── 📄 page.tsx                    # Checkout flow
│   ├── 📁 components/
│   │   ├── 📄 product-card.tsx              # Product card component
│   │   ├── 📄 product-grid.tsx              # Grid layout with animations
│   │   ├── 📄 filter-sidebar.tsx            # Catalog filtering
│   │   └── 📄 gst-badge.tsx                 # SGD price display
│   ├── 📁 lib/
│   │   ├── 📁 api/                          # API functions
│   │   │   ├── 📄 products.ts               # Product API
│   │   │   ├── 📄 quiz.ts                   # Quiz API
│   │   │   └── 📄 cart.ts                   # Cart API
│   │   ├── 📁 types/                        # TypeScript interfaces
│   │   │   └── 📄 product.ts                # Product types
│   │   ├── 📄 auth-fetch.ts                 # BFF proxy wrapper
│   │   └── 📄 utils.ts                        # Utility functions
│   ├── 📁 public/                           # Static assets
│   └── 📄 package.json
│
├── 📁 infra/                              # Infrastructure
│   └── 📁 docker/
│       └── 📄 docker-compose.yml            # PostgreSQL 17 + Redis 7.4
│
├── 📁 docs/                               # Documentation
│   ├── 📄 MASTER_EXECUTION_PLAN.md
│   └── 📄 PHASE_7_SUBPLAN.md
│
└── 📄 .env.example                        # Environment variables template
```

### System Architecture Diagram

```mermaid
architecture-beta
    %% User Layer
    group user_grp(cloud)["User Layer"]
    service user_svc(user)["Customer"] in user_grp

    %% Client Layer
    group client_grp(server)["Client Layer"]
    service next_svc(react)["Next.js 16 App Router"] in client_grp
    service react_svc(react)["React 19 Components"] in client_grp
    service tailwind_svc(css)["Tailwind CSS v4"] in client_grp
    service motion_svc(animation)["Framer Motion"] in client_grp

    %% BFF Layer
    group bff_grp(cloud)["BFF Layer (Edge)"]
    service proxy_svc(server)["BFF Proxy Route"] in bff_grp
    service jwt_svc(lock)["JWT in HttpOnly Cookies"] in bff_grp

    %% Backend Layer
    group backend_grp(database)["Backend Layer"]
    service django_svc(python)["Django 6"] in backend_grp
    service ninja_svc(api)["Django Ninja API"] in backend_grp
    service auth_svc(lock)["PyJWT Auth"] in backend_grp
    service curation_svc(algorithm)["Curation Engine"] in backend_grp

    %% Data Layer
    group data_grp(database)["Data Layer"]
    service postgres_svc(postgres)["PostgreSQL 17"] in data_grp
    service redis_svc(redis)["Redis 7.4"] in data_grp

    %% External Services
    group external_grp(cloud)["External Services"]
    service stripe_svc(stripe)["Stripe Singapore"] in external_grp
    service storage_svc(storage)["Cloud Storage"] in external_grp

    %% Connections
    user_svc:B -- T:next_svc
    next_svc:R -- L:react_svc
    react_svc:R -- L:tailwind_svc
    react_svc:B -- T:motion_svc

    next_svc{group}:B -- T:proxy_svc{group}
    proxy_svc:R -- L:jwt_svc
    proxy_svc{group}:B -- T:ninja_svc{group}

    ninja_svc:R -- L:django_svc
    ninja_svc:B -- T:auth_svc
    django_svc:R -- L:curation_svc

    django_svc{group}:B -- T:postgres_svc{group}
    django_svc{group}:B -- T:redis_svc{group}
    django_svc{group}:B -- T:stripe_svc{group}
```

### User Journey Flow

```mermaid
flowchart TD
    A[Landing Page] --> B{Authenticated?}
    
    B -->|No| C[Browse Products]
    B -->|Yes| D[Dashboard]
    
    C --> E[Product Detail]
    E --> F[Add to Cart]
    
    F --> G{Has Account?}
    G -->|No| H[Sign Up / Login]
    G -->|Yes| I[Checkout]
    
    H --> J[Complete Quiz]
    J --> K[View Preferences]
    K --> I
    
    I --> L[Stripe Checkout]
    L --> M{Payment Success?}
    M -->|Yes| N[Order Confirmation]
    M -->|No| O[Payment Failed]
    
    N --> P[Order History]
    
    D --> Q[Subscription Dashboard]
    Q --> R[View Next Box]
    R --> S[Pause/Cancel Subscription]
    
    C --> T[Filter by Category]
    C --> U[Filter by Origin]
    C --> V[Filter by Season]
    
    D --> W[View Preferences]
    D --> X[Update Profile]
```

### Application Logic Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant NextJS as Next.js 16
    participant BFF as BFF Proxy
    participant Django as Django API
    participant DB as PostgreSQL
    participant Redis

    %% Product Catalog Flow
    rect rgb(240, 255, 240)
        Note over User,Django: Product Catalog Flow
        User->>Browser: Navigate to /products
        Browser->>NextJS: Request page
        NextJS->>Django: GET /api/v1/products/products/
        Django->>DB: Query products
        DB-->>Django: Return products
        Django-->>NextJS: JSON response
        NextJS->>NextJS: Server Component renders HTML
        NextJS-->>Browser: HTML + Hydration
        Browser-->>User: Display product grid
    end

    %% Quiz Flow
    rect rgb(255, 245, 240)
        Note over User,Django: Preference Quiz Flow
        User->>Browser: Answer quiz questions
        Browser->>BFF: POST /api/proxy/api/v1/quiz/submit/
        BFF->>Django: Forward with JWT
        Django->>Django: Calculate preferences (weighted scoring)
        Django->>DB: Save UserPreference
        DB-->>Django: Saved
        Django-->>BFF: Top 3 categories + scores
        BFF-->>Browser: JSON response
        Browser-->>User: Show preference summary
    end

    %% Subscription Curation Flow
    rect rgb(240, 240, 255)
        Note over User,Django: Monthly Curation Flow
        Note over Django: Cron job triggers monthly
        Django->>DB: Get active subscriptions
        loop Each subscription
            Django->>DB: Get user preferences
            Django->>Django: curate_subscription_box()
            Django->>Django: get_current_season_sg()
            Django->>Django: score_products() - weighted algorithm
            Django->>DB: Save next_curation_override
        end
    end

    %% Cart Flow
    rect rgb(255, 255, 240)
        Note over User,Redis: Shopping Cart Flow
        User->>Browser: Add to cart
        Browser->>BFF: POST /api/v1/cart/add/
        BFF->>Django: Forward request
        Django->>Redis: HSET cart:{cart_id} product_id quantity
        Redis-->>Django: OK
        Django-->>BFF: Cart updated
        BFF-->>Browser: Response
        Browser-->>User: Update cart UI
    end

    %% Checkout Flow
    rect rgb(240, 255, 255)
        Note over User,Stripe: Checkout Flow
        User->>Browser: Proceed to checkout
        Browser->>BFF: POST /api/v1/checkout/create-session/
        BFF->>Django: Forward request
        Django->>Stripe: create_checkout_session()
        Stripe-->>Django: Session URL
        Django-->>BFF: Redirect URL
        BFF-->>Browser: 302 to Stripe
        Browser-->>User: Redirect to Stripe
        User->>Stripe: Complete payment
        Stripe->>Django: Webhook payment_intent.succeeded
        Django->>DB: Create Order
        Django->>Redis: Clear cart
    end
```

### Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ USER_PREFERENCE : has
    USER ||--o{ ADDRESS : has_many
    USER ||--o{ SUBSCRIPTION : subscribes_to
    USER ||--o{ ORDER : places
    
    USER_PREFERENCE {
        int user_id PK,FK
        json preferences
        datetime quiz_completed_at
    }
    
    ADDRESS {
        int id PK
        int user_id FK
        string block_street
        string unit
        string postal_code
        boolean is_default
    }
    
    TEA_CATEGORY ||--o{ PRODUCT : categorizes
    TEA_CATEGORY {
        int id PK
        string name
        string slug
        int fermentation_level
        string description
        int brewing_temp_celsius
        int brewing_time_seconds
    }
    
    ORIGIN ||--o{ PRODUCT : sources
    ORIGIN {
        int id PK
        string name
        string slug
        string region
        string description
    }
    
    PRODUCT {
        int id PK
        string name
        string slug
        decimal price_sgd
        boolean gst_inclusive
        int stock
        int category_id FK
        int origin_id FK
        string harvest_season
        int harvest_year
        boolean is_subscription_eligible
    }
    
    SUBSCRIPTION ||--o{ SUBSCRIPTION_SHIPMENT : receives
    SUBSCRIPTION {
        int id PK
        int user_id FK
        string plan
        decimal price_sgd
        json next_curation_override
        datetime next_billing_date
    }
    
    SUBSCRIPTION_SHIPMENT }o--o{ PRODUCT : contains
    SUBSCRIPTION_SHIPMENT {
        int id PK
        int subscription_id FK
        datetime shipped_at
        string tracking_number
        string curated_by
    }
    
    ORDER ||--o{ ORDER_ITEM : contains
    ORDER {
        int id PK
        int user_id FK
        string status
        decimal total_sgd
        decimal gst_amount_sgd
        string stripe_payment_intent_id
        datetime created_at
    }
    
    ORDER_ITEM }o--|| PRODUCT : references
    ORDER_ITEM {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal price_sgd_at_time
    }
    
    QUIZ_QUESTION ||--o{ QUIZ_CHOICE : has
    QUIZ_QUESTION {
        int id PK
        string question_text
        int order
        boolean is_required
    }
    
    QUIZ_CHOICE {
        int id PK
        int question_id FK
        string choice_text
        json preference_weights
        int order
    }
```

---

## ✨ Features

### Implemented Phases

| Phase | Feature | Status |
|-------|---------|--------|
| **0** | Foundation & Docker Setup | ✅ Complete |
| **1** | Backend Models (User, Product, Order) | ✅ Complete |
| **2** | JWT Authentication + BFF | ✅ Complete |
| **3** | Design System (Tailwind v4 + shadcn) | ✅ Complete |
| **4** | Product Catalog | ✅ Complete |
| **5** | Cart & Checkout | ✅ Complete |
| **6** | Tea Culture Content | ✅ Complete |
| **7** | Quiz & Subscription | ✅ Complete |
| **8** | Testing & Deployment | 🚧 In Progress |

### Core Features

- 🧭 **Hero Landing Page**: Storytelling with Eastern aesthetic
- 🛍️ **Product Catalog**: Filter by category, origin, fermentation, season
- 📝 **Preference Quiz**: Weighted scoring algorithm for personalized recommendations
- 🎁 **Subscription Service**: Monthly curated boxes with auto-curation
- 🛒 **Shopping Cart**: Redis-backed persistent cart
- 💳 **Stripe Checkout**: Singapore integration (SGD, GrabPay, PayNow)
- 📚 **Tea Culture Content**: Brewing guides, tasting notes, history articles
- 👤 **User Dashboard**: Subscription management, order history
- 🎨 **Eastern Design**: Tea brand colors, serif typography, paper textures

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20.0.0
- **Python** ≥ 3.12
- **PostgreSQL** 17
- **Redis** 7.4

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-org/cha-yuan.git
cd cha-yuan
```

2. **Set up environment variables**

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start Docker services** (PostgreSQL + Redis)

```bash
cd infra/docker
docker-compose up -d
```

4. **Set up Backend**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements/development.txt
python manage.py migrate
python manage.py seed_products
python manage.py seed_quiz
```

5. **Set up Frontend**

```bash
cd frontend
npm install
```

### Running the Application

**Development Mode** (requires both servers):

```bash
# Terminal 1: Start Django
npm run dev:backend

# Terminal 2: Start Next.js
npm run dev:frontend
```

**Access the application:**
- Frontend: http://localhost:3000
- Django Admin: http://localhost:8000/admin/
- API Docs: http://localhost:8000/docs/

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
python -m pytest --cov=apps --cov-report=html -v
```

### Frontend Tests

```bash
cd frontend
npm test              # Unit tests (Vitest)
npm run test:e2e      # E2E tests (Playwright)
```

### Test Coverage

- **Backend**: Target 85%+ coverage (pytest)
- **Frontend**: Target 85%+ coverage (Vitest)
- **E2E**: Critical user journeys (Playwright)

---

## 🚢 Deployment

### Docker Production Setup

```bash
cd infra/docker
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables (Production)

```bash
# Required
SECRET_KEY=your-production-secret-key
DATABASE_URL=postgresql://user:pass@host:5432/chayuan
REDIS_URL=redis://host:6379/0
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Singapore Context
GST_RATE=0.09
CURRENCY=SGD
TIMEZONE=Asia/Singapore
LOCALE=en_SG
```

### Vercel Deployment (Frontend)

```bash
# Build
npm run build

# Deploy
vercel --prod
```

### Security Checklist

- [ ] JWT tokens in HttpOnly cookies only
- [ ] CSRF protection enabled
- [ ] Rate limiting on API endpoints (Redis-based)
- [ ] SQL injection prevention (Django ORM)
- [ ] XSS prevention (Output encoding)
- [ ] Content Security Policy headers
- [ ] Stripe webhook signature verification
- [ ] PDPA compliance audit

---

## 📝 API Documentation

### Authentication

All protected endpoints require JWT in HttpOnly cookie (via BFF proxy).

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/products/products/` | GET | List products with filters |
| `/api/v1/products/{slug}/` | GET | Product detail |
| `/api/v1/quiz/questions/` | GET | Quiz questions (public) |
| `/api/v1/quiz/submit/` | POST | Submit quiz answers |
| `/api/v1/cart/` | GET | Get cart items |
| `/api/v1/cart/add/` | POST | Add item to cart |
| `/api/v1/checkout/create-session/` | POST | Create Stripe session |
| `/api/v1/subscriptions/current/` | GET | Get subscription |

Full API documentation available at `/docs/` when running locally.

---

## 🎨 Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-tea-500` | `#5C8A4D` | Primary brand color |
| `--color-tea-600` | `#4A7040` | Primary hover |
| `--color-ivory-50` | `#FDFBF7` | Page background |
| `--color-bark-900` | `#2A1D14` | Text primary |
| `--color-gold-500` | `#B8944D` | Accent, prices |

### Typography

- **Display**: "Playfair Display", serif (headings)
- **Sans**: "Inter", system-ui (body)
- **Chinese**: "Noto Serif SC", serif (茶源 branding)

---

## 🤝 Contributing

We follow **Test-Driven Development (TDD)**:

1. **RED**: Write failing test
2. **GREEN**: Write minimal code to pass
3. **REFACTOR**: Improve while keeping tests green

See `docs/` for detailed phase plans and architecture decisions.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

### Singapore Market Compliance

- **PDPA**: Personal Data Protection Act compliance
- **GST**: 9% Goods and Services Tax included in all prices
- **IRAS**: Pricing calculations follow IRAS guidelines

---

## 🙏 Acknowledgments

- **茶源 (CHA YUAN)** means "Tea Source" - honoring the origins of tea
- Premium tea gardens: Hangzhou, Fujian, Alishan, Darjeeling, Uji, Yunnan
- Built with ❤️ for tea lovers in Singapore

---

<div align="center">

**[Visit CHA YUAN](https://cha-yuan.sg)** · 
**[Documentation](docs/)** · 
**[Report Bug](../../issues)** · 
**[Request Feature](../../issues)**

🍵 *Brew with intention. Sip with mindfulness.* 🍵

</div>
