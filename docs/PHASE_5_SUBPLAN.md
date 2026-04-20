# Phase 5: Cart & Checkout

> **Duration:** Days 23-28 (6 days)
> **TDD Principle:** Cart state tests → Redis implementation → Stripe integration tests
> **Status:** READY FOR EXECUTION

---

## Executive Summary

This phase implements the complete shopping cart and checkout system, including Redis-based cart persistence, frontend cart state management, and Stripe Checkout integration for Singapore (supporting SGD currency, GrabPay, and PayNow payment methods). Following TDD methodology, we write tests first, then implement, then verify.

---

## TDD Workflow (Red-Green-Refactor)

```
┌─────────────────────────────────────────────────────────────────┐
│ RED: Write failing cart/Stripe test that defines expected API   │
│ ↓                                                               │
│ GREEN: Implement minimal Redis cart service / Stripe endpoint   │
│ ↓                                                               │
│ REFACTOR: Clean code, add validation, error handling            │
│ ↓                                                               │
│ VERIFY: Run full test suite, integration tests                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 5 Task Breakdown

### 5.1 Redis Cart Service Tests (Day 23) - RED Phase

**Test Files to Create:**

| Test File | Test Cases | Expected Behavior |
|-----------|------------|-------------------|
| `/backend/commerce/tests/test_cart_service.py` | 12+ test cases | Cart CRUD operations, TTL expiry |
| `/backend/commerce/tests/test_cart_merge.py` | 8+ test cases | Anonymous → User cart merge on login |
| `/backend/commerce/tests/test_cart_validation.py` | 6+ test cases | Stock validation, quantity limits |

**Test Cases Checklist:**
- [ ] `test_add_to_cart_creates_cart_entry()` - Creates new cart item
- [ ] `test_add_to_cart_increments_quantity()` - Increments existing item
- [ ] `test_get_cart_items_returns_list()` - Returns cart items with details
- [ ] `test_update_cart_item_quantity()` - Updates item quantity
- [ ] `test_remove_item_from_cart()` - Removes item completely
- [ ] `test_clear_cart_removes_all()` - Clears entire cart
- [ ] `test_cart_ttl_30_days()` - TTL set correctly
- [ ] `test_cart_expires_after_ttl()` - Data expires after 30 days
- [ ] `test_merge_anonymous_to_user_cart()` - Merges on login
- [ ] `test_merge_handles_duplicate_items()` - Sums quantities for duplicates
- [ ] `test_validate_stock_before_add()` - Prevents adding out-of-stock items
- [ ] `test_validate_quantity_limits()` - Max 99 items per product
- [ ] `test_calculate_cart_total_with_gst()` - Total includes GST

### 5.2 Redis Cart Service Implementation (Day 24) - GREEN Phase

**File:** `/backend/commerce/cart.py`

**Functions to Implement:**

| Function | Status | Tests Pass |
|----------|--------|------------|
| `get_cart_id(request)` | ⬜ | ⬜ |
| `get_cart_items(cart_id: str)` | ⬜ | ⬜ |
| `add_to_cart(cart_id, product_id, quantity)` | ⬜ | ⬜ |
| `update_cart_item(cart_id, product_id, quantity)` | ⬜ | ⬜ |
| `remove_from_cart(cart_id, product_id)` | ⬜ | ⬜ |
| `clear_cart(cart_id)` | ⬜ | ⬜ |
| `merge_anonymous_cart(anon_id, user_id)` | ⬜ | ⬜ |
| `validate_stock(product_id, quantity)` | ⬜ | ⬜ |
| `calculate_cart_totals(cart_items)` | ⬜ | ⬜ |

**Redis Key Schema:**
- Anonymous cart: `cart:{cart_uuid}` (hash)
- User cart: `cart:user:{user_id}` (hash)
- Cart item: `{product_id}` → `{quantity}:{timestamp}`

**TTL Configuration:**
- Cart expiry: 30 days (2,592,000 seconds)
- Reset TTL on every cart modification

### 5.3 Cart API Endpoints (Day 24-25) - GREEN Phase

**File:** `/backend/api/v1/cart.py` (Django Ninja)

**Endpoints to Implement:**

| Endpoint | Method | Status | Tests Pass |
|----------|--------|--------|------------|
| `GET /api/v1/cart/` | Get cart items | ⬜ | ⬜ |
| `POST /api/v1/cart/add/` | Add item | ⬜ | ⬜ |
| `PUT /api/v1/cart/update/` | Update quantity | ⬜ | ⬜ |
| `DELETE /api/v1/cart/remove/{product_id}` | Remove item | ⬜ | ⬜ |
| `DELETE /api/v1/cart/clear/` | Clear cart | ⬜ | ⬜ |

**Request/Response Schemas:**
- [ ] `CartItemSchema` - Product details + quantity + subtotal
- [ ] `CartResponseSchema` - Items list + totals + GST breakdown
- [ ] `AddToCartRequestSchema` - product_id, quantity
- [ ] `UpdateCartRequestSchema` - product_id, quantity

### 5.4 Frontend Cart Hook (Day 25) - GREEN Phase

**File:** `/frontend/lib/hooks/use-cart.ts`

**Features Checklist:**
- [ ] React Query for server state management
- [ ] Optimistic updates for add/remove operations
- [ ] Mutation for add to cart
- [ ] Mutation for update quantity
- [ ] Mutation for remove item
- [ ] Mutation for clear cart
- [ ] Cart item count badge support
- [ ] Error handling with toast notifications
- [ ] Singapore context headers

**Test File:** `/frontend/lib/hooks/use-cart.test.ts`
- [ ] Test add item mutation
- [ ] Test optimistic update
- [ ] Test error rollback
- [ ] Test cart query caching

### 5.5 Cart Drawer Component (Day 26) - GREEN Phase

**File:** `/frontend/components/cart-drawer.tsx`

**Features Checklist:**
- [ ] Sheet component from shadcn/ui
- [ ] Cart item list with images
- [ ] Quantity controls (+/- buttons)
- [ ] Remove item button with confirmation
- [ ] Subtotal calculation (with GST breakdown)
- [ ] "Continue to Checkout" CTA
- [ ] Empty cart state
- [ ] Loading skeleton
- [ ] Reduced motion support
- [ ] Mobile responsive

**Components Needed:**
| Component | File | Features |
|-----------|------|----------|
| `CartDrawer` | `/components/cart-drawer.tsx` | Sheet wrapper, cart state |
| `CartItemRow` | `/components/cart-item-row.tsx` | Single item row with controls |
| `CartSummary` | `/components/cart-summary.tsx` | Totals, GST breakdown |

### 5.6 Stripe Checkout Tests (Day 26) - RED Phase

**Test Files to Create:**

| Test File | Test Cases | Priority |
|-----------|------------|----------|
| `/backend/commerce/tests/test_stripe_checkout.py` | Session creation, line items | HIGH |
| `/backend/commerce/tests/test_stripe_webhook.py` | Payment success, failure | HIGH |

**Test Cases:**
- [ ] `test_create_checkout_session_returns_url()` - Returns valid Stripe URL
- [ ] `test_checkout_session_includes_line_items()` - All cart items included
- [ ] `test_checkout_session_uses_sgd_currency()` - SGD currency set
- [ ] `test_checkout_session_enables_grabpay()` - GrabPay payment method
- [ ] `test_checkout_session_enables_paynow()` - PayNow payment method
- [ ] `test_checkout_session_restricts_shipping_sg()` - Only SG addresses
- [ ] `test_webhook_payment_success_creates_order()` - Order created on success
- [ ] `test_webhook_payment_failure_logs_event()` - Failed payment logged
- [ ] `test_webhook_invalid_signature_rejected()` - Security check

### 5.7 Stripe Checkout Implementation (Day 27) - GREEN Phase

**File:** `/backend/commerce/stripe_sg.py`

**Functions:**
- [ ] `create_checkout_session(cart_items, user_email, success_url, cancel_url)`
- [ ] `verify_webhook_signature(payload, sig_header, secret)`
- [ ] `handle_payment_success(payment_intent)`
- [ ] `handle_payment_failure(payment_intent)`

**Configuration:**
```python
stripe.api_key = settings.STRIPE_SECRET_KEY_SG
stripe.api_version = "2026-02-01.acacia"
```

**File:** `/backend/api/v1/checkout.py` (Django Ninja)

**Endpoints:**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `POST /api/v1/checkout/create-session/` | Create Stripe session | Returns checkout URL |
| `POST /api/v1/checkout/webhook/` | Stripe webhook handler | Processes events |

**Checkout Session Config:**
- Currency: `sgd`
- Payment methods: `['card', 'grabpay', 'paynow']`
- Shipping countries: `['SG']` only
- Locale: `en`
- Line items: Unit amount in cents (price * 100)
- Metadata: cart_id, gst_rate (0.09)

### 5.8 Checkout Page (Day 27-28) - GREEN Phase

**File:** `/frontend/app/checkout/page.tsx` (Client Component)

**Features Checklist:**
- [ ] Cart summary display
- [ ] GST breakdown (subtotal, GST amount, total)
- [ ] Stripe Checkout redirect button
- [ ] Loading state during redirect
- [ ] Error handling for session creation
- [ ] Empty cart redirect to products
- [ ] Authentication check (or guest checkout)

**File:** `/frontend/components/sg-address-form.tsx`

**Features:**
- [ ] Recipient name input
- [ ] Block/Street input (Singapore format)
- [ ] Unit number input
- [ ] Postal code input (6-digit validation)
- [ ] Phone number input (+65 format)
- [ ] Form validation with Zod

### 5.9 Success/Cancel Pages (Day 28) - GREEN Phase

**File:** `/frontend/app/checkout/success/page.tsx`
- [ ] Thank you message
- [ ] Order confirmation number
- [ ] Order summary
- [ ] Continue shopping CTA
- [ ] Order details email confirmation

**File:** `/frontend/app/checkout/cancel/page.tsx`
- [ ] Payment cancelled message
- [ ] Return to cart button
- [ ] Support contact information

---

## Integration Checklist

### Backend Integration
- [ ] Redis client configured in Django settings
- [ ] Cart endpoints registered in `/backend/api/v1/urls.py`
- [ ] Checkout endpoints registered
- [ ] Stripe webhook endpoint secured
- [ ] GST calculation integrated into totals

### Frontend Integration
- [ ] Cart drawer accessible from navigation
- [ ] Add to cart button on product cards
- [ ] Cart badge in header (item count)
- [ ] Checkout page linked from cart drawer
- [ ] Stripe redirect handling

---

## Verification Gates

| Gate | Criteria | Check |
|------|----------|-------|
| **Tests Pass** | All cart + checkout tests pass (`pytest commerce/tests/`) | ⬜ |
| **Redis Working** | Cart persists across page refreshes | ⬜ |
| **Stripe Session** | Creates valid checkout.session | ⬜ |
| **Type Check** | TypeScript strict mode passes | ⬜ |
| **Build** | `npm run build` succeeds | ⬜ |
| **E2E** | Full cart → checkout → success flow works | ⬜ |

---

## Success Criteria

1. ✅ **Cart Functionality**
   - Add items to cart with quantity
   - Update quantities
   - Remove items
   - Cart persists in Redis for 30 days

2. ✅ **Cart Merge**
   - Anonymous cart merges with user cart on login
   - Duplicate items sum quantities

3. ✅ **Checkout Flow**
   - Stripe Checkout session created successfully
   - Supports SGD, GrabPay, PayNow
   - Restricts shipping to Singapore only

4. ✅ **Order Creation**
   - Webhook creates order on payment success
   - Order includes GST breakdown
   - Stock decremented on successful order

5. ✅ **TDD Compliance**
   - Tests written before implementation
   - All tests passing
   - No skipped tests

6. ✅ **Code Quality**
   - No TypeScript errors (strict mode)
   - No ESLint warnings
   - Components follow established patterns

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Redis data loss | AOF persistence configured; backup strategy |
| Stripe webhook failures | Exponential backoff retry; logging |
| Race condition on stock | Database-level stock check on checkout |
| Cart abandonment | Analytics tracking; email reminder (Phase 8) |
| Duplicate orders | Idempotency key on Stripe session creation |

---

## Next Steps

After Phase 5 completion, proceed to **Phase 6: Tea Culture Content** (Article models, content API, culture pages).

---

## TDD Execution Log

### Day 23: Write Cart Tests (RED)

```bash
# 1. Write cart service tests
cat > backend/commerce/tests/test_cart_service.py << 'EOF'
import pytest
from commerce.cart import add_to_cart, get_cart_items, update_cart_item

