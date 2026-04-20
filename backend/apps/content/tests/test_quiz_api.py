"""
Quiz API Tests (TDD RED Phase)

Tests for Quiz API endpoints following TDD methodology.
These tests define expected API behavior before implementation.

Endpoints to test:
- GET /api/v1/quiz/questions/ - List all questions with choices
- POST /api/v1/quiz/submit/ - Submit quiz answers, get preferences
- GET /api/v1/quiz/preferences/ - Get current user's preferences

Singapore Context:
- JWT authentication via HttpOnly cookies
- en-SG locale support
- Asia/Singapore timezone
"""

import pytest
from datetime import datetime
from decimal import Decimal
from unittest.mock import Mock, patch

from django.test import Client

# Import models for test setup
from apps.content.models import (
    QuizQuestion,
    QuizChoice,
    UserPreference,
    calculate_preferences,
)
from apps.core.models import User


# =============================================================================
# Fixtures
# =============================================================================


@pytest.fixture
def client():
    """Django test client."""
    return Client()


@pytest.fixture
def test_user():
    """Create a test user."""
    return User.objects.create(
        email="test@example.com",
        first_name="Test",
        last_name="User",
    )


@pytest.fixture
def authenticated_client(client, test_user):
    """Client with authenticated user session."""
    from apps.core.authentication import JWTTokenManager, set_auth_cookies
    from django.http import HttpResponse

    # Generate tokens
    tokens = JWTTokenManager.generate_tokens_for_user(test_user)

    # Create a mock response to set cookies
    response = HttpResponse()
    set_auth_cookies(response, tokens)

    # Copy cookies to client - response.cookies is SimpleCookie dict
    for key in response.cookies:
        client.cookies[key] = response.cookies[key].value

    return client


@pytest.fixture
def sample_quiz_questions():
    """Create sample quiz questions with choices for testing."""
    # Question 1: Tea strength preference
    q1 = QuizQuestion.objects.create(
        question_text="What tea strength do you prefer?",
        question_text_i18n={"en": "What tea strength do you prefer?"},
        order=1,
        is_required=True,
    )

    q1_choice1 = QuizChoice.objects.create(
        question=q1,
        choice_text="Light and delicate",
        choice_text_i18n={"en": "Light and delicate"},
        preference_weights={"white_tea": 0.9, "green_tea": 0.6, "oolong": 0.3},
        order=1,
    )

    q1_choice2 = QuizChoice.objects.create(
        question=q1,
        choice_text="Bold and robust",
        choice_text_i18n={"en": "Bold and robust"},
        preference_weights={"black_tea": 0.9, "puerh": 0.7, "oolong": 0.5},
        order=2,
    )

    # Question 2: Flavor profile
    q2 = QuizQuestion.objects.create(
        question_text="What flavors appeal to you?",
        question_text_i18n={"en": "What flavors appeal to you?"},
        order=2,
        is_required=True,
    )

    q2_choice1 = QuizChoice.objects.create(
        question=q2,
        choice_text="Floral and fragrant",
        choice_text_i18n={"en": "Floral and fragrant"},
        preference_weights={"oolong": 0.8, "white_tea": 0.6, "green_tea": 0.4},
        order=1,
    )

    q2_choice2 = QuizChoice.objects.create(
        question=q2,
        choice_text="Earthy and woody",
        choice_text_i18n={"en": "Earthy and woody"},
        preference_weights={"puerh": 0.9, "black_tea": 0.5},
        order=2,
    )

    # Question 3: Optional question
    q3 = QuizQuestion.objects.create(
        question_text="What time do you usually drink tea?",
        question_text_i18n={"en": "What time do you usually drink tea?"},
        order=3,
        is_required=False,
    )

    q3_choice1 = QuizChoice.objects.create(
        question=q3,
        choice_text="Morning",
        choice_text_i18n={"en": "Morning"},
        preference_weights={"black_tea": 0.8, "green_tea": 0.4},
        order=1,
    )

    return {
        "questions": [q1, q2, q3],
        "choices": {
            q1.id: [q1_choice1, q1_choice2],
            q2.id: [q2_choice1, q2_choice2],
            q3.id: [q3_choice1],
        },
    }


