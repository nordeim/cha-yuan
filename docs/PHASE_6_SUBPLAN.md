# Phase 6: Tea Culture Content

> **Duration:** Days 29-32 (4 days)
> **TDD Principle:** Content model tests → Article rendering tests → Implementation
> **Status:** READY FOR EXECUTION

---

## Executive Summary

This phase implements the Tea Culture content system — educational articles about brewing guides, tasting notes, and tea history. Following TDD methodology, we write tests first, then implement models and API endpoints, then create frontend pages. This phase also addresses the minor technical debt accumulated in Phase 5.

---

## Cross-Phase Alignment Review

### Dependencies from Previous Phases

| Phase | Dependency | Status | Impact on Phase 6 |
|-------|-----------|--------|-------------------|
| **Phase 3** | Design system (colors, typography) | ✅ Complete | Article cards use tea-* color palette |
| **Phase 3** | Animation system | ✅ Complete | Article transitions use fadeInUp |
| **Phase 3** | Shadcn UI components | ✅ Complete | Article cards use Card component |
| **Phase 4** | Product API patterns | ✅ Complete | Content API follows same patterns |
| **Phase 5** | GST Badge component | ✅ Complete | Reused in article teasers |

### ⚠️ Minor Issues from Phase 5 (Address in Phase 6)

| Issue | Severity | Resolution in Phase 6 |
|-------|----------|----------------------|
| Missing `sonner` toast library | MEDIUM | Install sonner OR replace with custom toast |
| auth-fetch import path issues | MEDIUM | Fix import paths, ensure proper exports |
| Missing UI components (Label, ScrollArea) | LOW | Verify all components exist OR create |
| Build dependency warnings | LOW | Clean up imports, ensure consistent patterns |

---

## TDD Workflow (Red-Green-Refactor)

