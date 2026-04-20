# Phase 1 Sub-Plan: Backend Foundation & Models

> **Phase:** 1  
> **Duration:** Days 4-7  
> **TDD Principle:** Write model tests → Define models → Run tests → Pass  
> **Status:** IN PROGRESS

---

## Deep Analysis: Backend Architecture Philosophy

Before implementing models, we must understand the **domain-driven design** principles:

### Core Domains

1. **Identity & Access** (`core` app): User management, authentication, Singapore-specific validations
2. **Commerce** (`commerce` app): Products, orders, cart, payments, subscriptions
3. **Content** (`content` app): Articles, quiz, user preferences

### Singapore-Specific Requirements

- **PDPA Compliance**: Consent tracking for all data collection
- **GST Calculation**: 9% GST with proper rounding per IRAS guidelines
- **Address Format**: Block/Street, Unit, Postal Code (6 digits)
- **Phone Format**: +65 XXXX XXXX
- **Timezone**: Asia/Singapore for all timestamps

---

## TDD Workflow for Phase 1

### Step 1: Write Test (RED)
```python
# tests/test_models_user.py
def test_user_requires_email():
    with pytest.raises(ValueError):
        User.objects.create_user(email="", password="test123")
```

### Step 2: Run Test (Fails)
```bash
pytest tests/test_models_user.py -v
# EXPECTED: FAILED
```

### Step 3: Implement Minimal Code (GREEN)
```python
# models.py
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        # ... implementation
```

### Step 4: Run Test (Passes)
```bash
pytest tests/test_models_user.py -v
# EXPECTED: PASSED
```

### Step 5: Refactor
Improve code structure while tests remain green.

---

## Task Breakdown

### Task 1.1: Django Project Initialization

**Rationale:** Establish the project structure before any business logic.

**Files to Create:**

| File | Purpose | Lines | TDD Status |
|------|---------|-------|------------|
| `manage.py` | Django CLI entry | ~20 | N/A |
| `chayuan/__init__.py` | Package marker | ~0 | N/A |
| `chayuan/settings/base.py` | Base settings | ~150 | N/A |
| `chayuan/settings/development.py` | Dev overrides | ~30 | N/A |
| `chayuan/settings/test.py` | Test settings | ~25 | N/A |
| `chayuan/urls.py` | URL routing | ~20 | N/A |
| `chayuan/asgi.py` | ASGI config | ~15 | N/A |
| `chayuan/wsgi.py` | WSGI config | ~15 | N/A |
| `apps/__init__.py` | Apps package | ~0 | N/A |
| `apps/core/__init__.py` | Core app | ~0 | N/A |
| `apps/core/apps.py` | App config | ~5 | N/A |
| `apps/commerce/__init__.py` | Commerce app | ~0 | N/A |
| `apps/commerce/apps.py` | App config | ~5 | N/A |
| `apps/content/__init__.py` | Content app | ~0 | N/A |
| `apps/content/apps.py` | App config | ~5 | N/A |
| `apps/api/__init__.py` | API app | ~0 | N/A |
| `apps/api/apps.py` | App config | ~5 | N/A |

**Checklist:**
- [ ] Django project created with `django-admin startproject`
- [ ] Settings split into base/development/test
- [ ] PostgreSQL 17 database configured
- [ ] Redis cache configured
- [ ] Singapore timezone set (Asia/Singapore)
- [ ] GST rate configured (0.09)
- [ ] Apps registered in INSTALLED_APPS
- [ ] First migration created

---

### Task 1.2: User Model with Singapore Validation

**Rationale:** Custom user model is required for email-based auth and SG-specific fields.

**Test Files (Write First):**

| Test File | Coverage Target | Test Cases |
|-----------|-----------------|------------|
| `apps/core/tests/test_models_user.py` | 100% | User creation, email validation, SG postal code, phone format |

**Model File (Implement After Tests Pass):**

**File:** `apps/core/models.py`

