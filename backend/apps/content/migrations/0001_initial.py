# Generated manually for Task 7.1.2

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="QuizQuestion",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("question_text", models.CharField(max_length=500)),
                ("question_text_i18n", models.JSONField(blank=True, default=dict)),
                ("order", models.PositiveIntegerField(default=0)),
                ("is_required", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "ordering": ["order", "id"],
                "verbose_name": "Quiz Question",
                "verbose_name_plural": "Quiz Questions",
            },
        ),
        migrations.CreateModel(
            name="QuizChoice",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("choice_text", models.CharField(max_length=200)),
                ("choice_text_i18n", models.JSONField(blank=True, default=dict)),
                ("preference_weights", models.JSONField(blank=True, default=dict)),
                ("order", models.PositiveIntegerField(default=0)),
                (
                    "question",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="choices",
                        to="content.quizquestion",
                    ),
                ),
            ],
            options={
                "ordering": ["order", "id"],
                "verbose_name": "Quiz Choice",
                "verbose_name_plural": "Quiz Choices",
            },
        ),
        migrations.CreateModel(
            name="UserPreference",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("preferences", models.JSONField(blank=True, default=dict)),
                ("quiz_completed_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="preference",
                        to="core.user",
                    ),
                ),
            ],
            options={
                "verbose_name": "User Preference",
                "verbose_name_plural": "User Preferences",
            },
        ),
    ]
