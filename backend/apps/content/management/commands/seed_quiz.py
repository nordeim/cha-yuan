"""
Management command to seed quiz questions and choices.

Usage:
    python manage.py seed_quiz
    python manage.py seed_quiz --clear  # Clear existing quiz data first

This command creates a comprehensive preference quiz with 6 questions
and weighted choices for tea category scoring.
"""

from django.core.management.base import BaseCommand
from apps.content.models import QuizQuestion, QuizChoice


class Command(BaseCommand):
    """Seed quiz data for preference quiz."""

    help = "Create sample quiz questions with weighted choices"

    def add_arguments(self, parser):
        """Add command arguments."""
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing quiz data before seeding",
        )

    def handle(self, *args, **options):
        """Execute the command."""
        if options["clear"]:
            self.clear_existing_data()

        self.stdout.write(self.style.SUCCESS("Seeding quiz questions..."))

        # Question 1: Tea Strength Preference (Required)
        q1 = self.create_question(
            text="What tea strength do you prefer?",
            order=1,
            required=True,
        )

        self.create_choice(
            question=q1,
            text="Light and delicate - subtle flavors, easy drinking",
            weights={"white_tea": 0.9, "green_tea": 0.6, "oolong": 0.3},
            order=1,
        )

        self.create_choice(
            question=q1,
            text="Medium and balanced - some complexity, not too strong",
            weights={"oolong": 0.8, "green_tea": 0.5, "white_tea": 0.4},
            order=2,
        )

        self.create_choice(
            question=q1,
            text="Bold and robust - full-bodied, intense flavor",
            weights={"black_tea": 0.9, "puerh": 0.7, "oolong": 0.4},
            order=3,
        )

        # Question 2: Flavor Profile (Required)
        q2 = self.create_question(
            text="What flavor profiles appeal to you most?",
            order=2,
            required=True,
        )

        self.create_choice(
            question=q2,
            text="Floral and fragrant - orchid, jasmine, garden notes",
            weights={"oolong": 0.9, "white_tea": 0.7, "green_tea": 0.4},
            order=1,
        )

        self.create_choice(
            question=q2,
            text="Fresh and grassy - vegetal, seaweed, spring meadow",
            weights={"green_tea": 0.9, "white_tea": 0.5, "oolong": 0.3},
            order=2,
        )

        self.create_choice(
            question=q2,
            text="Earthy and woody - forest floor, aged, mature",
            weights={"puerh": 0.9, "black_tea": 0.6, "oolong": 0.3},
            order=3,
        )

        self.create_choice(
            question=q2,
            text="Sweet and fruity - stone fruit, honey, mellow",
            weights={"white_tea": 0.8, "oolong": 0.6, "green_tea": 0.3},
            order=4,
        )

        # Question 3: Caffeine Preference (Required)
        q3 = self.create_question(
            text="What caffeine level do you prefer?",
            order=3,
            required=True,
        )

        self.create_choice(
            question=q3,
            text="Low caffeine - relaxing, evening tea, gentle on system",
            weights={"white_tea": 0.8, "green_tea": 0.7, "oolong": 0.3},
            order=1,
        )

        self.create_choice(
            question=q3,
            text="Medium caffeine - balanced energy, any time of day",
            weights={"oolong": 0.8, "green_tea": 0.5, "black_tea": 0.4},
            order=2,
        )

        self.create_choice(
            question=q3,
            text="High caffeine - energizing, morning boost, focused",
            weights={"black_tea": 0.9, "puerh": 0.8, "oolong": 0.4},
            order=3,
        )

        # Question 4: Brewing Time (Required)
        q4 = self.create_question(
            text="How much time do you like to spend brewing tea?",
            order=4,
            required=True,
        )

        self.create_choice(
            question=q4,
            text="Quick brew (1-2 minutes) - grab and go, busy lifestyle",
            weights={"green_tea": 0.8, "white_tea": 0.7, "black_tea": 0.4},
            order=1,
        )

        self.create_choice(
            question=q4,
            text="Medium brew (3-4 minutes) - balanced ritual, mindful moment",
            weights={"oolong": 0.8, "black_tea": 0.6, "green_tea": 0.5},
            order=2,
        )

        self.create_choice(
            question=q4,
            text="Long brew (5+ minutes) or multiple infusions - tea ceremony",
            weights={"puerh": 0.9, "oolong": 0.8, "green_tea": 0.3},
            order=3,
        )

        # Question 5: Tea Origin Interest (Required)
        q5 = self.create_question(
            text="Which tea origins interest you most?",
            order=5,
            required=True,
        )

        self.create_choice(
            question=q5,
            text="China - Hangzhou (Dragon Well), Fujian (Tieguanyin), Yunnan",
            weights={"green_tea": 0.8, "oolong": 0.7, "white_tea": 0.6, "puerh": 0.5},
            order=1,
        )

        self.create_choice(
            question=q5,
            text="Taiwan - Alishan (High Mountain), Sun Moon Lake, Oriental Beauty",
            weights={"oolong": 0.9, "black_tea": 0.5},
            order=2,
        )

        self.create_choice(
            question=q5,
            text="India - Darjeeling (Champagne of Teas), Assam, Nilgiri",
            weights={"black_tea": 0.9, "green_tea": 0.3},
            order=3,
        )

        self.create_choice(
            question=q5,
            text="Japan - Kyoto (Matcha, Gyokuro), Shizuoka (Sencha)",
            weights={"green_tea": 0.9, "white_tea": 0.2},
            order=4,
        )

        # Question 6: Temperature Preference (Optional)
        q6 = self.create_question(
            text="Do you enjoy cold brew or iced tea? (Optional)",
            order=6,
            required=False,
        )

        self.create_choice(
            question=q6,
            text="Hot tea only - traditional preparation",
            weights={"black_tea": 0.4, "puerh": 0.4, "oolong": 0.3},
            order=1,
        )

        self.create_choice(
            question=q6,
            text="Love cold brew - refreshing, smooth, less bitter",
            weights={"green_tea": 0.7, "white_tea": 0.8, "oolong": 0.6},
            order=2,
        )

        self.create_choice(
            question=q6,
            text="Both hot and cold - versatile tea drinker",
            weights={
                "oolong": 0.5,
                "green_tea": 0.5,
                "white_tea": 0.5,
                "black_tea": 0.3,
            },
            order=3,
        )

        self.stdout.write(self.style.SUCCESS("Successfully seeded quiz data!"))
        self.stdout.write(f"  - Questions: {QuizQuestion.objects.count()}")
        self.stdout.write(f"  - Choices: {QuizChoice.objects.count()}")
        self.stdout.write("")
        self.stdout.write("Quiz is ready for use. Access via:")
        self.stdout.write("  - GET /api/v1/quiz/questions/")
        self.stdout.write("  - POST /api/v1/quiz/submit/")
        self.stdout.write("  - GET /api/v1/quiz/preferences/")

    def clear_existing_data(self):
        """Clear existing quiz data."""
        self.stdout.write(self.style.WARNING("Clearing existing quiz data..."))
        QuizChoice.objects.all().delete()
        QuizQuestion.objects.all().delete()
        self.stdout.write(self.style.SUCCESS("Existing quiz data cleared"))

    def create_question(
        self, text: str, order: int, required: bool = True
    ) -> QuizQuestion:
        """Create or get a quiz question."""
        question, created = QuizQuestion.objects.get_or_create(
            question_text=text,
            defaults={
                "question_text_i18n": {"en": text},
                "order": order,
                "is_required": required,
            },
        )

        if created:
            self.stdout.write(f"  Created question: {text[:50]}...")
        else:
            self.stdout.write(f"  Question exists: {text[:50]}...")

        return question

    def create_choice(
        self, question: QuizQuestion, text: str, weights: dict, order: int
    ) -> QuizChoice:
        """Create or get a quiz choice."""
        choice, created = QuizChoice.objects.get_or_create(
            question=question,
            choice_text=text,
            defaults={
                "choice_text_i18n": {"en": text},
                "preference_weights": weights,
                "order": order,
            },
        )

        if created:
            weight_summary = ", ".join([f"{k}={v}" for k, v in weights.items()])
            self.stdout.write(f"    Created choice: {text[:40]}... ({weight_summary})")

        return choice
