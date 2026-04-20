"""
Quiz Scoring Algorithm Tests (TDD GREEN Phase)

Tests for preference calculation algorithm and scoring logic.
"""

import pytest
from datetime import datetime
from decimal import Decimal

# Import models directly (GREEN phase)
from apps.content.models import (
    QuizQuestion,
    QuizChoice,
    UserPreference,
    calculate_preferences,
)
from apps.core.models import User


class TestCalculatePreferences:
    """Test suite for calculate_preferences() function."""

    pytestmark = pytest.mark.django_db

    @pytest.fixture
    def user(self):
        """Fixture for a test user."""
        return User.objects.create(
            email="scoring@example.com",
            first_name="Scoring",
            last_name="Test",
        )

    @pytest.fixture
    def single_choice_high_weight(self):
        """Choice with high green tea preference."""
        question = QuizQuestion.objects.create(
            question_text="Test Question 1",
            order=1,
        )
        return QuizChoice.objects.create(
            question=question,
            choice_text="High Green Tea",
            preference_weights={
                "green_tea": 0.9,
                "white_tea": 0.2,
            },
            order=1,
        )

    @pytest.fixture
    def single_choice_medium_weight(self):
        """Choice with medium oolong preference."""
        question = QuizQuestion.objects.create(
            question_text="Test Question 2",
            order=2,
        )
        return QuizChoice.objects.create(
            question=question,
            choice_text="Medium Oolong",
            preference_weights={
                "oolong": 0.6,
                "green_tea": 0.3,
            },
            order=1,
        )

    @pytest.fixture
    def single_choice_low_weight(self):
        """Choice with low black tea preference."""
        question = QuizQuestion.objects.create(
            question_text="Test Question 3",
            order=3,
        )
        return QuizChoice.objects.create(
            question=question,
            choice_text="Low Black Tea",
            preference_weights={
                "black_tea": 0.3,
                "puerh": 0.1,
            },
            order=1,
        )

    def test_calculate_preferences_single_choice(self, single_choice_high_weight):
        """Calculate preferences from single choice."""
        result = calculate_preferences([single_choice_high_weight])

        assert "green_tea" in result
        assert "white_tea" in result
        # Highest score normalized to 100
        assert result["green_tea"] == 100
        # Lower score proportional
        assert result["white_tea"] == 22  # (0.2/0.9) * 100 ≈ 22

    def test_calculate_preferences_multiple_choices(
        self, single_choice_high_weight, single_choice_medium_weight
    ):
        """Aggregate preferences from multiple choices."""
        choices = [single_choice_high_weight, single_choice_medium_weight]
        result = calculate_preferences(choices)

        # green_tea: 0.9 + 0.3 = 1.2
        # oolong: 0.6
        # white_tea: 0.2
        assert "green_tea" in result
        assert "oolong" in result
        assert "white_tea" in result

        # Green tea should be highest (1.2 total)
        assert result["green_tea"] == 100
        # Oolong: (0.6/1.2) * 100 = 50
        assert result["oolong"] == 50
        # White tea: (0.2/1.2) * 100 = 17
        assert result["white_tea"] == 17

    def test_calculate_preferences_normalization(
        self,
        single_choice_high_weight,
        single_choice_medium_weight,
        single_choice_low_weight,
    ):
        """All scores normalized to 0-100 scale."""
        choices = [
            single_choice_high_weight,
            single_choice_medium_weight,
            single_choice_low_weight,
        ]
        result = calculate_preferences(choices)

        # All scores should be within 0-100
        for score in result.values():
            assert 0 <= score <= 100

        # Maximum should be 100
        assert max(result.values()) == 100

    def test_calculate_preferences_rounding(self, single_choice_high_weight):
        """Scores rounded to integers."""
        result = calculate_preferences([single_choice_high_weight])

        for score in result.values():
            assert isinstance(score, int)

    def test_calculate_preferences_empty_list(self):
        """Empty choices list returns empty dict."""
        result = calculate_preferences([])
        assert result == {}

    def test_calculate_preferences_no_weights(self):
        """Choices with no weights contribute nothing."""
        question = QuizQuestion.objects.create(question_text="Test")
        choice = QuizChoice.objects.create(
            question=question,
            choice_text="No weights",
            preference_weights={},
        )

        result = calculate_preferences([choice])
        assert result == {}