```
┌─────────────────────────────────────────────────────────────────┐
│ RED: Write content model tests that define Article behavior     │
│ ↓                                                               │
│ GREEN: Implement Django Article model with all fields           │
│ ↓                                                               │
│ REFACTOR: Clean model code, add admin customization             │
│ ↓                                                               │
│ RED: Write API endpoint tests for content listing/detail        │
│ ↓                                                               │
│ GREEN: Implement Django Ninja API endpoints                   │
│ ↓                                                               │
│ REFACTOR: Add pagination, filtering, search                   │
│ ↓                                                               │
│ RED: Write frontend component tests for ArticleCard             │
│ ↓                                                               │
│ GREEN: Implement React components with proper typing           │
│ ↓                                                               │
│ VERIFY: Run full test suite, integration tests                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 6 Task Breakdown

### 6.0 Address Phase 5 Technical Debt (Day 29 - Morning)

**Priority: HIGH**

| Task | Description | Status |
|------|-------------|--------|
| 6.0.1 | Install missing `sonner` toast library | ⬜ |
| 6.0.2 | Fix auth-fetch import/export paths | ⬜ |
| 6.0.3 | Verify/create missing UI components (Label, ScrollArea, etc.) | ⬜ |
| 6.0.4 | Clean up checkout page imports | ⬜ |
| 6.0.5 | Run TypeScript check to verify fixes | ⬜ |

**Files to Modify:**
- `/frontend/package.json` - Add sonner dependency
- `/frontend/lib/auth-fetch.ts` - Fix exports
- `/frontend/components/ui/label.tsx` - Create if missing
- `/frontend/components/ui/scroll-area.tsx` - Create if missing

---

### 6.1 Content Model Tests (Day 29 - Afternoon) - RED Phase

**Test Files to Create:**

| Test File | Test Cases | Coverage Target |
|-----------|------------|-----------------|
| `/backend/content/tests/test_models_article.py` | 15+ test cases | Article CRUD, validation |
| `/backend/content/tests/test_models_category.py` | 8+ test cases | Category hierarchy |
| `/backend/content/tests/test_article_publishing.py` | 6+ test cases | Publish/draft states |

**Test Cases Checklist:**
- [ ] `test_article_creation_with_required_fields()` - Creates with title, slug, content
- [ ] `test_article_slug_auto_generation()` - Slug generated from title
- [ ] `test_article_slug_unique_constraint()` - Duplicate slug raises error
- [ ] `test_article_published_at_optional()` - Can be null (draft)
- [ ] `test_article_is_published_property()` - Returns true if published
- [ ] `test_article_category_relationship()` - FK to Category works
- [ ] `test_article_featured_image_optional()` - Image can be null
- [ ] `test_article_excerpt_auto_generation()` - Excerpt from content if empty
- [ ] `test_article_meta_description_max_length()` - Truncates at 160 chars
- [ ] `test_article_reading_time_calculation()` - Estimates reading time
- [ ] `test_article_content_markdown_storage()` - Stores as markdown
- [ ] `test_category_creation()` - Category with name, slug, description
- [ ] `test_category_article_count()` - Returns published article count
- [ ] `test_article_ordering_by_published_at()` - Most recent first
- [ ] `test_article_scheduled_publishing()` - Future publish date

**Article Model Fields (from Master Plan):**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | Char(200) | ✅ | Article title |
| `title_i18n` | JSON | ❌ | Localized titles |
| `slug` | Slug | ✅ | URL-friendly identifier |
| `content` | Text | ✅ | Markdown content |
| `content_i18n` | JSON | ❌ | Localized content |
| `excerpt` | Text | ❌ | Auto-generated if empty |
| `category` | FK | ✅ | Category relationship |
| `featured_image` | Image | ❌ | Cover image |
| `meta_description` | Char(160) | ❌ | SEO meta |
| `published_at` | DateTime | ❌ | Null = draft |
| `is_featured` | Boolean | ❌ | Featured article |
| `reading_time_minutes` | Int | ❌ | Auto-calculated |
| `created_at` | DateTime | Auto | Timestamp |
| `updated_at` | DateTime | Auto | Timestamp |

---

### 6.2 Content Models Implementation (Day 29 - Afternoon) - GREEN Phase

**File:** `/backend/content/models.py`

**Models to Implement:**

| Model | Status | Tests Pass |
|-------|--------|------------|
| `ArticleCategory` | ⬜ | ⬜ |
| `Article` | ⬜ | ⬜ |
| `ArticleImage` | ⬜ | ⬜ (optional) |

**ArticleCategory Model:**
```python
class ArticleCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default="#5C8A4D")  # tea-500
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
```

**Article Model:**
```python
class Article(models.Model):
    title = models.CharField(max_length=200)
    title_i18n = models.JSONField(default=dict, blank=True)
    slug = models.SlugField(unique=True, max_length=200)
    content = models.TextField()
    content_i18n = models.JSONField(default=dict, blank=True)
    excerpt = models.TextField(blank=True)
    category = models.ForeignKey(ArticleCategory, on_delete=models.CASCADE, related_name='articles')
    featured_image = models.ImageField(upload_to='articles/', blank=True, null=True)
    meta_description = models.CharField(max_length=160, blank=True)
    published_at = models.DateTimeField(blank=True, null=True, db_index=True)
    is_featured = models.BooleanField(default=False, db_index=True)
    reading_time_minutes = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Checklist:**
- [ ] Auto-generate slug from title if not provided
- [ ] Auto-generate excerpt from content (first 300 chars)
- [ ] Calculate reading time (200 words/minute average)
- [ ] `is_published` property based on `published_at`
- [ ] Save method updates `updated_at`
- [ ] Meta options: ordering by `-published_at`, `-created_at`

---

### 6.3 Django Admin Configuration (Day 30 - Morning)

**File:** `/backend/content/admin.py`

**Admin Features:**
- [ ] Rich text editor (TinyMCE or Markdown editor)
- [ ] Image upload with preview
- [ ] Slug auto-population from title
- [ ] Published status indicator
- [ ] Filter by category, publish status
- [ ] Search by title, content
- [ ] List display: title, category, status, published_at
- [ ] Actions: publish, unpublish, feature, unfeature

**Checklist:**
- [ ] `ArticleCategoryAdmin` - list display, search
- [ ] `ArticleAdmin` - rich editing, filters, actions
- [ ] `publish_selected` admin action
- [ ] `make_featured` admin action

---

