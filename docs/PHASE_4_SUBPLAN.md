# Phase 4: Product Catalog & API

> **Duration:** Days 17-22 (6 days)
> **TDD Principle:** API contract tests → Endpoint implementation → Integration tests
> **Status:** IN PROGRESS

---

## Executive Summary

This phase implements the complete product catalog system including Django Ninja API endpoints and Next.js frontend pages. Following TDD methodology, we write tests first, then implement, then verify.

---

## TDD Workflow (Red-Green-Refactor)

```
┌─────────────────────────────────────────────────────────────────┐
│  RED: Write failing test that defines expected API behavior     │
│  ↓                                                              │
│  GREEN: Implement minimal Django endpoint code                  │
│  ↓                                                              │
│  REFACTOR: Clean code while tests pass                          │
│  ↓                                                              │
│  VERIFY: Run full test suite                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 4 Task Breakdown

### 4.1 API Contract Tests (Day 17) - RED Phase

**Test Files to Create:**

| Test File | Test Cases | Expected Behavior |
|-----------|------------|-------------------|
| `/backend/api/tests/test_products_api.py` | 10+ test cases | CRUD operations, filtering, pagination |
| `/backend/api/tests/test_categories_api.py` | 5+ test cases | List categories, get category with products |
| `/backend/api/tests/test_origins_api.py` | 5+ test cases | List origins, get origin details |

**Test Cases Checklist:**
- [ ] `test_list_products_returns_200()` - Basic GET returns products
- [ ] `test_list_products_with_filters()` - Category, origin, price filters work
- [ ] `test_list_products_pagination()` - Page size, page number params work
- [ ] `test_get_product_detail_by_slug()` - Detail endpoint returns full product
- [ ] `test_product_detail_includes_related()` - Related products included
- [ ] `test_list_categories_returns_all()` - All categories returned
- [ ] `test_category_with_product_count()` - Product count per category
- [ ] `test_list_origins_returns_regions()` - All origins with regions
- [ ] `test_origin_detail_with_products()` - Origin includes its products

### 4.2 Django Ninja API Endpoints (Day 18-19) - GREEN Phase

**File:** `/backend/api/v1/products.py`

**Endpoints to Implement:**

| Endpoint | Method | Status | Tests Pass |
|----------|--------|--------|------------|
| `GET /api/v1/products/` | List with filters | ⬜ | ⬜ |
| `GET /api/v1/products/{slug}/` | Detail | ⬜ | ⬜ |
| `GET /api/v1/categories/` | List categories | ⬜ | ⬜ |
| `GET /api/v1/categories/{slug}/` | Category detail | ⬜ | ⬜ |
| `GET /api/v1/origins/` | List origins | ⬜ | ⬜ |
| `GET /api/v1/origins/{slug}/` | Origin detail | ⬜ | ⬜ |

**Query Parameters:**
- [ ] `category` - Filter by tea category slug
- [ ] `origin` - Filter by origin slug
- [ ] `fermentation_min`/`fermentation_max` - Filter by fermentation level
- [ ] `season` - Filter by harvest season
- [ ] `price_min`/`price_max` - Price range in SGD
- [ ] `in_stock` - Boolean for stock availability
- [ ] `page` - Page number for pagination
- [ ] `page_size` - Items per page (default 12)

**Response Schemas:**
- [ ] `ProductListSchema` - Summary fields for listing
- [ ] `ProductDetailSchema` - Full fields with related
- [ ] `CategorySchema` - Category with product count
- [ ] `OriginSchema` - Origin with tea count

### 4.3 Frontend Product Listing Page (Day 20) - GREEN Phase

**File:** `/frontend/app/products/page.tsx` (Server Component)

**Features Checklist:**
- [ ] Server-side data fetching via `authFetch`
- [ ] Filter sidebar (Client Component)
- [ ] Product grid with Framer Motion animations
- [ ] Pagination controls
- [ ] SEO metadata generation
- [ ] Empty state when no products match
- [ ] Loading skeleton

**Components to Create:**
| Component | File | Status |
|-----------|------|--------|
| `FilterSidebar` | `/components/filter-sidebar.tsx` | ⬜ |
| `ProductGrid` | `/components/product-grid.tsx` | ⬜ |
| `ProductCard` | `/components/product-card.tsx` | ⬜ |
| `Pagination` | `/components/pagination.tsx` | ⬜ |
| `EmptyState` | `/components/empty-state.tsx` | ⬜ |

### 4.4 Product Detail Page (Day 21) - GREEN Phase

**File:** `/frontend/app/products/[slug]/page.tsx` (Server Component)

**Features Checklist:**
- [ ] Dynamic route with slug parameter
- [ ] Product image gallery
- [ ] Full product details
- [ ] Brewing guide widget (temperature in °C)
- [ ] Add to cart functionality
- [ ] Related products carousel
- [ ] SEO metadata per product

**Components to Create:**
| Component | File | Status |
|-----------|------|--------|
| `ProductGallery` | `/components/product-gallery.tsx` | ⬜ |
| `BrewingGuide` | `/components/brewing-guide.tsx` | ⬜ |
| `AddToCartButton` | `/components/add-to-cart-button.tsx` | ⬜ |
| `RelatedProducts` | `/components/related-products.tsx` | ⬜ |

### 4.5 GST Price Display Component (Day 22) - GREEN Phase

**File:** `/frontend/components/gst-badge.tsx`

**Features Checklist:**
- [ ] Display price in SGD format
- [ ] Show "incl. GST" indicator
- [ ] Responsive sizing
- [ ] Accessible price announcement

---

## Integration Checklist

### Backend Integration
- [ ] API endpoints registered in `/backend/api/v1/urls.py`
- [ ] Pagination configured with django-ninja-pagination
- [ ] CORS headers configured for frontend
- [ ] Redis caching for product list (optional)

### Frontend Integration
- [ ] Products page linked in navigation
- [ ] Product detail links from grid
- [ ] Error boundaries for API failures
- [ ] Loading states with skeletons

---

## Verification Gates

| Gate | Criteria | Check |
|------|----------|-------|
| **Tests Pass** | All API tests pass (`pytest api/tests/`) | ⬜ |
| **Type Check** | TypeScript strict mode passes | ⬜ |
| **Build** | `npm run build` succeeds | ⬜ |
| **E2E** | Product list and detail pages render | ⬜ |

---

## Success Criteria

1. ✅ **API Functionality**
   - All 6 endpoints return correct data
   - Filtering works for all query params
   - Pagination returns proper metadata

2. ✅ **Frontend Pages**
   - Product listing page renders with filters
   - Product detail page shows full info
   - Navigation between pages works

3. ✅ **TDD Compliance**
   - Tests written before implementation
   - All tests passing
   - No skipped tests

4. ✅ **Code Quality**
   - No TypeScript errors (strict mode)
   - No ESLint warnings
   - Components follow established patterns

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| API breaking changes | Versioned endpoints (`/api/v1/`) |
| Missing product images | Placeholder fallback in ProductCard |
| Slow API responses | Redis caching (Phase 8) |
| Filter state loss | URL query params synced |

---

## Next Steps

After Phase 4 completion, proceed to **Phase 5: Cart & Checkout** (Redis cart service + Stripe integration).
