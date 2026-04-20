"""
Django Admin configuration for CHA YUAN commerce.
Includes Subscription management with manual curation override.
"""

from django import forms
from django.contrib import admin
from django.utils.html import format_html

from apps.commerce.models import (
    Origin,
    TeaCategory,
    Product,
    Subscription,
    SubscriptionShipment,
)


class OriginAdmin(admin.ModelAdmin):
    """Admin for tea origins."""

    list_display = ["name", "region", "product_count", "created_at"]
    list_filter = ["region"]
    search_fields = ["name", "region"]
    prepopulated_fields = {"slug": ("name",)}

    def product_count(self, obj):
        """Count of products from this origin."""
        return obj.products.count()

    product_count.short_description = "Products"


class TeaCategoryAdmin(admin.ModelAdmin):
    """Admin for tea categories."""

    list_display = [
        "name",
        "fermentation_level",
        "get_brewing_temp_display",
        "get_brewing_time_display",
    ]
    search_fields = ["name"]
    prepopulated_fields = {"slug": ("name",)}


class ProductAdmin(admin.ModelAdmin):
    """Admin for tea products."""

    list_display = [
        "name",
        "category",
        "origin",
        "price_sgd",
        "stock",
        "is_available",
        "is_subscription_eligible",
        "is_new_arrival",
    ]
    list_filter = [
        "category",
        "origin",
        "is_available",
        "is_subscription_eligible",
        "is_new_arrival",
        "harvest_season",
    ]
    search_fields = ["name", "description"]
    prepopulated_fields = {"slug": ("name",)}
    list_editable = ["stock", "is_available", "is_subscription_eligible"]


class CurationOverrideForm(forms.ModelForm):
    """
    Form for tea masters to manually curate subscription boxes.
    Allows selecting 3-5 products to override auto-curation.
    """

    override_products = forms.ModelMultipleChoiceField(
        queryset=Product.objects.filter(
            is_subscription_eligible=True, stock__gt=0, is_available=True
        )
        .select_related("category", "origin")
        .order_by("category__name", "name"),
        widget=forms.CheckboxSelectMultiple,
        required=False,
        label="Select teas for next box",
        help_text="Select 3-5 teas to include in next month's box. Leave empty for auto-curation.",
    )

    class Meta:
        model = Subscription
        fields = [
            "user",
            "status",
            "plan",
            "price_sgd",
            "next_billing_date",
        ]

    def clean_override_products(self):
        """Validate that max 5 products are selected."""
        products = self.cleaned_data.get("override_products", [])
        if products and len(products) > 5:
            raise forms.ValidationError(
                "Maximum 5 products can be selected for a subscription box."
            )
        return products


class SubscriptionAdmin(admin.ModelAdmin):
    """
    Admin for tea subscriptions with manual curation override.
    """

    form = CurationOverrideForm

    list_display = [
        "user",
        "plan",
        "status",
        "price_sgd",
        "next_billing_date",
        "curation_override_active",
    ]
    list_filter = ["plan", "status", "created_at"]
    search_fields = ["user__email", "user__first_name", "user__last_name"]
    list_select_related = ["user"]
    date_hierarchy = "created_at"

    fieldsets = (
        (
            "Subscription Details",
            {
                "fields": ("user", "plan", "status", "price_sgd"),
            },
        ),
        (
            "Billing",
            {
                "fields": ("next_billing_date", "stripe_subscription_id"),
            },
        ),
        (
            "Manual Curation",
            {
                "fields": ("override_products",),
                "description": "Select teas to manually curate next box. Leave empty for auto-curation.",
            },
        ),
        (
            "Stripe",
            {
                "fields": ("stripe_customer_id",),
                "classes": ("collapse",),
            },
        ),
        (
            "Cancellation",
            {
                "fields": ("cancelled_at", "cancellation_reason"),
                "classes": ("collapse",),
            },
        ),
    )

    def curation_override_active(self, obj):
        """
        Display whether a manual curation override is active.
        Shows as a colored dot for quick visual reference.
        """
        if obj.next_curation_override:
            return format_html(
                '<span style="color: {}; font-weight: bold;">{} {}</span>',
                "#5C8A4D",
                "●",
                "Active",
            )
        return format_html(
            '<span style="color: {}; opacity: 0.6;">{} {}</span>', "#999", "○", "Auto"
        )
        return format_html('<span style="color: #999; opacity: 0.6;">○ Auto</span>')

    curation_override_active.boolean = True
    curation_override_active.short_description = "Curation"

    def save_model(self, request, obj, form, change):
        """
        Override save to process the override_products field.
        Converts form selection into JSON storage.
        """
        # Get selected products from form
        if "override_products" in form.cleaned_data:
            products = form.cleaned_data["override_products"]

            if products:
                # Store override with metadata
                obj.next_curation_override = {
                    "product_ids": list(products.values_list("id", flat=True)),
                    "selected_by": request.user.email,
                    "selected_at": __import__("django.utils.timezone")
                    .now()
                    .isoformat(),
                }
            else:
                # Clear override if empty selection
                obj.next_curation_override = None

        super().save_model(request, obj, form, change)

    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        qs = super().get_queryset(request)
        return qs.select_related("user")


class SubscriptionShipmentAdmin(admin.ModelAdmin):
    """Admin for subscription shipments."""

    list_display = [
        "id",
        "subscription",
        "status",
        "curation_type",
        "tracking_number",
        "created_at",
    ]
    list_filter = ["status", "curation_type", "created_at"]
    search_fields = ["subscription__user__email", "tracking_number"]
    filter_horizontal = ["products"]

    def get_queryset(self, request):
        """Optimize queryset."""
        qs = super().get_queryset(request)
        return qs.select_related("subscription", "subscription__user")


# Register models
admin.site.register(Origin, OriginAdmin)
admin.site.register(TeaCategory, TeaCategoryAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(Subscription, SubscriptionAdmin)
admin.site.register(SubscriptionShipment, SubscriptionShipmentAdmin)
