"""
Article Category Tests (TDD RED Phase)

Additional tests for ArticleCategory model focusing on
article relationships and counts.
"""

import pytest
from datetime import datetime

pytest.importorskip("apps.content.models", reason="Content models not yet implemented")

from apps.content.models import Article, ArticleCategory


class TestCategoryArticleCount:
    """Test category article counting."""

    @pytest.fixture
    def brewing_category(self):
        return ArticleCategory.objects.create(
            name="Brewing Guides",
            slug="brewing-guides",
        )

    @pytest.fixture
    def history_category(self):
        return ArticleCategory.objects.create(
            name="Tea History",
            slug="tea-history",
        )

    def test_category_article_count_zero(self, brewing_category):
        """Article count is 0 for new category."""
        assert brewing_category.articles.count() == 0

    def test_category_article_count_with_published(self, brewing_category):
        """Count includes published articles."""
        Article.objects.create(
            title="Published Article",
            content="Content",
            category=brewing_category,
            published_at=datetime.now(),
        )

        assert brewing_category.articles.count() == 1

    def test_category_article_count_includes_drafts(self, brewing_category):
        """Count includes draft articles."""
        Article.objects.create(
            title="Draft Article",
            content="Content",
            category=brewing_category,
            published_at=None,
        )

        assert brewing_category.articles.count() == 1

    def test_category_published_count_only(self, brewing_category):
        """Can filter to published only."""
        Article.objects.create(
            title="Published",
            content="Content",
            category=brewing_category,
            published_at=datetime.now(),
        )
        Article.objects.create(
            title="Draft",
            content="Content",
            category=brewing_category,
            published_at=None,
        )

        published_count = brewing_category.articles.filter(
            published_at__isnull=False
        ).count()

        assert published_count == 1

    def test_multiple_categories_separate_counts(
        self, brewing_category, history_category
    ):
        """Each category has independent article count."""
        Article.objects.create(
            title="Brewing Article",
            content="Content",
            category=brewing_category,
        )
        Article.objects.create(
            title="History Article 1",
            content="Content",
            category=history_category,
        )
        Article.objects.create(
            title="History Article 2",
            content="Content",
            category=history_category,
        )

        assert brewing_category.articles.count() == 1
        assert history_category.articles.count() == 2


class TestCategoryQuerySet:
    """Test category queryset methods."""

    def test_active_categories_only(self):
        """Can filter to active categories only."""
        active = ArticleCategory.objects.create(
            name="Active",
            slug="active",
            is_active=True,
        )
        ArticleCategory.objects.create(
            name="Inactive",
            slug="inactive",
            is_active=False,
        )

        active_categories = ArticleCategory.objects.filter(is_active=True)

        assert active_categories.count() == 1
        assert active_categories.first() == active

    def test_categories_with_articles(self):
        """Can filter categories that have articles."""
        with_articles = ArticleCategory.objects.create(
            name="With Articles",
            slug="with-articles",
        )
        without_articles = ArticleCategory.objects.create(
            name="Without Articles",
            slug="without-articles",
        )

        Article.objects.create(
            title="Article",
            content="Content",
            category=with_articles,
        )

        categories_with_articles = ArticleCategory.objects.filter(
            articles__isnull=False
        ).distinct()

        assert categories_with_articles.count() == 1
        assert categories_with_articles.first() == with_articles
