"use client";

import { motion } from "framer-motion";
import { CalendarDays, Clock, Receipt } from "lucide-react";
import type { Subscription } from "@/lib/types/subscription";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { staggerItemVariants } from "@/lib/animations";

interface NextBillingProps {
  subscription: Subscription;
}

/**
 * Format price in SGD with cents
 * @param cents - Price in cents
 * @returns Formatted price string
 */
function formatSGD(cents: number): string {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * Format date in Singapore timezone
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
function formatSGDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-SG", {
    timeZone: "Asia/Singapore",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * Format short date (for compact display)
 * @param dateString - ISO date string
 * @returns Short formatted date
 */
function formatShortSGDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-SG", {
    timeZone: "Asia/Singapore",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Calculate days until billing
 * @param dateString - ISO date string
 * @returns Number of days
 */
function getDaysUntil(dateString: string): number {
  const now = new Date();
  const target = new Date(dateString);
  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * NextBilling - Display next billing information with Singapore time
 *
 * Features:
 * - Next billing date with Singapore timezone
 * - Price in SGD with GST notation
 * - Billing interval info
 * - Days until billing countdown
 * - Payment method display
 *
 * Singapore Context:
 * - Asia/Singapore timezone
 * - SGD currency (en-SG locale)
 * - GST 9% included in price
 */
export function NextBilling({ subscription }: NextBillingProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? {} : staggerItemVariants;

  const daysUntil = getDaysUntil(subscription.nextBillingDate);
  const formattedDate = formatSGDate(subscription.nextBillingDate);
  const formattedPrice = formatSGD(subscription.priceCents);
  const shortDate = formatShortSGDate(subscription.nextBillingDate);

  // Get billing interval label
  const intervalLabel = {
    monthly: "Monthly",
    quarterly: "Quarterly",
    annual: "Annual",
  }[subscription.plan] || "Monthly";

  return (
    <motion.div
      variants={variants}
      className="bg-white rounded-2xl border border-ivory-300 p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-gold-600" />
        </div>
        <div>
          <h2 className="text-lg font-display text-bark-900">Next Billing</h2>
          <p className="text-sm text-bark-600">
            {intervalLabel} subscription
          </p>
        </div>
      </div>

      {/* Billing Date */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-display text-bark-900">
            {shortDate}
          </span>
        </div>
        <p className="text-sm text-bark-600 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gold-500" />
          <span>{formattedDate}</span>
        </p>
        <p className="text-xs text-bark-500 mt-1">
          Singapore time (SGT)
        </p>
      </div>

      {/* Price */}
      <div className="mb-6 p-4 bg-ivory-50 rounded-xl">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-semibold text-bark-900">
            {formattedPrice}
          </span>
          <span className="text-sm text-bark-600">/{subscription.plan.replace("ly", "")}</span>
        </div>
        <p className="text-xs text-bark-500 mt-1">
          incl. 9% GST
        </p>
      </div>

      {/* Days Until */}
      {daysUntil > 0 && subscription.status === "active" && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-bark-600">Time until next charge</span>
            <span className="text-sm font-medium text-tea-600">
              {daysUntil} {daysUntil === 1 ? "day" : "days"}
            </span>
          </div>
          <div className="h-2 bg-ivory-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-tea-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (daysUntil / 30) * 100)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Payment Method */}
      {subscription.paymentMethodLast4 && (
        <div className="flex items-center gap-3 pt-4 border-t border-ivory-200">
          <Receipt className="w-4 h-4 text-bark-500 flex-shrink-0" />
          <span className="text-sm text-bark-600">
            Payment via
            <span className="text-bark-900 ml-1">
              •••• {subscription.paymentMethodLast4}
            </span>
          </span>
        </div>
      )}

      {/* Cancelled/Paused State Messages */}
      {subscription.status === "cancelled" && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            No future billing. Subscription cancelled.
          </p>
        </div>
      )}

      {subscription.status === "paused" && (
        <div className="mt-4 p-3 bg-gold-50 border border-gold-200 rounded-lg">
          <p className="text-sm text-gold-800">
            Billing paused. Resume to reactivate charges.
          </p>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Skeleton loader for NextBilling
 */
export function NextBillingSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-ivory-300 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-ivory-200 rounded-xl animate-pulse" />
        <div>
          <div className="h-5 w-24 bg-ivory-200 rounded mb-1 animate-pulse" />
          <div className="h-4 w-32 bg-ivory-200 rounded animate-pulse" />
        </div>
      </div>

      <div className="mb-6">
        <div className="h-8 w-40 bg-ivory-200 rounded mb-2 animate-pulse" />
        <div className="h-4 w-56 bg-ivory-200 rounded animate-pulse" />
      </div>

      <div className="mb-6 p-4 bg-ivory-50 rounded-xl">
        <div className="h-7 w-32 bg-ivory-200 rounded mb-1 animate-pulse" />
        <div className="h-3 w-20 bg-ivory-200 rounded animate-pulse" />
      </div>
    </div>
  );
}