### 6.4 Content API Tests (Day 30 - Morning) - RED Phase

**Test Files to Create:**

| Test File | Test Cases | Priority |
|-----------|------------|----------|
| `/backend/api/tests/test_content_api.py` | 12+ test cases | HIGH |

**Test Cases:**
- [ ] `test_list_articles_returns_published_only()` - Drafts excluded
- [ ] `test_list_articles_pagination()` - Page size, page number
- [ ] `test_list_articles_filter_by_category()` - Category slug filter
- [ ] `test_list_articles_search_query()` - Full-text search
- [ ] `test_list_articles_featured_only()` - Featured filter
- [ ] `test_get_article_detail_by_slug()` - Full content returned
- [ ] `test_get_article_detail_increments_views()` - View tracking
- [ ] `test_get_article_detail_related_articles()` - Related by category
- [ ] `test_article_detail_404_for_draft()` - Draft returns 404
- [ ] `test_list_categories_returns_all()` - All categories
- [ ] `test_category_detail_with_article_count()` - Count included
- [ ] `test_article_content_rendered_markdown()` - HTML output

---

### 6.5 Content API Implementation (Day 30 - Afternoon) - GREEN Phase

**File:** `/backend/api/v1/content.py`

**Endpoints:**

| Endpoint | Method | Status | Tests Pass |
|----------|--------|--------|------------|
| `GET /api/v1/articles/` | List published articles | ⬜ | ⬜ |
| `GET /api/v1/articles/{slug}/` | Article detail | ⬜ | ⬜ |
| `GET /api/v1/articles/featured/` | Featured articles | ⬜ | ⬜ |
| `GET /api/v1/categories/` | List categories | ⬜ | ⬜ |
| `GET /api/v1/categories/{slug}/` | Category with articles | ⬜ | ⬜ |

**Query Parameters:**
- [ ] `category` - Filter by category slug
- [ ] `search` - Full-text search
- [ ] `featured` - Boolean for featured only
- [ ] `page` - Page number
- [ ] `page_size` - Items per page (default 9)

**Response Schemas:**
- [ ] `ArticleListSchema` - Summary for listing
- [ ] `ArticleDetailSchema` - Full with content
- [ ] `CategorySchema` - Category with article count

---

### 6.6 Frontend Components (Day 31) - RED→GREEN Phase

**Test Files (Write First):**
- `/frontend/components/__tests__/article-card.test.tsx`

**Test Cases:**
- [ ] `test_article_card_renders_title()` - Title in font-serif
- [ ] `test_article_card_shows_excerpt()` - Excerpt displayed
- [ ] `test_article_card_shows_category()` - Category badge
- [ ] `test_article_card_shows_reading_time()` - Time estimate
- [ ] `test_article_card_shows_published_date()` - Formatted date
- [ ] `test_article_card_shows_featured_image()` - Image with alt
- [ ] `test_article_card_has_correct_link()` - Link to /culture/{slug}
- [ ] `test_article_card_hover_animation()` - Scale on hover

**Components to Create:**

| Component | File | Features |
|-----------|------|----------|
| `ArticleCard` | `/components/article-card.tsx` | Image, title, excerpt, category, reading time |
| `ArticleGrid` | `/components/article-grid.tsx` | Responsive grid with animations |
| `ArticleContent` | `/components/article-content.tsx` | Markdown rendering with typography |
| `CategoryBadge` | `/components/category-badge.tsx` | Colored badge with category name |
| `ReadingTime` | `/components/reading-time.tsx` | Clock icon + minutes |
| `BrewingGuideWidget` | `/components/brewing-guide-widget.tsx` | Temp/time display for articles |

**ArticleCard Props Interface:**
```typescript
interface ArticleCardProps {
  article: {
    slug: string;
    title: string;
    excerpt: string;
    featured_image?: string;
    category: {
      name: string;
      slug: string;
      color?: string;
    };
    reading_time_minutes: number;
    published_at: string;
    is_featured?: boolean;
  };
}
```

---

### 6.7 Culture Listing Page (Day 31 - Afternoon) - GREEN Phase

**File:** `/frontend/app/culture/page.tsx` (Server Component)

