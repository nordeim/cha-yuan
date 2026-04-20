"""
Django Admin Configuration for Content Models

Custom admin interfaces for Article, ArticleCategory, QuizQuestion, QuizChoice, and UserPreference.
Includes rich text editing, publishing workflows, and quiz management.
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import Article, ArticleCategory, QuizQuestion, QuizChoice, UserPreference


@admin.register(ArticleCategory)
class ArticleCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "article_count", "order", "is_active"]
    list_filter = ["is_active"]
    search_fields = ["name", "description"]
    prepopulated_fields = {"slug": ("name",)}
    ordering = ["order", "name"]

    def article_count(self, obj):
        return obj.articles.count()

    article_count.short_description = "Articles"


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "category",
        "is_published_display",
        "is_featured",
        "reading_time_minutes",
        "published_at",
        "created_at",
    ]
    list_filter = [
        "is_featured",
        "category",
        "published_at",
        "created_at",
    ]
    search_fields = ["title", "content", "excerpt"]
    prepopulated_fields = {"slug": ("title",)}
    date_hierarchy = "published_at"
    ordering = ["-published_at", "-created_at"]

    fieldsets = (
        (
            "Content",
            {
                "fields": ("title", "slug", "category", "content", "excerpt"),
            },
        ),
        (
            "Publishing",
            {
                "fields": ("published_at", "is_featured"),
                "classes": ("collapse",),
            },
        ),
        (
            "Media & SEO",
            {
                "fields": ("featured_image", "meta_description"),
                "classes": ("collapse",),
            },
        ),
        (
            "Metadata",
            {
                "fields": ("reading_time_minutes", "created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )

    readonly_fields = ["created_at", "updated_at", "reading_time_minutes"]

    actions = ["publish_selected", "unpublish_selected", "make_featured"]

    def is_published_display(self, obj):
        if obj.is_published:
            return format_html('<span style="color: #5C8A4D;">● Published</span>')
        return format_html('<span style="color: #999;">○ Draft</span>')

    is_published_display.short_description = "Status"

    def publish_selected(self, request, queryset):
        from django.utils import timezone

        queryset.update(published_at=timezone.now())

    publish_selected.short_description = "Publish selected articles"

    def unpublish_selected(self, request, queryset):
        queryset.update(published_at=None)

    unpublish_selected.short_description = "Unpublish selected articles"

    def make_featured(self, request, queryset):
        queryset.update(is_featured=True)

    make_featured.short_description = "Mark as featured"


# =============================================================================
# Quiz Admin Configuration
# =============================================================================


class QuizChoiceInline(admin.TabularInline):
    """Inline editing for quiz choices within questions."""

    model = QuizChoice
    extra = 3
    min_num = 2
    fields = ["choice_text", "preference_weights", "order"]
    ordering = ["order"]


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    """Admin for quiz questions with inline choices."""

    list_display = [
        "question_text_short",
        "order",
        "is_required",
        "choices_count",
        "created_at",
    ]
    list_filter = ["is_required", "created_at"]
    search_fields = ["question_text", "question_text_i18n"]
    ordering = ["order", "id"]
    inlines = [QuizChoiceInline]

    def question_text_short(self, obj):
        """Truncated question text for list display."""
        return (
            obj.question_text[:50] + "..."
            if len(obj.question_text) > 50
            else obj.question_text
        )

    question_text_short.short_description = "Question"

    def choices_count(self, obj):
        """Number of choices for this question."""
        return obj.choices.count()

    choices_count.short_description = "Choices"


@admin.register(QuizChoice)
class QuizChoiceAdmin(admin.ModelAdmin):
    """Admin for individual quiz choices (optional standalone)."""

    list_display = [
        "choice_text_short",
        "question",
        "order",
        "has_weights",
    ]
    list_filter = ["question", "order"]
    search_fields = ["choice_text", "choice_text_i18n"]
    ordering = ["question__order", "order"]
    raw_id_fields = ["question"]

    def choice_text_short(self, obj):
        """Truncated choice text for list display."""
        return (
            obj.choice_text[:50] + "..."
            if len(obj.choice_text) > 50
            else obj.choice_text
        )

    choice_text_short.short_description = "Choice"

    def has_weights(self, obj):
        """Check if choice has preference weights."""
        return bool(obj.preference_weights)

    has_weights.boolean = True
    has_weights.short_description = "Has Weights"


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    """Admin for user preferences with quiz completion status."""

    list_display = [
        "user",
        "quiz_completed_display",
        "completed_at_short",
        "top_preferences_display",
        "created_at",
    ]
    list_filter = ["quiz_completed_at", "created_at", "updated_at"]
    search_fields = ["user__email", "user__first_name", "user__last_name"]
    readonly_fields = ["created_at", "updated_at", "get_top_preferences"]
    date_hierarchy = "quiz_completed_at"

    fieldsets = (
        (
            "User",
            {"fields": ("user",)},
        ),
        (
            "Quiz Status",
            {"fields": ("quiz_completed_at",)},
        ),
        (
            "Preferences",
            {"fields": ("preferences", "get_top_preferences")},
        ),
        (
            "Metadata",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    def quiz_completed_display(self, obj):
        """Visual indicator for quiz completion."""
        if obj.has_completed_quiz():
            return format_html('<span style="color: #5C8A4D;">● Completed</span>')
        return format_html('<span style="color: #999;">○ Incomplete</span>')

    quiz_completed_display.short_description = "Status"

    def completed_at_short(self, obj):
        """Formatted completion date."""
        if obj.quiz_completed_at:
            return obj.quiz_completed_at.strftime("%Y-%m-%d %H:%M")
        return "-"

    completed_at_short.short_description = "Completed At"

    def top_preferences_display(self, obj):
        """Display top 3 preferences."""
        if not obj.preferences:
            return "-"
        top = obj.get_top_preferences(n=3)
        return ", ".join(top) if top else "-"

    top_preferences_display.short_description = "Top Preferences"

    def get_top_preferences(self, obj):
        """Readonly display of top preferences."""
        return self.top_preferences_display(obj)

    get_top_preferences.short_description = "Calculated Top Preferences"