```python
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.validators import RegexValidator
from django.db import models

class UserManager(BaseUserManager):
    """Custom user manager with email as username."""
    
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model for Singapore market."""
    
    # Singapore postal code validator (6 digits)
    postal_code_validator = RegexValidator(
        regex=r'^\d{6}$',
        message='Postal code must be exactly 6 digits (e.g., 123456)'
    )
    
    # Singapore phone validator (+65 XXXX XXXX)
    phone_validator = RegexValidator(
        regex=r'^\+65\s?\d{8}$',
        message='Phone number must be in format: +65 XXXX XXXX'
    )
    
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    
    # Singapore-specific fields
    phone = models.CharField(
        max_length=20,
        blank=True,
        validators=[phone_validator],
        help_text='Format: +65 XXXX XXXX'
    )
    postal_code = models.CharField(
        max_length=6,
        blank=True,
        validators=[postal_code_validator],
        help_text='6-digit Singapore postal code'
    )
    
    # PDPA compliance
    pdpa_consent_at = models.DateTimeField(null=True, blank=True)
    pdpa_consent_version = models.CharField(max_length=10, blank=True)
    
    # Status fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'user'
        verbose_name_plural = 'users'
    
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_short_name(self):
        return self.first_name
    
    def has_pdpa_consent(self):
        """Check if user has given PDPA consent."""
        return self.pdpa_consent_at is not None


class Address(models.Model):
    """Singapore address model."""
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='addresses'
    )
    recipient_name = models.CharField(max_length=255)
    block_street = models.CharField(
        max_length=255,
        help_text='e.g., Blk 123 Jurong East St 13'
    )
    unit = models.CharField(
        max_length=50,
        blank=True,
        help_text='e.g., #04-56'
    )
    postal_code = models.CharField(
        max_length=6,
        validators=[User.postal_code_validator]
    )
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'addresses'
        verbose_name_plural = 'addresses'
    
    def __str__(self):
        return f"{self.recipient_name} - {self.postal_code}"
    
    def format_sg_address(self):
        """Format address in Singapore style."""
        lines = [self.recipient_name]
        if self.unit:
            lines.append(f"{self.block_street}, {self.unit}")
        else:
            lines.append(self.block_street)
        lines.append(f"Singapore {self.postal_code}")
        return "\n".join(lines)
    
    def save(self, *args, **kwargs):
        # Ensure only one default address per user
        if self.is_default:
            Address.objects.filter(user=self.user).update(is_default=False)
        super().save(*args, **kwargs)
```

**Checklist:**
- [ ] Write User model tests first (should FAIL)
- [ ] Implement User model with SG validations
- [ ] Write Address model tests
- [ ] Implement Address model
- [ ] Run tests - should PASS
- [ ] Create initial migration
- [ ] Test migration applies cleanly

---

### Task 1.3: GST Calculation Utilities

**Rationale:** Accurate GST calculation is critical for Singapore compliance.

**Test Files (Write First):**

| Test File | Coverage Target | Test Cases |
|-----------|-----------------|------------|
| `apps/core/sg/tests/test_gst.py` | 100% | Calculation accuracy, edge cases, IRAS compliance |

**Test Cases:**
```python
def test_calculate_gst_inclusive_price():
    """Test GST calculation per IRAS guidelines."""
    from decimal import Decimal
    
    # Test cases
    assert calculate_gst_inclusive_price(Decimal('10.00')) == Decimal('10.90')
    assert calculate_gst_inclusive_price(Decimal('0.01')) == Decimal('0.02')
    assert calculate_gst_inclusive_price(Decimal('99.99')) == Decimal('108.99')
    
def test_extract_gst_from_inclusive():
    """Test GST extraction from inclusive price."""
    total = Decimal('109.00')
    gst = extract_gst_from_inclusive(total)
    assert gst == Decimal('9.00')
    
def test_rounding_per_iras():
    """Test 1-cent rounding per IRAS guidelines."""
    # Edge case: 0.005 should round to 0.01
    result = calculate_gst_inclusive_price(Decimal('0.05'))
    assert result == Decimal('0.05') + Decimal('0.01')  # 0.06
```

**Implementation File:**

**File:** `apps/core/sg/gst.py`

