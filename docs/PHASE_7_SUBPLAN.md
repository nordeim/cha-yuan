# Phase 7: Subscription & Preference Quiz

> **Duration:** Days 33-38 (6 days)  
> **TDD Principle:** Quiz scoring tests → Curation algorithm tests → Implementation  
> **Status:** READY FOR EXECUTION  

---

## Executive Summary

Phase 7 implements the **one-time onboarding preference quiz** and **subscription curation engine** — two core features that differentiate CHA YUAN as a personalized tea discovery platform. This phase follows the TDD methodology: write tests first, then implement backend models and algorithms, then build frontend interfaces.

### Key Features

1. **Preference Quiz System** - Multi-question quiz to determine tea preferences
2. **Scoring Algorithm** - Weighted scoring based on quiz answers
3. **Curation Engine** - Auto-curate monthly tea boxes based on preferences and season
4. **Manual Override** - Tea masters can override curation via Django Admin
5. **Subscription Dashboard** - User-facing subscription management

---

## Cross-Phase Alignment Review

### Dependencies from Previous Phases

| Phase | Dependency | Status | Impact on Phase 7 |
|-------|-----------|--------|-------------------|
| **Phase 1** | User model | ✅ Complete | User FK in UserPreference |
| **Phase 4** | Product model | ✅ Complete | Products eligible for subscription |
| **Phase 5** | Checkout flow | ✅ Complete | Stripe for subscription billing |
| **Phase 6** | Content system | ✅ Complete | Educational content references |

### Alignment with Master Plan

| Master Plan Section | Phase 7 Deliverable | Alignment |
|---------------------|---------------------|-----------|
| 7.1 Quiz System | Quiz models + API + Frontend | ✅ Direct match |
| 7.2 Subscription Curation | Curation engine + Admin override | ✅ Direct match |
| 7.3 Subscription Frontend | Dashboard page | ✅ Direct match |

---

## TDD Workflow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ RED: Write quiz scoring tests that define preference algorithm │
│ ↓                                                              │
│ GREEN: Implement QuizQuestion, QuizChoice, UserPreference     │
│ ↓                                                              │
│ REFACTOR: Clean model code, add scoring logic                  │
│ ↓                                                              │
│ RED: Write curation algorithm tests                            │
│ ↓                                                              │
│ GREEN: Implement curation.py with scoring logic                │
│ ↓                                                              │
│ REFACTOR: Add manual override, Django Admin integration       │
│ ↓                                                              │
│ RED: Write quiz frontend tests                                 │
│ ↓                                                              │
│ GREEN: Implement quiz pages with multi-step UI                │
│ ↓                                                              │
│ VERIFY: Run full test suite, integration tests                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 7 Task Breakdown

### 7.1 Quiz Models & Tests (Day 33-34)

#### 7.1.1 Quiz Model Tests - RED Phase

**Test Files to Create:**

| Test File | Test Cases | Coverage Target |
|-----------|------------|-------------------|
| `/backend/content/tests/test_models_quiz.py` | 20+ test cases | Quiz questions, choices, scoring |
| `/backend/content/tests/test_quiz_scoring.py` | 15+ test cases | Preference calculation algorithm |

**Test Cases Checklist:**
- [ ] `test_quiz_question_creation_with_choices()` - Create question with choices
- [ ] `test_quiz_question_ordering()` - Questions ordered by 'order' field
- [ ] `test_quiz_choice_preference_weights()` - Weights stored as JSON
- [ ] `test_quiz_choice_text_i18n()` - Localized choice text
- [ ] `test_user_preference_creation()` - Store preferences after quiz
- [ ] `test_user_preference_quiz_completed_at()` - Timestamp recorded
- [ ] `test_user_preference_preferences_json()` - Store category preferences
- [ ] `test_preference_score_calculation()` - Calculate weighted scores
- [ ] `test_preference_top_categories()` - Get top N preferences
- [ ] `test_quiz_submit_creates_preferences()` - Full quiz flow
- [ ] `test_quiz_completed_guard()` - Prevent retaking quiz
- [ ] `test_invalid_choice_id()` - Handle invalid choices
- [ ] `test_missing_required_answers()` - Validation
- [ ] `test_preference_normalization()` - Scores normalized to 0-100
- [ ] `test_tie_breaker_handling()` - Handle equal scores

#### 7.1.2 Quiz Models Implementation - GREEN Phase

**File:** `/backend/content/models.py` (Add to existing)

**Models to Implement:**