class TestGetTopPreferences:
    """Test suite for UserPreference.get_top_preferences() method."""

    pytestmark = pytest.mark.django_db

    @pytest.fixture
    def user(self):
        return User.objects.create(
            email="topprefs@example.com",
            first_name="Top",
            last_name="Prefs",
        )

    @pytest.fixture
    def user_with_preferences(self, user):
        """User with calculated preferences."""
        return UserPreference.objects.create(
            user=user,
            preferences={
                "green_tea": 95,
                "oolong": 82,
                "black_tea": 67,
                "white_tea": 54,
                "puerh": 31,
            },
            quiz_completed_at=datetime.now(),
        )

    def test_get_top_preferences_basic(self, user_with_preferences):
        """Return top 3 preferences by default."""
        top = user_with_preferences.get_top_preferences()

        assert len(top) == 3
        assert top[0] == "green_tea"
        assert top[1] == "oolong"
        assert top[2] == "black_tea"

    def test_get_top_preferences_custom_n(self, user_with_preferences):
        """Return top N when specified."""
        top_2 = user_with_preferences.get_top_preferences(n=2)
        assert len(top_2) == 2
        assert top_2[0] == "green_tea"
        assert top_2[1] == "oolong"

        top_5 = user_with_preferences.get_top_preferences(n=5)
        assert len(top_5) == 5

    def test_get_top_preferences_empty(self, user):
        """Return empty list when no preferences."""
        pref = UserPreference.objects.create(
            user=user,
            preferences={},
        )
        top = pref.get_top_preferences()
        assert top == []

    def test_get_top_preferences_n_greater_than_total(self, user_with_preferences):
        """Handle N > total preferences gracefully."""
        top_10 = user_with_preferences.get_top_preferences(n=10)
        assert len(top_10) == 5  # Only 5 categories exist

    def test_get_top_preferences_tie_breaker(self, user):
        """Tie-breaker uses alphabetical order."""
        pref = UserPreference.objects.create(
            user=user,
            preferences={
                "oolong": 50,
                "black_tea": 50,  # Same score as oolong
                "green_tea": 50,  # Same score
            },
            quiz_completed_at=datetime.now(),
        )

        top = pref.get_top_preferences(n=3)
        # Alphabetical: black_tea, green_tea, oolong
        assert top[0] == "black_tea"
        assert top[1] == "green_tea"
        assert top[2] == "oolong"

    def test_get_top_preferences_zero_score_included(self, user):
        """Zero scores are included if in top N."""
        pref = UserPreference.objects.create(
            user=user,
            preferences={
                "green_tea": 100,
                "oolong": 0,  # Zero score
            },
            quiz_completed_at=datetime.now(),
        )

        top = pref.get_top_preferences(n=2)
        assert len(top) == 2
        assert top[0] == "green_tea"
        assert top[1] == "oolong"


