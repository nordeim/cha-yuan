# Phase 4 Remaining Tasks: Frontend Product Catalog

> **Duration:** Days 20-22 (3 days)
> **TDD Principle:** Component tests → Implementation → Integration tests
> **Status:** READY FOR EXECUTION

---

## Overview

This sub-plan covers the remaining Phase 4 tasks:
- 4.4 Frontend Product Listing Page (Server Component)
- 4.5 Product Detail Page with Dynamic Routing
- 4.6 ProductCard Component with GST Display
- 4.7 Build Verification and Test Execution

---

## TDD Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│  RED: Write failing component test                              │
│  ↓                                                              │
│  GREEN: Implement component with minimal code                   │
│  ↓                                                              │
│  REFACTOR: Clean code, ensure accessibility                     │
│  ↓                                                              │
│  INTEGRATE: Connect to API, verify data flow                    │
│  ↓                                                              │
│  VERIFY: Full build + test suite                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Task 4.6: ProductCard Component with GST Display

**Duration:** Day 20 (Morning)
**TDD Principle:** Visual test → Component implementation

### 4.6.1 Component Test Specification (Write First)

**Test File:** `/frontend/components/tests/product-card.test.tsx`

| Test Case | Expected Behavior | Priority |
|-----------|------------------|----------|
| `test_product_card_renders_name` | Display product name in font-display | HIGH |
| `test_product_card_shows_sgd_price` | Format price with SGD currency | HIGH |
| `test_product_card_shows_gst_inclusive_badge` | Show "incl. GST" when applicable | HIGH |
| `test_product_card_shows_stock_status` | Display "In Stock" / "Out of Stock" | HIGH |
| `test_product_card_shows_weight` | Display "50g" format | MEDIUM |
| `test_product_card_has_correct_link` | Link to /products/{slug} | HIGH |
| `test_product_card_shows_category_badge` | Display category with fermentation color | MEDIUM |
| `test_product_card_shows_origin` | Display origin name | MEDIUM |
| `test_product_card_shows_season_year` | Display "Spring 2019" if available | LOW |
| `test_product_card_hover_animation` | Scale image on hover (if !reducedMotion) | LOW |

### 4.6.2 Component Implementation

**File:** `/frontend/components/product-card.tsx`

**Props Interface:**
```typescript
interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    shortDescription: string;
    priceSgd: number;
    priceWithGst: number;
    gstAmount: number;
    currency: string;
    weightGrams: number;
    isInStock: boolean;
    isNewArrival: boolean;
    harvestSeason?: string;
    harvestYear?: number;
    image?: string;
    category: {
      name: string;
      slug: string;
      fermentationLevel: number;
    };
    origin: {
      name: string;
      slug: string;
    };
  };
}
```

**Checklist:**
- [ ] Accept product prop with full type safety
- [ ] Format SGD price with Intl.NumberFormat
- [ ] Show "incl. GST" badge for gst-inclusive products
- [ ] Display stock status indicator (green dot = in stock)
- [ ] Show weight with "g" suffix
- [ ] Link to product detail page
- [ ] Display category badge with color coding
- [ ] Show harvest season/year if available
- [ ] "New" badge for isNewArrival
- [ ] Hover animation (image scale 1.08)
- [ ] Reduced motion support
- [ ] WCAG: Proper heading hierarchy
- [ ] WCAG: Alt text for images

### 4.6.3 GST Badge Component

**File:** `/frontend/components/gst-badge.tsx`

**Checklist:**
- [ ] Format price in SGD with proper locale
- [ ] Show "incl. GST" indicator
- [ ] Responsive sizing (sm, md, lg)

---

## Task 4.4: Product Listing Page (Server Component)

**Duration:** Day 20 (Afternoon) - Day 21 (Morning)
**TDD Principle:** Page test → Server Component implementation

### 4.4.1 Page Test Specification (Write First)

**Test File:** `/frontend/app/products/page.test.tsx`

| Test Case | Expected Behavior | Priority |
|-----------|------------------|----------|
| `test_page_fetches_products` | Server Component calls authFetch | HIGH |
| `test_page_shows_product_grid` | Display 12 products in grid | HIGH |
| `test_page_has_filters` | Show filter sidebar | HIGH |
| `test_page_shows_pagination` | Display page controls | HIGH |
| `test_page_has_seo_metadata` | Title and description set | HIGH |
| `test_page_handles_empty_state` | Show "No products found" | MEDIUM |
| `test_page_applies_filters` | URL query params affect results | MEDIUM |

### 4.4.2 Server Component Implementation

**File:** `/frontend/app/products/page.tsx`

**Features:**
- [ ] Server-side data fetching via authFetch
- [ ] Parse searchParams for filters
- [ ] Filter sidebar (Client Component)
- [ ] Product grid with ProductCard
- [ ] Pagination
- [ ] SEO metadata generation
- [ ] Empty state
- [ ] Loading state (Suspense)

**SearchParams Interface:**
```typescript
interface SearchParams {
  category?: string;
  origin?: string;
  fermentation?: string;
  season?: string;
  priceMin?: string;
  priceMax?: string;
  inStock?: string;
  page?: string;
  pageSize?: string;
}
```

### 4.4.3 Filter Sidebar Component

**File:** `/frontend/components/filter-sidebar.tsx`