| Model | Fields | Purpose |
|-------|--------|---------|
| `QuizQuestion` | text, order, required | Quiz questions |
| `QuizChoice` | question FK, text, weights | Answer choices |
| `UserPreference` | user FK, preferences, completed_at | Store results |

**QuizQuestion Model:**
```python
class QuizQuestion(models.Model):
    question_text = models.CharField(max_length=500)
    question_text_i18n = models.JSONField(default=dict, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_required = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "id"]
```

**QuizChoice Model:**
```python
class QuizChoice(models.Model):
    question = models.ForeignKey(QuizQuestion, related_name="choices", on_delete=models.CASCADE)
    choice_text = models.CharField(max_length=200)
    choice_text_i18n = models.JSONField(default=dict, blank=True)
    # Weights: {"green_tea": 0.8, "oolong": 0.3, "black_tea": 0.1}
    preference_weights = models.JSONField(default=dict)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]
```

**UserPreference Model:**
```python
class UserPreference(models.Model):
    user = models.OneToOneField("core.User", related_name="preference", on_delete=models.CASCADE)
    # Example: {"green_tea": 85, "oolong": 72, "black_tea": 45}
    preferences = models.JSONField(default=dict)
    quiz_completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_top_preferences(self, n=3):
        """Return top N preference categories."""
        sorted_prefs = sorted(self.preferences.items(), key=lambda x: x[1], reverse=True)
        return [cat for cat, _ in sorted_prefs[:n]]

    def has_completed_quiz(self):
        return self.quiz_completed_at is not None
```

**Scoring Algorithm:**
```python
def calculate_preferences(choices):
    """
    Calculate user preferences based on selected choices.
    
    Args:
        choices: List of QuizChoice objects
    
    Returns:
        Dict mapping category_slug to preference score (0-100)
    """
    raw_scores = defaultdict(float)
    
    for choice in choices:
        for category, weight in choice.preference_weights.items():
            raw_scores[category] += weight
    
    # Normalize to 0-100 scale
    if raw_scores:
        max_score = max(raw_scores.values())
        normalized = {
            cat: min(100, round((score / max_score) * 100))
            for cat, score in raw_scores.items()
        }
        return normalized
    
    return {}
```

#### 7.1.3 Quiz API Endpoints (Day 34)

**File:** `/backend/api/v1/quiz.py`

**Endpoints:**

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `GET /api/v1/quiz/questions/` | List | Get all quiz questions with choices | ⬜ |
| `POST /api/v1/quiz/submit/` | Create | Submit quiz answers, get preferences | ⬜ |
| `GET /api/v1/quiz/preferences/` | Retrieve | Get current user's preferences | ⬜ |

**Request/Response Schemas:**

```python
class QuizChoiceSchema(Schema):
    id: int
    choice_text: str
    order: int

class QuizQuestionSchema(Schema):
    id: int
    question_text: str
    order: int
    is_required: bool
    choices: List[QuizChoiceSchema]

class QuizSubmitSchema(Schema):
    answers: Dict[int, int]  # question_id: choice_id

class QuizResultSchema(Schema):
    preferences: Dict[str, int]  # category_slug: score
    top_categories: List[str]

class UserPreferenceSchema(Schema):
    preferences: Dict[str, int]
    quiz_completed_at: Optional[datetime]
    top_categories: List[str]
```

**Checklist:**
- [ ] Endpoint returns questions with choices
- [ ] Submit validates all required questions answered
- [ ] Submit creates/updates UserPreference
- [ ] Submit returns calculated preferences
- [ ] Preference endpoint returns current user data
- [ ] Guard prevents quiz retake (optional)

---

### 7.2 Curation Engine (Day 35-36)

#### 7.2.1 Curation Algorithm Tests - RED Phase

**Test File:** `/backend/commerce/tests/test_curation.py`

**Test Cases:**
- [ ] `test_get_current_season_sg_spring()` - March-May
- [ ] `test_get_current_season_sg_summer()` - June-August
- [ ] `test_get_current_season_sg_autumn()` - September-November
- [ ] `test_get_current_season_sg_winter()` - December-February
- [ ] `test_curate_returns_5_products()` - Always 5 products
- [ ] `test_curate_respects_eligibility()` - Only eligible products
- [ ] `test_curate_filters_in_stock()` - Only in-stock products
- [ ] `test_curate_matches_season()` - Current harvest season
- [ ] `test_curate_excludes_recent()` - Not recently shipped
- [ ] `test_score_products_applies_preferences()` - Higher for preferred categories
- [ ] `test_score_products_boosts_new_arrival()` - +30 points for new arrivals
- [ ] `test_manual_override_takes_priority()` - Admin override works
- [ ] `test_manual_override_clears_after_use()` - Auto-clears after shipping
- [ ] `test_curate_with_no_preferences()` - Works without quiz
- [ ] `test_curate_with_no_eligible_products()` - Empty list handling
- [ ] `test_curate_tie_breaker()` - Handles equal scores