```python
"""
GST calculation utilities for Singapore (IRAS compliant).

Reference: https://www.iras.gov.sg/
GST Rate: 9% (effective 2024)
Rounding: Standard rounding to nearest cent (0.005 rounds up)
"""

from decimal import Decimal, ROUND_HALF_UP

# Singapore GST rate (9% as of 2024)
GST_RATE = Decimal('0.09')


def calculate_gst_inclusive_price(base_price: Decimal) -> Decimal:
    """
    Calculate price with GST included per IRAS guidelines.
    
    Formula: base_price * (1 + GST_RATE)
    Rounding: Standard rounding to nearest cent
    
    Args:
        base_price: Price before GST (2 decimal places)
        
    Returns:
        Price inclusive of GST (2 decimal places)
        
    Example:
        >>> calculate_gst_inclusive_price(Decimal('10.00'))
        Decimal('10.90')
    """
    if base_price < 0:
        raise ValueError("Base price cannot be negative")
    
    result = base_price * (Decimal('1') + GST_RATE)
    return result.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def extract_gst_from_inclusive(total_price: Decimal) -> Decimal:
    """
    Extract GST amount from an inclusive price.
    
    Formula: total - (total / 1.09)
    
    Args:
        total_price: Price inclusive of GST
        
    Returns:
        GST amount (2 decimal places)
        
    Example:
        >>> extract_gst_from_inclusive(Decimal('109.00'))
        Decimal('9.00')
    """
    if total_price < 0:
        raise ValueError("Total price cannot be negative")
    
    base_price = total_price / Decimal('1.09')
    gst_amount = total_price - base_price
    return gst_amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def calculate_gst_amount(base_price: Decimal) -> Decimal:
    """
    Calculate GST amount from base price.
    
    Args:
        base_price: Price before GST
        
    Returns:
        GST amount (2 decimal places)
        
    Example:
        >>> calculate_gst_amount(Decimal('100.00'))
        Decimal('9.00')
    """
    if base_price < 0:
        raise ValueError("Base price cannot be negative")
    
    gst = base_price * GST_RATE
    return gst.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def validate_gst_calculation(base_price: Decimal, total_price: Decimal) -> bool:
    """
    Validate that GST calculation is correct.
    
    Args:
        base_price: Price before GST
        total_price: Price inclusive of GST
        
    Returns:
        True if calculation is valid
        
    Example:
        >>> validate_gst_calculation(Decimal('100.00'), Decimal('109.00'))
        True
    """
    expected_total = calculate_gst_inclusive_price(base_price)
    return total_price == expected_total
```

**Checklist:**
- [ ] Write GST tests first (should FAIL)
- [ ] Implement GST utilities
- [ ] Run tests - should PASS with 100% coverage
- [ ] Document edge cases

---

### Task 1.4: Product Models

**Rationale:** Products are the core commerce entity with complex relationships.

**Test Files (Write First):**

| Test File | Coverage Target | Test Cases |
|-----------|-----------------|------------|
| `apps/commerce/tests/test_models_origin.py` | 100% | Origin creation, validation |
| `apps/commerce/tests/test_models_category.py` | 100% | Category creation, fermentation levels |
| `apps/commerce/tests/test_models_product.py` | 100% | Product creation, GST pricing, stock |

**Models:**

**File:** `apps/commerce/models.py`