def test_add_to_cart_creates_entry():
    """Adding a new item creates cart entry."""
    cart_id = "test-cart-123"
    result = add_to_cart(cart_id, product_id=1, quantity=2)
    assert result is True
    items = get_cart_items(cart_id)
    assert len(items) == 1
    assert items[0]['quantity'] == 2

def test_add_increments_existing_quantity():
    """Adding same product increments quantity."""
    cart_id = "test-cart-456"
    add_to_cart(cart_id, product_id=1, quantity=2)
    add_to_cart(cart_id, product_id=1, quantity=3)
    items = get_cart_items(cart_id)
    assert items[0]['quantity'] == 5
EOF

# 2. Run tests (expect FAIL)
pytest backend/commerce/tests/test_cart_service.py -v
# EXPECTED: FAILED (functions don't exist yet)
```

### Day 24: Implement Cart Service (GREEN)

```bash
# 3. Implement cart service
cat > backend/commerce/cart.py << 'EOF'
import redis
import uuid
from datetime import timedelta
from django.conf import settings

redis_client = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=1,  # Cart database
    decode_responses=True
)

CART_TTL = timedelta(days=30)

def get_cart_id(request) -> str:
    """Get or create cart ID from cookies."""
    cart_id = request.COOKIES.get('cart_id')
    if not cart_id:
        cart_id = str(uuid.uuid4())
    return cart_id

