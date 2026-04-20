"""
Test-Driven Development: GST Calculation Tests
Write tests BEFORE implementing GST utilities.
"""

import pytest
from decimal import Decimal, InvalidOperation


class TestGSTCalculation:
    """Tests for Singapore GST calculation utilities."""

    def test_calculate_gst_inclusive_price_basic(self):
        """Test basic GST calculation."""
        from apps.core.sg.gst import calculate_gst_inclusive_price

        result = calculate_gst_inclusive_price(Decimal("100.00"))
        assert result == Decimal("109.00")

    def test_calculate_gst_inclusive_price_rounding(self):
        """Test GST rounding to 2 decimal places."""
        from apps.core.sg.gst import calculate_gst_inclusive_price

        result = calculate_gst_inclusive_price(Decimal("10.00"))
        assert result == Decimal("10.90")

    def test_calculate_gst_inclusive_price_small_amount(self):
        """Test GST on small amounts."""
        from apps.core.sg.gst import calculate_gst_inclusive_price

        result = calculate_gst_inclusive_price(Decimal("0.01"))
        assert result == Decimal("0.01")  # Rounds to 1 cent

    def test_calculate_gst_inclusive_price_negative_raises_error(self):
        """Test that negative price raises ValueError."""
        from apps.core.sg.gst import calculate_gst_inclusive_price

        with pytest.raises(ValueError, match="cannot be negative"):
            calculate_gst_inclusive_price(Decimal("-10.00"))

    def test_calculate_gst_inclusive_price_zero(self):
        """Test GST on zero."""
        from apps.core.sg.gst import calculate_gst_inclusive_price

        result = calculate_gst_inclusive_price(Decimal("0"))
        assert result == Decimal("0.00")

    def test_calculate_gst_amount(self):
        """Test GST amount calculation."""
        from apps.core.sg.gst import calculate_gst_amount

        result = calculate_gst_amount(Decimal("100.00"))
        assert result == Decimal("9.00")

    def test_calculate_gst_amount_negative_raises_error(self):
        """Test that negative price raises ValueError for GST amount."""
        from apps.core.sg.gst import calculate_gst_amount

        with pytest.raises(ValueError, match="cannot be negative"):
            calculate_gst_amount(Decimal("-10.00"))

    def test_extract_gst_from_inclusive(self):
        """Test GST extraction from inclusive price."""
        from apps.core.sg.gst import extract_gst_from_inclusive

        result = extract_gst_from_inclusive(Decimal("109.00"))
        assert result == Decimal("9.00")

    def test_extract_gst_from_inclusive_negative_raises_error(self):
        """Test that negative total raises ValueError."""
        from apps.core.sg.gst import extract_gst_from_inclusive

        with pytest.raises(ValueError, match="cannot be negative"):
            extract_gst_from_inclusive(Decimal("-10.00"))

    def test_validate_gst_calculation_valid(self):
        """Test validation of correct GST calculation."""
        from apps.core.sg.gst import validate_gst_calculation

        assert validate_gst_calculation(Decimal("100.00"), Decimal("109.00")) is True

    def test_validate_gst_calculation_invalid(self):
        """Test validation of incorrect GST calculation."""
        from apps.core.sg.gst import validate_gst_calculation

        assert validate_gst_calculation(Decimal("100.00"), Decimal("110.00")) is False

    def test_gst_rate_constant(self):
        """Test that GST rate is 9%."""
        from apps.core.sg.gst import GST_RATE

        assert GST_RATE == Decimal("0.09")

    def test_rounding_per_iras(self):
        """Test rounding according to IRAS guidelines."""
        from apps.core.sg.gst import calculate_gst_inclusive_price

        # Test edge case rounding
        result = calculate_gst_inclusive_price(Decimal("0.05"))
        assert result == Decimal("0.05")

        result = calculate_gst_inclusive_price(Decimal("99.99"))
        assert result == Decimal("108.99")
