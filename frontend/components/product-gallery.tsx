"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";

interface ProductGalleryProps {
  images: string[];
  alt: string;
  fallbackImage: string | null;
}

/**
 * Product Gallery Component
 * Image carousel with thumbnails
 * Eastern tea brand aesthetic
 */
export function ProductGallery({ images, alt, fallbackImage }: ProductGalleryProps) {
  const prefersReducedMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Use fallback if no images array or empty
  const displayImages = images.length > 0
    ? images
    : fallbackImage
    ? [fallbackImage]
    : [];

  const hasImages = displayImages.length > 0;
  const hasMultipleImages = displayImages.length > 1;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  // Placeholder when no images
  if (!hasImages) {
    return (
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-ivory-200">
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-tea-500/30 text-8xl mb-4">茶</span>
          <p className="text-bark-500/50 text-sm">No image available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-ivory-100 border border-ivory-300">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? {} : { opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 cursor-zoom-in"
            onClick={() => setIsZoomed(true)}
          >
            <Image
              src={displayImages[currentIndex] || "/images/tea-placeholder.png"}
              alt={`${alt} - Image ${currentIndex + 1}`}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            {/* Zoom indicator */}
            <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <ZoomIn className="w-5 h-5 text-bark-700" />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-bark-700" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-bark-700" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {hasMultipleImages && (
          <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur rounded-full text-sm text-bark-700">
            {currentIndex + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultipleImages && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {displayImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              onClick={() => goToIndex(index)}
              className={cn(
                "relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                index === currentIndex
                  ? "border-tea-500 ring-2 ring-tea-500/20"
                  : "border-transparent hover:border-ivory-400"
              )}
              aria-label={`Go to image ${index + 1}`}
              aria-current={index === currentIndex ? "true" : "false"}
            >
              <Image
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setIsZoomed(false)}
          >
            {/* Close button */}
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label="Close zoom"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Zoomed Image */}
            <div className="relative w-full h-full max-w-5xl max-h-screen">
              <Image
                src={displayImages[currentIndex] || "/images/tea-placeholder.png"}
                alt={`${alt} - Zoomed view`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            {/* Navigation in zoom */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
