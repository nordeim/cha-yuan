"use client";


import { motion } from "framer-motion";
import { Flame, Eye, BookOpen, ArrowRight } from "lucide-react";
import { useReducedMotion } from "../../lib/hooks/use-reduced-motion";
import {
  scrollRevealVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from "@/lib/animations";
import { cn } from "@/lib/utils";

/* ============================================
   TEA CULTURE SECTION
   Dark background with culture cards
   Matches mockup exactly
   ============================================ */

const CULTURE_CARDS = [
  {
    icon: Flame,
    title: "Brewing Methods",
    description:
      "Master the gongfu cha style, learn water temperatures, and discover the perfect steeping times for each tea type.",
    image: "tea-brewing-pour",
    color: "gold",
  },
  {
    icon: Eye,
    title: "Tasting Notes",
    description:
      "Develop your palate with our sensory guide — from visual appreciation to the lingering aftertaste (hui gan).",
    image: "tea-tasting-ceremony",
    color: "tea",
  },
  {
    icon: BookOpen,
    title: "History & Lore",
    description:
      "Journey through 5,000 years of tea — from Shennong's legendary discovery to the Silk Road tea trade.",
    image: "tea-history-ancient",
    color: "terra",
  },
];

const BREWING_TEMPS = [
  { temp: "75°C", type: "White Tea" },
  { temp: "80°C", type: "Green Tea" },
  { temp: "95°C", type: "Oolong Tea" },
  { temp: "100°C", type: "Black & Pu'erh" },
];

export function CultureSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      id="culture"
      className="bg-bark-800 section-spacing relative overflow-hidden"
    >
      {/* Decorative */}
      <div className="absolute top-0 left-0 right-0 h-px gold-line opacity-50" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-tea-900/30 rounded-full blur-[100px]" />
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-gold-500/5 rounded-full blur-[80px]" />

      <div className="container-chayuan">
        {/* Section Header */}
        <motion.div
          initial={prefersReducedMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={scrollRevealVariants}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 text-gold-400 text-xs tracking-[0.3em] uppercase font-medium mb-4">
            <span className="w-6 h-px bg-gold-400" />
            Tea Culture
            <span className="w-6 h-px bg-gold-400" />
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-ivory-100 mb-4">
            The Art of <span className="text-gold-400 italic">Slow Tea</span>
          </h2>
          <p className="text-ivory-400/70 max-w-2xl mx-auto leading-relaxed">
            Discover the rituals, wisdom, and meditative practices that transform
            a simple cup into a moment of profound presence.
          </p>
        </motion.div>

        {/* Culture Grid */}
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-3 gap-8"
        >
          {CULTURE_CARDS.map((card, index) => (
            <motion.div
              key={card.title}
              variants={staggerItemVariants}
              custom={index}
              className="group relative rounded-2xl overflow-hidden cursor-pointer"
            >
              {/* Image */}
              <div className="aspect-[3/4] overflow-hidden">
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(https://picsum.photos/seed/${card.image}/600/800.jpg)`,
                  }}
                />
              </div>
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-bark-900/90 via-bark-900/40 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl backdrop-blur flex items-center justify-center mb-4",
                    card.color === "gold"
                      ? "bg-gold-500/20"
                      : card.color === "tea"
                      ? "bg-tea-500/20"
                      : "bg-terra-400/20"
                  )}
                >
                  <card.icon
                    className={cn(
                      "w-6 h-6",
                      card.color === "gold"
                        ? "text-gold-400"
                        : card.color === "tea"
                        ? "text-tea-400"
                        : "text-terra-300"
                    )}
                  />
                </div>
                <h3 className="font-display text-xl font-semibold text-ivory-100 mb-2">
                  {card.title}
                </h3>
                <p className="text-ivory-300/80 text-sm leading-relaxed mb-4">
                  {card.description}
                </p>
                <span className="inline-flex items-center gap-1 text-gold-400 text-sm font-medium group-hover:gap-2 transition-all">
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Guide Strip */}
        <motion.div
          initial={prefersReducedMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true }}
          variants={scrollRevealVariants}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {BREWING_TEMPS.map((item) => (
            <div
              key={item.type}
              className="text-center p-6 rounded-xl border border-white/10 bg-white/5"
            >
              <span className="font-display text-3xl font-bold text-gold-400">
                {item.temp}
              </span>
              <p className="text-ivory-400/70 text-sm mt-2">{item.type}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default CultureSection;