def add_to_cart(cart_id: str, product_id: int, quantity: int) -> bool:
    """Add item to Redis cart with atomic increment."""
    key = f"cart:{cart_id}"
    current = redis_client.hincrby(key, str(product_id), quantity)
    if current == quantity:  # First addition
        redis_client.expire(key, CART_TTL)
    else:
        redis_client.expire(key, CART_TTL)  # Reset TTL
    return True

def get_cart_items(cart_id: str) -> list[dict]:
    """Fetch cart items with product details from DB."""
    key = f"cart:{cart_id}"
    cart_data = redis_client.hgetall(key)
    # Transform to items with product details (requires DB lookup)
    items = []
    for product_id, quantity in cart_data.items():
        items.append({
            'product_id': int(product_id),
            'quantity': int(quantity),
        })
    return items
EOF

# 4. Run tests (expect PASS)
pytest backend/commerce/tests/test_cart_service.py -v
# EXPECTED: PASSED

# 5. Refactor and add more tests...
```

---

## Ready for Execution

**Confirmation Required:**

Reply "**yes**" to proceed with:
1. Writing cart service tests (RED phase)
2. Implementing Redis cart service
3. Creating cart API endpoints
4. Building frontend cart hook and drawer
5. Writing Stripe tests
6. Implementing Stripe Checkout (SGD, GrabPay, PayNow)
7. Running full test suite
8. Verifying build

Or specify modifications to this plan.
