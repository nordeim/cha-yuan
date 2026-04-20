"use client";


import { motion } from "framer-motion";
import { ArrowRight, Leaf } from "lucide-react";
import { useReducedMotion } from "../../lib/hooks/use-reduced-motion";
import {
  fadeUpVariants,
  fadeVariants,
  floatVariants,
  DELAY_VALUES,
} from "@/lib/animations";
import Link from "next/link";

/* ============================================
   HERO SECTION
   Serene entrance with floating leaves
   Matches mockup exactly
   ============================================ */

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-end overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(https://picsum.photos/seed/teagarden-misty/1920/1080.jpg)`,
          }}
        />
        {/* Overlays */}
        <div className="hero-overlay absolute inset-0 hidden md:block" />
        <div className="hero-overlay-mobile absolute inset-0 md:hidden" />
      </div>

      {/* Floating Tea Leaves Decoration */}
      {!prefersReducedMotion && (
        <>
          <motion.div
            initial={floatVariants.initial as { y: number; rotate: number }}
            animate={floatVariants.animate as { y: number[]; rotate: number[] }}
            transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
            className="absolute top-32 right-16 opacity-20 hidden lg:block"
          >
            <Leaf className="w-16 h-16 text-tea-300 rotate-45" />
          </motion.div>
          <motion.div
            initial={floatVariants.initial as { y: number; rotate: number }}
            animate={floatVariants.animate as { y: number[]; rotate: number[] }}
            transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, delay: 1 }}
            className="absolute top-48 right-48 opacity-10 hidden lg:block"
          >
            <Leaf className="w-12 h-12 text-tea-200 -rotate-12" />
          </motion.div>
        </>
      )}

      {/* Hero Content */}
      <div className="relative z-10 w-full container-chayuan pb-20 md:pb-28 pt-32">
        <div className="max-w-2xl">
          {/* Since 1892 Badge */}
          <motion.div
            initial={prefersReducedMotion ? "visible" : "hidden"}
            animate="visible"
            variants={fadeUpVariants}
            transition={{ delay: DELAY_VALUES[200] }}
            className="opacity-0"
          >
            <span className="inline-flex items-center gap-2 text-gold-400 text-xs tracking-[0.3em] uppercase font-medium mb-6">
              <span className="w-8 h-px bg-gold-400" />
              Since 1892
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={prefersReducedMotion ? "visible" : "hidden"}
            animate="visible"
            variants={fadeUpVariants}
            transition={{ delay: DELAY_VALUES[400] }}
            className="opacity-0 font-display text-4xl md:text-6xl lg:text-7xl font-semibold text-ivory-50 leading-[1.1] tracking-tight mb-6"
          >
            Where Ancient
            <br />
            <span className="text-gold-400 italic">Tea Wisdom</span>
            <br />
            Meets Modern Life
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={prefersReducedMotion ? "visible" : "hidden"}
            animate="visible"
            variants={fadeUpVariants}
            transition={{ delay: DELAY_VALUES[600] }}
            className="opacity-0 text-ivory-300 text-base md:text-lg leading-relaxed mb-10 max-w-lg"
          >
            From the misty peaks of Yunnan to your cup — we curate the finest
            single-origin teas, honoring centuries of tradition while embracing
            the rhythm of contemporary living.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={prefersReducedMotion ? "visible" : "hidden"}
            animate="visible"
            variants={fadeUpVariants}
            transition={{ delay: DELAY_VALUES[800] }}
            className="opacity-0 flex flex-wrap gap-4"
          >
            <Link
              href="#collection"
              className="inline-flex items-center gap-2 bg-gold-500 text-bark-900 px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide hover:bg-gold-400 transition-all active:scale-[0.97]"
            >
              Explore Our Teas
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#culture"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-ivory-100 px-8 py-3.5 rounded-full text-sm font-medium tracking-wide border border-white/20 hover:bg-white/20 transition-all active:scale-[0.97]"
            >
              Tea Ceremony
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        {!prefersReducedMotion && (
          <motion.div
            initial={prefersReducedMotion ? "visible" : "hidden"}
            animate="visible"
            variants={fadeVariants}
            transition={{ delay: DELAY_VALUES[1200] }}
            className="opacity-0 absolute bottom-8 right-8 hidden md:flex flex-col items-center gap-2"
          >
            <span className="text-ivory-400 text-[10px] tracking-[0.2em] uppercase rotate-90 mb-8">
              Scroll
            </span>
            <div className="w-px h-16 bg-gradient-to-b from-gold-400 to-transparent" />
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default HeroSection;