#### 7.2.2 Curation Engine Implementation - GREEN Phase

**File:** `/backend/commerce/curation.py`

```python
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
from collections import defaultdict
from pytz import timezone
from django.db.models import QuerySet

from .models import Product
from ..content.models import UserPreference


def get_current_season_sg() -> str:
    """
    Determine harvest season based on Singapore timezone.
    
    Singapore is tropical (equatorial), but we map to traditional
    tea harvesting seasons:
    - Spring: March-May (best for green/white teas)
    - Summer: June-August (oolong harvest)
    - Autumn: September-November (black tea peak)
    - Winter: December-February (limited harvest)
    """
    sg_now = datetime.now(timezone('Asia/Singapore'))
    month = sg_now.month
    
    if 3 <= month <= 5:
        return 'spring'
    elif 6 <= month <= 8:
        return 'summer'
    elif 9 <= month <= 11:
        return 'autumn'
    else:
        return 'winter'


def get_recently_shipped(user_subscription, months: int = 3) -> List[int]:
    """Get product IDs shipped in last N months."""
    from .models import SubscriptionShipment
    
    cutoff = datetime.now(timezone('Asia/Singapore')) - timedelta(days=30*months)
    shipments = SubscriptionShipment.objects.filter(
        subscription=user_subscription,
        shipped_at__gte=cutoff
    ).prefetch_related('products')
    
    product_ids = set()
    for shipment in shipments:
        for product in shipment.products.all():
            product_ids.add(product.id)
    
    return list(product_ids)


def score_products(
    products: QuerySet,
    preferences: Dict[str, int],
    current_season: str
) -> List[Tuple[Product, float]]:
    """
    Score products based on user preferences and attributes.
    
    Scoring:
    - Base score: 1.0
    - Category preference: +0.6 * normalized_pref (0-1)
    - Season match: +0.3
    - New arrival: +0.3
    - Stock level: +0.1 * (stock / 10)
    """
    scored = []
    
    for product in products:
        score = 1.0
        
        # Category preference boost
        if preferences and product.category:
            cat_slug = product.category.slug
            if cat_slug in preferences:
                # Normalize preference (0-100) to (0-1) and apply weight
                score += (preferences[cat_slug] / 100) * 0.6
        
        # Season match boost
        if product.harvest_season == current_season:
            score += 0.3
        
        # New arrival boost
        if getattr(product, 'is_new_arrival', False):
            score += 0.3
        
        # Stock availability (max 0.1)
        stock = getattr(product, 'stock', 0)
        score += min(0.1, stock / 100)
        
        scored.append((product, score))
    
    # Sort by score descending
    scored.sort(key=lambda x: x[1], reverse=True)
    
    return scored


def curate_subscription_box(user_subscription) -> List[Product]:
    """
    Curate monthly tea box with manual override support.
    
    Logic:
    1. Check for manual override from Django Admin
    2. If override exists, use those products and clear
    3. Otherwise, run auto-curation algorithm
    
    Returns:
        List of 5 Product objects
    """
    # Check for manual override
    if user_subscription.next_curation_override:
        product_ids = user_subscription.next_curation_override.get('product_ids', [])
        if product_ids:
            products = Product.objects.filter(
                id__in=product_ids,
                is_subscription_eligible=True,
                stock__gt=0
            ).distinct()[:5]
            
            # Clear override after use
            user_subscription.next_curation_override = None
            user_subscription.save()
            
            return list(products)
    
    # Auto-curation
    current_season = get_current_season_sg()
    
    # Get user preferences
    user = user_subscription.user
    preferences = {}
    try:
        pref_obj = user.preference
        if pref_obj and pref_obj.preferences:
            preferences = pref_obj.preferences
    except:
        pass  # No preferences yet
    
    # Get candidates
    recently_shipped = get_recently_shipped(user_subscription)
    
    candidates = Product.objects.filter(
        is_subscription_eligible=True,
        stock__gt=0
    ).exclude(
        id__in=recently_shipped
    ).select_related('category', 'origin')
    
    # If we have enough seasonal matches, prefer those
    seasonal_candidates = candidates.filter(harvest_season=current_season)
    if seasonal_candidates.count() >= 5:
        candidates = seasonal_candidates
    
    # Score and return top 5
    scored = score_products(candidates, preferences, current_season)
    return [p for p, _ in scored[:5]]
```

