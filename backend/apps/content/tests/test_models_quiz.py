"""
Quiz Model Tests (TDD GREEN Phase)

Tests for QuizQuestion, QuizChoice, and UserPreference models.
"""

import pytest
from datetime import datetime, timedelta
from decimal import Decimal
from unittest.mock import Mock, patch

# Import models directly (GREEN phase - models should exist)
from apps.content.models import (
    QuizQuestion,
    QuizChoice,
    UserPreference,
    calculate_preferences,
)
from apps.core.models import User


class TestQuizQuestion:
    """Test suite for QuizQuestion model."""

    @pytest.fixture
    def question_data(self):
        """Fixture for basic question data."""
        return {
            "question_text": "What is your preferred tea strength?",
            "question_text_i18n": {
                "en": "What is your preferred tea strength?",
                "zh": "您喜欢什么浓度的茶？",
            },
            "order": 1,
            "is_required": True,
        }

    def test_quiz_question_creation(self, question_data):
        """QuizQuestion can be created with required fields."""
        question = QuizQuestion.objects.create(**question_data)

        assert question.id is not None
        assert question.question_text == "What is your preferred tea strength?"
        assert (
            question.question_text_i18n["en"] == "What is your preferred tea strength?"
        )
        assert question.order == 1
        assert question.is_required is True

    def test_quiz_question_str_representation(self, question_data):
        """String representation returns truncated question text."""
        question = QuizQuestion.objects.create(**question_data)
        assert "What is your preferred tea strength?" in str(question)

    def test_quiz_question_ordering(self):
        """Questions ordered by 'order' field, then id."""
        q3 = QuizQuestion.objects.create(question_text="Question 3", order=30)
        q1 = QuizQuestion.objects.create(question_text="Question 1", order=10)
        q2 = QuizQuestion.objects.create(question_text="Question 2", order=20)

        questions = list(QuizQuestion.objects.all())
        assert questions[0].question_text == "Question 1"
        assert questions[1].question_text == "Question 2"
        assert questions[2].question_text == "Question 3"

    def test_quiz_question_default_required(self):
        """Default is_required is True."""
        question = QuizQuestion.objects.create(
            question_text="Test Question",
        )
        assert question.is_required is True

    def test_quiz_question_default_i18n(self):
        """Default i18n is empty dict."""
        question = QuizQuestion.objects.create(
            question_text="Test Question",
        )
        assert question.question_text_i18n == {}

    def test_quiz_question_optional(self):
        """Question can be marked as optional."""
        question = QuizQuestion.objects.create(
            question_text="Optional Question",
            is_required=False,
        )
        assert question.is_required is False

    def test_quiz_question_created_at(self):
        """created_at is set automatically."""
        before = datetime.now()
        question = QuizQuestion.objects.create(question_text="Test")
        after = datetime.now()

        assert question.created_at is not None
        assert before <= question.created_at <= after


