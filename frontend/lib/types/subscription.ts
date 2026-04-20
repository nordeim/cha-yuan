/**
 * Subscription Type Definitions
 *
 * TypeScript interfaces for the CHA YUAN subscription system.
 * These types align with the Django Ninja API schemas.
 */

import type { UserPreference } from "./quiz";

/**
 * Subscription status values
 */
export type SubscriptionStatus = "active" | "paused" | "cancelled";

/**
 * Subscription plan types
 */
export type SubscriptionPlan = "monthly" | "quarterly" | "annual";

/**
 * Curation method for subscription boxes
 */
export type CurationType = "auto" | "manual";

/**
 * Billing record status
 */
export type BillingStatus = "paid" | "pending" | "failed";

/**
 * Simplified product reference for subscription preview
 */
export interface SubscriptionProduct {
  /** Unique identifier */
  id: string;
  /** Product name */
  name: string;
  /** Product slug for linking */
  slug: string;
  /** Product image URL */
  image?: string;
  /** Tea category */
  category: string;
  /** Origin region */
  origin?: string;
}

/**
 * Subscription plan details
 */
export interface SubscriptionPlanDetails {
  /** Plan type */
  type: SubscriptionPlan;
  /** Display name */
  name: string;
  /** Price in SGD cents */
  priceCents: number;
  /** Billing interval description */
  interval: string;
  /** Features included */
  features: string[];
}

/**
 * Subscription data
 */
export interface Subscription {
  /** Unique identifier */
  id: string;
  /** Current status */
  status: SubscriptionStatus;
  /** Subscription plan */
  plan: SubscriptionPlan;
  /** Next billing date (ISO 8601) */
  nextBillingDate: string;
  /** Price in SGD cents */
  priceCents: number;
  /** Subscription creation date */
  createdAt: string;
  /** Subscription start date */
  startedAt: string;
  /** Cancellation date (if cancelled) */
  cancelledAt?: string;
  /** Pause date (if paused) */
  pausedAt?: string;
  /** Payment method last 4 digits */
  paymentMethodLast4?: string;
  /** Payment method type */
  paymentMethodType?: "card" | "paynow";
}

/**
 * Next box preview data
 */
export interface NextBoxPreview {
  /** Products curated for next box */
  products: SubscriptionProduct[];
  /** Curation method */
  curatedBy: CurationType;
  /** Estimated shipment date */
  estimatedShipDate?: string;
  /** Whether curation is complete */
  isCurated: boolean;
}

/**
 * Billing history record
 */
export interface BillingRecord {
  /** Unique identifier */
  id: string;
  /** Billing date */
  date: string;
  /** Amount in SGD cents */
  amountCents: number;
  /** Payment status */
  status: BillingStatus;
  /** Invoice download URL */
  invoiceUrl?: string;
  /** Description */
  description: string;
}

/**
 * Complete subscription dashboard data
 */
export interface SubscriptionDashboardData {
  /** Current subscription */
  subscription: Subscription;
  /** User preferences from quiz */
  preferences: UserPreference | null;
  /** Next box preview (null if not yet curated) */
  nextBox: NextBoxPreview | null;
  /** Billing history (last 6 months) */
  billingHistory: BillingRecord[];
}

/**
 * Subscription API error response
 */
export interface SubscriptionError {
  /** Error message */
  detail: string;
  /** Additional error details */
  errors?: Record<string, string[]>;
}

/**
 * Cancellation request payload
 */
export interface CancelSubscriptionRequest {
  /** Reason for cancellation (optional) */
  reason?: string;
}

/**
 * Pause subscription request payload
 */
export interface PauseSubscriptionRequest {
  /** Number of months to pause (1-3) */
  months?: number;
  /** Reason for pausing */
  reason?: string;
}

/**
 * Subscription statistics
 */
export interface SubscriptionStats {
  /** Total boxes received */
  totalBoxes: number;
  /** Total teas received */
  totalTeas: number;
  /** Member since date */
  memberSince: string;
  /** Next anniversary date */
  nextAnniversary?: string;
}
