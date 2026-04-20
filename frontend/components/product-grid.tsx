"use client";

import { motion } from "framer-motion";
import { Product } from "@/lib/types/product";
import { ProductCard } from "./product-card";
import { Package } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
  showEmptyState?: boolean;
}

/**
 * Product Grid Component
 * Responsive grid layout for tea products
 * Uses Tailwind CSS grid with tea brand styling
 */
export function ProductGrid({
  products,
  columns = 3,
  showEmptyState = true,
}: ProductGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  // Empty state
  if (products.length === 0 && showEmptyState) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 px-4"
      >
        <div className="w-16 h-16 rounded-full bg-ivory-100 
                      flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-tea-500/50" />
        </div>
        <h3 className="font-serif text-xl text-bark-900 mb-2">
          No Teas Found
        </h3>
        <p className="text-bark-700/60 text-center max-w-md">
          We couldn&apos;t find any teas matching your criteria. 
          Try adjusting your filters or browse our full collection.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className={`grid ${gridCols[columns]} gap-6`}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
        />
      ))}
    </motion.div>
  );
}

/**
 * Skeleton loader for product grid
 * Shows while products are loading
 */
export function ProductGridSkeleton({
  columns = 3,
  count = 6,
}: {
  columns?: 2 | 3 | 4;
  count?: number;
}) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-ivory-50 rounded-lg overflow-hidden animate-pulse"
        >
          {/* Image placeholder */}
          <div className="aspect-[4/3] bg-ivory-100" />
          
          {/* Content placeholder */}
          <div className="p-4 space-y-3">
            <div className="h-3 bg-ivory-200 rounded w-1/2" />
            <div className="h-5 bg-ivory-200 rounded w-3/4" />
            <div className="h-3 bg-ivory-200 rounded w-1/3" />
            <div className="h-6 bg-ivory-200 rounded w-1/2 mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}