# =============================================================================
# GET /api/v1/quiz/questions/ Tests
# =============================================================================


@pytest.mark.django_db
class TestGetQuizQuestions:
    """Test suite for GET /api/v1/quiz/questions/ endpoint."""

    def test_get_questions_returns_all(self, client, sample_quiz_questions):
        """Endpoint returns all quiz questions with choices."""
        response = client.get("/api/v1/quiz/questions/")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3  # 3 questions

    def test_get_questions_includes_choices(self, client, sample_quiz_questions):
        """Each question includes its choices."""
        response = client.get("/api/v1/quiz/questions/")

        assert response.status_code == 200
        data = response.json()

        # First question should have 2 choices
        assert len(data[0]["choices"]) == 2

        # Each choice should have id, text, order
        choice = data[0]["choices"][0]
        assert "id" in choice
        assert "choice_text" in choice
        assert "order" in choice

    def test_get_questions_excludes_preference_weights(
        self, client, sample_quiz_questions
    ):
        """Choice weights should NOT be exposed to frontend (security)."""
        response = client.get("/api/v1/quiz/questions/")

        assert response.status_code == 200
        data = response.json()

        # Preference weights should not be in response
        choice = data[0]["choices"][0]
        assert "preference_weights" not in choice

    def test_get_questions_respects_ordering(self, client, sample_quiz_questions):
        """Questions ordered by 'order' field."""
        response = client.get("/api/v1/quiz/questions/")

        assert response.status_code == 200
        data = response.json()

        # Check ordering (order=1, order=2, order=3)
        assert data[0]["order"] == 1
        assert data[1]["order"] == 2
        assert data[2]["order"] == 3

    def test_get_questions_no_auth_required(self, client, sample_quiz_questions):
        """Anonymous users can view questions."""
        response = client.get("/api/v1/quiz/questions/")

        assert response.status_code == 200

    def test_get_questions_locale_en_sg(self, client, sample_quiz_questions):
        """Returns English (Singapore) by default."""
        response = client.get("/api/v1/quiz/questions/")

        assert response.status_code == 200
        data = response.json()

        # Question text should be in English
        assert "What tea strength do you prefer?" in data[0]["question_text"]

    def test_get_questions_empty_quiz(self, client):
        """Returns empty list when no questions exist."""
        response = client.get("/api/v1/quiz/questions/")

        assert response.status_code == 200
        data = response.json()
        assert data == []


# =============================================================================
# POST /api/v1/quiz/submit/ Tests
# =============================================================================


