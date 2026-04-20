"use client";

import { motion } from "framer-motion";
import { Package, Sparkles, Leaf, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { NextBoxPreview } from "@/lib/types/subscription";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { staggerItemVariants } from "@/lib/animations";

interface NextBoxPreviewProps {
  nextBox: NextBoxPreview | null;
}

// Category display names mapping
const categoryNames: Record<string, string> = {
  green_tea: "Green Tea",
  black_tea: "Black Tea",
  oolong: "Oolong",
  white_tea: "White Tea",
  pu_erh: "Pu-erh",
  herbal: "Herbal Tea",
  floral: "Floral Tea",
};

/**
 * Format date in Singapore timezone
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
function formatSGDate(dateString?: string): string {
  if (!dateString) return "TBD";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-SG", {
    timeZone: "Asia/Singapore",
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * NextBoxPreview - Display curated products for next shipment
 *
 * Features:
 * - Product cards with images
 * - Curation type indicator (auto/manual)
 * - Empty state for pending curation
 * - Estimated ship date
 *
 * Design:
 * - Card grid layout
 * - Tea brand styling
 * - Hover effects on product cards
 */
export function NextBoxPreview({ nextBox }: NextBoxPreviewProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion ? {} : staggerItemVariants;

  // Empty state - not yet curated
  if (!nextBox || !nextBox.isCurated) {
    return (
      <motion.div
        variants={variants}
        className="bg-white rounded-2xl border border-ivory-300 p-6 shadow-sm"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-tea-100 flex items-center justify-center">
            <Package className="w-5 h-5 text-tea-600" />
          </div>
          <div>
            <h2 className="text-lg font-display text-bark-900">Next Box</h2>
            <p className="text-sm text-bark-600">Your upcoming curation</p>
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-ivory-100 flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-bark-400" />
          </div>
          <h3 className="text-lg font-medium text-bark-900 mb-2">
            Being Curated
          </h3>
          <p className="text-sm text-bark-600 max-w-xs mx-auto mb-4">
            Our tea masters are carefully selecting the finest teas for your next box.
            Check back soon!
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gold-600">
            <Sparkles className="w-4 h-4" />
            <span>Personalized for your taste</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={variants}
      className="bg-white rounded-2xl border border-ivory-300 p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-tea-100 flex items-center justify-center">
            <Package className="w-5 h-5 text-tea-600" />
          </div>
          <div>
            <h2 className="text-lg font-display text-bark-900">Next Box</h2>
            <p className="text-sm text-bark-600">
              {nextBox.products.length} teas curated for you
            </p>
          </div>
        </div>

        {/* Curation Badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
            nextBox.curatedBy === "manual"
              ? "bg-gold-100 text-gold-700"
              : "bg-tea-100 text-tea-700"
          }`}
        >
          {nextBox.curatedBy === "manual" ? (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hand-picked</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-curated</span>
            </>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {nextBox.products.map((product, index) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="bg-ivory-50 rounded-xl overflow-hidden border border-ivory-200 
                         group-hover:border-tea-300 group-hover:shadow-sm transition-all duration-200"
            >
              {/* Product Image */}
              <div className="aspect-square relative bg-ivory-100">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Leaf className="w-8 h-8 text-bark-300" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3">
                <p className="text-xs text-gold-600 mb-0.5">
                  {categoryNames[product.category] || product.category}
                </p>
                <h4 className="text-sm font-medium text-bark-900 line-clamp-1 group-hover:text-tea-700 transition-colors">
                  {product.name}
                </h4>
                {product.origin && (
                  <p className="text-xs text-bark-500 mt-0.5">
                    {product.origin}
                  </p>
                )}
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Ship Date */}
      {nextBox.estimatedShipDate && (
        <div className="flex items-center gap-3 p-3 bg-ivory-50 rounded-xl">
          <Truck className="w-5 h-5 text-bark-500" />
          <div>
            <p className="text-sm text-bark-600">Estimated ship date</p>
            <p className="text-sm font-medium text-bark-900">
              {formatSGDate(nextBox.estimatedShipDate)}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Skeleton loader for NextBoxPreview
 */
export function NextBoxPreviewSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-ivory-300 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-ivory-200 rounded-xl animate-pulse" />
          <div>
            <div className="h-5 w-24 bg-ivory-200 rounded mb-1 animate-pulse" />
            <div className="h-4 w-32 bg-ivory-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-6 w-24 bg-ivory-200 rounded-full animate-pulse" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-ivory-50 rounded-xl overflow-hidden">
            <div className="aspect-square bg-ivory-200 animate-pulse" />
            <div className="p-3">
              <div className="h-3 w-16 bg-ivory-200 rounded mb-1 animate-pulse" />
              <div className="h-4 w-24 bg-ivory-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
