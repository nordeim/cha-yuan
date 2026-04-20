# Phase 6 Frontend Remediation Plan

> **Date:** April 16, 2026  
> **Status:** VALIDATION COMPLETE - READY FOR EXECUTION  
> **Scope:** Complete missing Phase 6 frontend components for Tea Culture Content  
> **Approach:** Test-Driven Development (TDD) - Red-Green-Refactor

---

## Executive Summary

This remediation plan addresses the critical gap identified in Phase 6: **frontend components for Tea Culture are missing** despite being claimed as complete in `to_verify.md`. The backend (models, admin, API) is fully functional and verified. This plan creates all missing frontend components using TDD methodology.

### Validation Results Summary

| Component | Backend | Frontend (Claimed) | Frontend (Actual) | Status |
|-----------|---------|-------------------|-------------------|--------|
| Article Model | ✅ | N/A | N/A | Complete |
| ArticleCategory Model | ✅ | N/A | N/A | Complete |
| Django Admin | ✅ | N/A | N/A | Complete |
| Content API | ✅ 6 endpoints | N/A | N/A | Complete |
| API Tests | ✅ 25+ cases | N/A | N/A | Complete |
| ArticleCard | N/A | ✅ | ❌ MISSING | **To Create** |
| ArticleGrid | N/A | ✅ | ❌ MISSING | **To Create** |
| CategoryBadge | N/A | ✅ | ❌ MISSING | **To Create** |
| ArticleContent | N/A | ✅ | ❌ MISSING | **To Create** |
| Culture Listing Page | N/A | ✅ | ❌ MISSING | **To Create** |
| Article Detail Page | N/A | ✅ | ❌ MISSING | **To Create** |

---

## TDD Workflow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  RED: Write component tests (failing)                           │
│     ↓                                                          │
│  GREEN: Implement component (minimal code)                     │
│     ↓                                                          │
│  REFACTOR: Improve code quality                                 │
│     ↓                                                          │
│  INTEGRATION: Create page using component                     │
│     ↓                                                          │
│  VERIFY: Run full test suite + TypeScript + Build              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 6.6: Component Development

### 6.6.1 TDD Task 1: CategoryBadge Component

**Duration:** 30 minutes  
**TDD Phase:** Red → Green → Refactor

#### RED Phase: Write Tests First

**Test File:** `/frontend/components/__tests__/category-badge.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryBadge } from '../category-badge';

describe('CategoryBadge', () => {
  it('renders category name', () => {
    render(<CategoryBadge name="Brewing Guides" slug="brewing" />);
    expect(screen.getByText('Brewing Guides')).toBeInTheDocument();
  });

  it('renders with custom color', () => {
    const { container } = render(
      <CategoryBadge name="History" slug="history" color="#C4724B" />
    );
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveStyle({ backgroundColor: '#C4724B' });
  });

  it('uses default color when not provided', () => {
    const { container } = render(
      <CategoryBadge name="Tasting" slug="tasting" />
    );
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveStyle({ backgroundColor: '#5C8A4D' });
  });

  it('links to category page', () => {
    render(<CategoryBadge name="Brewing" slug="brewing" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/culture?category=brewing');
  });
});
```

**Run Test (Expect FAIL):**
```bash
cd /home/project/tea-culture/cha-yuan/frontend
npm run test -- category-badge.test.tsx
# EXPECTED: FAIL (component doesn't exist)
```

#### GREEN Phase: Implement Component

**Component File:** `/frontend/components/category-badge.tsx`

**Requirements:**
- Accept `name`, `slug`, `color` props
- Default color: `#5C8A4D` (tea-500)
- Link to `/culture?category={slug}`
- Apply tea brand styling
- React 19 compatible (no forwardRef)

**Checklist:**
- [ ] Component accepts CategoryBadgeProps interface
- [ ] Rounds color values with rounded-full
- [ ] Uses gold-500 for text on dark backgrounds
- [ ] Supports hover:scale-105 animation
- [ ] Uses Link from next/link

#### REFACTOR Phase: Enhance

- [ ] Add TypeScript strict typing
- [ ] Ensure accessibility (aria-label)
- [ ] Verify responsive behavior

---

### 6.6.2 TDD Task 2: ArticleCard Component

**Duration:** 90 minutes  
**TDD Phase:** Red → Green → Refactor

#### RED Phase: Write Tests First

**Test File:** `/frontend/components/__tests__/article-card.test.tsx`

