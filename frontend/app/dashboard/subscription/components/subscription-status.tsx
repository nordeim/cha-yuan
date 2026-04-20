"use client";

import { motion } from "framer-motion";
import { Package, Calendar, CreditCard } from "lucide-react";
import type { Subscription } from "@/lib/types/subscription";
import { getSubscriptionStatusInfo } from "@/lib/hooks/use-subscription";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { staggerItemVariants } from "@/lib/animations";

interface SubscriptionStatusProps {
  subscription: Subscription;
}

/**
 * SubscriptionStatus - Display current subscription status and plan
 *
 * Features:
 * - Status badge with color coding (active/paused/cancelled)
 * - Plan details with icon
 * - Subscription ID
 * - Member since date
 * - Payment method info
 *
 * Design:
 * - Card with header
 * - Status-specific color coding
 * - Clean typography hierarchy
 */
export function SubscriptionStatus({ subscription }: SubscriptionStatusProps) {
  const prefersReducedMotion = useReducedMotion();
  const statusInfo = getSubscriptionStatusInfo(subscription.status);

  // Format member since date with Singapore locale
  const memberSince = new Date(subscription.startedAt).toLocaleDateString(
    "en-SG",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  // Format subscription ID (truncate if too long)
  const displayId = subscription.id.length > 12
    ? `${subscription.id.slice(0, 6)}...${subscription.id.slice(-4)}`
    : subscription.id;

  const variants = prefersReducedMotion ? {} : staggerItemVariants;

  return (
    <motion.div
      variants={variants}
      className="bg-white rounded-2xl border border-ivory-300 p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-display text-bark-900 mb-1">
            Subscription
          </h2>
          <p className="text-sm text-bark-600">
            Manage your tea delivery
          </p>
        </div>

        {/* Status Badge */}
        <div
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo.colorClass} bg-opacity-10 ${statusInfo.textClass}`}
        >
          <span className={`inline-block w-2 h-2 rounded-full ${statusInfo.colorClass} mr-2`} />
          {statusInfo.label}
        </div>
      </div>

      {/* Plan Details */}
      <div className="space-y-4">
        {/* Plan Type */}
        <div className="flex items-center gap-4 p-4 bg-ivory-50 rounded-xl">
          <div className="w-12 h-12 rounded-xl bg-tea-100 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-tea-600" />
          </div>
          <div>
            <p className="text-sm text-bark-600">Current Plan</p>
            <p className="text-lg font-medium text-bark-900 capitalize">
              {subscription.plan}
            </p>
          </div>
        </div>

        {/* Member Since */}
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="w-4 h-4 text-bark-500 flex-shrink-0" />
          <span className="text-bark-600">
            Member since <span className="text-bark-900">{memberSince}</span>
          </span>
        </div>

        {/* Subscription ID */}
        <div className="flex items-center gap-3 text-sm">
          <CreditCard className="w-4 h-4 text-bark-500 flex-shrink-0" />
          <span className="text-bark-600">
            Subscription ID: <span className="text-bark-900 font-mono">{displayId}</span>
          </span>
        </div>

        {/* Payment Method (if available) */}
        {subscription.paymentMethodLast4 && (
          <div className="flex items-center gap-3 text-sm pt-2 border-t border-ivory-200">
            <svg
              className="w-4 h-4 text-bark-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <span className="text-bark-600">
              Payment method: <span className="text-bark-900">•••• {subscription.paymentMethodLast4}</span>
              {subscription.paymentMethodType === "paynow" && (
                <span className="ml-2 text-xs bg-tea-100 text-tea-700 px-2 py-0.5 rounded-full">
                  PayNow
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Status-specific messages */}
      {subscription.status === "paused" && (
        <div className="mt-4 p-3 bg-gold-50 border border-gold-200 rounded-lg">
          <p className="text-sm text-gold-800">
            Your subscription is paused. Resume anytime to continue receiving curated teas.
          </p>
        </div>
      )}

      {subscription.status === "cancelled" && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            Your subscription has been cancelled. You can reactivate anytime to start a new subscription.
          </p>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Skeleton loader for SubscriptionStatus
 */
export function SubscriptionStatusSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-ivory-300 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="h-6 w-32 bg-ivory-200 rounded mb-1 animate-pulse" />
          <div className="h-4 w-40 bg-ivory-200 rounded animate-pulse" />
        </div>
        <div className="h-8 w-20 bg-ivory-200 rounded-full animate-pulse" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4 p-4 bg-ivory-50 rounded-xl">
          <div className="w-12 h-12 bg-ivory-200 rounded-xl animate-pulse" />
          <div>
            <div className="h-4 w-24 bg-ivory-200 rounded mb-1 animate-pulse" />
            <div className="h-6 w-32 bg-ivory-200 rounded animate-pulse" />
          </div>
        </div>

        <div className="h-4 w-48 bg-ivory-200 rounded animate-pulse" />
        <div className="h-4 w-56 bg-ivory-200 rounded animate-pulse" />
      </div>
    </div>
  );
}
