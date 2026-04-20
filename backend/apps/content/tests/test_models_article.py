"""
Article Model Tests (TDD RED Phase)

Tests for Article and ArticleCategory models.
These tests define the expected behavior before implementation.
"""

import pytest
from datetime import datetime, timedelta
from decimal import Decimal
from unittest.mock import Mock, patch


# These imports will fail initially (expected - RED phase)
# After implementing models, these will work (GREEN phase)
pytest.importorskip("apps.content.models", reason="Article models not yet implemented")

from apps.content.models import Article, ArticleCategory


class TestArticleCategory:
    """Test suite for ArticleCategory model."""

    @pytest.fixture
    def category_data(self):
        return {
            "name": "Brewing Guides",
            "slug": "brewing-guides",
            "description": "Learn how to brew tea like a master",
            "color": "#5C8A4D",  # tea-500
        }

    def test_category_creation(self, category_data):
        """ArticleCategory can be created with required fields."""
        category = ArticleCategory.objects.create(**category_data)

        assert category.id is not None
        assert category.name == "Brewing Guides"
        assert category.slug == "brewing-guides"
        assert category.is_active is True

    def test_category_slug_unique(self, category_data):
        """Duplicate slug should raise error."""
        ArticleCategory.objects.create(**category_data)

        with pytest.raises(Exception):  # IntegrityError
            ArticleCategory.objects.create(
                name="Another Name",
                slug="brewing-guides",  # Same slug
            )

    def test_category_str_representation(self, category_data):
        """String representation returns name."""
        category = ArticleCategory.objects.create(**category_data)
        assert str(category) == "Brewing Guides"

    def test_category_ordering(self):
        """Categories ordered by 'order' field."""
        cat3 = ArticleCategory.objects.create(name="Third", slug="third", order=30)
        cat1 = ArticleCategory.objects.create(name="First", slug="first", order=10)
        cat2 = ArticleCategory.objects.create(name="Second", slug="second", order=20)

        categories = list(ArticleCategory.objects.all())
        assert categories[0].name == "First"
        assert categories[1].name == "Second"
        assert categories[2].name == "Third"

    def test_category_default_is_active(self):
        """Default is_active is True."""
        category = ArticleCategory.objects.create(
            name="Test",
            slug="test",
        )
        assert category.is_active is True

    def test_category_default_color(self):
        """Default color is tea-500."""
        category = ArticleCategory.objects.create(
            name="Test",
            slug="test",
        )
        assert category.color == "#5C8A4D"