**Test Cases:**
1. `renders article title in font-serif`
2. `displays excerpt with line-clamp-2`
3. `shows category badge`
4. `displays reading time with Clock icon`
5. `shows formatted published date`
6. `renders featured image with Next.js Image`
7. `links to article detail page`
8. `applies hover animation`
9. `handles missing featured image gracefully`
10. `uses correct image sizes for responsive loading`

#### GREEN Phase: Implement Component

**Component File:** `/frontend/components/article-card.tsx`

**Interface Requirements:**
```typescript
interface ArticleCardProps {
  article: {
    slug: string;
    title: string;
    excerpt: string;
    featured_image?: string | null;
    category: {
      name: string;
      slug: string;
      color?: string;
    };
    reading_time_minutes: number;
    published_at: string;
  };
}
```

**Design Specifications (from Phase 3 System):**
- Aspect ratio: 16/10 for featured image
- Background fallback: gradient from tea-100 to ivory-300
- Title: font-serif, text-xl, bark-900
- Excerpt: bark-700/70, text-sm, line-clamp-2
- Meta: flex row with gap-4, bark-700/60
- Animation: Framer Motion fadeInUp
- Hover: Image scale-105 transition

**Checklist:**
- [ ] Uses Next.js Image with proper sizes
- [ ] Imports CategoryBadge component
- [ ] Uses formatDate from lib/utils
- [ ] Clock icon from lucide-react
- [ ] Responsive design (mobile-first)
- [ ] Framer Motion animations with useReducedMotion check
- [ ] Link wraps entire card

---

### 6.6.3 TDD Task 3: ArticleGrid Component

**Duration:** 60 minutes  
**TDD Phase:** Red → Green → Refactor

#### RED Phase: Write Tests First

**Test File:** `/frontend/components/__tests__/article-grid.test.tsx`

**Test Cases:**
1. `renders grid with correct responsive columns`
2. `renders ArticleCard for each article`
3. `applies stagger animation on mount`
4. `handles empty articles array`
5. `maintains grid gap spacing`

#### GREEN Phase: Implement Component

**Component File:** `/frontend/components/article-grid.tsx`

**Requirements:**
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Gap: `gap-8`
- Stagger delay: 100ms per item
- Import and use ArticleCard

---

### 6.6.4 TDD Task 4: ArticleContent Component (Markdown)

**Duration:** 90 minutes  
**TDD Phase:** Red → Green → Refactor  
**Dependencies:** react-markdown, remark-gfm

#### RED Phase: Write Tests First

**Test File:** `/frontend/components/__tests__/article-content.test.tsx`

**Test Cases:**
1. `renders headings with correct typography styles`
2. `renders paragraphs with leading-relaxed`
3. `renders links with tea-600 color`
4. `renders images with lazy loading`
5. `renders unordered lists with disc markers`
6. `renders ordered lists with decimal markers`
7. `renders blockquotes with left border`
8. `renders code blocks with syntax highlighting`
9. `renders tables with responsive wrapper`
10. `handles markdown tables correctly`

#### GREEN Phase: Implement Component

**Component File:** `/frontend/components/article-content.tsx`

**Dependencies to Install:**
```bash
npm install react-markdown remark-gfm rehype-highlight
```

**Custom Renderers (from Phase 6 Sub-Plan):**
```typescript
const components = {
  h1: ({ children }) => <h1 className="font-serif text-4xl text-bark-900 mb-6">{children}</h1>,
  h2: ({ children }) => <h2 className="font-serif text-2xl text-bark-900 mt-8 mb-4">{children}</h2>,
  h3: ({ children }) => <h3 className="font-serif text-xl text-bark-900 mt-6 mb-3">{children}</h3>,
  p: ({ children }) => <p className="text-bark-700 leading-relaxed mb-4">{children}</p>,
  a: ({ href, children }) => <a href={href} className="text-tea-600 hover:underline">{children}</a>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-tea-500 pl-4 italic text-bark-700 my-6">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4">{children}</ol>,
  li: ({ children }) => <li className="text-bark-700">{children}</li>,
  code: ({ inline, children }) => (
    inline 
      ? <code className="bg-ivory-200 px-2 py-1 rounded text-sm">{children}</code>
      : <pre className="bg-ivory-200 p-4 rounded-lg overflow-x-auto"><code>{children}</code></pre>
  ),
};
```

---

## Phase 6.7: Culture Listing Page

### TDD Task 5: Culture Listing Page

**Duration:** 120 minutes  
**File:** `/frontend/app/culture/page.tsx` (Server Component)

