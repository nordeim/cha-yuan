"""
Content Models - Tea Culture Articles and Quiz System
Article, ArticleCategory, QuizQuestion, QuizChoice, and UserPreference models.
"""

import re
from collections import defaultdict
from django.db import models
from django.utils.text import slugify


class ArticleCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, max_length=100)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default="#5C8A4D")
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "name"]
        verbose_name = "Article Category"
        verbose_name_plural = "Article Categories"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Article(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    content = models.TextField()
    excerpt = models.TextField(blank=True)
    meta_description = models.CharField(max_length=160, blank=True)
    category = models.ForeignKey(
        ArticleCategory,
        on_delete=models.CASCADE,
        related_name="articles",
    )
    featured_image = models.ImageField(upload_to="articles/", blank=True)
    published_at = models.DateTimeField(blank=True, null=True, db_index=True)
    is_featured = models.BooleanField(default=False, db_index=True)
    reading_time_minutes = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]
        verbose_name = "Article"
        verbose_name_plural = "Articles"

    def __str__(self):
        return self.title

    @property
    def is_published(self):
        return self.published_at is not None

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            self.slug = self._generate_unique_slug(base_slug)

        if not self.excerpt:
            self.excerpt = self._generate_excerpt()

        self.reading_time_minutes = self._calculate_reading_time()

        if len(self.meta_description) > 160:
            self.meta_description = self.meta_description[:157] + "..."

        super().save(*args, **kwargs)

    def _generate_unique_slug(self, base_slug):
        slug = base_slug
        counter = 1
        while Article.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        return slug

    def _generate_excerpt(self):
        plain_text = re.sub(r"[#*_`\[\]\(\)!]", "", self.content)
        plain_text = " ".join(plain_text.split())
        if len(plain_text) <= 300:
            return plain_text
        return plain_text[:297] + "..."

    def _calculate_reading_time(self):
        plain_text = re.sub(r"[#*_`\[\]\(\)!]", "", self.content)
        word_count = len(plain_text.split())
        return max(1, round(word_count / 200))


# =============================================================================
# QUIZ MODELS
# =============================================================================


class QuizQuestion(models.Model):
    """
    Quiz question for onboarding preference quiz.
    One-time completion - users cannot retake or edit answers per scope.
    """

    question_text = models.CharField(max_length=500)
    question_text_i18n = models.JSONField(default=dict, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_required = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Quiz Question"
        verbose_name_plural = "Quiz Questions"

    def __str__(self):
        """Return truncated question text."""
        if len(self.question_text) > 50:
            return f"{self.question_text[:47]}..."
        return self.question_text


class QuizChoice(models.Model):
    """
    Answer choice for a quiz question with preference weights.
    Weights determine how much this choice contributes to category preferences.
    Example: {"green_tea": 0.8, "oolong": 0.3, "black_tea": 0.1}
    """

    question = models.ForeignKey(
        QuizQuestion,
        on_delete=models.CASCADE,
        related_name="choices",
    )
    choice_text = models.CharField(max_length=200)
    choice_text_i18n = models.JSONField(default=dict, blank=True)
    # Weights: {"green_tea": 0.8, "oolong": 0.3, "black_tea": 0.1}
    preference_weights = models.JSONField(default=dict, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Quiz Choice"
        verbose_name_plural = "Quiz Choices"

    def __str__(self):
        """Return truncated choice text."""
        if len(self.choice_text) > 50:
            return f"{self.choice_text[:47]}..."
        return self.choice_text


class UserPreference(models.Model):
    """
    User's tea preferences calculated from quiz answers.
    Linked one-to-one with User. One-time completion per scope.
    """

    user = models.OneToOneField(
        "core.User",
        on_delete=models.CASCADE,
        related_name="preference",
    )
    # Example: {"green_tea": 85, "oolong": 72, "black_tea": 45}
    preferences = models.JSONField(default=dict, blank=True)
    quiz_completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "User Preference"
        verbose_name_plural = "User Preferences"

    def __str__(self):
        """Return user email and completion status."""
        status = "completed" if self.has_completed_quiz() else "incomplete"
        return f"{self.user.email} - {status}"

    def has_completed_quiz(self):
        """Check if user has completed the quiz."""
        return self.quiz_completed_at is not None

    def get_top_preferences(self, n=3):
        """
        Return top N preference categories by score.
        Tie-breaker: alphabetical order for equal scores.

        Args:
            n: Number of top preferences to return (default: 3)

        Returns:
            List of category slugs, sorted by score descending
        """
        if not self.preferences:
            return []

        # Sort by score descending, then by category name (tie-breaker)
        sorted_prefs = sorted(
            self.preferences.items(),
            key=lambda x: (-x[1], x[0]),  # Negative score for descending, then name
        )

        return [cat for cat, _ in sorted_prefs[:n]]


# =============================================================================
# PREFERENCE CALCULATION
# =============================================================================


def calculate_preferences(choices):
    """
    Calculate user preferences based on selected quiz choices.

    Algorithm:
    1. Aggregate preference weights from all selected choices
    2. Normalize scores to 0-100 scale (relative to highest score)
    3. Return dict mapping category_slug to preference score

    Args:
        choices: List of QuizChoice objects selected by user

    Returns:
        Dict mapping category_slug to preference score (0-100)
    """
    if not choices:
        return {}

    # Aggregate raw scores
    raw_scores = defaultdict(float)

    for choice in choices:
        for category, weight in choice.preference_weights.items():
            raw_scores[category] += weight

    if not raw_scores:
        return {}

    # Normalize to 0-100 scale
    max_score = max(raw_scores.values())
    if max_score == 0:
        return {}

    normalized = {
        cat: min(100, round((score / max_score) * 100))
        for cat, score in raw_scores.items()
    }

    return normalized