**Features Checklist:**
- [ ] Server-side data fetching via `authFetch`
- [ ] Hero section with featured articles
- [ ] Category filter sidebar (Client Component)
- [ ] Article grid with ArticleCard components
- [ ] Pagination
- [ ] SEO metadata generation
- [ ] Empty state when no articles

**Page Structure:**
```
┌─────────────────────────────────────────────────────────┐
│  HERO: Featured Articles (3 columns on desktop)          │
├─────────────────────────────────────────────────────────┤
│  FILTER BAR: Category tabs + Search                      │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────────────────────┐  │
│  │             │  │  ARTICLE GRID (3 cols desktop)   │  │
│  │  CATEGORIES │  │  ┌─────┐ ┌─────┐ ┌─────┐      │  │
│  │  SIDEBAR    │  │  │Card │ │Card │ │Card │      │  │
│  │             │  │  └─────┘ └─────┘ └─────┘      │  │
│  └─────────────┘  └─────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  PAGINATION                                            │
└─────────────────────────────────────────────────────────┘
```

---

### 6.8 Article Detail Page (Day 32) - GREEN Phase

**File:** `/frontend/app/culture/[slug]/page.tsx` (Server Component)

**Features Checklist:**
- [ ] Dynamic route with slug parameter
- [ ] Server-side fetch by slug
- [ ] 404 handling for invalid/draft slugs
- [ ] Featured image with overlay
- [ ] Typography hierarchy (serif headings)
- [ ] Category badge
- [ ] Published date + reading time
- [ ] Markdown content rendering
- [ ] Table of contents (optional)
- [ ] Related articles (same category)
- [ ] Social sharing buttons
- [ ] SEO metadata (title, description, OG image)

**Typography for Markdown:**
- [ ] H1: `font-serif text-4xl text-bark-900`
- [ ] H2: `font-serif text-2xl text-bark-900 mt-8 mb-4`
- [ ] H3: `font-serif text-xl text-bark-900 mt-6 mb-3`
- [ ] P: `text-bark-700 leading-relaxed mb-4`
- [ ] Blockquote: `border-l-4 border-tea-500 pl-4 italic`
- [ ] Code: `bg-ivory-200 px-2 py-1 rounded`
- [ ] UL/OL: `list-disc list-inside space-y-2`

---

### 6.9 Markdown Rendering Tests (Day 32) - RED Phase

**Test File:** `/frontend/components/__tests__/article-content.test.tsx`

**Test Cases:**
- [ ] `test_renders_headings_correctly()` - H1, H2, H3 with proper styles
- [ ] `test_renders_paragraphs()` - Text with proper spacing
- [ ] `test_renders_links()` - Links with tea-600 color
- [ ] `test_renders_images()` - Images with lazy loading
- [ ] `test_renders_lists()` - UL and OL styling
- [ ] `test_renders_blockquotes()` - Styled blockquotes
- [ ] `test_renders_code_blocks()` - Syntax highlighting
- [ ] `test_renders_tables()` - Responsive tables

---

### 6.10 Markdown Rendering Implementation (Day 32) - GREEN Phase

**File:** `/frontend/components/article-content.tsx`

**Libraries:**
- [ ] `react-markdown` - Markdown to React
- [ ] `remark-gfm` - GitHub-flavored markdown
- [ ] `rehype-highlight` - Syntax highlighting

**Custom Components:**
```typescript
const components = {
  h1: ({ children }) => <h1 className="font-serif text-4xl text-bark-900 mb-6">{children}</h1>,
  h2: ({ children }) => <h2 className="font-serif text-2xl text-bark-900 mt-8 mb-4">{children}</h2>,
  p: ({ children }) => <p className="text-bark-700 leading-relaxed mb-4">{children}</p>,
  a: ({ href, children }) => <a href={href} className="text-tea-600 hover:underline">{children}</a>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-tea-500 pl-4 italic text-bark-700 my-6">
      {children}
    </blockquote>
  ),
  // ... more components
};
```

---

## Integration Checklist