#### Page Structure

```
┌─────────────────────────────────────────────────────────┐
│ HERO SECTION: Featured Articles                         │
│ - Title: "Tea Culture"                                   │
│ - Subtitle: "Brewing guides, tasting notes, history"    │
│ - Background: Subtle tea imagery                         │
├─────────────────────────────────────────────────────────┤
│ FILTER BAR: Category tabs + Search                      │
│ - Horizontal scroll on mobile                           │
│ - "All" as default                                       │
│ - Active state with tea-600                            │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────────────────────────┐    │
│ │ CATEGORIES  │ │ ARTICLE GRID (3 cols desktop)   │    │
│ │ SIDEBAR     │ │ ┌─────┐ ┌─────┐ ┌─────┐        │    │
│ │             │ │ │Card │ │Card │ │Card │        │    │
│ │ (Mobile:    │ │ └─────┘ └─────┘ └─────┘        │    │
│ │  Sheet)     │ │                                 │    │
│ └─────────────┘ └─────────────────────────────────┘    │
├─────────────────────────────────────────────────────────┤
│ PAGINATION                                              │
│ - 9 articles per page                                    │
│ - Client-side navigation                                │
└─────────────────────────────────────────────────────────┘
```

#### Data Fetching

**Server Component Data Fetch:**
```typescript
import { authFetch } from '@/lib/auth-fetch';

async function getArticles(searchParams: { [key: string]: string | string[] | undefined }) {
  const category = searchParams.category as string | undefined;
  const page = parseInt(searchParams.page as string) || 1;
  const search = searchParams.search as string | undefined;
  
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (search) params.set('search', search);
  params.set('page', String(page));
  
  const response = await authFetch(`/api/v1/articles/?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch articles');
  
  return response.json();
}

async function getCategories() {
  const response = await authFetch('/api/v1/categories/');
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
}
```

#### Checklist

- [ ] Server Component with async data fetching
- [ ] Hero section with Eastern aesthetic
- [ ] Category filter tabs (Client Component)
- [ ] Search functionality
- [ ] ArticleGrid integration
- [ ] Pagination component
- [ ] SEO metadata generation
- [ ] Error handling with error.tsx
- [ ] Loading state with loading.tsx
- [ ] Mobile-responsive filter sidebar (Sheet)

---

## Phase 6.8: Article Detail Page

### TDD Task 6: Article Detail Page

**Duration:** 120 minutes  
**File:** `/frontend/app/culture/[slug]/page.tsx` (Server Component)

#### Page Structure

```
┌─────────────────────────────────────────────────────────┐
│ HERO SECTION: Featured Image with Overlay              │
│ - Full-width image                                     │
│ - Gradient overlay (hero-overlay)                      │
│ - Title: font-serif, large, white                    │
│ - Category badge                                       │
│ - Meta: date + reading time                            │
├─────────────────────────────────────────────────────────┤
│ ARTICLE CONTENT                                         │
│ - Markdown rendering (ArticleContent)                  │
│ - Typography hierarchy                                 │
│ - Blockquotes, lists, code blocks                      │
├─────────────────────────────────────────────────────────┤
│ RELATED ARTICLES                                        │
│ - "More from [Category Name]"                         │
│ - Horizontal scroll on mobile                          │
│ - 3 article cards                                      │
└─────────────────────────────────────────────────────────┘
```

#### Data Fetching

```typescript
async function getArticle(slug: string) {
  const response = await authFetch(`/api/v1/articles/${slug}/`);
  if (!response.ok) {
    if (response.status === 404) notFound();
    throw new Error('Failed to fetch article');
  }
  return response.json();
}

