# Order Model Design Document
## CHA YUAN E-Commerce Platform

### Design Rationale

The Order model must capture:
1. **Payment data** from Stripe (payment_intent_id, amount, method, receipt)
2. **Cart contents** at time of purchase (what was bought, quantities, prices)
3. **Customer info** (user link for auth, email/guest data, shipping address)
4. **Fulfillment workflow** (status tracking: paid → processing → shipped → delivered)
5. **Singapore compliance** (GST breakdown, SGD currency)

### Model: Order

```python
class Order(models.Model):
    """
    Customer purchase order.
    Created when Stripe payment_intent.succeeded webhook fires.
    """

    # Order identification
    order_number = models.CharField(max_length=20, unique=True, db_index=True)
    # Format: CY-YYYYMMDD-XXX (e.g., CY-20260424-001)

    # Status workflow
    STATUS_CHOICES = [
        ("pending", "Pending Payment"),      # Created but not yet confirmed
        ("paid", "Paid"),                      # Payment succeeded
        ("processing", "Processing"),          # Order being prepared
        ("shipped", "Shipped"),                # Order dispatched
        ("delivered", "Delivered"),            # Customer received
        ("cancelled", "Cancelled"),            # Order cancelled
        ("refunded", "Refunded"),              # Payment refunded
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    # Customer linkage
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                             related_name="orders")
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
    stripe_payment_intent_id = models.CharField(max_length=255, unique=True, db_index=True)
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
```

### Model: OrderItem

```python
class OrderItem(models.Model):
    """
    Individual line item in an order.
    Captures product state at time of purchase (prices frozen).
    """

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")

    # Product reference (nullable in case product is deleted later)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL,
                                null=True, blank=True, related_name="order_items")

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
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "order_items"
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.quantity}x {self.product_name} in {self.order.order_number}"

    def save(self, *args, **kwargs):
        # Calculate subtotal from unit_price * quantity
        from decimal import Decimal
        self.subtotal_sgd = Decimal(str(self.unit_price_sgd)) * self.quantity
        super().save(*args, **kwargs)
```

### Integration Points

#### 1. Webhook Handler Updates Required

**File: `apps/commerce/stripe_sg.py`**

Line 247: Fix import
```python
# Change from (broken):
from commerce.models import Order

# To:
from apps.commerce.models import Order, OrderItem
```

Lines 304-326: Update order creation logic
```python
# Current (broken - Order doesn't exist):
order = Order.objects.create(**order_data)

# Should become:
order = Order.objects.create(
    user=user if user_id else None,
    customer_email=payment_intent.get("receipt_email", ""),
    customer_name=shipping_address["name"],
    shipping_name=shipping_address["name"],
    shipping_block_street=shipping_address["line1"],
    shipping_unit=shipping_address["line2"],
    shipping_postal_code=shipping_address["postal_code"],
    subtotal_sgd=base_amount,
    gst_amount_sgd=gst_amount,
    total_sgd=total_sgd,
    stripe_payment_intent_id=payment_intent_id,
    stripe_receipt_url=receipt_url,
    payment_method=payment_method,
    cart_id=cart_id,
    status="paid",
)

# Create OrderItems from cart
if cart_id:
    from apps.commerce.cart import get_cart_items
    cart_items = get_cart_items(cart_id)
    for item in cart_items:
        OrderItem.objects.create(
            order=order,
            product_id=item["product_id"],
            product_name=item["name"],
            product_slug=item["slug"],
            product_weight_grams=item["weight_grams"],
            product_image=item["image"] or "",
            unit_price_sgd=Decimal(str(item["price_with_gst"])),
            quantity=item["quantity"],
        )

# Decrement stock
for item in cart_items:
    try:
        product = Product.objects.get(id=item["product_id"])
        product.stock -= item["quantity"]
        product.save()
    except Product.DoesNotExist:
        pass
```

#### 2. Admin Configuration

**File: `apps/commerce/admin.py`**

Add OrderAdmin and OrderItemAdmin:
```python
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ["product_name", "product_slug", "quantity", "unit_price_sgd", "subtotal_sgd"]

class OrderAdmin(admin.ModelAdmin):
    list_display = ["order_number", "customer_email", "total_sgd", "status", "created_at"]
    list_filter = ["status", "created_at", "payment_method"]
    search_fields = ["order_number", "customer_email", "stripe_payment_intent_id"]
    readonly_fields = ["order_number", "created_at", "updated_at"]
    inlines = [OrderItemInline]
    date_hierarchy = "created_at"

admin.site.register(Order, OrderAdmin)
admin.site.register(OrderItem)
```

#### 3. Test File Fixes Required

**File: `apps/commerce/tests/test_stripe_webhook.py`**

Multiple issues:
1. Line 36, 50: Wrong import path `commerce.stripe_sg` → `apps.commerce.stripe_sg`
2. Line 127, 141, etc.: Mock patches use wrong path `commerce.stripe_sg.Order` → `apps.commerce.models.Order`
3. Lines need `@pytest.mark.django_db` decorator for DB access

### Database Migration

Migration file: `0003_order_orderitem.py`

```python
class Migration(migrations.Migration):
    dependencies = [
        ("commerce", "0002_alter_subscription_next_curation_override"),
    ]

    operations = [
        migrations.CreateModel(
            name="Order",
            fields=[...],
            options={"db_table": "orders", "ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="OrderItem",
            fields=[...],
            options={"db_table": "order_items", "ordering": ["created_at"]},
        ),
    ]
```

### Verification Checklist

- [ ] Order model exists in `apps.commerce.models`
- [ ] OrderItem model exists with FK to Order
- [ ] Migration `0003_order_orderitem.py` created and applied
- [ ] `stripe_sg.py` imports Order/OrderItem correctly
- [ ] `handle_payment_success()` creates Order + OrderItems
- [ ] `handle_payment_success()` decrements product stock
- [ ] `commerce/admin.py` registers Order with OrderItem inline
- [ ] Tests import from correct paths (`apps.commerce...` not `commerce...`)
- [ ] Tests have `@pytest.mark.django_db` decorator
- [ ] All webhook tests pass