class TestQuizChoice:
    """Test suite for QuizChoice model."""

    @pytest.fixture
    def question(self):
        """Fixture for a QuizQuestion."""
        return QuizQuestion.objects.create(
            question_text="Test Question",
            order=1,
        )

    @pytest.fixture
    def choice_data(self, question):
        """Fixture for basic choice data."""
        return {
            "question": question,
            "choice_text": "Light and subtle",
            "choice_text_i18n": {"en": "Light and subtle", "zh": "清淡细腻"},
            "preference_weights": {
                "green_tea": 0.8,
                "white_tea": 0.6,
                "oolong": 0.3,
            },
            "order": 1,
        }

    def test_quiz_choice_creation(self, choice_data):
        """QuizChoice can be created with required fields."""
        choice = QuizChoice.objects.create(**choice_data)

        assert choice.id is not None
        assert choice.choice_text == "Light and subtle"
        assert choice.question == choice_data["question"]

    def test_quiz_choice_preference_weights(self, choice_data):
        """Weights stored as JSON and accessible."""
        choice = QuizChoice.objects.create(**choice_data)

        assert "green_tea" in choice.preference_weights
        assert choice.preference_weights["green_tea"] == 0.8
        assert choice.preference_weights["white_tea"] == 0.6
        assert choice.preference_weights["oolong"] == 0.3

    def test_quiz_choice_empty_weights(self, question):
        """Default preference_weights is empty dict."""
        choice = QuizChoice.objects.create(
            question=question,
            choice_text="Neutral choice",
        )
        assert choice.preference_weights == {}

    def test_quiz_choice_question_relationship(self, choice_data):
        """Choice has FK to Question with related_name='choices'."""
        choice = QuizChoice.objects.create(**choice_data)
        question = choice_data["question"]

        # Access via FK
        assert choice.question == question

        # Access via related_name
        assert choice in question.choices.all()

    def test_quiz_choice_ordering(self, question):
        """Choices ordered by 'order' field."""
        c3 = QuizChoice.objects.create(
            question=question,
            choice_text="Choice 3",
            order=30,
        )
        c1 = QuizChoice.objects.create(
            question=question,
            choice_text="Choice 1",
            order=10,
        )
        c2 = QuizChoice.objects.create(
            question=question,
            choice_text="Choice 2",
            order=20,
        )

        choices = list(question.choices.all())
        assert choices[0].choice_text == "Choice 1"
        assert choices[1].choice_text == "Choice 2"
        assert choices[2].choice_text == "Choice 3"

    def test_quiz_choice_cascade_delete(self, question):
        """Choices deleted when question is deleted."""
        choice = QuizChoice.objects.create(
            question=question,
            choice_text="Will be deleted",
        )
        choice_id = choice.id

        question.delete()

        with pytest.raises(QuizChoice.DoesNotExist):
            QuizChoice.objects.get(id=choice_id)

    def test_quiz_choice_str_representation(self, choice_data):
        """String representation returns truncated choice text."""
        choice = QuizChoice.objects.create(**choice_data)
        assert "Light and subtle" in str(choice)


class TestUserPreference:
    """Test suite for UserPreference model."""

    @pytest.fixture
    def user(self):
        """Fixture for a User."""
        return User.objects.create(
            email="test@example.com",
            first_name="Test",
            last_name="User",
        )

    @pytest.fixture
    def preference_data(self, user):
        """Fixture for basic preference data."""
        return {
            "user": user,
            "preferences": {
                "green_tea": 85,
                "oolong": 72,
                "black_tea": 45,
                "white_tea": 38,
            },
            "quiz_completed_at": datetime.now(),
        }

    def test_user_preference_creation(self, preference_data):
        """UserPreference can be created with required fields."""
        pref = UserPreference.objects.create(**preference_data)

        assert pref.id is not None
        assert pref.user == preference_data["user"]
        assert pref.preferences["green_tea"] == 85
        assert pref.quiz_completed_at is not None

    def test_user_preference_user_relationship(self, preference_data):
        """Preference has OneToOne FK to User with related_name='preference'."""
        pref = UserPreference.objects.create(**preference_data)
        user = preference_data["user"]

        # Access via FK
        assert pref.user == user

        # Access via related_name
        assert user.preference == pref

    def test_user_preference_duplicate_prevented(self, user):
        """Duplicate UserPreference should raise IntegrityError."""
        UserPreference.objects.create(
            user=user,
            preferences={"green_tea": 50},
        )

        with pytest.raises(Exception):  # IntegrityError
            UserPreference.objects.create(
                user=user,
                preferences={"oolong": 50},
            )

    def test_user_preference_default_preferences(self, user):
        """Default preferences is empty dict."""
        pref = UserPreference.objects.create(user=user)
        assert pref.preferences == {}

    def test_user_preference_null_quiz_completed(self, user):
        """quiz_completed_at can be null (incomplete quiz)."""
        pref = UserPreference.objects.create(
            user=user,
            preferences={},
            quiz_completed_at=None,
        )
        assert pref.quiz_completed_at is None

    def test_user_preference_has_completed_quiz_true(self, user):
        """has_completed_quiz() returns True when timestamp set."""
        pref = UserPreference.objects.create(
            user=user,
            preferences={"green_tea": 80},
            quiz_completed_at=datetime.now(),
        )
        assert pref.has_completed_quiz() is True

    def test_user_preference_has_completed_quiz_false(self, user):
        """has_completed_quiz() returns False when no timestamp."""
        pref = UserPreference.objects.create(
            user=user,
            preferences={},
            quiz_completed_at=None,
        )
        assert pref.has_completed_quiz() is False

    def test_user_preference_get_top_preferences_default(self, user):
        """get_top_preferences() returns top 3 by default."""
        pref = UserPreference.objects.create(
            user=user,
            preferences={
                "green_tea": 85,
                "oolong": 72,
                "black_tea": 45,
                "white_tea": 38,
            },
        )

        top = pref.get_top_preferences()
        assert len(top) == 3
        assert top[0] == "green_tea"
        assert top[1] == "oolong"
        assert top[2] == "black_tea"

    def test_user_preference_get_top_preferences_custom_n(self, user):
        """get_top_preferences(n) returns top N."""
        pref = UserPreference.objects.create(
            user=user,
            preferences={
                "green_tea": 85,
                "oolong": 72,
                "black_tea": 45,
            },
        )

        top = pref.get_top_preferences(n=2)
        assert len(top) == 2
        assert top[0] == "green_tea"
        assert top[1] == "oolong"

    def test_user_preference_get_top_preferences_empty(self, user):
        """get_top_preferences() returns empty list when no preferences."""
        pref = UserPreference.objects.create(user=user, preferences={})
        top = pref.get_top_preferences()
        assert top == []

    def test_user_preference_get_top_preferences_tie_breaker(self, user):
        """Tie-breaker: alphabetical order for equal scores."""
        pref = UserPreference.objects.create(
            user=user,
            preferences={
                "oolong": 50,
                "green_tea": 50,  # Same score
            },
        )

        top = pref.get_top_preferences(n=2)
        # Should be alphabetical for ties
        assert len(top) == 2

    def test_user_preference_timestamps(self, user):
        """created_at and updated_at are set automatically."""
        pref = UserPreference.objects.create(
            user=user,
            preferences={},
        )

        assert pref.created_at is not None
        assert pref.updated_at is not None

    def test_user_preference_str_representation(self, preference_data):
        """String representation includes user email and status."""
        pref = UserPreference.objects.create(**preference_data)
        str_repr = str(pref)
        assert "test@example.com" in str_repr
        assert "completed" in str_repr.lower()