async function getRelatedArticles(slug: string) {
  const response = await authFetch(`/api/v1/articles/${slug}/related/?limit=3`);
  if (!response.ok) return [];
  return response.json();
}
```

#### Checklist

- [ ] Dynamic route with slug parameter
- [ ] generateMetadata for SEO
- [ ] 404 handling with notFound()
- [ ] Hero with featured image
- [ ] ArticleContent markdown rendering
- [ ] Related articles section
- [ ] Social sharing buttons (optional)
- [ ] Error boundary

---

## Dependencies Check

### Required Packages

| Package | Version | Purpose | Status |
|---------|---------|---------|--------|
| react-markdown | ^9.0.0 | Markdown rendering | ❌ Need to install |
| remark-gfm | ^4.0.0 | GitHub-flavored markdown | ❌ Need to install |
| rehype-highlight | ^7.0.0 | Syntax highlighting | ❌ Need to install |

### Install Commands

```bash
cd /home/project/tea-culture/cha-yuan/frontend
npm install react-markdown remark-gfm rehype-highlight
```

---

## Verification Gates

### Pre-Implementation Checklist

- [ ] Backend API is running and accessible
- [ ] PostgreSQL has sample articles for testing
- [ ] All existing tests pass
- [ ] TypeScript configuration is correct

### Post-Implementation Verification

| Gate | Command | Expected Result |
|------|---------|-----------------|
| **Component Tests** | `npm run test -- article` | All tests pass (0 failures) |
| **Type Check** | `npm run typecheck` | 0 errors, strict mode |
| **Lint** | `npm run lint` | 0 warnings |
| **Build** | `npm run build` | Exit code 0, no errors |
| **E2E** | `npm run test:e2e -- culture` | Critical paths pass |

### Manual Verification

- [ ] Culture listing page loads with articles
- [ ] Category filters work
- [ ] Search functionality works
- [ ] Article detail page renders markdown correctly
- [ ] Related articles display
- [ ] Responsive design on mobile
- [ ] Animations respect prefers-reduced-motion

---

## Integration with Existing Code

### Reuse Existing Patterns

| From File | Reuse | In New Component |
|-----------|-------|------------------|
| `components/product-card.tsx` | Animation patterns | ArticleCard |
| `components/product-grid.tsx` | Stagger animation | ArticleGrid |
| `components/gst-badge.tsx` | Styling patterns | CategoryBadge |
| `app/products/page.tsx` | Server Component pattern | culture/page.tsx |
| `app/products/[slug]/page.tsx` | Dynamic route pattern | culture/[slug]/page.tsx |
| `lib/animations.ts` | Framer Motion variants | All animated components |
| `lib/utils.ts` | formatDate function | ArticleCard |

### TypeScript Types

Create shared types file:

**File:** `/frontend/lib/types/article.ts`

```typescript
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  meta_description?: string;
  featured_image?: string | null;
  category: Category;
  reading_time_minutes: number;
  published_at: string;
  is_featured: boolean;
}

export interface PaginatedArticles {
  items: Article[];
  count: number;
  page: number;
  pages: number;
}
```

---

## Success Criteria

1. ✅ **All Components Created**
   - CategoryBadge.tsx
   - ArticleCard.tsx
   - ArticleGrid.tsx
   - ArticleContent.tsx
   - culture/page.tsx
   - culture/[slug]/page.tsx

2. ✅ **TDD Compliance**
   - Tests written before implementation
   - All tests passing
   - No skipped tests

3. ✅ **Code Quality**
   - TypeScript strict mode: 0 errors
   - ESLint: 0 warnings
   - React 19 compatible (no forwardRef)

4. ✅ **Design Alignment**
   - Uses tea brand color palette
   - Typography hierarchy maintained
   - Animations use Framer Motion
   - Responsive design verified

5. ✅ **Integration**
   - Culture page linked in navigation
   - API integration working
   - SEO metadata generated
   - Error handling implemented

---

## Execution Plan Summary

| Task | Duration | TDD Phase | Files Created |
|------|----------|-----------|---------------|
| 6.6.1 CategoryBadge | 30 min | Red→Green→Refactor | category-badge.tsx + test |
| 6.6.2 ArticleCard | 90 min | Red→Green→Refactor | article-card.tsx + test |
| 6.6.3 ArticleGrid | 60 min | Red→Green→Refactor | article-grid.tsx + test |
| 6.6.4 ArticleContent | 90 min | Red→Green→Refactor | article-content.tsx + test |
| 6.7 Culture Listing | 120 min | Green | culture/page.tsx |
| 6.8 Article Detail | 120 min | Green | culture/[slug]/page.tsx |
| **Total** | **8.5 hours** | | **12 files** |

---

## Next Steps

After Phase 6 completion:
1. Proceed to **Phase 7: Subscription & Preference Quiz**
2. Backend: Quiz models and curation engine
3. Frontend: Quiz interface and subscription dashboard

---

## Approval Request

This remediation plan has been validated against:
- ✅ Master Execution Plan (Phase 6 requirements)
- ✅ Phase 6 Sub-Plan (TDD workflow)
- ✅ Existing codebase (design system patterns)
- ✅ Backend API (endpoint contracts)

**Ready for execution upon confirmation.**

> Reply "**EXECUTE**" to begin implementation following TDD methodology.
