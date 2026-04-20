"""
Core models for CHA YUAN - User and Address with Singapore-specific validations.
"""

from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.validators import RegexValidator
from django.db import models


class UserManager(models.Manager):
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

    def normalize_email(self, email):
        """Normalize email to lowercase."""
        email = email or ""
        return email.lower()


class User(AbstractBaseUser, PermissionsMixin):
    """Custom user model for Singapore market."""

    # Singapore postal code validator (6 digits)
    postal_code_validator = RegexValidator(
        regex=r"^\d{6}$", message="Postal code must be exactly 6 digits (e.g., 123456)"
    )

    # Singapore phone validator (+65 XXXX XXXX)
    phone_validator = RegexValidator(
        regex=r"^\+65\s?\d{8}$", message="Phone number must be in format: +65 XXXX XXXX"
    )

    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)

    # Singapore-specific fields
    phone = models.CharField(
        max_length=20,
        blank=True,
        validators=[phone_validator],
        help_text="Format: +65 XXXX XXXX",
    )
    postal_code = models.CharField(
        max_length=6,
        blank=True,
        validators=[postal_code_validator],
        help_text="6-digit Singapore postal code",
    )

    # PDPA compliance
    pdpa_consent_at = models.DateTimeField(null=True, blank=True)
    pdpa_consent_version = models.CharField(max_length=10, blank=True)

    # Status fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    class Meta:
        db_table = "users"
        verbose_name = "user"
        verbose_name_plural = "users"

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

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="addresses")
    recipient_name = models.CharField(max_length=255)
    block_street = models.CharField(
        max_length=255, help_text="e.g., Blk 123 Jurong East St 13"
    )
    unit = models.CharField(max_length=50, blank=True, help_text="e.g., #04-56")
    postal_code = models.CharField(
        max_length=6, validators=[User.postal_code_validator]
    )
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "addresses"
        verbose_name_plural = "addresses"

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
