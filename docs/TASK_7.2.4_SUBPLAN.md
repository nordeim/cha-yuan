# Task 7.2.4: Django Admin Curation Override UI

> **Task ID:** 7.2.4  
> **Duration:** 1 day  
> **Status:** READY FOR EXECUTION  
> **TDD Principle:** Test Admin UI → Implement Form → Verify Admin Integration

---

## Executive Summary

Implements a Django Admin interface that allows tea masters to manually curate subscription boxes for specific users. This provides a fallback mechanism when auto-curation needs human expertise intervention.

### Key Features
1. **Product Selection Form** - Multi-select widget for choosing 3-5 teas
2. **Visual Override Indicator** - Boolean display showing if override is active
3. **JSON Persistence** - Store override data with metadata (who, when)
4. **Auto-clear on Use** - Override consumed when next curation runs

---

## Implementation Plan

### Step 1: Create Admin Tests (RED Phase) ⏳

**Test File:** `/backend/apps/commerce/tests/test_admin_curation.py`

**Test Cases:**
- [ ] `test_curation_override_form_renders()` - Form loads with eligible products
- [ ] `test_curation_override_limits_to_5_products()` - Validation enforces max
- [ ] `test_curation_override_stores_json()` - Save creates proper JSON structure
- [ ] `test_curation_override_clears_empty_selection()` - Empty clears override
- [ ] `test_admin_shows_override_indicator()` - Boolean displays in list view
- [ ] `test_override_metadata_includes_user_and_timestamp()` - Audit trail

### Step 2: Create CurationOverrideForm (GREEN Phase) ⏳

**File:** `/backend/apps/commerce/admin.py` (add to existing)

**Form Requirements:**
```python
class CurationOverrideForm(forms.ModelForm):
    """Form for tea masters to manually curate next box."""
    
    override_products = forms.ModelMultipleChoiceField(
        queryset=Product.objects.filter(
            is_subscription_eligible=True,
            stock__gt=0
        ).select_related('category').order_by('name'),
        widget=forms.CheckboxSelectMultiple,
        required=False,
        label="Select teas for next box",
        help_text="Select 3-5 teas to include in next month's box. Leave empty for auto-curation."
    )
```

**Form Validation:**
- Max 5 products
- All must be in-stock
- All must be subscription eligible

### Step 3: Create SubscriptionAdmin (GREEN Phase) ⏳

**Admin Configuration:**
```python
class SubscriptionAdmin(admin.ModelAdmin):
    form = CurationOverrideForm
    list_display = [
        'user',
        'plan',
        'status',
        'next_billing_date',
        'curation_override_active',
    ]
    list_filter = ['plan', 'status', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
```

**Custom Methods:**
- `curation_override_active()` - Boolean indicator with colored dot
- `save_model()` - Process form data into JSON

### Step 4: JSON Structure Specification

**Stored Format:**
```json
{
  "product_ids": [101, 102, 103],
  "selected_by": "tea.master@chayuan.sg",
  "selected_at": "2026-04-17T11:30:00+08:00",
  "reason": "VIP customer request (optional)"
}
```

### Step 5: Integration Verification ✅

**Existing Infrastructure:**
- ✅ Subscription model with `next_curation_override` field
- ✅ SubscriptionShipment model tracking
- ✅ Curation engine in `curation.py`

**Integration Points:**
- Admin form writes to `next_curation_override`
- `curate_subscription_box()` reads override
- Auto-clears after use

---

## TODO List

```
[ ] Step 1: Write admin tests (RED)
[ ] Step 1.1: Test form renders with eligible products
[ ] Step 1.2: Test validation enforces 5-product limit
[ ] Step 1.3: Test save creates JSON structure
[ ] Step 1.4: Test override indicator in list view
[ ] Step 2: Implement CurationOverrideForm (GREEN)
[ ] Step 2.1: Form with ModelMultipleChoiceField
[ ] Step 2.2: Queryset filtering (eligible, in-stock)
[ ] Step 2.3: Validation for max 5 products
[ ] Step 3: Implement SubscriptionAdmin (GREEN)
[ ] Step 3.1: list_display configuration
[ ] Step 3.2: curation_override_active indicator
[ ] Step 3.3: save_model override for JSON persistence
[ ] Step 4: Register admin
[ ] Step 4.1: Register Subscription in commerce/admin.py
[ ] Step 4.2: Register SubscriptionShipment
[ ] Step 5: Verify integration
[ ] Step 5.1: Test with Django admin panel
[ ] Step 5.2: Verify JSON structure
[ ] Step 5.3: Test curation consumption
[ ] Step 6: Run full test suite
[ ] Step 6.1: All tests pass (33 curation tests)
[ ] Step 6.2: New admin tests pass
[ ] Step 6.3: Coverage maintained
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Too many products selected | Form validation enforces max 5 |
| Out-of-stock products | Queryset filters to in-stock only |
| Override not clearing | Curation engine clears after use (already implemented) |
| Admin performance | Use `select_related` for user data |

---

## Validation Criteria

- [ ] All 5 admin tests pass
- [ ] Form shows only eligible products
- [ ] Override saves as JSON with metadata
- [ ] List view shows visual indicator
- [ ] Integration with curation engine verified

---

## Next Steps After Completion

- Task 7.3.1: Quiz Frontend API Integration
- Task 7.4.1: Subscription Dashboard

---

**Ready for Execution:**

> Reply "EXECUTE TASK 7.2.4" to begin implementation following TDD.