#### 7.2.3 Django Admin Override UI (Day 36)

**File:** `/backend/commerce/admin.py` (Add to existing)

```python
class CurationOverrideForm(forms.ModelForm):
    """Form for tea masters to manually curate next box."""
    
    override_products = forms.ModelMultipleChoiceField(
        queryset=Product.objects.filter(
            is_subscription_eligible=True,
            stock__gt=0
        ).order_by('name'),
        widget=forms.CheckboxSelectMultiple,
        required=False,
        label="Select teas for next box",
        help_text="Select 3-5 teas to include in next month's box. Leave empty for auto-curation."
    )
    
    class Meta:
        model = Subscription
        fields = ['override_products']


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
    
    def curation_override_active(self, obj):
        """Show if manual override is set."""
        return bool(obj.next_curation_override)
    curation_override_active.boolean = True
    curation_override_active.short_description = "Override"
    
    def save_model(self, request, obj, form, change):
        """Override save to process selected products."""
        if 'override_products' in form.cleaned_data:
            products = form.cleaned_data['override_products']
            if products:
                obj.next_curation_override = {
                    'product_ids': list(products.values_list('id', flat=True)),
                    'selected_by': request.user.email,
                    'selected_at': timezone.now().isoformat()
                }
            else:
                obj.next_curation_override = None
        
        super().save_model(request, obj, form, change)
```

**File:** `/backend/commerce/models.py` (Add to existing)

```python
class Subscription(models.Model):
    # ... existing fields ...
    
    # Curation override (set by tea masters)
    next_curation_override = models.JSONField(
        null=True,
        blank=True,
        help_text="Manual product selection for next box"
    )
    
    def curate_next_box(self) -> List[Product]:
        """Curate next month's box."""
        from .curation import curate_subscription_box
        return curate_subscription_box(self)


class SubscriptionShipment(models.Model):
    """Track shipped subscription boxes."""
    subscription = models.ForeignKey(Subscription, related_name='shipments', on_delete=models.CASCADE)
    products = models.ManyToManyField(Product, related_name='shipments')
    shipped_at = models.DateTimeField(auto_now_add=True)
    tracking_number = models.CharField(max_length=100, blank=True)
    curated_by = models.CharField(
        max_length=50,
        choices=[
            ('auto', 'Auto-Curation'),
            ('manual', 'Manual Override'),
            ('hybrid', 'Hybrid'),
        ],
        default='auto'
    )
```

---

### 7.3 Quiz Frontend (Day 37)

#### 7.3.1 Quiz API Integration

**File:** `/frontend/lib/api/quiz.ts`

```typescript
export async function getQuizQuestions() {
  const response = await authFetch('/api/v1/quiz/questions/');
  if (!response.ok) throw new Error('Failed to fetch quiz');
  return response.json();
}

export async function submitQuiz(answers: Record<number, number>) {
  const response = await authFetch('/api/v1/quiz/submit/', {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
  if (!response.ok) throw new Error('Failed to submit quiz');
  return response.json();
}

export async function getUserPreferences() {
  const response = await authFetch('/api/v1/quiz/preferences/');
  if (!response.ok) throw new Error('Failed to fetch preferences');
  return response.json();
}
```

#### 7.3.2 Quiz Page (Client Component)

**File:** `/frontend/app/quiz/page.tsx`

**Features:**
- [ ] Multi-step quiz interface
- [ ] Progress indicator
- [ ] Animated transitions (Framer Motion)
- [ ] One-time completion guard (check if already completed)
- [ ] Results visualization
- [ ] Option to skip/view recommendations

**Component Structure:**
```
QuizPage
├── QuizIntro (what to expect)
├── QuizQuestion (current question)
│   ├── QuestionText
│   └── ChoiceButtons
├── QuizProgress (step X of Y)
├── QuizResults (preference summary)
│   ├── PreferenceChart
│   └── RecommendedCategories
└── Navigation (Back, Next, Submit)
```

**Design Requirements:**
- Use tea brand colors (tea-600 for progress, bark-900 for text)
- Animated progress bar with gold-500 accent
- Smooth transitions between questions (300ms)
- Responsive layout (mobile-first)
- Accessibility: keyboard navigation, focus states

---

### 7.4 Subscription Dashboard (Day 38)