**Client Component - Required**

**Filters to Implement:**
- [ ] Categories (checkbox group)
- [ ] Origins (checkbox group)
- [ ] Fermentation Level (slider: 0-100%)
- [ ] Season (checkbox: Spring, Summer, Autumn, Winter)
- [ ] Price Range (min/max inputs)
- [ ] In Stock Only (toggle)

**Checklist:**
- [ ] Sync filters with URL query params
- [ ] Update URL on filter change
- [ ] Clear all filters button
- [ ] Active filter count badge
- [ ] Mobile: Collapsible filter drawer

---

## Task 4.5: Product Detail Page

**Duration:** Day 21 (Afternoon) - Day 22 (Morning)
**TDD Principle:** Dynamic route test → Page implementation

### 4.5.1 Page Test Specification (Write First)

**Test File:** `/frontend/app/products/[slug]/page.test.tsx`

| Test Case | Expected Behavior | Priority |
|-----------|------------------|----------|
| `test_page_fetches_product_by_slug` | Get product from API | HIGH |
| `test_page_shows_product_details` | Name, description, price | HIGH |
| `test_page_shows_brewing_guide` | Temperature and time | HIGH |
| `test_page_shows_image_gallery` | Product images | HIGH |
| `test_page_has_add_to_cart` | Add to cart button | HIGH |
| `test_page_shows_related_products` | 4 related products | MEDIUM |
| `test_page_handles_404` | Not found for invalid slug | HIGH |
| `test_page_has_seo_metadata` | Dynamic title/description | HIGH |

### 4.5.2 Server Component Implementation

**File:** `/frontend/app/products/[slug]/page.tsx`

**Features:**
- [ ] Dynamic route with slug param
- [ ] Server-side fetch by slug
- [ ] 404 handling
- [ ] Image gallery
- [ ] Brewing guide widget
- [ ] Add to cart button
- [ ] Related products carousel
- [ ] SEO metadata generation

**Components Needed:**
| Component | File | Features |
|-----------|------|----------|
| ProductGallery | `/components/product-gallery.tsx` | Image carousel, thumbnails |
| BrewingGuide | `/components/brewing-guide.tsx` | Temp/time display |
| AddToCartButton | `/components/add-to-cart-button.tsx` | Quantity selector, add action |
| RelatedProducts | `/components/related-products.tsx` | Horizontal scroll |

### 4.5.3 Brewing Guide Widget

**File:** `/frontend/components/brewing-guide.tsx`

**Display:**
- [ ] Temperature in °C (Singapore metric)
- [ ] Time in minutes/seconds
- [ ] Visual temperature gauge
- [ ] Step-by-step instructions

---

## Task 4.7: Build Verification & Test Execution

**Duration:** Day 22 (Afternoon)

### 4.7.1 Verification Checklist

**Frontend Build:**
- [ ] TypeScript strict mode passes
- [ ] ESLint no warnings
- [ ] `npm run build` succeeds
- [ ] Static generation works for product pages
- [ ] Dynamic routes generate correctly

**API Tests:**
- [ ] Run backend API tests: `pytest apps/api/tests/test_products_api.py -v`
- [ ] All 12 test cases pass
- [ ] Coverage meets 85% target

**Integration Tests:**
- [ ] Product listing page renders
- [ ] Product detail page loads
- [ ] Filters apply correctly
- [ ] Pagination works
- [ ] Images load
- [ ] Links navigate correctly

**Accessibility:**
- [ ] Keyboard navigation works
- [ ] Screen reader announces prices
- [ ] Focus states visible
- [ ] Color contrast WCAG AA

### 4.7.2 Success Criteria

| Criteria | Status |
|----------|--------|
| ProductCard renders with GST display | ⬜ |
| Product listing page fetches and displays products | ⬜ |
| Filters sync with URL params | ⬜ |
| Product detail page shows full info | ⬜ |
| Brewing guide displays correctly | ⬜ |
| Related products shown | ⬜ |
| All TypeScript checks pass | ⬜ |
| Build succeeds | ⬜ |
| All tests pass | ⬜ |

---

## Phase 4 Completion Gates

| Gate | Criteria | Verification |
|------|----------|------------|
| **Tests Written** | All component tests exist before implementation | `find . -name "*.test.tsx" -path "*/products/*"` |
| **Components Built** | ProductCard, FilterSidebar, ProductGallery, BrewingGuide, AddToCartButton | Manual inspection |
| **Pages Created** | /products, /products/[slug] | File exists |
| **API Connected** | Pages fetch from Django API | Network tab in DevTools |
| **GST Display** | Prices show SGD with "incl. GST" | Visual verification |
| **Build Success** | `npm run build` exits 0 | Build output |
| **Test Success** | `pytest api/tests/` all pass | Test output |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| API unavailable during dev | Mock data fallback in components |
| Image loading failures | Placeholder component |
| Slow product list | Implement React.memo for cards |
| Filter state loss | URL persistence |
| Mobile layout breaks | Test at 320px breakpoint |

---

## Ready for Execution

**Confirmation Required:**

Reply "**yes**" to proceed with:
1. Writing component tests (RED phase)
2. Implementing ProductCard with GST display
3. Creating product listing page
4. Creating product detail page
5. Running full test suite
6. Verifying build

Or specify modifications to this plan.