### Backend Integration
- [ ] Article endpoints registered in `/backend/api/v1/urls.py`
- [ ] Pagination configured (9 articles per page)
- [ ] CORS headers configured
- [ ] Media files configuration for uploads
- [ ] Admin media serving in development

### Frontend Integration
- [ ] Culture page linked in navigation
- [ ] Article detail links from listing
- [ ] SEO-friendly URLs with slugs
- [ ] Error boundaries for API failures
- [ ] Loading states with skeletons

---

## Verification Gates

| Gate | Criteria | Check |
|------|----------|-------|
| **Tests Pass** | All content tests pass (`pytest content/tests/`) | ⬜ |
| **Type Check** | TypeScript strict mode passes | ⬜ |
| **Build** | `npm run build` succeeds | ⬜ |
| **E2E** | Culture pages render, articles display | ⬜ |
| **Markdown** | Article content renders with proper styling | ⬜ |
| **Phase 5 Debt** | All Phase 5 minor issues resolved | ⬜ |

---

## Success Criteria

1. ✅ **Article Management**
   - Articles can be created/edited in Django Admin
   - Markdown editor works properly
   - Image upload functional
   - Publish/unpublish actions work

2. ✅ **API Functionality**
   - All 5 endpoints return correct data
   - Pagination works
   - Filtering by category works
   - Search functionality works

3. ✅ **Frontend Pages**
   - Culture listing page renders
   - Article detail page shows full content
   - Markdown renders with proper styling
   - Navigation between articles works

4. ✅ **TDD Compliance**
   - Tests written before implementation
   - All tests passing
   - No skipped tests

5. ✅ **Code Quality**
   - No TypeScript errors (strict mode)
   - No ESLint warnings
   - Components follow established patterns

6. ✅ **Phase 5 Debt Resolved**
   - Missing dependencies installed
   - Import paths fixed
   - Build warnings resolved

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Markdown XSS | Sanitize HTML output, use react-markdown security |
| Large images | Image optimization with next/image |
| Slow article load | Server-side rendering for SEO, CDN for images |
| Content editor complexity | Use proven editor (TinyMCE), provide training |

---

## Next Steps

After Phase 6 completion, proceed to **Phase 7: Subscription & Preference Quiz** (Quiz models, curation engine, subscription dashboard).

---

## TDD Execution Log

### Day 29: Write Content Model Tests (RED)

```bash
# 1. Write Article model tests
cat > backend/content/tests/test_models_article.py << 'EOF'
import pytest
from content.models import Article, ArticleCategory

def test_article_creation():
    """Article can be created with required fields."""
    category = ArticleCategory.objects.create(name="Brewing Guides", slug="brewing")
    article = Article.objects.create(
        title="How to Brew Green Tea",
        content="Brewing instructions...",
        category=category,
    )
    assert article.slug == "how-to-brew-green-tea"
    assert article.is_published is False  # Draft by default
EOF

# 2. Run tests (expect FAIL)
pytest backend/content/tests/test_models_article.py -v
# EXPECTED: FAILED (models don't exist yet)

# 3. Implement models
# ... implement Article and ArticleCategory models ...

# 4. Run tests (expect PASS)
pytest backend/content/tests/test_models_article.py -v
# EXPECTED: PASSED

# 5. Refactor and add more tests...
```

---

## Ready for Execution

**Confirmation Required:**

Reply "**yes**" to proceed with:
1. ✅ Fix Phase 5 technical debt (install dependencies, fix imports)
2. ✅ Write content model tests (RED phase)
3. ✅ Implement Article and ArticleCategory models (GREEN phase)
4. ✅ Configure Django Admin with rich editor
5. ✅ Write content API tests
6. ✅ Implement content API endpoints
7. ✅ Create frontend ArticleCard component
8. ✅ Build culture listing page
9. ✅ Build article detail page with markdown
10. ✅ Implement markdown rendering with custom components
11. ✅ Run full test suite
12. ✅ Verify build passes

Or specify modifications to this plan.

---

## Phase 6 TODO Tracker