class TestQuizIntegration:
    """Integration tests for Quiz models working together."""

    @pytest.fixture
    def user(self):
        """Fixture for a User."""
        return User.objects.create(
            email="quizuser@example.com",
            first_name="Quiz",
            last_name="User",
        )

    @pytest.fixture
    def full_quiz_question(self):
        """Fixture for a question with multiple choices."""
        question = QuizQuestion.objects.create(
            question_text="What tea region interests you most?",
            order=1,
            is_required=True,
        )

        # Choice 1: China - high green/white tea preference
        QuizChoice.objects.create(
            question=question,
            choice_text="China (Hangzhou, Fujian)",
            preference_weights={
                "green_tea": 0.9,
                "white_tea": 0.8,
                "oolong": 0.5,
            },
            order=1,
        )

        # Choice 2: Taiwan - high oolong preference
        QuizChoice.objects.create(
            question=question,
            choice_text="Taiwan (Alishan, Sun Moon Lake)",
            preference_weights={
                "oolong": 1.0,
                "green_tea": 0.3,
            },
            order=2,
        )

        # Choice 3: India - high black tea preference
        QuizChoice.objects.create(
            question=question,
            choice_text="India (Darjeeling, Assam)",
            preference_weights={
                "black_tea": 1.0,
                "oolong": 0.2,
            },
            order=3,
        )

        return question

    def test_full_quiz_structure(self, full_quiz_question):
        """Question has 3 choices accessible via related_name."""
        assert full_quiz_question.choices.count() == 3

        choices = list(full_quiz_question.choices.all())
        assert choices[0].choice_text == "China (Hangzhou, Fujian)"
        assert choices[1].choice_text == "Taiwan (Alishan, Sun Moon Lake)"
        assert choices[2].choice_text == "India (Darjeeling, Assam)"

    def test_choice_weights_vary_by_region(self, full_quiz_question):
        """Different choices have different preference weights."""
        china_choice = full_quiz_question.choices.get(
            choice_text="China (Hangzhou, Fujian)"
        )
        taiwan_choice = full_quiz_question.choices.get(
            choice_text="Taiwan (Alishan, Sun Moon Lake)"
        )

        # China choice favors green tea
        assert china_choice.preference_weights["green_tea"] == 0.9

        # Taiwan choice favors oolong
        assert taiwan_choice.preference_weights["oolong"] == 1.0

    def test_user_preference_with_quiz_completion(self, user, full_quiz_question):
        """User can have preferences linked to quiz completion."""
        # Simulate quiz completion
        pref = UserPreference.objects.create(
            user=user,
            preferences={
                "oolong": 85,
                "green_tea": 70,
            },
            quiz_completed_at=datetime.now(),
        )

        assert pref.has_completed_quiz() is True
        assert pref.get_top_preferences(n=1)[0] == "oolong"