```python
from django.db import models
from django.utils.text import slugify
from apps.core.sg.gst import calculate_gst_inclusive_price


class Origin(models.Model):
    """Tea origin/region (e.g., Yunnan, Fujian)."""
    
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    region = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='origins/', blank=True)
    
    class Meta:
        db_table = 'origins'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class TeaCategory(models.Model):
    """Tea category with fermentation level."""
    
    FERMENTATION_CHOICES = [
        (0, 'White (0%)'),
        (5, 'Green (0-5%)'),
        (40, 'Oolong (15-70%)'),
        (100, 'Black (100%)'),
        (101, 'Pu\'erh (Post-fermented)'),
    ]
    
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True)
    fermentation_level = models.PositiveSmallIntegerField(
        choices=FERMENTATION_CHOICES,
        help_text='Oxidation level percentage'
    )
    description = models.TextField(blank=True)
    brewing_guide = models.TextField(
        blank=True,
        help_text='Brewing instructions in Markdown'
    )
    
    class Meta:
        db_table = 'tea_categories'
        verbose_name_plural = 'tea categories'
        ordering = ['fermentation_level']
    
    def __str__(self):
        return self.name
    
    def get_brewing_temp_c(self):
        """Return recommended brewing temperature in Celsius."""
        temps = {
            0: 75,   # White
            5: 80,   # Green
            40: 95,  # Oolong
            100: 100, # Black
            101: 100, # Pu'erh
        }
        return temps.get(self.fermentation_level, 95)


class Product(models.Model):
    """Tea product model with Singapore pricing."""
    
    SEASON_CHOICES = [
        ('spring', 'Spring'),
        ('summer', 'Summer'),
        ('autumn', 'Autumn'),
        ('winter', 'Winter'),
    ]
    
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    
    # Pricing (SGD)
    price_sgd = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='Price in SGD'
    )
    gst_inclusive = models.BooleanField(
        default=True,
        help_text='Whether price includes 9% GST'
    )
    
    # Inventory
    stock = models.PositiveIntegerField(default=0)
    weight_g = models.PositiveIntegerField(
        default=50,
        help_text='Weight in grams'
    )
    
    # Relationships
    origin = models.ForeignKey(
        Origin,
        on_delete=models.PROTECT,
        related_name='products'
    )
    category = models.ForeignKey(
        TeaCategory,
        on_delete=models.PROTECT,
        related_name='products'
    )
    
    # Attributes
    harvest_season = models.CharField(
        max_length=10,
        choices=SEASON_CHOICES
    )
    harvest_year = models.PositiveSmallIntegerField()
    
    # Features
    is_subscription_eligible = models.BooleanField(default=True)
    is_new_arrival = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    
    # SEO
    meta_title = models.CharField(max_length=255, blank=True)
    meta_description = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def get_price_with_gst(self):
        """Return price with GST included."""
        if self.gst_inclusive:
            return self.price_sgd
        return calculate_gst_inclusive_price(self.price_sgd)
    
    def get_gst_amount(self):
        """Return GST amount for this product."""
        from apps.core.sg.gst import calculate_gst_amount
        if self.gst_inclusive:
            from apps.core.sg.gst import extract_gst_from_inclusive
            return extract_gst_from_inclusive(self.price_sgd)
        return calculate_gst_amount(self.price_sgd)
    
    def get_base_price(self):
        """Return price without GST."""
        if self.gst_inclusive:
            from apps.core.sg.gst import extract_gst_from_inclusive
            return self.price_sgd - extract_gst_from_inclusive(self.price_sgd)
        return self.price_sgd
    
    def is_in_stock(self):
        """Check if product is in stock."""
        return self.stock > 0
    
    def get_brewing_temp(self):
        """Return brewing temperature."""
        return self.category.get_brewing_temp_c()
```

**Checklist:**
- [ ] Write Origin tests first
- [ ] Implement Origin model
- [ ] Write Category tests
- [ ] Implement Category model
- [ ] Write Product tests
- [ ] Implement Product model with GST methods
- [ ] Run all commerce tests - should PASS

---

### Task 1.5: Order Models

**Rationale:** Orders track the purchase lifecycle with GST tracking for compliance.

**Test Files (Write First):**

| Test File | Coverage Target | Test Cases |
|-----------|-----------------|------------|
| `apps/commerce/tests/test_models_order.py` | 100% | Order creation, GST calculation, status transitions |

**Models:**

```python
class Order(models.Model):
    """Order model with Singapore GST tracking."""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]
    
    user = models.ForeignKey(
        'core.User',
        on_delete=models.CASCADE,
        related_name='orders'
    )
    
    # Order numbers: CHA-YYYYMMDD-XXXX
    order_number = models.CharField(max_length=20, unique=True)
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    # Pricing (SGD) - stored for audit
    subtotal_sgd = models.DecimalField(max_digits=12, decimal_places=2)
    gst_amount_sgd = models.DecimalField(max_digits=12, decimal_places=2)
    total_sgd = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Shipping
    shipping_address = models.JSONField()
    shipping_cost_sgd = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )
    
    # Payment
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.order_number
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self.generate_order_number()
        super().save(*args, **kwargs)
    
    def generate_order_number(self):
        """Generate unique order number."""
        from datetime import datetime
        date_str = datetime.now().strftime('%Y%m%d')
        count = Order.objects.filter(
            created_at__date=datetime.now().date()
        ).count() + 1
        return f"CHA-{date_str}-{count:04d}"
    
    def calculate_totals(self):
        """Recalculate order totals from items."""
        items = self.items.all()
        self.subtotal_sgd = sum(item.get_subtotal() for item in items)
        self.gst_amount_sgd = sum(item.get_gst_amount() for item in items)
        self.total_sgd = self.subtotal_sgd + self.gst_amount_sgd + self.shipping_cost_sgd
        self.save()


class OrderItem(models.Model):
    """Individual items in an order."""
    
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='order_items'
    )
    quantity = models.PositiveIntegerField(default=1)
    
    # Price snapshot at time of order
    price_sgd_at_time = models.DecimalField(max_digits=10, decimal_places=2)
    gst_rate_at_time = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=Decimal('0.09')
    )
    
    class Meta:
        db_table = 'order_items'
    
    def __str__(self):
        return f"{self.product.name} x{self.quantity}"
    
    def get_subtotal(self):
        """Return subtotal (price * quantity)."""
        return self.price_sgd_at_time * self.quantity
    
    def get_gst_amount(self):
        """Return GST amount for this item."""
        from apps.core.sg.gst import calculate_gst_amount
        return calculate_gst_amount(self.get_subtotal())
```