@pytest.mark.django_db
class TestSubmitQuiz:
    """Test suite for POST /api/v1/quiz/submit/ endpoint."""

    def test_submit_quiz_success(self, authenticated_client, sample_quiz_questions):
        """Valid submission creates preferences and returns success."""
        q1, q2, q3 = sample_quiz_questions["questions"]
        choice1 = sample_quiz_questions["choices"][q1.id][0]
        choice2 = sample_quiz_questions["choices"][q2.id][0]

        payload = {
            "answers": {
                str(q1.id): choice1.id,
                str(q2.id): choice2.id,
            }
        }

        response = authenticated_client.post(
            "/api/v1/quiz/submit/",
            data=payload,
            content_type="application/json",
        )

        assert response.status_code == 200
        data = response.json()
        assert "preferences" in data
        assert "top_categories" in data

    def test_submit_quiz_creates_preferences(
        self, authenticated_client, sample_quiz_questions, test_user
    ):
        """Submission creates UserPreference record."""
        q1, q2, q3 = sample_quiz_questions["questions"]
        choice1 = sample_quiz_questions["choices"][q1.id][0]
        choice2 = sample_quiz_questions["choices"][q2.id][0]

        payload = {
            "answers": {
                str(q1.id): choice1.id,
                str(q2.id): choice2.id,
            }
        }

        # Submit quiz
        authenticated_client.post(
            "/api/v1/quiz/submit/",
            data=payload,
            content_type="application/json",
        )

        # Verify preference was created
        preference = UserPreference.objects.get(user=test_user)
        assert preference.has_completed_quiz()
        assert len(preference.preferences) > 0

    def test_submit_quiz_returns_preferences(
        self, authenticated_client, sample_quiz_questions
    ):
        """Response includes calculated preferences."""
        q1, q2, q3 = sample_quiz_questions["questions"]
        choice1 = sample_quiz_questions["choices"][q1.id][
            0
        ]  # Light: white_tea=0.9, green_tea=0.6
        choice2 = sample_quiz_questions["choices"][q2.id][
            0
        ]  # Floral: oolong=0.8, white_tea=0.6

        payload = {
            "answers": {
                str(q1.id): choice1.id,
                str(q2.id): choice2.id,
            }
        }

        response = authenticated_client.post(
            "/api/v1/quiz/submit/",
            data=payload,
            content_type="application/json",
        )

        data = response.json()
        preferences = data["preferences"]

        # Scores should be normalized 0-100
        for score in preferences.values():
            assert 0 <= score <= 100

        # white_tea: 0.9 + 0.6 = 1.5 (should be highest = 100)
        assert preferences["white_tea"] == 100

    def test_submit_quiz_missing_required(
        self, authenticated_client, sample_quiz_questions
    ):
        """Returns 400 if required questions not answered."""
        q1, q2, q3 = sample_quiz_questions["questions"]
        choice1 = sample_quiz_questions["choices"][q1.id][0]

        # Only answer q1, missing required q2
        payload = {
            "answers": {
                str(q1.id): choice1.id,
            }
        }

        response = authenticated_client.post(
            "/api/v1/quiz/submit/",
            data=payload,
            content_type="application/json",
        )

        assert response.status_code == 400
        data = response.json()
        assert "required" in str(data).lower() or "missing" in str(data).lower()

    def test_submit_quiz_invalid_choice(
        self, authenticated_client, sample_quiz_questions
    ):
        """Returns 400 if choice doesn't belong to question."""
        q1, q2, q3 = sample_quiz_questions["questions"]

        # Use choice from q1 for q2 (invalid)
        choice1 = sample_quiz_questions["choices"][q1.id][0]

        payload = {
            "answers": {
                str(q1.id): choice1.id,
                str(q2.id): choice1.id,  # Invalid: choice1 belongs to q1
            }
        }

        response = authenticated_client.post(
            "/api/v1/quiz/submit/",
            data=payload,
            content_type="application/json",
        )

        assert response.status_code == 400

    def test_submit_quiz_optional_question(
        self, authenticated_client, sample_quiz_questions
    ):
        """Optional questions can be skipped."""
        q1, q2, q3 = sample_quiz_questions["questions"]
        choice1 = sample_quiz_questions["choices"][q1.id][0]
        choice2 = sample_quiz_questions["choices"][q2.id][0]

        # Only answer required questions (q1, q2), skip optional q3
        payload = {
            "answers": {
                str(q1.id): choice1.id,
                str(q2.id): choice2.id,
            }
        }

        response = authenticated_client.post(
            "/api/v1/quiz/submit/",
            data=payload,
            content_type="application/json",
        )

        assert response.status_code == 200

    def test_submit_quiz_unauthenticated(self, client, sample_quiz_questions):
        """Returns 401 if user not authenticated."""
        q1, q2, q3 = sample_quiz_questions["questions"]
        choice1 = sample_quiz_questions["choices"][q1.id][0]
        choice2 = sample_quiz_questions["choices"][q2.id][0]

        payload = {
            "answers": {
                str(q1.id): choice1.id,
                str(q2.id): choice2.id,
            }
        }

        response = client.post(
            "/api/v1/quiz/submit/",
            data=payload,
            content_type="application/json",
        )

        assert response.status_code == 401

    def test_submit_quiz_already_completed(
        self, authenticated_client, sample_quiz_questions, test_user
    ):
        """Returns 400 if quiz already completed (one-time only)."""
        # Create existing preference
        UserPreference.objects.create(
            user=test_user,
            preferences={"green_tea": 80},
            quiz_completed_at=datetime.now(),
        )

        q1, q2, q3 = sample_quiz_questions["questions"]
        choice1 = sample_quiz_questions["choices"][q1.id][0]
        choice2 = sample_quiz_questions["choices"][q2.id][0]

        payload = {
            "answers": {
                str(q1.id): choice1.id,
                str(q2.id): choice2.id,
            }
        }

        response = authenticated_client.post(
            "/api/v1/quiz/submit/",
            data=payload,
            content_type="application/json",
        )

        assert response.status_code == 400
        data = response.json()
        assert "already" in str(data).lower() or "completed" in str(data).lower()

    def test_submit_quiz_invalid_question_id(self, authenticated_client):
        """Returns 400 if question ID doesn't exist."""
        payload = {
            "answers": {
                "99999": 1,  # Non-existent question
            }
        }

        response = authenticated_client.post(
            "/api/v1/quiz/submit/",
            data=payload,
            content_type="application/json",
        )

        assert response.status_code == 400


