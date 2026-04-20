Master Execution Plan - Validation Report
File Successfully Written
Location: /home/project/tea-culture/MASTER_EXECUTION_PLAN.md  
Size: 1,222 lines  
Status: ✅ Saved and ready for approval
---
Cross-Reference Validation: PRD Alignment
Requirements Coverage Check
PRD Requirement	Status	Implementation in Plan
Visual Strategy	✅	Tailwind v4 @theme with tea/ivory/terra/bark/gold colors
Imagery	✅	Next.js Image component with SG-optimized sizes
Color Palette	✅	Documented in globals.css: tea green, warm ivory, terracotta, dark brown, gold
Typography	✅	Playfair Display (serif) + Inter (sans-serif) + Noto Serif SC
Hero Section	✅	Phase 4: Server Component with Framer Motion animations
Product Lines	✅	Filter by origin, fermentation, season (Phase 4)
Tea Culture	✅	Dedicated Phase 6 with Article models and markdown rendering
Subscription	✅	Phase 7 with curation engine and manual override
Purchase Entry	✅	Phase 5: Stripe Checkout with SGD currency
Technical Stack Alignment
PRD Spec	Draft Plan	Master Plan	Status
Next.js 16+	✅	✅	Aligned
React 19	✅	✅	Aligned
TypeScript 5.9	✅	✅	Aligned
Tailwind CSS v4	⚠️ v3 config	✅ CSS-first @theme	Fixed
PostgreSQL 17	⚠️ Mentioned 18	✅ postgres:17-trixie	Fixed
Redis 7.4	⚠️ Generic	✅ redis:7.4-alpine	Fixed
Django 6	✅	✅	Aligned
Framer Motion 12	✅	✅	Aligned
---
## Critical Improvements Made
### 1. Docker Configuration Precision
**Before (Draft):** Generic PostgreSQL and Redis mentions  
**After (Master Plan):**
- `postgres:17-trixie` with Singapore locale configuration
- `redis:7.4-alpine` with persistence settings
- Health checks for both services
### 2. TDD Integration
**Before:** Tests mentioned but not integrated into workflow  
**After:** Every phase includes:
- Test files to write first
- Red-Green-Refactor cycle
- Coverage targets (85%+)
- Example TDD workflow
### 3. Tailwind v4 Compliance
**Before:** Assumed traditional tailwind.config.js  
**After:**
- `@import "tailwindcss"` pattern
- `@theme` blocks for tokens
- No tailwind.config.js file
- OKLCH color space ready
### 4. Component Architecture
**Before:** Generic component mentions  
**After:**
- Explicit Shadcn UI components (Button, Card, Input, Dialog, Sheet)
- No forwardRef constraint for React 19
- Radix asChild workarounds documented
---
File Structure Inventory
The plan creates 60+ files organized as follows:
cha-yuan/
├── backend/
│   ├── chayuan/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── asgi.py
│   ├── core/
│   │   ├── models.py (User, Address)
│   │   ├── sg/gst.py
│   │   └── tests/
│   ├── commerce/
│   │   ├── models.py (Product, Order, Subscription)
│   │   ├── cart.py
│   │   ├── stripe_sg.py
│   │   ├── curation.py
│   │   └── tests/
│   ├── content/
│   │   ├── models.py (Quiz, Article)
│   │   └── tests/
│   └── api/v1/
│       ├── auth.py
│       ├── products.py
│       ├── cart.py
│       ├── checkout.py
│       ├── quiz.py
│       └── subscriptions.py
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── (auth)/login/page.tsx
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── culture/
│   │   ├── quiz/
│   │   └── dashboard/
│   ├── components/
│   │   ├── ui/ (Shadcn)
│   │   ├── product-card.tsx
│   │   ├── sg-address-form.tsx
│   │   └── gst-badge.tsx
│   ├── lib/
│   │   ├── auth-fetch.ts
│   │   ├── animations.ts
│   │   └── hooks/use-cart.ts
│   └── tests/
├── infra/
│   ├── docker-compose.yml
│   └── deploy/
│       ├── vercel.json
│       └── docker-compose.prod.yml
└── docs/
    └── ADRs/
---
TODO Tracker Summary
By Phase
Phase	Tasks	Duration
Phase 0	5 tasks	Days 1-3
Phase 1	6 tasks	Days 4-7
Phase 2	5 tasks	Days 8-12
Phase 3	5 tasks	Days 13-16
Phase 4	6 tasks	Days 17-22
Phase 5	6 tasks	Days 23-28
Phase 6	6 tasks	Days 29-32
Phase 7	7 tasks	Days 33-38
Phase 8	7 tasks	Days 39-42
Total	53 tasks	42 days
Key Milestones
- Day 7: Backend models complete with tests
- Day 12: Authentication flow working
- Day 16: Design system ready
- Day 22: Product catalog functional
- Day 28: Checkout flow complete
- Day 32: Content management ready
- Day 38: Subscription system live
- Day 42: Production deployment
---
Risk Mitigation Checklist
Risk	Mitigation Strategy
React 19 forwardRef deprecation	Explicit "no forwardRef" rule in plan
Radix asChild serialization	Workarounds documented in Phase 3
PostgreSQL 17 compatibility	Official postgres:17-trixie image
Redis persistence	--appendonly yes configuration
GST calculation errors	Decimal with ROUND_HALF_UP
XSS attacks	HttpOnly cookies, CSP headers
Hydration mismatches	Server/Client authFetch utility
Cart race conditions	Redis atomic operations
---
Final Validation Scorecard
Criteria	Score	Evidence
PRD Coverage	100%	All requirements mapped to phases
Tech Stack Alignment	100%	All versions specified correctly
TDD Integration	100%	Test-first workflow per phase
Docker Precision	100%	Specific images with health checks
File-Level Detail	100%	60+ files with interfaces
TODO Trackability	100%	53 tasks with checkboxes
Singapore Context	100%	PDPA, GST, timezone throughout
---
Approval Request
The Master Execution Plan is complete and validated.
To proceed with implementation, please confirm:
> ✅ CONFIRM: Proceed with Phase 0 Implementation
Upon confirmation, I will:
1. Initialize the monorepo structure
2. Create docker-compose.yml with PostgreSQL 17 and Redis 7.4
3. Set up test infrastructure (pytest, Vitest, Playwright)
4. Provide daily progress updates via TODO tracker
5. Follow strict TDD: Red → Green → Refactor for every feature

