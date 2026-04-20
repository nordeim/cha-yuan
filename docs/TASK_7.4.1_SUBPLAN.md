# Task 7.4.1: Subscription Dashboard Page

> **Duration:** 1 day  
> **TDD Principle:** Design-first with Type Safety  
> **Status:** READY FOR EXECUTION

---

## Executive Summary

Build the **Subscription Dashboard** for CHA YUAN - a user-facing subscription management interface that displays:
- Current subscription status (active/paused/cancelled)
- Next billing date (in Singapore time - Asia/Singapore)
- Next box preview (if available)
- Preference summary from quiz
- Cancel subscription option

The dashboard serves as the user's central hub for managing their personalized tea subscription journey.

---

## Alignment with Master Plan

### From MASTER_EXECUTION_PLAN.md Section 7.3:
- Location: `/frontend/app/dashboard/subscription/page.tsx`
- Client Component (requires user session)
- Features subscription status, billing, and next box preview

### From PHASE_7_SUBPLAN.md Section 7.4.1:
**Required Features:**
- [ ] Current subscription status (active/paused/cancelled)
- [ ] Next billing date (SG time)
- [ ] Next box preview (if available)
- [ ] Preference summary
- [ ] Cancel subscription option
- [ ] Billing history (optional)

**Data Interface:**
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

## Component Architecture

```
/frontend/app/dashboard/subscription/
├── page.tsx                      # Main orchestrator
├── components/
│   ├── subscription-guard.tsx    # Auth + subscription check
│   ├── subscription-status.tsx     # Status badge + plan info
│   ├── next-billing.tsx          # Billing date + price
│   ├── next-box-preview.tsx      # Curated products preview
│   ├── preference-summary.tsx      # Quiz results display
│   ├── cancel-subscription.tsx     # Cancel flow with confirmation
│   ├── billing-history.tsx         # Past invoices (optional)
│   └── index.ts                    # Barrel exports
└── __tests__/
    └── subscription-page.test.tsx  # Component tests
```

---

## Phase Breakdown

### Phase 1: Planning & Component Architecture
**Goal:** Define data types, API contracts, and component interfaces.

**Deliverables:**
1. TypeScript interfaces for Subscription data
2. API endpoint specifications
3. Component props definitions
4. Error state handling plan

**Key Decisions:**
- Use React Query for data fetching
- Singapore timezone formatting with `Intl.DateTimeFormat`
- SGD currency formatting with `Intl.NumberFormat`
- Loading skeletons for async states

### Phase 2: Backend API Types & Schema Definition
**Goal:** Define the complete data contract.

**Files to Create:**
1. `/frontend/lib/types/subscription.ts` - TypeScript interfaces

**Types Required:**
```typescript
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';
export type SubscriptionPlan = 'monthly' | 'quarterly' | 'annual';
export type CurationType = 'auto' | 'manual';

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  nextBillingDate: string;  // ISO 8601 format
  price: number;  // SGD, cents
  createdAt: string;
}

export interface NextBoxPreview {
  products: Product[];  // Limited fields: id, name, image, category
  curatedBy: CurationType;
  estimatedShipDate: string;
}

export interface SubscriptionDashboardData {
  subscription: Subscription;
  preferences: {
    topCategories: string[];
    allPreferences: Record<string, number>;
  } | null;
  nextBox: NextBoxPreview | null;
  billingHistory: BillingRecord[];
}

export interface BillingRecord {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl?: string;
}
```

### Phase 3: Frontend API Layer
**Goal:** Create API functions and React Query hooks.

**Files to Create:**
1. `/frontend/lib/api/subscription.ts` - API functions
2. `/frontend/lib/hooks/use-subscription.ts` - React Query hooks

**API Functions:**
```typescript
export async function getSubscription(): Promise<SubscriptionDashboardData>;
export async function cancelSubscription(reason?: string): Promise<void>;
export async function pauseSubscription(): Promise<void>;
export async function resumeSubscription(): Promise<void>;
```

**React Query Hooks:**
```typescript
export function useSubscription(): UseQueryResult<SubscriptionDashboardData, Error>;
export function useCancelSubscription(): UseMutationResult<void, Error, { reason?: string }>;
```

### Phase 4: SubscriptionStatus Component
**Goal:** Display current subscription status and plan details.

**Features:**
- Status badge (active: tea-600, paused: gold-500, cancelled: red-500)
- Plan name with icon
- Subscription ID
- Creation date
- Visual indicator for each status

**Design:**
- Card with icon header
- Status-specific color coding
- Plan upgrade/downgrade CTA (future feature)

### Phase 5: NextBillingDate Component
**Goal:** Display billing information in Singapore time.

**Features:**
- Next billing date formatted with Asia/Singapore timezone
- Price in SGD with GST notation
- "Billing cycle" info (monthly/quarterly/annual)
- Payment method summary (last 4 digits)

**Singapore Time Formatting:**
```typescript
const formatter = new Intl.DateTimeFormat('en-SG', {
  timeZone: 'Asia/Singapore',
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
```

### Phase 6: NextBoxPreview Component
**Goal:** Preview the curated products for next shipment.

**Features:**
- Product cards with image, name, category
- Curation indicator (auto/manual)
- Estimated ship date
- "Not yet curated" state
- Product count (X of 5 teas selected)

**Empty State:**
- Message: "Your next box is being curated..."
- Estimated curation timeframe

### Phase 7: PreferenceSummary Component
**Goal:** Display quiz results with visual representation.

**Features:**
- Top 3 tea categories with scores
- Horizontal bar chart (reusing QuizResults style)
- "Retake Quiz" link (disabled - one-time only)
- "Browse by Preference" CTA

