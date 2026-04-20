"""
Quiz API Endpoints - Django Ninja

API for tea preference quiz and user preferences.
Endpoints:
- GET /api/v1/quiz/questions/ - List all quiz questions with choices
- POST /api/v1/quiz/submit/ - Submit quiz answers, get preferences
- GET /api/v1/quiz/preferences/ - Get current user's preferences

Singapore Context:
- JWT authentication via HttpOnly cookies
- One-time quiz completion (not editable per scope)
- Preference weights NOT exposed to frontend (security)
"""

from typing import List, Optional, Dict
from datetime import datetime
from decimal import Decimal

from ninja import Router, Schema
from ninja.errors import HttpError
from django.db.models import Prefetch

from apps.content.models import (
    QuizQuestion,
    QuizChoice,
    UserPreference,
    calculate_preferences,
)
from apps.core.models import User
from apps.core.authentication import JWTAuth


router = Router(tags=["quiz"])


# =============================================================================
# Schemas
# =============================================================================


class QuizChoiceSchema(Schema):
    """Quiz choice response schema (weights excluded for security)."""

    id: int
    choice_text: str
    order: int


class QuizQuestionSchema(Schema):
    """Quiz question with choices (no auth required)."""

    id: int
    question_text: str
    order: int
    is_required: bool
    choices: List[QuizChoiceSchema]


class QuizSubmitSchema(Schema):
    """Submit quiz answers."""

    answers: Dict[int, int]  # question_id: choice_id


class QuizResultSchema(Schema):
    """Quiz submission result with calculated preferences."""

    preferences: Dict[str, int]  # category_slug: score (0-100)
    top_categories: List[str]


class UserPreferenceSchema(Schema):
    """User preference response."""

    preferences: Optional[Dict[str, int]]
    quiz_completed_at: Optional[datetime]
    top_categories: List[str]


class ErrorSchema(Schema):
    """Error response schema."""

    detail: str


# =============================================================================
# Helper Functions
# =============================================================================


def get_quiz_questions_with_choices() -> List[QuizQuestion]:
    """
    Fetch all quiz questions with prefetched choices.

    Returns:
        List of QuizQuestion objects ordered by 'order'
    """
    return QuizQuestion.objects.prefetch_related(
        Prefetch("choices", queryset=QuizChoice.objects.order_by("order"))
    ).order_by("order")


def validate_quiz_answers(
    answers: Dict[int, int], questions: List[QuizQuestion]
) -> tuple[List[QuizChoice], List[str]]:
    """
    Validate quiz answers and return selected choices.

    Args:
        answers: Dict mapping question_id to choice_id
        questions: List of QuizQuestion objects

    Returns:
        Tuple of (selected_choices, error_messages)
    """
    selected_choices = []
    errors = []

    # Build lookup for questions
    question_map = {q.id: q for q in questions}

    # Check required questions
    for question in questions:
        if question.is_required and question.id not in answers:
            errors.append(f"Required question {question.id} not answered")
            continue

        if question.id in answers:
            choice_id = answers[question.id]

            # Validate choice exists and belongs to question
            try:
                choice = QuizChoice.objects.get(id=choice_id, question_id=question.id)
                selected_choices.append(choice)
            except QuizChoice.DoesNotExist:
                errors.append(f"Invalid choice {choice_id} for question {question.id}")

    return selected_choices, errors


# =============================================================================
# GET /api/v1/quiz/questions/
# =============================================================================


@router.get("/questions/", response=List[QuizQuestionSchema], auth=None)
def get_quiz_questions(request):
    """
    Get all quiz questions with their choices.

    No authentication required. Returns questions ordered by 'order' field.
    Preference weights are NOT included (security).

    Returns:
        List of QuizQuestionSchema objects with nested QuizChoiceSchema
    """
    questions = get_quiz_questions_with_choices()

    result = []
    for question in questions:
        choices = [
            QuizChoiceSchema(
                id=choice.id,
                choice_text=choice.choice_text,
                order=choice.order,
            )
            for choice in question.choices.all()
        ]

        result.append(
            QuizQuestionSchema(
                id=question.id,
                question_text=question.question_text,
                order=question.order,
                is_required=question.is_required,
                choices=choices,
            )
        )

    return result


# =============================================================================
# POST /api/v1/quiz/submit/
# =============================================================================


@router.post(
    "/submit/",
    response={200: QuizResultSchema, 400: ErrorSchema},
    auth=JWTAuth(),
)
def submit_quiz(request, payload: QuizSubmitSchema):
    """
    Submit quiz answers and get calculated preferences.

    Authentication required. One-time submission only.

    Args:
        payload: QuizSubmitSchema with answers dict {question_id: choice_id}

    Returns:
        QuizResultSchema with preferences and top categories

    Raises:
        HttpError 400: Validation errors or already completed
        HttpError 401: Not authenticated
    """
    user = request.auth

    # Check if user already completed quiz
    if UserPreference.objects.filter(user=user).exists():
        existing = UserPreference.objects.get(user=user)
        if existing.has_completed_quiz():
            raise HttpError(400, "Quiz already completed")

    # Get all questions
    questions = get_quiz_questions_with_choices()

    if not questions:
        raise HttpError(400, "No quiz questions available")

    # Validate answers
    selected_choices, errors = validate_quiz_answers(payload.answers, questions)

    if errors:
        raise HttpError(400, "; ".join(errors))

    if not selected_choices:
        raise HttpError(400, "No valid answers provided")

    # Calculate preferences
    preferences = calculate_preferences(selected_choices)

    # Get top categories
    top_categories = []
    if preferences:
        sorted_prefs = sorted(preferences.items(), key=lambda x: (-x[1], x[0]))
        top_categories = [cat for cat, _ in sorted_prefs[:3]]

    # Create or update UserPreference
    user_pref, _ = UserPreference.objects.update_or_create(
        user=user,
        defaults={
            "preferences": preferences,
            "quiz_completed_at": datetime.now(),
        },
    )

    return QuizResultSchema(
        preferences=preferences,
        top_categories=top_categories,
    )


# =============================================================================
# GET /api/v1/quiz/preferences/
# =============================================================================


@router.get(
    "/preferences/",
    response={200: UserPreferenceSchema, 401: ErrorSchema},
    auth=JWTAuth(),
)
def get_user_preferences(request):
    """
    Get current user's quiz preferences.

    Authentication required. Returns null if quiz not completed.

    Returns:
        UserPreferenceSchema with preferences, completion date, top categories

    Raises:
        HttpError 401: Not authenticated
    """
    user = request.auth

    try:
        pref = UserPreference.objects.get(user=user)

        top_categories = pref.get_top_preferences(n=3) if pref.preferences else []

        return UserPreferenceSchema(
            preferences=pref.preferences if pref.preferences else None,
            quiz_completed_at=pref.quiz_completed_at,
            top_categories=top_categories,
        )
    except UserPreference.DoesNotExist:
        return UserPreferenceSchema(
            preferences=None,
            quiz_completed_at=None,
            top_categories=[],
        )
