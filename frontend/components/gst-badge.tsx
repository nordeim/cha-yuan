"use client";

import { formatSGDPrice } from "@/lib/types/product";

interface GstBadgeProps {
  price: string | number;
  gstAmount: string | number;
  showGstLabel?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * GST Badge Component
 * Displays price in SGD with optional GST indicator
 * Singapore context: GST 9%
 */
export function GstBadge({
  price,
  gstAmount: _gstAmount,
  showGstLabel = true,
  size = "md",
}: GstBadgeProps) {
  const sizeClasses = {
    sm: {
      price: "text-base font-semibold",
      label: "text-xs",
    },
    md: {
      price: "text-xl font-semibold",
      label: "text-xs",
    },
    lg: {
      price: "text-2xl font-semibold",
      label: "text-sm",
    },
    xl: {
      price: "text-3xl md:text-4xl font-semibold",
      label: "text-sm",
    },
  };

  const formattedPrice = formatSGDPrice(price);

  return (
    <div className="flex flex-col">
      <span
        className={`${sizeClasses[size].price} text-gold-600 tracking-tight`}
        aria-label={`Price: ${formattedPrice}`}
      >
        {formattedPrice}
      </span>
      {showGstLabel && (
        <span
          className={`${sizeClasses[size].label} text-bark-700/60`}
          aria-label="Includes GST"
        >
          incl. GST
        </span>
      )}
    </div>
  );
}

/**
 * Compact price display for lists
 */
export function CompactPrice({
  price,
  showGst = false,
}: {
  price: string | number;
  showGst?: boolean;
}) {
  return (
    <span className="text-gold-600 font-semibold">
      {formatSGDPrice(price)}
      {showGst && (
        <span className="text-bark-700/60 text-xs ml-1">incl. GST</span>
      )}
    </span>
  );
}
