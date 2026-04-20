"""
Content API Endpoints - Django Ninja

API for tea culture articles and categories.
"""

from typing import List, Optional
from datetime import datetime

from ninja import Router, Schema, Query
from ninja.pagination import paginate
from ninja.errors import HttpError
from django.db.models import Q

from apps.content.models import Article, ArticleCategory


router = Router(tags=["content"])


# ============================================================================
# Schemas
# ============================================================================


class CategorySchema(Schema):
    """Category response schema."""

    id: int
    name: str
    slug: str
    description: str
    color: str


class CategoryDetailSchema(CategorySchema):
    """Category with article count."""

    article_count: int


class ArticleListSchema(Schema):
    """Article summary for listing."""

    id: int
    title: str
    slug: str
    excerpt: str
    category: CategorySchema
    featured_image: Optional[str] = None
    reading_time_minutes: int
    published_at: Optional[datetime] = None
    is_featured: bool


class ArticleDetailSchema(ArticleListSchema):
    """Full article with content."""

    content: str
    meta_description: str


class ArticleFilters(Schema):
    """Query filters for articles."""

    category: Optional[str] = None
    search: Optional[str] = None
    featured: Optional[bool] = None


class PaginatedResponse(Schema):
    """Paginated response wrapper."""

    items: List[ArticleListSchema]
    count: int
    page: int
    pages: int


# ============================================================================
# Helper Functions
# ============================================================================


def get_published_articles():
    """Get queryset of published articles."""
    return Article.objects.filter(published_at__isnull=False).select_related("category")


def apply_filters(queryset, filters: ArticleFilters):
    """Apply filters to article queryset."""
    # Category filter
    if filters.category:
        queryset = queryset.filter(category__slug=filters.category)

    # Featured filter
    if filters.featured is not None:
        queryset = queryset.filter(is_featured=filters.featured)

    # Search filter
    if filters.search:
        queryset = queryset.filter(
            Q(title__icontains=filters.search)
            | Q(content__icontains=filters.search)
            | Q(excerpt__icontains=filters.search)
        )

    return queryset


# ============================================================================
# Endpoints
# ============================================================================


@router.get("/articles/", response=List[ArticleListSchema])
@paginate
def list_articles(request, filters: ArticleFilters = Query(...)):
    """
    List published articles.

    Query params:
    - category: Filter by category slug
    - search: Full-text search
    - featured: Filter featured articles only
    """
    queryset = get_published_articles()
    queryset = apply_filters(queryset, filters)

    return queryset


@router.get("/articles/featured/", response=List[ArticleListSchema])
def list_featured_articles(request, limit: int = 6):
    """
    Get featured published articles.

    Query params:
    - limit: Number of articles to return (default 6)
    """
    queryset = get_published_articles().filter(is_featured=True)
    return list(queryset[:limit])


@router.get("/articles/{slug}/", response=ArticleDetailSchema)
def get_article_detail(request, slug: str):
    """
    Get full article by slug.

    Returns 404 if article not found or not published.
    """
    try:
        article = Article.objects.select_related("category").get(
            slug=slug,
            published_at__isnull=False,
        )
        return article
    except Article.DoesNotExist:
        raise HttpError(404, "Article not found")


@router.get("/articles/{slug}/related/", response=List[ArticleListSchema])
def get_related_articles(request, slug: str, limit: int = 3):
    """
    Get related articles (same category).

    Query params:
    - limit: Number of articles to return (default 3)
    """
    try:
        article = Article.objects.get(
            slug=slug,
            published_at__isnull=False,
        )

        related = (
            get_published_articles()
            .filter(category=article.category)
            .exclude(id=article.id)[:limit]
        )

        return list(related)
    except Article.DoesNotExist:
        raise HttpError(404, "Article not found")


@router.get("/categories/", response=List[CategorySchema])
def list_categories(request):
    """
    List all active article categories.
    """
    return ArticleCategory.objects.filter(is_active=True)


@router.get("/categories/{slug}/", response=CategoryDetailSchema)
def get_category_detail(request, slug: str):
    """
    Get category with article count.
    """
    try:
        category = ArticleCategory.objects.get(slug=slug, is_active=True)

        return {
            "id": category.id,
            "name": category.name,
            "slug": category.slug,
            "description": category.description,
            "color": category.color,
            "article_count": category.articles.filter(
                published_at__isnull=False
            ).count(),
        }
    except ArticleCategory.DoesNotExist:
        raise HttpError(404, "Category not found")


@router.get("/categories/{slug}/articles/", response=List[ArticleListSchema])
@paginate
def list_category_articles(request, slug: str):
    """
    List published articles in a category.
    """
    try:
        category = ArticleCategory.objects.get(slug=slug, is_active=True)
        return get_published_articles().filter(category=category)
    except ArticleCategory.DoesNotExist:
        raise HttpError(404, "Category not found")
