# CHA YUAN (茶源) - Comprehensive Agent Brief

**Version:** 2.0.0 | **Last Updated:** 2026-04-20 | **Phase:** 8 (Testing & Deployment)

---

## 📋 Executive Summary

This document serves as the **definitive source of truth** for understanding the CHA YUAN (茶源) premium tea e-commerce platform. It synthesizes all project documentation, codebase architecture, implementation patterns, and historical context to enable any new coding agent to immediately understand the WHAT, WHY, and HOW of the project without requiring additional code review.

### Project Identity

| Attribute | Value |
|-----------|-------|
| **Name** | CHA YUAN (茶源) - "Tea Source" |
| **Market** | Singapore exclusively (single-region) |
| **Type** | Premium tea e-commerce with subscription model |
| **Core Problem** | Overwhelming tea selection without guidance; quality uncertainty; lack of personalization |
| **Core Solution** | Preference-based quiz + monthly curated tea boxes + educational content |
| **Status** | Phase 8 - Core functionality complete, production-ready pending final tests |

---

## 🍵 WHAT: Project Definition & Scope

### Core Features Implemented

1. **Hero Landing** - Eastern aesthetic storytelling with tea garden imagery, animated steam wisps, scroll reveal effects
2. **Product Catalog** - Browse by origin (Fujian, Yunnan, Taiwan, etc.), fermentation level (White/Green/Oolong/Black/Pu'erh), season (Spring/Summer/Autumn/Winter)
3. **Preference Quiz** - One-time onboarding with weighted scoring algorithm (60% preference + 30% season + 10% inventory)
4. **Subscription Service** - Monthly curated boxes with 3 tiers:
   - Discovery Box: $29/mo (3 teas)
   - Connoisseur Box: $49/mo (4 teas) - Popular
   - Master's Reserve: $79/mo (5 teas, aged & limited)
5. **Shopping Cart** - Redis-backed persistent cart with 30-day TTL, anonymous-to-authenticated merge
6. **Checkout** - Stripe Singapore integration (SGD, GrabPay, PayNow), shipping address collection
7. **Tea Culture Content** - Brewing guides, tasting notes, historical articles
8. **User Dashboard** - Subscription management, order history, preference viewing

### Visual Strategy (from Project Requirements)

**Color Palette:**
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-tea-500` | `#5C8A4D` | Primary brand color |
| `--color-tea-600` | `#4A7040` | Primary hover state |
| `--color-ivory-50` | `#FDFBF7` | Page background |
| `--color-ivory-100` | `#FAF6EE` | Paper texture background |
| `--color-terra-300` | `#D99068` | Accent/warmth |
| `--color-terra-400` | `#C4724B` | Warm accents |
| `--color-bark-700` | `#4A3728` | Dark text secondary |
| `--color-bark-800` | `#3D2B1F` | Text primary |
| `--color-bark-900` | `#2A1D14` | Dark backgrounds |
| `--color-gold-300` | `#D4B96A` | Premium highlight |
| `--color-gold-400` | `#C5A55A` | Accent, prices, CTAs |
| `--color-gold-500` | `#B8944D` | Premium CTAs |

**Typography:**
- **Display:** "Playfair Display", serif (headings, brand names)
- **Sans:** "Inter", system-ui (body text, UI elements)
- **Chinese:** "Noto Serif SC", serif (茶源 branding)

**Page Structure (10 sections):**
1. **Hero Section** - Full-screen tea garden photo with gradient overlay, floating leaf animations, animated steam wisps, scroll indicator
2. **Philosophy Section** - Split layout with ceremony image (steam animation), heritage badge (130+ years), 4 value icons (Single Origin, Hand Crafted, Organic, Sustainable)
3. **Collection Section** - 3-tab interface (By Origin / Fermentation / Season) with product cards
4. **Tea Culture Section** - Dark section with 3 overlay cards (Brewing Methods, Tasting Notes, History) + temperature guide strip (80°C Green, 95°C Oolong, 100°C Black/Pu'erh, 75°C White)
5. **Macro Feature** - Leaf texture close-up with terroir storytelling
6. **Subscription Section** - 3-tier pricing with highlighted popular option, feature list
7. **Testimonials** - 3 community quotes with gold star ratings
8. **Shop CTA** - Green tea-colored call to action with trust badges (Free Shipping $50+, 100% Organic, Sustainably Sourced, Fair Trade)
9. **Newsletter** - Functional email subscription form
10. **Footer** - 4-column layout (Brand, Shop, Learn, Company) with social links

**Functional Interactions (from mockup):**
- Tab switching for product organization
- Mobile hamburger menu with smooth toggle
- Navbar transparency → frosted glass on scroll
- Scroll-reveal animations via IntersectionObserver
- Toast notifications for subscriptions
- Back-to-top button appears on scroll
- All buttons have active scale feedback

---

## 🎯 WHY: Architecture Decisions & Rationale

### Technology Stack Selection

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| **Frontend** | Next.js | 16.2+ | App Router for SEO; Server Components for static content; Turbopack |
| **Framework** | React | 19+ | Concurrent features; Server Actions; No `forwardRef` (treats ref as standard prop) |
| **Backend** | Django | 6.0+ | Python 3.12+; Async support; Rapid API development |
| **API** | Django Ninja | 1.6+ | Pydantic v2 validation; Centralized Registry pattern |
| **Database** | PostgreSQL | 17 | JSONB optimization; vacuum efficiency |
| **Cache** | Redis | 7.4 | Cart persistence (30 days); Sessions; Rate limiting |
| **Styling** | Tailwind CSS | v4 | CSS-first theming; OKLCH colors; Lightning CSS; NO `tailwind.config.js` |
| **UI Library** | Radix UI + shadcn | Latest | Accessible primitives; wrap/modify for bespoke styling |
| **Animation** | Framer Motion | 12.38+ | Smooth micro-interactions; `useReducedMotion()` for accessibility |
| **State** | TanStack Query | 5.99+ | Server state management; Cache invalidation |
| **Validation** | Zod | 4+ | Runtime validation; form schemas |
| **Payment** | Stripe | 14.4+ | Singapore integration (GrabPay, PayNow); SGD currency |
| **Testing** | Vitest + Playwright | Latest | Unit + E2E test coverage |

### Singapore Market Requirements

**GST 9%:**
- Hardcoded as `Decimal('0.09')` in backend (`GST_RATE = Decimal('0.09')`)
- All public prices displayed inclusive of GST
- Calculation follows IRAS guidelines with `ROUND_HALF_UP`
- Methods: `get_price_with_gst()`, `get_gst_amount()`

**Currency:**
- SGD only (hardcoded throughout)
- Display format: `$48.00` with "incl. GST" indicator
- Formatter: `Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' })`

**PDPA Compliance:**
- User model includes `pdpa_consent_at` timestamp
- Consent tracking mandatory for all users
- Checkbox on signup: "I consent to PDPA terms"

**Address Format:**
```
Block/Street: "Blk 123 Jurong East St 13"
Unit: "#04-56"
Postal Code: 6-digit (validated with regex ^\d{6}$)
Full: "Blk 123 Jurong East St 13 #04-56 Singapore 600123"
```

**Phone Format:**
```
+65 XXXX XXXX (validated with regex ^\+65\s?\d{8}$)
Examples: +65 9123 4567, +6591234567
```

**Timezone:**
- All operations use `Asia/Singapore` (SGT)
- Django: `TIME_ZONE = "Asia/Singapore"`
- JavaScript: `Intl.DateTimeFormat("en-SG", { timeZone: "Asia/Singapore" })`

---

## 🏗️ HOW: Architecture Patterns & Implementation

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ CHA YUAN ARCHITECTURE                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│   ┌──────────────┐     ┌──────────────────────────────┐        │
│   │ FRONTEND     │────▶│ BACKEND                      │        │
│   │              │     │                              │        │
│   │ Next.js 16   │────▶│ Django 6 + Ninja API         │        │
│   │ React 19     │ /api/│                              │        │
│   │ Tailwind v4  │ Proxy│ PostgreSQL 17 | Redis 7.4    │        │
│   └──────────────┘     └──────────────────────────────┘        │
│         │                          │                           │
│         │                          │                           │
│   ┌─────▼──────────────────┐        │                           │
│   │ JWT + HttpOnly Cookies│◀───────┘                           │
│   └───────────────────────┘                                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Pattern 1: BFF (Backend for Frontend)

**Location:** `frontend/app/api/proxy/[...path]/route.ts`

**Purpose:** Secure JWT handling via HttpOnly cookies; hides backend URL from client

**Flow:**
```
Client Component → /api/proxy/api/v1/* → Django API
                      ↓
              Extract JWT from cookie
                      ↓
              Forward with Authorization header
```

**Critical Rules:**
- Frontend NEVER stores JWT in localStorage
- Always uses BFF proxy for authenticated requests
- Server Components can call backend directly via `authFetch`
- Client Components must route through `/api/proxy/*`

### Pattern 2: Centralized API Registry (CRITICAL)

**Location:** `backend/api_registry.py`

**Purpose:** Eager router registration at import time (NOT in `ready()` method)

**Why This Pattern:**
- Django Ninja routers must be registered before URL resolution
- `AppConfig.ready()` runs too late in the lifecycle
- Prevents circular imports
- Ensures endpoints registered when Django starts

**Implementation:**
```python
# api_registry.py - Eager registration at module level
from ninja import NinjaAPI

api = NinjaAPI(
    title="CHA YUAN API",
    version="1.0.0",
    description="Premium Tea E-Commerce API for Singapore",
    docs_url="/docs/",
    openapi_url="/openapi.json",
)

# Import and register at module load time
from apps.api.v1.products import router as products_router
api.add_router("/products/", products_router, tags=["products"])

from apps.api.v1.cart import router as cart_router
api.add_router("/cart/", cart_router, tags=["cart"])

# etc...
```

**Router Endpoint Pattern - RELATIVE PATHS:**
```python
# products.py - Router mounted at /products/ in api_registry.py
router = Router(tags=["products"])

@router.get("/")        # NOT "/products/" - Results in /api/v1/products/
@router.get("/{slug}/") # NOT "/products/{slug}/" - Results in /api/v1/products/{slug}/
```

### Pattern 3: Server-First Design

**Server Components (RSC):**
- Product listing pages (`/products/page.tsx`)
- Product detail pages (`/products/[slug]/page.tsx`)
- Article content pages (`/culture/page.tsx`, `/culture/[slug]/page.tsx`)
- SEO-critical content

**Client Components:**
- Cart interactions (`CartDrawer`)
- Quiz interface (`QuizPage`, `QuizQuestion`, `QuizResults`)
- Filter sidebars (`FilterSidebar`)
- Product tabs (tab switching)
- Forms with state (subscription management)

### Pattern 4: Next.js 15+ Async Params

**CRITICAL:** Page params are `Promise<>` in Next.js 15+

```typescript
// CORRECT (Next.js 15+)
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;  // MUST await before accessing
  const product = await getProductBySlug(slug);
  // ...
}

// INCORRECT (pre-Next.js 15)
export default function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;  // This will fail in Next.js 15+
}
```

### Pattern 5: Tailwind CSS v4 CSS-First

**Location:** `frontend/app/globals.css`

**Key Points:**
- NO `tailwind.config.js` - all configuration in CSS
- CSS-first theming with `@theme` block
- OKLCH color space for perceptual uniformity
- Lightning CSS for compilation

```css
/* globals.css */
@import "tailwindcss";

@theme {
  /* Custom Colors - Tea Brand Palette */
  --color-tea-50: #f4f7f1;
  --color-tea-100: #e6ede0;
  --color-tea-200: #cddbc2;
  --color-tea-300: #a8c290;
  --color-tea-400: #7da35e;
  --color-tea-500: #5C8A4d;
  --color-tea-600: #4a7040;
  --color-tea-700: #3b5a34;
  --color-tea-800: #31482c;
  --color-tea-900: #2a3d26;
  --color-tea-950: #141f12;

  --color-ivory-50: #FDFBF7;
  --color-ivory-100: #FAF6EE;
  --color-ivory-200: #F5F0E8;
  --color-ivory-300: #EDE5D8;
  --color-ivory-400: #E0D4C3;
  --color-ivory-500: #D1C1AA;

  --color-terra-300: #D99068;
  --color-terra-400: #C4724B;
  --color-terra-500: #B5613F;
  --color-terra-600: #A04E32;
  --color-terra-700: #86402B;

  --color-bark-700: #4A3728;
  --color-bark-800: #3D2B1F;
  --color-bark-900: #2A1D14;

  --color-gold-300: #D4B96A;
  --color-gold-400: #C5A55A;
  --color-gold-500: #B8944D;
  --color-gold-600: #A07E3C;

  /* Typography */
  --font-sans: "Inter", system-ui, sans-serif;
  --font-serif: "Playfair Display", Georgia, serif;
  --font-chinese: "Noto Serif SC", serif;

  /* Spacing */
  --spacing-18: 4.5rem;
  --spacing-88: 22rem;
}

@layer base {
  * {
    @apply border-ivory-300;
  }
  body {
    @apply bg-ivory-100 text-bark-900 font-sans;
  }
}
```

### Pattern 6: Curation Algorithm (60/30/10)

**Location:** `backend/apps/commerce/curation.py`

**Purpose:** Score products for subscription boxes based on user preferences

**Algorithm:**
1. **User Preferences (60%)**: Based on one-time onboarding quiz scores (0-100 per category)
2. **Seasonality (30%)**: Matches tea harvest cycles to current Singapore season
   - Spring: March-May
   - Summer: June-August
   - Autumn: September-November
   - Winter: December-February
3. **Inventory (10%)**: Boosts products with healthy stock levels to ensure fulfillment

**Key Functions:**
```python
# Get current season in Singapore
def get_current_season_sg() -> str:
    sg_now = datetime.now(timezone('Asia/Singapore'))
    month = sg_now.month
    if 3 <= month <= 5: return 'spring'
    elif 6 <= month <= 8: return 'summer'
    elif 9 <= month <= 11: return 'autumn'
    else: return 'winter'

# Score products for curation
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

### Pattern 7: Shopping Cart (Redis-Backed)

**Location:** `backend/apps/commerce/cart.py`

**Features:**
- Persistent storage in Redis with 30-day TTL
- Anonymous cart merges with authenticated cart on login
- Atomic operations using Redis HINCRBY

```python
# Cart operations
def get_cart_id(request) -> str:
    cart_id = request.COOKIES.get('cart_id')
    if not cart_id:
        cart_id = str(uuid.uuid4())
    return cart_id

def add_to_cart(cart_id: str, product_id: int, quantity: int) -> bool:
    """Add item to Redis cart with atomic operations."""
    key = f"cart:{cart_id}"
    current = redis_client.hincrby(key, product_id, quantity)
    if current == quantity:  # First addition
        redis_client.expire(key, CART_TTL)  # 30 days
    return True

def merge_anonymous_cart(anonymous_id: str, user_id: int) -> str:
    """Merge anonymous cart with user cart on login."""
    anon_key = f"cart:{anonymous_id}"
    user_key = f"cart:user:{user_id}"
    # Atomic merge logic
    return user_key
```

---

## 🗂️ Complete Project Structure

```
/home/project/tea-culture/cha-yuan/
│
├── 📁 backend/                    # Django 6 Backend
│   ├── 📄 api_registry.py         # CRITICAL: Centralized API router (eager registration)
│   ├── 📁 apps/
│   │   ├── 📁 api/
│   │   │   ├── 📁 v1/             # API endpoints (Django Ninja)
│   │   │   │   ├── 📄 __init__.py
│   │   │   │   ├── 📄 products.py     # Product catalog API
│   │   │   │   ├── 📄 cart.py         # Shopping cart API
│   │   │   │   ├── 📄 checkout.py     # Stripe checkout API
│   │   │   │   ├── 📄 content.py      # Articles & culture content
│   │   │   │   ├── 📄 quiz.py         # Preference quiz API
│   │   │   │   └── 📄 subscriptions.py # Subscription management API
│   │   │   └── 📁 tests/
│   │   │       ├── 📄 __init__.py
│   │   │       ├── 📄 test_router_registration.py
│   │   │       └── 📄 ...
│   │   │
│   │   ├── 📁 commerce/           # Product & Commerce
│   │   │   ├── 📄 __init__.py
│   │   │   ├── 📄 models.py         # Product, Origin, TeaCategory, Subscription, Order
│   │   │   ├── 📄 admin.py          # Django Admin customization
│   │   │   ├── 📄 cart.py           # Redis cart service
│   │   │   ├── 📄 curation.py       # AI curation algorithm
│   │   │   ├── 📄 stripe_sg.py      # Singapore Stripe integration
│   │   │   └── 📁 management/
│   │   │       └── 📁 commands/
│   │   │           ├── 📄 __init__.py
│   │   │           └── 📄 seed_products.py  # Seed 12 premium teas
│   │   │
│   │   ├── 📁 content/             # Content & Quiz
│   │   │   ├── 📄 __init__.py
│   │   │   ├── 📄 models.py         # QuizQuestion, QuizChoice, UserPreference, Article
│   │   │   ├── 📄 admin.py          # Quiz admin with inline choices
│   │   │   └── 📁 management/
│   │   │       └── 📁 commands/
│   │   │           ├── 📄 __init__.py
│   │   │           └── 📄 seed_quiz.py       # Seed 6 quiz questions
│   │   │
│   │   └── 📁 core/                 # Users & Auth
│   │       ├── 📄 __init__.py
│   │       ├── 📄 models.py         # User model with SG validation
│   │       ├── 📄 authentication.py # JWT + HttpOnly cookies
│   │       ├── 📄 admin.py          # User admin
│   │       └── 📁 sg/               # Singapore utilities
│   │           ├── 📄 __init__.py
│   │           ├── 📄 validators.py # Phone, postal code validation
│   │           └── 📄 pricing.py    # GST calculation
│   │
│   ├── 📁 chayuan/                 # Django Project Config
│   │   ├── 📄 __init__.py
│   │   ├── 📄 urls.py              # URL configuration (imports from api_registry)
│   │   ├── 📄 wsgi.py
│   │   ├── 📄 asgi.py
│   │   └── 📁 settings/
│   │       ├── 📄 __init__.py
│   │       ├── 📄 base.py          # Base settings
│   │       ├── 📄 development.py
│   │       └── 📄 production.py
│   │
│   ├── 📁 requirements/            # Python Dependencies
│   │   ├── 📄 base.txt
│   │   ├── 📄 development.txt
│   │   └── 📄 production.txt
│   │
│   ├── 📄 manage.py
│   ├── 📄 pytest.ini
│   └── 📄 .env.example
│
├── 📁 frontend/                   # Next.js 16 Frontend
│   ├── 📁 app/                    # App Router
│   │   ├── 📁 (routes)/           # Logic-grouped routes
│   │   │   ├── 📁 products/
│   │   │   │   ├── 📄 page.tsx            # Product listing (Server Component)
│   │   │   │   ├── 📁 [slug]/
│   │   │   │   │   └── 📄 page.tsx        # Product detail (Dynamic)
│   │   │   │   └── 📁 components/
│   │   │   │       └── 📄 product-catalog.tsx
│   │   │   │
│   │   │   ├── 📁 culture/
│   │   │   │   ├── 📄 page.tsx
│   │   │   │   └── 📁 [slug]/
│   │   │   │       └── 📄 page.tsx        # Article detail
│   │   │   │
│   │   │   ├── 📁 quiz/
│   │   │   │   ├── 📄 page.tsx            # Quiz intro
│   │   │   │   └── 📁 components/
│   │   │   │       ├── 📄 quiz-intro.tsx
│   │   │   │       ├── 📄 quiz-question.tsx
│   │   │   │       └── 📄 quiz-results.tsx
│   │   │   │
│   │   │   ├── 📁 cart/
│   │   │   │   └── 📄 page.tsx
│   │   │   │
│   │   │   ├── 📁 checkout/
│   │   │   │   ├── 📄 page.tsx
│   │   │   │   ├── 📁 success/
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   └── 📁 cancel/
│   │   │   │       └── 📄 page.tsx
│   │   │   │
│   │   │   ├── 📁 dashboard/
│   │   │   │   └── 📁 subscription/
│   │   │   │       ├── 📄 page.tsx
│   │   │   │       └── 📁 components/
│   │   │   │           ├── 📄 subscription-status.tsx
│   │   │   │           ├── 📄 next-billing.tsx
│   │   │   │           ├── 📄 next-box-preview.tsx
│   │   │   │           ├── 📄 preference-summary.tsx
│   │   │   │           └── 📄 cancel-subscription.tsx
│   │   │   │
│   │   │   └── 📁 shop/
│   │   │       └── 📄 page.tsx            # Redirects to /products
│   │   │
│   │   ├── 📁 api/
│   │   │   └── 📁 proxy/
│   │   │       └── 📁 [...path]/
│   │   │           └── 📄 route.ts         # BFF Proxy Route
│   │   │
│   │   ├── 📄 layout.tsx
│   │   ├── 📄 page.tsx                    # Home page
│   │   ├── 📄 globals.css                 # Tailwind v4 theme
│   │   └── 📄 providers.tsx                 # QueryClientProvider
│   │
│   ├── 📁 components/               # UI Components
│   │   ├── 📁 ui/                   # shadcn primitives
│   │   │   ├── 📄 button.tsx
│   │   │   ├── 📄 input.tsx
│   │   │   ├── 📄 label.tsx
│   │   │   ├── 📄 sheet.tsx
│   │   │   ├── 📄 scroll-area.tsx
│   │   │   ├── 📄 separator.tsx
│   │   │   └── 📄 ...
│   │   │
│   │   ├── 📁 sections/             # Page sections
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
│   ├── 📁 lib/                    # Utilities
│   │   ├── 📁 api/                # API functions
│   │   │   ├── 📄 products.ts     # Product API
│   │   │   ├── 📄 quiz.ts         # Quiz API
│   │   │   └── 📄 subscription.ts # Subscription API
│   │   │
│   │   ├── 📁 types/              # TypeScript interfaces
│   │   │   ├── 📄 product.ts
│   │   │   ├── 📄 quiz.ts
│   │   │   └── 📄 subscription.ts
│   │   │
│   │   ├── 📁 hooks/              # Custom hooks
│   │   │   └── 📄 use-subscription.ts
│   │   │
│   │   ├── 📄 auth-fetch.ts       # BFF wrapper
│   │   ├── 📄 animations.ts       # Framer Motion variants
│   │   └── 📄 utils.ts            # Utility functions
│   │
│   ├── 📁 public/                 # Static assets
│   │   └── 📁 images/
│   │
│   ├── 📄 next.config.ts
│   ├── 📄 postcss.config.mjs
│   ├── 📄 tsconfig.json
│   ├── 📄 package.json
│   └── 📄 .env.example
│
├── 📁 infra/                      # Infrastructure
│   └── 📁 docker/
│       ├── 📄 docker-compose.yml
│       ├── 📄 Dockerfile.backend.dev
│       └── 📄 Dockerfile.frontend.dev
│
├── 📁 docs/                       # Documentation
│   ├── 📄 PHASE_0_SUBPLAN.md
│   ├── 📄 PHASE_1_SUBPLAN.md
│   ├── 📄 PHASE_2_SUBPLAN.md
│   ├── 📄 PHASE_3_SUBPLAN.md
│   ├── 📄 PHASE_4_SUBPLAN.md
│   ├── 📄 PHASE_4_REMAINING_SUBPLAN.md
│   ├── 📄 PHASE_5_SUBPLAN.md
│   ├── 📄 PHASE_6_SUBPLAN.md
│   ├── 📄 PHASE_7_SUBPLAN.md
│   ├── 📄 TASK_7.2.4_SUBPLAN.md
│   ├── 📄 TASK_7.3.1_SUBPLAN.md
│   ├── 📄 TASK_7.4.1_SUBPLAN.md
│   └── 📄 Project_Architecture_Document.md
│
├── 📁 plan/                       # Planning documents
│   ├── 📄 MASTER_EXECUTION_PLAN.md
│   ├── 📄 Project_Requirements_Document.md
│   ├── 📄 status_new.md
│   ├── 📄 status_8.md
│   └── 📄 ...
│
├── 📄 README.md
├── 📄 CLAUDE.md                   # Agent briefing (concise)
├── 📄 AGENT_BRIEF.md             # This comprehensive document
├── 📄 PROJECT_KNOWLEDGE_BASE.md   # Technical knowledge base
├── 📄 AGENTS.md                   # Project-specific agent context
└── 📄 .env.example
```

---

## 🔌 Complete API Endpoint Reference

### Public Endpoints (No Auth Required)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/products/` | GET | No | List products with filters (category, origin, fermentation, season) |
| `/api/v1/products/{slug}/` | GET | No | Product detail with related products |
| `/api/v1/products/categories/` | GET | No | Tea categories with counts |
| `/api/v1/products/origins/` | GET | No | Tea origins |
| `/api/v1/content/articles/` | GET | No | Articles list |
| `/api/v1/content/articles/{slug}/` | GET | No | Article detail |
| `/api/v1/content/categories/` | GET | No | Article categories |
| `/api/v1/quiz/questions/` | GET | No | Quiz questions (choices exposed, weights hidden) |
| `/api/v1/checkout/config/` | GET | No | Stripe publishable key |

### Authenticated Endpoints (JWT Required)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/cart/` | GET | Get cart contents |
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
| `/api/v1/auth/me/` | GET | Current user profile |
| `/api/v1/auth/login/` | POST | Login (sets HttpOnly cookies) |
| `/api/v1/auth/logout/` | POST | Logout (clears cookies) |
| `/api/v1/auth/refresh/` | POST | Refresh access token |

---

## 🧪 Testing Strategy & Commands

### Backend Tests (Pytest)

```bash
cd /home/project/tea-culture/cha-yuan/backend

# Run all tests
pytest -v

# Run specific test modules
pytest apps/content/tests/test_quiz_scoring.py -v
pytest apps/content/tests/test_quiz_api.py -v
pytest apps/commerce/tests/test_curation.py -v
pytest apps/commerce/tests/test_cart.py -v

# Run with coverage
pytest --cov=apps --cov-report=html -v
```

**Test Status (Verified):**
- test_quiz_scoring.py: 17/17 tests passing
- test_quiz_api.py: 24/24 tests passing
- test_curation.py: 33/33 tests passing
- test_admin_curation.py: 19/19 tests passing
- **Total: 93 backend tests passing**

### Frontend Tests (Vitest + Playwright)

```bash
cd /home/project/tea-culture/cha-yuan/frontend

# Unit tests
npm test

# E2E tests
npm run test:e2e

# TypeScript check
npm run typecheck

# Build verification
npm run build
```

**Test Status (Verified):**
- Unit tests: 39/39 tests passing
- TypeScript strict mode: Clean (0 errors)
- Production build: Successful (10 pages generated)

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

### Complete Environment Setup

```bash
# 1. Start Infrastructure (PostgreSQL 17 + Redis 7.4)
cd /home/project/tea-culture/cha-yuan/infra/docker
docker-compose up -d

# Verify services
pg_isready -h 127.0.0.1 -p 5432  # Should return "accepting connections"
redis-cli -h 127.0.0.1 -p 6379 ping  # Should return "PONG"

# 2. Backend Setup
cd /home/project/tea-culture/cha-yuan/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements/development.txt

# Database setup
python manage.py migrate --settings=chayuan.settings.development

# Seed test data
python manage.py seed_products --settings=chayuan.settings.development  # 12 products
python manage.py seed_quiz --settings=chayuan.settings.development      # 6 quiz questions

# Start Django server
python manage.py runserver 127.0.0.1:8000 --settings=chayuan.settings.development

# 3. Frontend Setup (new terminal)
cd /home/project/tea-culture/cha-yuan/frontend
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

### Build Commands Reference

| Command | Purpose | Location |
|---------|---------|----------|
| `npm run dev` | Start dev server | frontend/ |
| `npm run build` | Production build | frontend/ |
| `npm run typecheck` | TypeScript check | frontend/ |
| `npm run lint` | ESLint check | frontend/ |
| `npm test` | Run unit tests | frontend/ |
| `npm run test:e2e` | Run E2E tests | frontend/ |
| `python manage.py runserver` | Django dev | backend/ |
| `pytest` | Backend tests | backend/ |
| `docker-compose up -d` | Start services | infra/docker/ |

---

## 🎨 Implementation Standards

### Backend (Django + Django Ninja)

**API Router Registration (CRITICAL):**
```python
# api_registry.py - Centralized registration
api.add_router("/products/", products_router)

# products.py - RELATIVE paths
@router.get("/")           # Accessible at /api/v1/products/
@router.get("/{slug}/")    # Accessible at /api/v1/products/{slug}/
```

**Singapore Context:**
- GST 9%: `GST_RATE = Decimal('0.09')`
- SGD currency: Hardcoded as default
- Address format: Block/Street, Unit, Postal Code (6 digits)
- Phone: `+65 XXXX XXXX` validation
- Timezone: `Asia/Singapore`

**Model Patterns:**
- Use `select_related()` for FK relations
- Use `prefetch_related()` for reverse FKs
- Add `is_available=True` filters for public APIs

### Frontend (Next.js 16 + React 19)

**Next.js 15+ Async Params (CRITICAL):**
```typescript
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;  // MUST await
  const product = await getProductBySlug(slug);
}
```

**TypeScript Strict Mode:**
- No `any` - use `unknown` instead
- Prefer `interface` over `type` (except unions)
- Explicit return types on public functions
- Handle `undefined` in filter types: `category?: string | undefined`

**Tailwind CSS v4 (CSS-first):**
- Theme in `globals.css` with `@theme`
- NO `tailwind.config.js`
- Use `cn()` utility for conditional classes

**BFF Pattern:**
```typescript
// Server Component: Direct backend call
const response = await authFetch(`/api/v1/products/`, { skipAuth: true });

// Client Component: Through proxy (handled automatically)
const response = await authFetch(`/api/v1/products/`, { skipAuth: true });
```

**React 19 (No forwardRef):**
```typescript
// CORRECT (React 19)
function MyComponent({ ref, ...props }: { ref: React.Ref<HTMLDivElement> }) {
  return <div ref={ref} {...props} />;
}

// INCORRECT (pre-React 19 pattern)
const MyComponent = forwardRef((props, ref) => { ... });
```

**Animation (Framer Motion):**
```typescript
const prefersReducedMotion = useReducedMotion();
initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
```

---

## 🔐 Security & Compliance

### Authentication (BFF Pattern)
- JWT tokens stored in HttpOnly cookies (never localStorage)
- Frontend uses BFF proxy (`/api/proxy/*`) to Django
- Cookie attributes: HttpOnly, Secure, SameSite=Lax
- Access token: 15min expiry
- Refresh token: 7 days expiry

### Singapore Compliance
- **PDPA**: User consent tracked in `User.pdpa_consent_at`
- **GST 9%**: All prices displayed as inclusive
- **Address Format**: Block/Street, Unit, Postal Code
- **Phone**: `+65` prefix validation

### Stripe Integration
- Test keys: `pk_test_*` and `sk_test_*`
- Webhook endpoint: `/api/v1/checkout/webhook/`
- Currency: SGD only
- Payment methods: Cards, GrabPay, PayNow

---

## 🐛 Known Issues & Solutions

### Issue: API 404 "Not Found"
**Cause:** Duplicate path in router registration
**Fix:** Use relative paths in router endpoints
```python
# BAD
@router.get("/products/{slug}/")

# GOOD
@router.get("/{slug}/")
```

### Issue: Product Detail Page 404
**Cause 1:** Next.js 15 async params not awaited
**Fix:** `const { slug } = await params`

**Cause 2:** Frontend calling wrong URL
**Fix:** `BASE_URL = "/api/v1/products"` (not `/api/v1`)

### Issue: Build Fails - Categories Not Found
**Cause:** Static generation without backend running
**Fix:** Add error handling in page.tsx
```typescript
const categories = await getCategories().catch(() => []);
```

### Issue: TypeScript Errors
**Common:** `Type 'string | undefined' is not assignable`
**Fix:** Add explicit union: `category?: string | undefined`

### Issue: Trailing Slash Redirects
**Observation:** Django Ninja returns 308 redirect for URLs without trailing slash
**Solution:** Always include trailing slash in API calls

### Issue: Django Ninja Router Registration Error
**Cause:** Registering routers in `ready()` method
**Fix:** Use Centralized API Registry pattern - register at import time

---

## ⚠️ Anti-Patterns to Avoid

1. **Never** store JWT in localStorage - use HttpOnly cookies
2. **Never** use `any` type in TypeScript - use `unknown`
3. **Never** duplicate API paths in router endpoints
4. **Never** skip `await` on Next.js 15+ params
5. **Never** commit secrets (use .env files)
6. **Never** forget trailing slashes on API calls
7. **Never** mix v3 and v4 Tailwind utilities
8. **Never** use `forwardRef` in React 19
9. **Never** build custom component if shadcn/ui primitive exists
10. **Never** skip error handling for backend fetches in Server Components

---

## 📊 Phase Status & Completion

| Phase | Feature | Status | Notes |
|-------|---------|--------|-------|
| 0 | Foundation & Docker | ✅ Complete | PostgreSQL 17, Redis 7.4 |
| 1 | Backend Models | ✅ Complete | Product, Order, Subscription, User, Quiz |
| 2 | JWT Auth + BFF | ✅ Complete | HttpOnly cookies, BFF proxy, JWT |
| 3 | Design System | ✅ Complete | Tailwind v4, shadcn, Eastern aesthetic |
| 4 | Product Catalog | ✅ Complete | Listing + Detail pages, filtering |
| 5 | Cart & Checkout | ✅ Complete | Redis cart, Stripe SG integration |
| 6 | Tea Culture | ✅ Complete | Articles, brewing guides |
| 7 | Quiz & Subscription | ✅ Complete | Curation algorithm, dashboard |
| 8 | Testing & Deploy | 🚧 In Progress | E2E tests, prod verification |

**Working Features (Verified):**
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

**Current Gap:** None critical - project is functional and production-ready pending final E2E tests.

---

## 📚 Documentation References

| Document | Purpose |
|----------|---------|
| `README.md` | Comprehensive project overview with badges, setup instructions |
| `CLAUDE.md` | Concise agent briefing (485 lines) |
| `AGENT_BRIEF.md` | This comprehensive document |
| `PROJECT_KNOWLEDGE_BASE.md` | Technical knowledge base (156 lines) |
| `AGENTS.md` | Project-specific context for agents |
| `docs/Project_Architecture_Document.md` | Full architecture with Mermaid diagrams (1,252 lines) |
| `docs/PHASE_7_SUBPLAN.md` | Phase 7 detailed implementation plan |
| `docs/PHASE_4_SUBPLAN.md` | Phase 4 implementation plan |
| `plan/MASTER_EXECUTION_PLAN.md` | Full 8-phase execution roadmap (1,222 lines) |
| `plan/Project_Requirements_Document.md` | Requirements + HTML mockup (1,345 lines) |
| `plan/status_new.md` | Current status and remediation notes (894 lines) |
| `plan/status_8.md` | Phase 8 status (319 lines) |

---

## 🎯 Success Criteria

A task is complete when:

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

## 🚀 Next Steps (Phase 8)

1. **E2E Testing**: Playwright tests for critical flows
   - Browse → Add to cart → Checkout
   - Sign up → Quiz → Subscription
2. **Production Build**: Verify static export
3. **Performance**: Lighthouse audit (target ≥90)
4. **Security Scan**: Dependency audit
5. **Documentation**: API documentation update

---

*Generated from meticulous analysis of all project documentation and codebase.*
*Last updated: 2026-04-20*
*Project Phase: 8 (Testing & Deployment)*
*Status: Core functionality complete, production-ready pending final tests*
*Version: 2.0.0 - Comprehensive Agent Brief*