# =============================================================================
# GET /api/v1/quiz/preferences/ Tests
# =============================================================================


@pytest.mark.django_db
class TestGetPreferences:
    """Test suite for GET /api/v1/quiz/preferences/ endpoint."""

    def test_get_preferences_authenticated(self, authenticated_client, test_user):
        """Returns preferences for authenticated user."""
        # Create preference
        UserPreference.objects.create(
            user=test_user,
            preferences={"green_tea": 85, "oolong": 72, "black_tea": 45},
            quiz_completed_at=datetime.now(),
        )

        response = authenticated_client.get("/api/v1/quiz/preferences/")

        assert response.status_code == 200
        data = response.json()
        assert "preferences" in data
        assert "top_categories" in data
        assert "quiz_completed_at" in data

    def test_get_preferences_no_preference_yet(self, authenticated_client):
        """Returns null if user hasn't completed quiz."""
        response = authenticated_client.get("/api/v1/quiz/preferences/")

        assert response.status_code == 200
        data = response.json()
        assert data.get("preferences") is None
        assert data.get("quiz_completed_at") is None

    def test_get_preferences_unauthenticated(self, client):
        """Returns 401 if user not authenticated."""
        response = client.get("/api/v1/quiz/preferences/")

        assert response.status_code == 401

    def test_get_preferences_top_categories(self, authenticated_client, test_user):
        """Returns top 3 categories by score."""
        UserPreference.objects.create(
            user=test_user,
            preferences={
                "green_tea": 85,
                "oolong": 72,
                "black_tea": 45,
                "white_tea": 30,
            },
            quiz_completed_at=datetime.now(),
        )

        response = authenticated_client.get("/api/v1/quiz/preferences/")

        assert response.status_code == 200
        data = response.json()
        top_categories = data["top_categories"]

        assert len(top_categories) == 3
        assert top_categories[0] == "green_tea"  # Highest score
        assert top_categories[1] == "oolong"
        assert top_categories[2] == "black_tea"

    def test_get_preferences_empty_preferences(self, authenticated_client, test_user):
        """Handle empty preferences gracefully."""
        UserPreference.objects.create(
            user=test_user,
            preferences={},
            quiz_completed_at=datetime.now(),
        )

        response = authenticated_client.get("/api/v1/quiz/preferences/")

        assert response.status_code == 200
        data = response.json()
        assert data["top_categories"] == []


# =============================================================================
# Error Handling Tests
# =============================================================================


@pytest.mark.django_db
class TestQuizApiErrors:
    """Test error handling and edge cases."""

    def test_submit_quiz_empty_payload(self, authenticated_client):
        """Returns 400/422 for empty payload."""
        response = authenticated_client.post(
            "/api/v1/quiz/submit/",
            data={},
            content_type="application/json",
        )

        assert response.status_code in [
            400,
            422,
        ]  # Ninja returns 422 for validation errors

    def test_submit_quiz_invalid_json(self, authenticated_client):
        """Returns 400 for invalid JSON."""
        response = authenticated_client.post(
            "/api/v1/quiz/submit/",
            data="invalid json",
            content_type="application/json",
        )

        assert response.status_code == 400

    def test_get_questions_method_not_allowed(self, authenticated_client):
        """POST not allowed on questions endpoint."""
        response = authenticated_client.post("/api/v1/quiz/questions/")
        assert response.status_code == 405
