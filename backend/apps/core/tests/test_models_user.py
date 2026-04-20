"""
Test-Driven Development: User Model Tests
Write tests BEFORE implementing the User model.
"""

import pytest
from django.core.exceptions import ValidationError


@pytest.mark.django_db
class TestUserModel:
    """Tests for custom User model with Singapore-specific fields."""

    def test_user_requires_email(self):
        """Test that email is required to create a user."""
        from apps.core.models import User

        with pytest.raises(ValueError, match="Email is required"):
            User.objects.create_user(email="", password="testpass123")

    def test_user_can_be_created_with_email(self):
        """Test that user can be created with valid email."""
        from apps.core.models import User

        user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User",
        )

        assert user.email == "test@example.com"
        assert user.first_name == "Test"
        assert user.last_name == "User"
        assert user.check_password("testpass123")

    def test_email_is_normalized(self):
        """Test that email is normalized to lowercase."""
        from apps.core.models import User

        user = User.objects.create_user(
            email="Test@Example.COM",
            password="testpass123",
            first_name="Test",
            last_name="User",
        )

        assert user.email == "test@example.com"

    def test_superuser_can_be_created(self):
        """Test that superuser can be created."""
        from apps.core.models import User

        user = User.objects.create_superuser(
            email="admin@example.com",
            password="adminpass123",
            first_name="Admin",
            last_name="User",
        )

        assert user.is_superuser
        assert user.is_staff

    def test_singapore_postal_code_validation_valid(self):
        """Test that valid 6-digit SG postal code is accepted."""
        from apps.core.models import User

        user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User",
            postal_code="123456",
        )

        assert user.postal_code == "123456"

    def test_singapore_postal_code_validation_invalid_length(self):
        """Test that invalid postal code length is rejected."""
        from apps.core.models import User

        user = User(
            email="test@example.com",
            first_name="Test",
            last_name="User",
            postal_code="12345",  # Invalid: 5 digits
        )

        with pytest.raises(ValidationError):
            user.full_clean()

    def test_singapore_postal_code_validation_invalid_chars(self):
        """Test that non-numeric postal code is rejected."""
        from apps.core.models import User

        user = User(
            email="test@example.com",
            first_name="Test",
            last_name="User",
            postal_code="12345A",  # Invalid: contains letter
        )

        with pytest.raises(ValidationError):
            user.full_clean()

    def test_singapore_phone_validation_valid(self):
        """Test that valid +65 phone number is accepted."""
        from apps.core.models import User

        user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User",
            phone="+6512345678",
        )

        assert user.phone == "+6512345678"

    def test_singapore_phone_validation_invalid_format(self):
        """Test that invalid phone format is rejected."""
        from apps.core.models import User

        user = User(
            email="test@example.com",
            first_name="Test",
            last_name="User",
            phone="12345678",  # Missing +65
        )

        with pytest.raises(ValidationError):
            user.full_clean()

    def test_pdpa_consent_tracking(self):
        """Test that PDPA consent can be tracked."""
        from datetime import datetime
        from apps.core.models import User

        user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User",
            pdpa_consent_at=datetime.now(),
            pdpa_consent_version="1.0",
        )

        assert user.has_pdpa_consent()
        assert user.pdpa_consent_version == "1.0"

    def test_user_without_pdpa_consent(self):
        """Test that user without PDPA consent returns False."""
        from apps.core.models import User

        user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User",
        )

        assert not user.has_pdpa_consent()

    def test_get_full_name(self):
        """Test that full name is correctly formatted."""
        from apps.core.models import User

        user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User",
        )

        assert user.get_full_name() == "Test User"

    def test_get_short_name(self):
        """Test that short name returns first name."""
        from apps.core.models import User

        user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User",
        )

        assert user.get_short_name() == "Test"

    def test_username_field_is_email(self):
        """Test that USERNAME_FIELD is set to email."""
        from apps.core.models import User

        assert User.USERNAME_FIELD == "email"
        assert "email" in User.REQUIRED_FIELDS


@pytest.mark.django_db
class TestAddressModel:
    """Tests for Singapore Address model."""

    def test_address_can_be_created(self):
        """Test that address can be created for user."""
        from apps.core.models import User, Address

        user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User",
        )

        address = Address.objects.create(
            user=user,
            recipient_name="Test User",
            block_street="Blk 123 Jurong East St 13",
            unit="#04-56",
            postal_code="123456",
            is_default=True,
        )

        assert address.user == user
        assert address.postal_code == "123456"

    def test_address_format_sg_address(self):
        """Test Singapore address formatting."""
        from apps.core.models import User, Address

        user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User",
        )

        address = Address.objects.create(
            user=user,
            recipient_name="Test User",
            block_street="Blk 123 Jurong East St 13",
            unit="#04-56",
            postal_code="123456",
            is_default=True,
        )

        formatted = address.format_sg_address()
        assert "Test User" in formatted
        assert "Blk 123 Jurong East St 13, #04-56" in formatted
        assert "Singapore 123456" in formatted

    def test_only_one_default_address_per_user(self):
        """Test that only one address can be default per user."""
        from apps.core.models import User, Address

        user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User",
        )

        # Create first default address
        addr1 = Address.objects.create(
            user=user,
            recipient_name="Test User",
            block_street="Blk 123",
            postal_code="123456",
            is_default=True,
        )

        # Create second default address
        addr2 = Address.objects.create(
            user=user,
            recipient_name="Test User 2",
            block_street="Blk 456",
            postal_code="654321",
            is_default=True,
        )

        # Refresh first address from DB
        addr1.refresh_from_db()

        # First address should no longer be default
        assert not addr1.is_default
        assert addr2.is_default