**Design:**
- Compact version of QuizResults
- Card layout with tea brand colors
- Score percentages

### Phase 8: CancelSubscription Component
**Goal:** Handle subscription cancellation with confirmation.

**Features:**
- "Cancel Subscription" button (destructive)
- Confirmation dialog with consequences explanation
- Cancellation reason input (optional)
- "Pause instead" alternative CTA
- Success/error feedback
- Immediate UI update on success

**Cancellation Flow:**
1. User clicks "Cancel"
2. Dialog opens with confirmation
3. User confirms + optional reason
4. API call to cancel
5. UI updates to "cancelled" state
6. Redirect to cancellation confirmation page

### Phase 9: SubscriptionPage Orchestrator
**Goal:** Main page component that composes all sub-components.

**Structure:**
```tsx
<DashboardLayout>
  <SubscriptionGuard>
    <div className="space-y-6">
      <PageHeader title="My Subscription" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <SubscriptionStatusCard />
          <NextBoxPreviewCard />
          <PreferenceSummaryCard />
        </div>
        
        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          <NextBillingCard />
          <BillingHistoryCard />
          <CancelSubscriptionCard />
        </div>
      </div>
    </div>
  </SubscriptionGuard>
</DashboardLayout>
```

**Loading State:**
- Skeleton cards for each section
- Staggered animation

**Error State:**
- Full-page error with retry
- Individual section errors

### Phase 10: Testing & Documentation
**Goal:** Verify functionality and document usage.

**Test Files:**
1. `subscription-page.test.tsx` - Page integration tests
2. `subscription-status.test.tsx` - Component tests
3. `next-billing.test.tsx` - Timezone formatting tests
4. `cancel-subscription.test.tsx` - Mutation tests

**Test Cases:**
- Renders with subscription data
- Displays Singapore time correctly
- Handles empty next box state
- Cancels subscription successfully
- Shows error on API failure
- Loading skeletons appear

---

## Design Specifications

### Color Palette (Tea Brand)
| Element | Color | Usage |
|---------|-------|-------|
| Status: Active | tea-600 (#4a7040) | Active badge |
| Status: Paused | gold-500 (#B8944D) | Paused badge |
| Status: Cancelled | red-500 | Cancelled badge |
| Background | ivory-50 (#FDFBF7) | Page background |
| Cards | white | Card backgrounds |
| Text | bark-900 (#2A1D14) | Primary text |
| Accents | gold-400 | Premium highlights |

### Typography
- **Page Title**: text-3xl font-display
- **Card Titles**: text-xl font-display
- **Body**: text-sm text-bark-700
- **Labels**: text-xs uppercase tracking-wide

### Spacing
- Section gap: space-y-6
- Card padding: p-6
- Grid gap: gap-6
- Container: max-w-6xl mx-auto

### Animations
- Page load: fadeInUp (0.6s)
- Card hover: subtle lift (y: -2px)
- Status changes: smooth color transition
- Skeleton: shimmer animation

---

## Success Criteria

### Functional Requirements
- [ ] Displays subscription status correctly
- [ ] Shows next billing date in Singapore time
- [ ] Formats SGD price with GST notation
- [ ] Shows next box preview when available
- [ ] Displays quiz preferences summary
- [ ] Cancels subscription with confirmation
- [ ] Handles loading and error states

### Technical Requirements
- [ ] TypeScript strict mode compliant
- [ ] React 19 compatible (no forwardRef)
- [ ] React Query for data fetching
- [ ] Singapore timezone (Asia/Singapore)
- [ ] SGD currency (en-SG locale)
- [ ] Accessibility: keyboard navigation
- [ ] Reduced motion support

### Design Requirements
- [ ] Tea brand color palette
- [ ] Eastern minimalism aesthetic
- [ ] Responsive layout (mobile-first)
- [ ] Smooth animations
- [ ] Loading skeletons

---

## Dependencies

### Already Available:
- ✅ React Query (TanStack)
- ✅ Framer Motion
- ✅ Tailwind CSS v4
- ✅ shadcn/ui components
- ✅ authFetch utility
- ✅ useReducedMotion hook

### To Create:
- [ ] Subscription types
- [ ] Subscription API functions
- [ ] useSubscription hook

---

## Singapore Context Compliance

| Requirement | Implementation |
|-------------|----------------|
| **Timezone** | Asia/Singapore in `Intl.DateTimeFormat` |
| **Currency** | SGD with `Intl.NumberFormat('en-SG')` |
| **Date Format** | 17 April 2026 (Singapore style) |
| **Price Display** | $49.90 SGD (incl. GST) |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| No subscription data | Show "No active subscription" CTA |
| Timezone errors | Use explicit Asia/Singapore |
| Currency formatting | Intl.NumberFormat with fallback |
| Cancellation API failure | Show error toast, allow retry |
| Large preference data | Paginate/collapse in UI |

---

## API Endpoints Required

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/subscriptions/current/` | GET | Get current subscription |
| `/api/v1/subscriptions/cancel/` | POST | Cancel subscription |
| `/api/v1/subscriptions/pause/` | POST | Pause subscription |
| `/api/v1/subscriptions/resume/` | POST | Resume subscription |

---

## Ready for Execution

**Validation:**
- ✅ Aligned with PHASE_7_SUBPLAN.md
- ✅ Aligned with MASTER_EXECUTION_PLAN.md
- ✅ Design system compliance
- ✅ Singapore context requirements
- ✅ TDD approach documented

**Next Step:** Confirm and begin Phase 1 implementation.
