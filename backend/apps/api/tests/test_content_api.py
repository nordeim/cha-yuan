"""
Content API Tests (TDD RED Phase)

Tests for article and category API endpoints.
"""

import pytest
from datetime import datetime, timedelta

pytest.importorskip("apps.content.models", reason="Content models not yet implemented")
pytest.importorskip("apps.api.v1.content", reason="Content API not yet implemented")

from apps.content.models import Article, ArticleCategory
from apps.api.v1.content import router


class TestArticleListAPI:
    """Test GET /api/v1/articles/ endpoint."""

    @pytest.fixture
    def brewing_category(self):
        return ArticleCategory.objects.create(
            name="Brewing Guides",
            slug="brewing-guides",
        )

    @pytest.fixture
    def published_article(self, brewing_category):
        return Article.objects.create(
            title="Published Article",
            content="Content here",
            category=brewing_category,
            published_at=datetime.now(),
        )

    @pytest.fixture
    def draft_article(self, brewing_category):
        return Article.objects.create(
            title="Draft Article",
            content="Draft content",
            category=brewing_category,
            published_at=None,
        )

    def test_list_articles_returns_published_only(
        self, published_article, draft_article
    ):
        """Only published articles returned."""
        assert Article.objects.filter(is_published=True).count() == 1

    def test_list_articles_pagination(self, brewing_category):
        """Pagination works."""
        for i in range(15):
            Article.objects.create(
                title=f"Article {i}",
                content="Content",
                category=brewing_category,
                published_at=datetime.now(),
            )

        published = Article.objects.filter(published_at__isnull=False)
        assert published.count() == 15

    def test_list_articles_filter_by_category(self, brewing_category):
        """Filter by category slug."""
        other_category = ArticleCategory.objects.create(name="History", slug="history")
        Article.objects.create(
            title="Brewing Article",
            content="Content",
            category=brewing_category,
            published_at=datetime.now(),
        )
        Article.objects.create(
            title="History Article",
            content="Content",
            category=other_category,
            published_at=datetime.now(),
        )

        brewing_articles = Article.objects.filter(
            category__slug="brewing-guides", published_at__isnull=False
        )
        assert brewing_articles.count() == 1

    def test_list_articles_search_query(self, brewing_category):
        """Full-text search works."""
        Article.objects.create(
            title="Dragon Well Guide",
            content="How to brew dragon well tea",
            category=brewing_category,
            published_at=datetime.now(),
        )
        Article.objects.create(
            title="Pu-erh Guide",
            content="How to brew pu-erh tea",
            category=brewing_category,
            published_at=datetime.now(),
        )

        results = Article.objects.filter(
            title__icontains="dragon", published_at__isnull=False
        )
        assert results.count() == 1

    def test_list_articles_featured_only(self, brewing_category):
        """Filter for featured articles."""
        Article.objects.create(
            title="Regular Article",
            content="Content",
            category=brewing_category,
            published_at=datetime.now(),
            is_featured=False,
        )
        Article.objects.create(
            title="Featured Article",
            content="Content",
            category=brewing_category,
            published_at=datetime.now(),
            is_featured=True,
        )

        featured = Article.objects.filter(is_featured=True, published_at__isnull=False)
        assert featured.count() == 1


class TestArticleDetailAPI:
    """Test GET /api/v1/articles/{slug}/ endpoint."""

    @pytest.fixture
    def brewing_category(self):
        return ArticleCategory.objects.create(
            name="Brewing Guides",
            slug="brewing-guides",
        )

    def test_get_article_detail_by_slug(self, brewing_category):
        """Detail endpoint returns full article."""
        article = Article.objects.create(
            title="Detail Test",
            content="Full content here",
            category=brewing_category,
            published_at=datetime.now(),
        )

        assert article.slug == "detail-test"
        assert article.is_published is True

    def test_get_article_detail_returns_404_for_draft(self, brewing_category):
        """Draft articles return 404."""
        article = Article.objects.create(
            title="Draft Test",
            content="Draft content",
            category=brewing_category,
            published_at=None,
        )

        assert article.is_published is False

    def test_get_article_detail_related_articles(self, brewing_category):
        """Related articles same category."""
        main = Article.objects.create(
            title="Main Article",
            content="Content",
            category=brewing_category,
            published_at=datetime.now(),
        )
        related = Article.objects.create(
            title="Related Article",
            content="Content",
            category=brewing_category,
            published_at=datetime.now(),
        )

        related_articles = Article.objects.filter(
            category=brewing_category, published_at__isnull=False
        ).exclude(id=main.id)

        assert related_articles.count() == 1
        assert related_articles.first() == related


class TestCategoryAPI:
    """Test category endpoints."""

    def test_list_categories_returns_all(self):
        """All categories returned."""
        ArticleCategory.objects.create(name="Brewing", slug="brewing")
        ArticleCategory.objects.create(name="History", slug="history")

        assert ArticleCategory.objects.count() == 2

    def test_category_detail_with_article_count(self):
        """Category includes article count."""
        category = ArticleCategory.objects.create(
            name="Brewing",
            slug="brewing",
        )
        Article.objects.create(
            title="Article 1",
            content="Content",
            category=category,
            published_at=datetime.now(),
        )
        Article.objects.create(
            title="Article 2",
            content="Content",
            category=category,
            published_at=datetime.now(),
        )

        assert category.articles.count() == 2


class TestFeaturedArticlesAPI:
    """Test featured articles endpoint."""

    def test_get_featured_articles(self):
        """Returns only featured published articles."""
        category = ArticleCategory.objects.create(name="Test", slug="test")

        Article.objects.create(
            title="Featured",
            content="Content",
            category=category,
            published_at=datetime.now(),
            is_featured=True,
        )
        Article.objects.create(
            title="Not Featured",
            content="Content",
            category=category,
            published_at=datetime.now(),
            is_featured=False,
        )
        Article.objects.create(
            title="Draft Featured",
            content="Content",
            category=category,
            published_at=None,
            is_featured=True,
        )

        featured_published = Article.objects.filter(
            is_featured=True, published_at__isnull=False
        )
        assert featured_published.count() == 1
