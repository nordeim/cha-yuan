/**
 * Subscription API Functions
 *
 * Type-safe API functions for the CHA YUAN subscription system.
 * Communicates with Django backend via BFF proxy.
 *
 * @module lib/api/subscription
 */

import { authFetch } from "@/lib/auth-fetch";
import type {
  SubscriptionDashboardData,
  SubscriptionError,
  CancelSubscriptionRequest,
  PauseSubscriptionRequest,
} from "@/lib/types/subscription";

/**
 * Fetch current user's subscription dashboard data.
 *
 * Returns complete subscription information including:
 * - Current subscription status and plan
 * - Next billing date and price
 * - Next box preview (if curated)
 * - User preferences from quiz
 * - Billing history
 *
 * @returns Complete subscription dashboard data
 * @throws {Error} If not authenticated or subscription not found
 *
 * @example
 * ```typescript
 * const data = await getSubscription();
 * console.log(data.subscription.status); // "active"
 * console.log(data.nextBox?.products); // [...]
 * ```
 */
export async function getSubscription(): Promise<SubscriptionDashboardData> {
  const response = await authFetch("/api/v1/subscriptions/current/", {
    method: "GET",
  });

  if (!response.ok) {
    const errorData: SubscriptionError = await response.json().catch(() => ({
      detail: "Failed to fetch subscription",
    }));

    if (response.status === 401) {
      throw new Error("Authentication required");
    }

    if (response.status === 404) {
      throw new Error("No active subscription found");
    }

    throw new Error(errorData.detail || "Failed to fetch subscription");
  }

  return response.json();
}

/**
 * Cancel the current subscription.
 *
 * This will immediately cancel the subscription. The user will continue
 * to receive boxes until the end of the current billing period.
 *
 * @param data - Optional cancellation reason and feedback
 * @throws {Error} If cancellation fails
 *
 * @example
 * ```typescript
 * await cancelSubscription({ reason: "Too expensive" });
 * ```
 */
export async function cancelSubscription(
  data?: CancelSubscriptionRequest
): Promise<void> {
  const response = await authFetch("/api/v1/subscriptions/cancel/", {
    method: "POST",
    body: JSON.stringify(data || {}),
  });

  if (!response.ok) {
    const errorData: SubscriptionError = await response.json().catch(() => ({
      detail: "Failed to cancel subscription",
    }));

    if (response.status === 400) {
      throw new Error(errorData.detail || "Subscription cannot be cancelled");
    }

    throw new Error(errorData.detail || "Failed to cancel subscription");
  }
}

/**
 * Pause the current subscription.
 *
 * Pauses subscription for 1-3 months. During pause, no new boxes
 * will be shipped and no charges will be made.
 *
 * @param data - Pause duration and reason
 * @throws {Error} If pause fails
 *
 * @example
 * ```typescript
 * await pauseSubscription({ months: 2, reason: "Traveling" });
 * ```
 */
export async function pauseSubscription(
  data?: PauseSubscriptionRequest
): Promise<void> {
  const response = await authFetch("/api/v1/subscriptions/pause/", {
    method: "POST",
    body: JSON.stringify(data || {}),
  });

  if (!response.ok) {
    const errorData: SubscriptionError = await response.json().catch(() => ({
      detail: "Failed to pause subscription",
    }));

    throw new Error(errorData.detail || "Failed to pause subscription");
  }
}

/**
 * Resume a paused subscription.
 *
 * Reactivates the subscription immediately. Next billing date will be
 * adjusted based on the resume date.
 *
 * @throws {Error} If resume fails
 *
 * @example
 * ```typescript
 * await resumeSubscription();
 * ```
 */
export async function resumeSubscription(): Promise<void> {
  const response = await authFetch("/api/v1/subscriptions/resume/", {
    method: "POST",
  });

  if (!response.ok) {
    const errorData: SubscriptionError = await response.json().catch(() => ({
      detail: "Failed to resume subscription",
    }));

    throw new Error(errorData.detail || "Failed to resume subscription");
  }
}

/**
 * Update subscription plan.
 *
 * Changes the subscription plan (monthly/quarterly/annual).
 * Prorated charges or credits may apply.
 *
 * @param plan - New plan type
 * @throws {Error} If update fails
 *
 * @example
 * ```typescript
 * await updatePlan("annual");
 * ```
 */
export async function updatePlan(
  plan: "monthly" | "quarterly" | "annual"
): Promise<void> {
  const response = await authFetch("/api/v1/subscriptions/update-plan/", {
    method: "POST",
    body: JSON.stringify({ plan }),
  });

  if (!response.ok) {
    const errorData: SubscriptionError = await response.json().catch(() => ({
      detail: "Failed to update plan",
    }));

    throw new Error(errorData.detail || "Failed to update plan");
  }
}