**Checklist:**
- [ ] Write Order model tests first
- [ ] Implement Order model
- [ ] Write OrderItem tests
- [ ] Implement OrderItem model
- [ ] Test order number generation
- [ ] Test GST calculation across items
- [ ] Run all tests - should PASS

---

## Phase 1 Success Criteria

| Criteria | Verification Command | Expected Result |
|----------|---------------------|-----------------|
| Django project runs | `python manage.py check` | System check identified no issues |
| Database connects | `python manage.py migrate --check` | No unapplied migrations |
| User model works | `pytest apps/core/tests/test_models_user.py -v` | All tests PASS |
| GST utilities work | `pytest apps/core/sg/tests/test_gst.py -v` | All tests PASS with 100% coverage |
| Product models work | `pytest apps/commerce/tests/ -v` | All tests PASS |
| Coverage target | `pytest --cov=apps --cov-report=term-missing` | ≥85% coverage |
| Admin accessible | `python manage.py runserver` + browse to /admin | Django admin loads |

---

## Phase 1 Execution Order

1. **Initialize Django project** (30 min)
2. **Write User model tests** (30 min)
3. **Implement User model** (45 min)
4. **Write GST tests** (20 min)
5. **Implement GST utilities** (30 min)
6. **Write Product model tests** (45 min)
7. **Implement Product models** (60 min)
8. **Write Order model tests** (30 min)
9. **Implement Order models** (45 min)
10. **Run full test suite** (15 min)
11. **Create migrations** (10 min)
12. **Verify coverage** (10 min)

**Total Estimated Time:** ~6.5 hours

---

## Validation Checklist Against Master Plan

| Master Plan Requirement | Phase 1 Implementation | Status |
|-------------------------|----------------------|--------|
| Custom User model | ✅ With email, SG postal code, phone | Planned |
| GST calculation | ✅ Decimal with ROUND_HALF_UP | Planned |
| Product model | ✅ With GST methods | Planned |
| Order model | ✅ With GST tracking | Planned |
| Singapore timezone | ✅ In settings | Planned |
| PDPA consent tracking | ✅ pdpa_consent_at field | Planned |
| Test coverage 85%+ | ✅ TDD ensures coverage | Planned |

---

## Next Steps After Phase 1

Upon Phase 1 completion:
1. Verify all models work in Django Admin
2. Proceed to **Phase 2: Authentication & BFF Layer**
3. Implement JWT authentication with HttpOnly cookies
4. Create BFF proxy for secure API communication

---

## TDD Commitment for Phase 1

Every model will follow the Red-Green-Refactor cycle:

```bash
# Example: User model TDD

# 1. RED - Write failing test
cat > apps/core/tests/test_models_user.py << 'EOF'
import pytest
from apps.core.models import User

def test_user_requires_email():
    with pytest.raises(ValueError):
        User.objects.create_user(email="", password="test")
EOF

# 2. Run test (fails)
pytest apps/core/tests/test_models_user.py::test_user_requires_email -v
# EXPECTED: FAILED

# 3. GREEN - Implement minimal code
# Edit apps/core/models.py to add validation

# 4. Run test (passes)
pytest apps/core/tests/test_models_user.py::test_user_requires_email -v
# EXPECTED: PASSED

# 5. REFACTOR - Improve code while tests pass
# Add more validations, clean up

# 6. Repeat for all test cases
```

**Ready to execute Phase 1?**

> `✅ CONFIRM: Proceed with Phase 1 Implementation`