| Task | Duration | Status | Priority |
|------|----------|--------|----------|
| **6.0** Fix Phase 5 Technical Debt | 2 hours | ⬜ Pending | HIGH |
| 6.0.1 Install sonner dependency | 15 min | ⬜ | HIGH |
| 6.0.2 Fix auth-fetch imports | 30 min | ⬜ | HIGH |
| 6.0.3 Verify UI components | 30 min | ⬜ | HIGH |
| 6.0.4 Clean checkout imports | 30 min | ⬜ | MEDIUM |
| 6.0.5 Run typecheck | 15 min | ⬜ | HIGH |
| **6.1** Write Content Model Tests | 3 hours | ⬜ Pending | HIGH |
| 6.1.1 Article model tests | 90 min | ⬜ | HIGH |
| 6.1.2 Category model tests | 45 min | ⬜ | HIGH |
| 6.1.3 Publishing state tests | 45 min | ⬜ | HIGH |
| **6.2** Implement Content Models | 3 hours | ⬜ Pending | HIGH |
| 6.2.1 ArticleCategory model | 45 min | ⬜ | HIGH |
| 6.2.2 Article model | 90 min | ⬜ | HIGH |
| 6.2.3 Run model tests | 45 min | ⬜ | HIGH |
| **6.3** Django Admin Config | 2 hours | ⬜ Pending | MEDIUM |
| 6.3.1 Category admin | 30 min | ⬜ | MEDIUM |
| 6.3.2 Article admin | 60 min | ⬜ | MEDIUM |
| 6.3.3 Rich editor integration | 30 min | ⬜ | MEDIUM |
| **6.4** Write Content API Tests | 2 hours | ⬜ Pending | HIGH |
| 6.4.1 List endpoint tests | 60 min | ⬜ | HIGH |
| 6.4.2 Detail endpoint tests | 60 min | ⬜ | HIGH |
| **6.5** Implement Content API | 3 hours | ⬜ Pending | HIGH |
| 6.5.1 Content router | 60 min | ⬜ | HIGH |
| 6.5.2 Article endpoints | 90 min | ⬜ | HIGH |
| 6.5.3 Category endpoints | 30 min | ⬜ | HIGH |
| **6.6** Frontend Components | 4 hours | ⬜ Pending | HIGH |
| 6.6.1 ArticleCard component | 90 min | ⬜ | HIGH |
| 6.6.2 ArticleGrid component | 60 min | ⬜ | HIGH |
| 6.6.3 CategoryBadge component | 30 min | ⬜ | MEDIUM |
| 6.6.4 ReadingTime component | 30 min | ⬜ | MEDIUM |
| 6.6.5 Component tests | 30 min | ⬜ | HIGH |
| **6.7** Culture Listing Page | 3 hours | ⬜ Pending | HIGH |
| 6.7.1 Server Component structure | 60 min | ⬜ | HIGH |
| 6.7.2 Hero section | 60 min | ⬜ | MEDIUM |
| 6.7.3 Filter sidebar | 60 min | ⬜ | MEDIUM |
| **6.8** Article Detail Page | 4 hours | ⬜ Pending | HIGH |
| 6.8.1 Dynamic route setup | 30 min | ⬜ | HIGH |
| 6.8.2 Page layout | 60 min | ⬜ | HIGH |
| 6.8.3 Related articles | 60 min | ⬜ | MEDIUM |
| 6.8.4 SEO metadata | 30 min | ⬜ | MEDIUM |
| **6.9** Markdown Rendering Tests | 2 hours | ⬜ Pending | HIGH |
| 6.9.1 Write markdown tests | 90 min | ⬜ | HIGH |
| **6.10** Markdown Implementation | 3 hours | ⬜ Pending | HIGH |
| 6.10.1 Install markdown libs | 15 min | ⬜ | HIGH |
| 6.10.2 ArticleContent component | 90 min | ⬜ | HIGH |
| 6.10.3 Custom renderers | 60 min | ⬜ | MEDIUM |
| **6.11** Build Verification | 2 hours | ⬜ Pending | HIGH |
| 6.11.1 TypeScript check | 30 min | ⬜ | HIGH |
| 6.11.2 Frontend build | 30 min | ⬜ | HIGH |
| 6.11.3 Integration tests | 60 min | ⬜ | HIGH |

**Total Estimated Duration:** 4 days (Days 29-32)