class TestArticle:
    """Test suite for Article model."""

    @pytest.fixture
    def category(self):
        return ArticleCategory.objects.create(
            name="Brewing Guides",
            slug="brewing-guides",
        )

    @pytest.fixture
    def article_data(self, category):
        return {
            "title": "How to Brew Green Tea",
            "content": "# Brewing Green Tea\n\n1. Heat water to 80°C\n2. Add 2g of tea leaves\n3. Steep for 2 minutes",
            "category": category,
        }

    def test_article_creation(self, article_data):
        """Article can be created with required fields."""
        article = Article.objects.create(**article_data)

        assert article.id is not None
        assert article.title == "How to Brew Green Tea"
        assert article.slug == "how-to-brew-green-tea"
        assert article.is_published is False  # Draft by default

    def test_article_slug_auto_generation(self, article_data):
        """Slug is auto-generated from title."""
        article = Article.objects.create(**article_data)
        assert article.slug == "how-to-brew-green-tea"

    def test_article_slug_unique(self, article_data):
        """Duplicate slug should be made unique."""
        Article.objects.create(**article_data)

        # Second article with same title
        article2 = Article.objects.create(
            title="How to Brew Green Tea",
            content="Different content",
            category=article_data["category"],
        )

        assert article2.slug != "how-to-brew-green-tea"
        assert "how-to-brew-green-tea" in article2.slug

    def test_article_excerpt_auto_generation(self, article_data):
        """Excerpt auto-generated from content if empty."""
        article = Article.objects.create(**article_data)

        # Should take first ~300 chars of content (plain text)
        assert article.excerpt is not None
        assert len(article.excerpt) <= 300
        assert "Brewing Green Tea" in article.excerpt

    def test_article_excerpt_preserves_custom(self, article_data):
        """Custom excerpt is preserved."""
        article_data["excerpt"] = "Custom excerpt here"
        article = Article.objects.create(**article_data)

        assert article.excerpt == "Custom excerpt here"

    def test_article_is_published_property(self, article_data):
        """is_published returns True when published_at is set."""
        article = Article.objects.create(**article_data)
        assert article.is_published is False

        # Publish the article
        article.published_at = datetime.now()
        article.save()

        assert article.is_published is True

    def test_article_published_at_optional(self, article_data):
        """published_at can be null (draft)."""
        article = Article.objects.create(**article_data)
        assert article.published_at is None

    def test_article_category_relationship(self, article_data, category):
        """Article has FK to Category."""
        article = Article.objects.create(**article_data)

        assert article.category == category
        assert article.category.name == "Brewing Guides"

    def test_article_reading_time_calculation(self, article_data):
        """Reading time calculated from content."""
        article = Article.objects.create(**article_data)

        # Content has ~50 words, reading at 200 wpm = ~1 minute
        assert article.reading_time_minutes >= 1

    def test_article_meta_description_max_length(self, article_data):
        """Meta description truncated at 160 chars."""
        article_data["meta_description"] = "a" * 200
        article = Article.objects.create(**article_data)

        assert len(article.meta_description) <= 160

    def test_article_featured_image_optional(self, article_data):
        """Featured image is optional."""
        article = Article.objects.create(**article_data)
        assert article.featured_image == ""

    def test_article_is_featured_default(self, article_data):
        """Default is_featured is False."""
        article = Article.objects.create(**article_data)
        assert article.is_featured is False

    def test_article_ordering(self, category):
        """Articles ordered by -published_at, -created_at."""
        # Create articles with different dates
        article1 = Article.objects.create(
            title="Article 1",
            content="Content 1",
            category=category,
            published_at=datetime.now() - timedelta(days=2),
        )
        article2 = Article.objects.create(
            title="Article 2",
            content="Content 2",
            category=category,
            published_at=datetime.now() - timedelta(days=1),
        )
        article3 = Article.objects.create(
            title="Article 3",
            content="Content 3",
            category=category,
            published_at=None,  # Draft
        )

        articles = list(Article.objects.all())
        # Published articles first, newest first
        assert articles[0] == article2
        assert articles[1] == article1
        assert articles[2] == article3

    def test_article_timestamps(self, article_data):
        """created_at and updated_at are set automatically."""
        article = Article.objects.create(**article_data)

        assert article.created_at is not None
        assert article.updated_at is not None

    def test_article_str_representation(self, article_data):
        """String representation returns title."""
        article = Article.objects.create(**article_data)
        assert str(article) == "How to Brew Green Tea"


class TestArticlePublishing:
    """Test article publishing workflows."""

    @pytest.fixture
    def category(self):
        return ArticleCategory.objects.create(
            name="History",
            slug="history",
        )

    def test_publish_draft_article(self, category):
        """Can publish a draft article."""
        article = Article.objects.create(
            title="Draft Article",
            content="Draft content",
            category=category,
        )

        assert article.is_published is False

        article.published_at = datetime.now()
        article.save()

        assert article.is_published is True

    def test_unpublish_article(self, category):
        """Can unpublish by clearing published_at."""
        article = Article.objects.create(
            title="Published Article",
            content="Content",
            category=category,
            published_at=datetime.now(),
        )

        assert article.is_published is True

        article.published_at = None
        article.save()

        assert article.is_published is False

    def test_scheduled_publishing(self, category):
        """Can schedule article for future publication."""
        future_date = datetime.now() + timedelta(days=7)

        article = Article.objects.create(
            title="Future Article",
            content="Future content",
            category=category,
            published_at=future_date,
        )

        assert article.is_published is True
        assert article.published_at > datetime.now()


class TestArticleContent:
    """Test article content handling."""

    @pytest.fixture
    def category(self):
        return ArticleCategory.objects.create(
            name="Tasting Notes",
            slug="tasting-notes",
        )

    def test_article_markdown_content(self, category):
        """Article stores markdown content."""
        markdown = """# Dragon Well Tea

This is **premium** green tea from *Hangzhou*.

## Brewing Instructions

1. Heat water to 80°C
2. Use 2g per 100ml
3. Steep for 2-3 minutes

> Pro tip: Don't use boiling water!

```python
# Code block example
brew_time = 180  # seconds
```
"""
        article = Article.objects.create(
            title="Dragon Well Guide",
            content=markdown,
            category=category,
        )

        assert article.content == markdown
        assert "# Dragon Well Tea" in article.content

    def test_article_long_content(self, category):
        """Article can store long content."""
        long_content = "Word " * 5000  # ~30,000 chars

        article = Article.objects.create(
            title="Long Article",
            content=long_content,
            category=category,
        )

        assert len(article.content) > 25000
