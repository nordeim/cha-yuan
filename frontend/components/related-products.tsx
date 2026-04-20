"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Leaf } from "lucide-react";
import { Product } from "@/lib/types/product";
import { CompactProductCard } from "./product-card";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

interface RelatedProductsProps {
  products: Product[];
}

/**
 * Related Products Component
 * Horizontal scrollable carousel of related tea products
 * Eastern tea brand aesthetic with smooth animations
 */
export function RelatedProducts({ products }: RelatedProductsProps) {
  const prefersReducedMotion = useReducedMotion();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) {
    return null;
  }

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = 320; // Card width + gap
    const newScrollLeft = direction === "left"
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <section className="section-spacing border-t border-ivory-300">
      <div className="container-chayuan">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="w-4 h-4 text-tea-600" />
              <span className="text-sm text-tea-600 font-medium uppercase tracking-wide">
                You may also enjoy
              </span>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl text-bark-900">
              Related Teas
            </h2>
          </div>

          {/* Navigation Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="border-ivory-400 hover:border-tea-400 hover:bg-tea-50"
            >
              <ChevronLeft className="w-5 h-5 text-bark-700" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="border-ivory-400 hover:border-tea-400 hover:bg-tea-50"
            >
              <ChevronRight className="w-5 h-5 text-bark-700" />
            </Button>
          </div>
        </div>

        {/* Products Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="flex-shrink-0 w-[280px] md:w-[300px]"
              style={{ scrollSnapAlign: "start" }}
            >
              <CompactProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {/* Mobile Scroll Hint */}
        <div className="md:hidden flex items-center justify-center gap-2 mt-4 text-sm text-bark-500">
          <ChevronLeft className="w-4 h-4" />
          <span>Swipe to see more</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </section>
  );
}