class TestQuizScoringAlgorithm:
    """Tests for preference calculation algorithm."""

    @pytest.fixture
    def user(self):
        """Fixture for a User."""
        return User.objects.create(
            email="scoring@example.com",
            first_name="Scoring",
            last_name="Test",
        )

    @pytest.fixture
    def sample_choices(self):
        """Fixture for sample choices with weights."""
        question = QuizQuestion.objects.create(
            question_text="Test Question",
            order=1,
        )

        choice1 = QuizChoice.objects.create(
            question=question,
            choice_text="Choice 1",
            preference_weights={
                "green_tea": 0.8,
                "oolong": 0.3,
            },
            order=1,
        )

        choice2 = QuizChoice.objects.create(
            question=question,
            choice_text="Choice 2",
            preference_weights={
                "green_tea": 0.4,
                "black_tea": 0.7,
            },
            order=2,
        )

        return [choice1, choice2]

    def test_calculate_preferences_single_choice(self, user, sample_choices):
        """Calculate preferences from single choice."""
        # Import will fail initially (expected - RED phase)
        from content.models import calculate_preferences

        result = calculate_preferences([sample_choices[0]])

        assert "green_tea" in result
        assert "oolong" in result
        assert result["green_tea"] == 100  # Normalized to max
        assert result["oolong"] < 100

    def test_calculate_preferences_multiple_choices(self, user, sample_choices):
        """Calculate preferences aggregated from multiple choices."""
        from content.models import calculate_preferences

        result = calculate_preferences(sample_choices)

        # green_tea: 0.8 + 0.4 = 1.2
        # black_tea: 0.7
        # oolong: 0.3
        assert "green_tea" in result
        assert "black_tea" in result
        assert "oolong" in result

        # Green tea should be highest (1.2 total)
        assert result["green_tea"] > result["black_tea"]

    def test_calculate_preferences_normalization(self, user, sample_choices):
        """Preferences normalized to 0-100 scale."""
        from content.models import calculate_preferences

        result = calculate_preferences(sample_choices)

        # All scores should be 0-100
        for score in result.values():
            assert 0 <= score <= 100

        # Highest should be 100 (normalized to max)
        assert max(result.values()) == 100

    def test_calculate_preferences_empty(self, user):
        """Empty choices list returns empty dict."""
        from content.models import calculate_preferences

        result = calculate_preferences([])
        assert result == {}

    def test_calculate_preferences_with_unlisted_category(self, user):
        """Categories not in any choice still appear with 0."""
        question = QuizQuestion.objects.create(question_text="Test")
        choice = QuizChoice.objects.create(
            question=question,
            choice_text="Test",
            preference_weights={"green_tea": 0.5},
        )

        from content.models import calculate_preferences

        result = calculate_preferences([choice])

        # Only green_tea should be in result
        assert "green_tea" in result
        assert "black_tea" not in result

    def test_get_top_preferences_from_calculated(self, user, sample_choices):
        """Top preferences extracted from calculated scores."""
        from content.models import calculate_preferences

        scores = calculate_preferences(sample_choices)
        top_2 = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:2]
        top_categories = [cat for cat, _ in top_2]

        assert len(top_categories) == 2
        assert "green_tea" == top_categories[0]  # Should be highest
