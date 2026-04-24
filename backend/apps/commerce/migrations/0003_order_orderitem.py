# Generated manually for Order and OrderItem models
# CHA YUAN - Order tracking for Stripe checkout

from django.db import migrations, models
import django.db.models.deletion
from decimal import Decimal


class Migration(migrations.Migration):
    dependencies = [
        ("commerce", "0002_alter_subscription_next_curation_override"),
    ]

    operations = [
        migrations.CreateModel(
            name="Order",
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
                ("order_number", models.CharField(db_index=True, max_length=20, unique=True)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("pending", "Pending Payment"),
                            ("paid", "Paid"),
                            ("processing", "Processing"),
                            ("shipped", "Shipped"),
                            ("delivered", "Delivered"),
                            ("cancelled", "Cancelled"),
                            ("refunded", "Refunded"),
                        ],
                        default="pending",
                        max_length=20,
                    ),
                ),
                ("customer_email", models.EmailField()),
                ("customer_name", models.CharField(blank=True, max_length=255)),
                ("customer_phone", models.CharField(blank=True, max_length=20)),
                ("shipping_name", models.CharField(max_length=255)),
                ("shipping_block_street", models.CharField(max_length=255)),
                ("shipping_unit", models.CharField(blank=True, max_length=50)),
                ("shipping_postal_code", models.CharField(max_length=6)),
                ("shipping_country", models.CharField(default="SG", max_length=2)),
                ("subtotal_sgd", models.DecimalField(decimal_places=2, max_digits=10)),
                ("gst_amount_sgd", models.DecimalField(decimal_places=2, max_digits=10)),
                ("total_sgd", models.DecimalField(decimal_places=2, max_digits=10)),
                (
                    "stripe_payment_intent_id",
                    models.CharField(db_index=True, max_length=255, unique=True),
                ),
                ("stripe_receipt_url", models.URLField(blank=True)),
                ("payment_method", models.CharField(blank=True, max_length=100)),
                ("tracking_number", models.CharField(blank=True, max_length=255)),
                ("shipped_at", models.DateTimeField(blank=True, null=True)),
                ("delivered_at", models.DateTimeField(blank=True, null=True)),
                (
                    "cart_id",
                    models.CharField(blank=True, help_text="Original cart ID", max_length=255),
                ),
                (
                    "notes",
                    models.TextField(blank=True, help_text="Customer or staff notes"),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="orders",
                        to="core.user",
                    ),
                ),
            ],
            options={
                "db_table": "orders",
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="OrderItem",
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
                ("product_name", models.CharField(max_length=255)),
                ("product_slug", models.SlugField()),
                ("product_weight_grams", models.PositiveIntegerField()),
                ("product_image", models.URLField(blank=True)),
                ("unit_price_sgd", models.DecimalField(decimal_places=2, max_digits=10)),
                ("quantity", models.PositiveIntegerField()),
                ("subtotal_sgd", models.DecimalField(decimal_places=2, max_digits=10)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("pending", "Pending"),
                            ("preparing", "Preparing"),
                            ("shipped", "Shipped"),
                            ("delivered", "Delivered"),
                            ("returned", "Returned"),
                        ],
                        default="pending",
                        max_length=20,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "order",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="items",
                        to="commerce.order",
                    ),
                ),
                (
                    "product",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="order_items",
                        to="commerce.product",
                    ),
                ),
            ],
            options={
                "db_table": "order_items",
                "ordering": ["created_at"],
            },
        ),
    ]
