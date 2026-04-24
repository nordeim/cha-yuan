"""
Commerce models for CHA YUAN - Product catalog with Singapore GST pricing.
"""

from decimal import Decimal, ROUND_HALF_UP

from django.db import models

from apps.core.models import User


class Origin(models.Model):
    """Tea origin region."""

    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    region = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    image = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "origins"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.region})"


class TeaCategory(models.Model):
    """Tea category with fermentation level and brewing guide."""

    FERMENTATION_CHOICES = [
        (0, "White Tea (0%)"),
        (5, "Green Tea (0-5%)"),
        (45, "Oolong Tea (15-70%)"),
        (100, "Black Tea (100%)"),
        (-1, "Pu'erh Tea (Post-fermented)"),
    ]

    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    fermentation_level = models.IntegerField(
        choices=FERMENTATION_CHOICES,
        help_text="Oxidation percentage",
    )
    description = models.TextField()
    brewing_temp_celsius = models.IntegerField(
        help_text="Recommended brewing temperature in Celsius",
    )
    brewing_time_seconds = models.IntegerField(
        help_text="Recommended brewing time in seconds",
    )
    image = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "tea_categories"
        verbose_name_plural = "tea categories"
        ordering = ["fermentation_level"]

    def __str__(self):
        return self.name

    def get_brewing_temp_display(self):
        """Return brewing temperature with unit."""
        return f"{self.brewing_temp_celsius}°C"

    def get_brewing_time_display(self):
        """Return brewing time in minutes/seconds format."""
        if self.brewing_time_seconds >= 60:
            minutes = self.brewing_time_seconds // 60
            seconds = self.brewing_time_seconds % 60
            if seconds > 0:
                return f"{minutes}:{seconds:02d} min"
            return f"{minutes} min"
        return f"{self.brewing_time_seconds} sec"


class Product(models.Model):
    """Tea product with Singapore GST pricing."""

    SEASON_CHOICES = [
        ("spring", "Spring"),
        ("summer", "Summer"),
        ("autumn", "Autumn"),
        ("winter", "Winter"),
    ]

    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    short_description = models.CharField(max_length=255)

    # Pricing (SGD)
    price_sgd = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Base price in SGD (before GST)",
    )
    gst_inclusive = models.BooleanField(
        default=True,
        help_text="Whether price includes GST",
    )

    # Inventory
    stock = models.PositiveIntegerField(default=0)
    is_available = models.BooleanField(default=True)

    # Relationships
    origin = models.ForeignKey(
        Origin,
        on_delete=models.CASCADE,
        related_name="products",
    )
    category = models.ForeignKey(
        TeaCategory,
        on_delete=models.CASCADE,
        related_name="products",
    )

    # Tea-specific fields
    harvest_season = models.CharField(
        max_length=10,
        choices=SEASON_CHOICES,
        blank=True,
    )
    harvest_year = models.PositiveIntegerField(null=True, blank=True)
    weight_grams = models.PositiveIntegerField(default=50)
    is_new_arrival = models.BooleanField(default=False)
    is_subscription_eligible = models.BooleanField(default=True)

    # Media
    image = models.URLField(blank=True)
    images = models.JSONField(default=list, blank=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "products"
        ordering = ["-is_new_arrival", "-created_at"]

    def __str__(self):
        return self.name

    def get_price_with_gst(self):
        """Calculate price with GST included."""
        if self.gst_inclusive:
            return self.price_sgd
        # GST 9%
        gst_rate = Decimal("0.09")
        total = self.price_sgd * (Decimal("1") + gst_rate)
        return total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    @property
    def price_with_gst(self):
        """Property accessor for API serialization."""
        return self.get_price_with_gst()

    def get_gst_amount(self):
        """Calculate GST amount."""
        if self.gst_inclusive:
            # Extract GST from inclusive price
            base = self.price_sgd / Decimal("1.09")
            gst = self.price_sgd - base
        else:
            gst = self.price_sgd * Decimal("0.09")
        return gst.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    @property
    def gst_amount(self):
        """Property accessor for API serialization."""
        return self.get_gst_amount()

    def is_in_stock(self):
        """Check if product is in stock."""
        return self.stock > 0 and self.is_available

    @property
    def in_stock(self):
        """Property accessor for API serialization."""
        return self.is_in_stock()

    def get_weight_display(self):
        """Return weight with unit."""
        return f"{self.weight_grams}g"

    @property
    def weight_display(self):
        """Property accessor for API serialization."""
        return self.get_weight_display()

    def get_season_display_with_year(self):
        """Return season and year if available."""
        if self.harvest_season and self.harvest_year:
            return f"{self.get_harvest_season_display()} {self.harvest_year}"
        return self.get_harvest_season_display() if self.harvest_season else ""


class Subscription(models.Model):
    """
    Tea subscription for monthly curated boxes.
    Singapore market - SGD billing.
    """

    STATUS_CHOICES = [
        ("active", "Active"),
        ("paused", "Paused"),
        ("cancelled", "Cancelled"),
        ("past_due", "Past Due"),
    ]

    PLAN_CHOICES = [
        ("monthly", "Monthly"),
        ("quarterly", "Quarterly"),
        ("annual", "Annual"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="subscriptions",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="active",
    )
    plan = models.CharField(
        max_length=20,
        choices=PLAN_CHOICES,
        default="monthly",
    )

    # Billing
    price_sgd = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Monthly subscription price in SGD",
    )
    next_billing_date = models.DateTimeField()

    # Curation override (manual selection by tea master)
    next_curation_override = models.JSONField(
        default=dict,
        blank=True,
        null=True,
        help_text="Manual product selection for next shipment. Format: {'product_ids': [1, 2, 3]}",
    )

    # Stripe
    stripe_subscription_id = models.CharField(
        max_length=255,
        blank=True,
        help_text="Stripe subscription ID",
    )
    stripe_customer_id = models.CharField(
        max_length=255,
        blank=True,
        help_text="Stripe customer ID",
    )

    # Cancellation
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "subscriptions"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} - {self.plan} ({self.status})"

    def is_active(self):
        """Check if subscription is active."""
        return self.status == "active"

    def can_curate(self):
        """Check if subscription is eligible for curation."""
        return self.status in ["active", "paused"]