#### 7.4.1 Subscription Dashboard Page

**File:** `/frontend/app/dashboard/subscription/page.tsx`

**Features:**
- [ ] Current subscription status (active/paused/cancelled)
- [ ] Next billing date (SG time)
- [ ] Next box preview (if available)
- [ ] Preference summary
- [ ] Cancel subscription option
- [ ] Billing history (optional)

**Data Requirements:**
```typescript
interface SubscriptionData {
  id: string;
  status: 'active' | 'paused' | 'cancelled';
  plan: 'monthly' | 'quarterly' | 'annual';
  nextBillingDate: string;
  price: number;
  preferences?: {
    topCategories: string[];
    allPreferences: Record<string, number>;
  };
  nextBox?: {
    products: Product[];
    curatedBy: 'auto' | 'manual';
  };
}
```

---

## Integration Checklist

### Backend Integration
- [ ] Quiz models registered in Django Admin
- [ ] Quiz endpoints added to `/backend/api/v1/urls.py`
- [ ] Curation engine tests pass
- [ ] Subscription models have curation_override field
- [ ] SubscriptionShipment model tracks history

### Frontend Integration
- [ ] Quiz page linked from onboarding flow
- [ ] Dashboard subscription page accessible
- [ ] Navigation updates for logged-in users
- [ ] Protected routes (quiz only if not completed)

---

## Verification Gates

| Gate | Criteria | Check |
|------|----------|-------|
| **Tests Pass** | All quiz and curation tests pass | ⬜ |
| **Type Check** | TypeScript strict mode passes | ⬜ |
| **Build** | `npm run build` succeeds | ⬜ |
| **E2E** | Quiz flow works end-to-end | ⬜ |
| **Curation** | Manual override works in Admin | ⬜ |

---

## Success Criteria

1. ✅ **Quiz System**
   - Users can complete quiz once
   - Preferences calculated correctly
   - Results displayed with top categories

2. ✅ **Curation Engine**
   - Auto-curation based on season + preferences
   - Manual override from Django Admin
   - Returns exactly 5 products

3. ✅ **Frontend Pages**
   - Quiz multi-step interface works
   - Dashboard shows subscription status
   - Animations respect reduced motion

4. ✅ **TDD Compliance**
   - Tests written before implementation
   - All tests passing
   - No skipped tests

5. ✅ **Code Quality**
   - No TypeScript errors (strict mode)
   - No ESLint warnings
   - React 19 compatible (no forwardRef)

---

## Dependencies

### Already Installed (from Phase 6)
- Django 6 + Django Ninja
- React 19 + Next.js 16
- Framer Motion
- PyTZ (for timezone handling)

### New Dependencies Needed
| Package | Purpose |
|---------|---------|
| `pytz` | Singapore timezone handling |
| Recharts or Chart.js | Preference visualization |

---

## Phase 7 TODO List

```
[ ] 7.1.1: Write Quiz Model Tests (RED)
[ ] 7.1.2: Implement Quiz Models (GREEN)
[ ] 7.1.3: Write Quiz API Tests (RED)
[ ] 7.1.4: Implement Quiz API Endpoints (GREEN)
[ ] 7.2.1: Write Curation Algorithm Tests (RED)
[ ] 7.2.2: Implement Curation Engine (GREEN)
[ ] 7.2.3: Django Admin Curation Override (GREEN)
[ ] 7.3.1: Quiz Frontend API Integration
[ ] 7.3.2: Quiz Page Multi-step Interface
[ ] 7.4.1: Subscription Dashboard Page
[ ] 7.5.1: TypeScript Check
[ ] 7.5.2: Build Verification
[ ] 7.5.3: Update TODO List

PHASE 7 COMPLETE ✅
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Quiz answers incomplete | Frontend validation, backend check required questions |
| No eligible products | Fallback to any in-stock, alert admin if < 5 |
| Timezone issues | Always use Asia/Singapore, store with pytz |
| Manual override too large | Limit to 5 products in form validation |

---

## Next Steps

After Phase 7 completion, proceed to **Phase 8: Testing, Optimization & Deployment**:
- Performance optimization (Lighthouse)
- Security audit
- E2E testing
- Production deployment

---

## Approval

**Ready for Execution:**

> Reply "**EXECUTE PHASE 7**" to begin implementation following TDD methodology.

This plan has been validated against:
- ✅ Master Execution Plan Phase 7 requirements
- ✅ Existing codebase (models, patterns)
- ✅ TDD workflow specifications
- ✅ Design system constraints (tea brand colors)
