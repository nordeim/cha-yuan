"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Product } from "@/lib/types/product";
import { GstBadge } from "./gst-badge";

interface ProductCardProps {
  product: Product;
  index?: number;
}

/**
 * Product Card Component
 * Displays a tea product with Eastern aesthetic
 * Links to product detail page
 */
export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const isNewArrival = product.is_new_arrival;
  const isInStock = product.is_in_stock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group"
    >
      <Link
        href={`/products/${product.slug}`}
        className="block relative bg-ivory-50 rounded-lg overflow-hidden 
                   border border-ivory-300/50 hover:border-tea-500/30
                   transition-all duration-300 hover:shadow-lg hover:shadow-tea-500/5"
        aria-label={`View ${product.name}`}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-ivory-100">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 
                         group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center
                            bg-gradient-to-br from-ivory-100 to-ivory-200">
              <span className="text-tea-500/30 text-4xl">茶</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isNewArrival && (
              <span className="px-2 py-1 bg-gold-500 text-ivory-50 
                             text-xs font-medium rounded">
                New
              </span>
            )}
          </div>

          {!isInStock && (
            <div className="absolute inset-0 bg-ivory-50/80 flex items-center 
                            justify-center backdrop-blur-sm">
              <span className="px-3 py-1.5 bg-bark-800 text-ivory-50 
                               text-sm font-medium rounded">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Category & Origin */}
          <div className="flex items-center gap-2 text-xs text-bark-700/70">
            <span>{product.category.name}</span>
            <span className="text-ivory-400">|</span>
            <span>{product.origin.region}</span>
          </div>

          {/* Name */}
          <h3 className="font-serif text-bark-900 text-lg leading-tight 
                         group-hover:text-tea-700 transition-colors">
            {product.name}
          </h3>

          {/* Weight */}
          <p className="text-xs text-bark-700/60">
            {product.weight_display}
          </p>

          {/* Price */}
          <div className="pt-2 border-t border-ivory-300/50">
            <GstBadge
              price={product.price_sgd}
              gstAmount={product.gst_amount}
              size="md"
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/**
 * Compact Product Card for related products
 */
export function CompactProductCard({
  product,
}: {
  product: Product;
}) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="flex gap-3 p-2 rounded-lg hover:bg-ivory-50 
                 transition-colors group"
    >
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded bg-ivory-100 flex-shrink-0 
                      overflow-hidden relative">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center
                          text-tea-500/30 text-xl">
            茶
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-serif text-bark-900 truncate
                      group-hover:text-tea-700 transition-colors">
          {product.name}
        </h4>
        <p className="text-xs text-bark-700/60 mt-1">
          {product.weight_display}
        </p>
        <p className="text-gold-600 font-semibold text-sm mt-1">
          S${product.price_sgd}
        </p>
      </div>
    </Link>
  );
}