class SubscriptionShipment(models.Model):
    """
    Individual shipment in a subscription.
    Tracks what products were sent and when.
    """

    STATUS_CHOICES = [
        ("preparing", "Preparing"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("returned", "Returned"),
        ("cancelled", "Cancelled"),
    ]

    subscription = models.ForeignKey(
        Subscription,
        on_delete=models.CASCADE,
        related_name="shipments",
    )
    products = models.ManyToManyField(
        Product,
        related_name="shipments",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="preparing",
    )

    # Shipping
    tracking_number = models.CharField(max_length=255, blank=True)
    shipped_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    # Curation metadata
    curation_type = models.CharField(
        max_length=20,
        choices=[("auto", "Auto-curated"), ("manual", "Manual override")],
        default="auto",
        help_text="Whether this shipment was auto-curated or manually selected",
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "subscription_shipments"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Shipment {self.id} for {self.subscription.user.email}"


class Order(models.Model):
    """
    Customer purchase order.
    Created when Stripe payment_intent.succeeded webhook fires.
    """

    STATUS_CHOICES = [
        ("pending", "Pending Payment"),
        ("paid", "Paid"),
        ("processing", "Processing"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
        ("refunded", "Refunded"),
    ]

    # Order identification
    order_number = models.CharField(max_length=20, unique=True, db_index=True)

    # Status workflow
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )

    # Customer linkage
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )
    # For guest checkout, user is null; we capture email below
    customer_email = models.EmailField()
    customer_name = models.CharField(max_length=255, blank=True)
    customer_phone = models.CharField(max_length=20, blank=True)

    # Singapore address (copied at time of purchase)
    shipping_name = models.CharField(max_length=255)
    shipping_block_street = models.CharField(max_length=255)
    shipping_unit = models.CharField(max_length=50, blank=True)
    shipping_postal_code = models.CharField(max_length=6)
    shipping_country = models.CharField(max_length=2, default="SG")

    # Pricing (SGD)
    subtotal_sgd = models.DecimalField(max_digits=10, decimal_places=2)
    gst_amount_sgd = models.DecimalField(max_digits=10, decimal_places=2)
    total_sgd = models.DecimalField(max_digits=10, decimal_places=2)

    # Payment
    stripe_payment_intent_id = models.CharField(
        max_length=255,
        unique=True,
        db_index=True,
    )
    stripe_receipt_url = models.URLField(blank=True)
    payment_method = models.CharField(max_length=100, blank=True)
    # Examples: "visa ending in 4242", "grabpay", "paynow"

    # Fulfillment
    tracking_number = models.CharField(max_length=255, blank=True)
    shipped_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    # Metadata
    cart_id = models.CharField(max_length=255, blank=True, help_text="Original cart ID")
    notes = models.TextField(blank=True, help_text="Customer or staff notes")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "orders"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.order_number} - {self.customer_email}"

    def generate_order_number(self):
        """Generate unique order number: CY-YYYYMMDD-XXX"""
        from datetime import datetime
        today = datetime.now()
        prefix = f"CY-{today.strftime('%Y%m%d')}"

        # Find next sequence number for today
        existing = Order.objects.filter(order_number__startswith=prefix).count()
        sequence = existing + 1
        return f"{prefix}-{sequence:03d}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self.generate_order_number()
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    """
    Individual line item in an order.
    Captures product state at time of purchase (prices frozen).
    """

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )

    # Product reference (nullable in case product is deleted later)
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="order_items",
    )

    # Frozen product data (at time of purchase)
    product_name = models.CharField(max_length=255)
    product_slug = models.SlugField()
    product_weight_grams = models.PositiveIntegerField()
    product_image = models.URLField(blank=True)

    # Pricing (frozen at purchase)
    unit_price_sgd = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()
    subtotal_sgd = models.DecimalField(max_digits=10, decimal_places=2)

    # Fulfillment
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("preparing", "Preparing"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("returned", "Returned"),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "order_items"
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.quantity}x {self.product_name} in {self.order.order_number}"

    def save(self, *args, **kwargs):
        # Calculate subtotal from unit_price * quantity
        self.subtotal_sgd = Decimal(str(self.unit_price_sgd)) * self.quantity
        super().save(*args, **kwargs)