class TestQuizSubmitFlow:
    """Integration tests for quiz submission workflow."""

    pytestmark = pytest.mark.django_db

    @pytest.fixture
    def user(self):
        return User.objects.create(
            email="submit@example.com",
            first_name="Submit",
            last_name="Test",
        )

    @pytest.fixture
    def complete_quiz(self):
        """Create a complete quiz with questions and choices."""
        # Question 1: Tea strength
        q1 = QuizQuestion.objects.create(
            question_text="What tea strength do you prefer?",
            order=1,
            is_required=True,
        )
        q1_light = QuizChoice.objects.create(
            question=q1,
            choice_text="Light and delicate",
            preference_weights={"white_tea": 0.9, "green_tea": 0.6},
            order=1,
        )
        q1_strong = QuizChoice.objects.create(
            question=q1,
            choice_text="Bold and robust",
            preference_weights={"black_tea": 0.9, "puerh": 0.7},
            order=2,
        )

        # Question 2: Flavor profile
        q2 = QuizQuestion.objects.create(
            question_text="What flavors appeal to you?",
            order=2,
            is_required=True,
        )
        q2_floral = QuizChoice.objects.create(
            question=q2,
            choice_text="Floral and fragrant",
            preference_weights={"oolong": 0.8, "green_tea": 0.5, "white_tea": 0.4},
            order=1,
        )
        q2_earthy = QuizChoice.objects.create(
            question=q2,
            choice_text="Earthy and woody",
            preference_weights={"puerh": 0.9, "oolong": 0.3},
            order=2,
        )

        return {
            "questions": [q1, q2],
            "choices": {
                q1.id: [q1_light, q1_strong],
                q2.id: [q2_floral, q2_earthy],
            },
        }

    def test_quiz_submit_creates_preferences(self, user, complete_quiz):
        """Full quiz flow creates UserPreference with calculated scores."""
        # User selects: Light (q1) + Floral (q2)
        selected_choices = [
            complete_quiz["choices"][complete_quiz["questions"][0].id][0],  # Light
            complete_quiz["choices"][complete_quiz["questions"][1].id][0],  # Floral
        ]

        # Calculate preferences
        scores = calculate_preferences(selected_choices)

        # Create UserPreference
        pref = UserPreference.objects.create(
            user=user,
            preferences=scores,
            quiz_completed_at=datetime.now(),
        )

        # Verify preferences stored
        assert pref.has_completed_quiz() is True
        assert len(pref.preferences) > 0

        # Verify top categories make sense
        top = pref.get_top_preferences(n=3)
        # white_tea: 0.9 + 0.4 = 1.3 (highest)
        # oolong: 0.8 + 0.3 = 1.1 (second)
        # green_tea: 0.6 + 0.5 = 1.1 (tied with oolong, alphabetical)
        assert "white_tea" in top

    def test_quiz_submit_with_different_answers(self, user, complete_quiz):
        """Different answers produce different preferences."""
        # User 1: Light + Floral (choices 0, 0)
        choices_1 = [
            complete_quiz["choices"][complete_quiz["questions"][0].id][0],
            complete_quiz["choices"][complete_quiz["questions"][1].id][0],
        ]
        scores_1 = calculate_preferences(choices_1)

        # User 2: Strong + Earthy (choices 1, 1)
        choices_2 = [
            complete_quiz["choices"][complete_quiz["questions"][0].id][1],
            complete_quiz["choices"][complete_quiz["questions"][1].id][1],
        ]
        scores_2 = calculate_preferences(choices_2)

        # Preferences should be different
        assert scores_1 != scores_2

        # User 1 should prefer white_tea (light choice)
        assert "white_tea" in scores_1
        assert scores_1["white_tea"] > 50  # Should be high

        # User 2 should prefer black_tea/puerh (strong choice)
        assert "black_tea" in scores_2 or "puerh" in scores_2


class TestPreferenceValidation:
    """Tests for preference data validation."""

    pytestmark = pytest.mark.django_db

    @pytest.fixture
    def user(self):
        return User.objects.create(
            email="validation@example.com",
            first_name="Validation",
            last_name="Test",
        )

    def test_preference_scores_must_be_numeric(self, user):
        """Preference scores must be integers 0-100."""
        # Valid preferences
        pref = UserPreference.objects.create(
            user=user,
            preferences={
                "green_tea": 85,
                "oolong": 72,
            },
        )
        assert pref.preferences["green_tea"] == 85

    def test_preference_categories_as_slugs(self, user):
        """Category keys should be slugs (lowercase with underscores)."""
        pref = UserPreference.objects.create(
            user=user,
            preferences={
                "green_tea": 50,  # Valid slug
                "black_tea": 50,  # Valid slug
                "puerh": 50,  # Valid slug
            },
        )
        assert "green_tea" in pref.preferences
        assert "black_tea" in pref.preferences

    def test_preference_empty_dict_valid(self, user):
        """Empty preferences dict is valid (quiz not completed)."""
        pref = UserPreference.objects.create(
            user=user,
            preferences={},
            quiz_completed_at=None,
        )
        assert pref.preferences == {}
        assert pref.has_completed_quiz() is False
