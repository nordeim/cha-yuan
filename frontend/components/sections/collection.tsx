"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useReducedMotion } from "../../lib/hooks/use-reduced-motion";
import {
  scrollRevealVariants,
  staggerContainerVariants,
  staggerItemVariants,
  imageHoverVariants,
} from "@/lib/animations";
import { cn } from "@/lib/utils";
import Link from "next/link";

/* ============================================
   COLLECTION SECTION
   Product tabs with tea cards
   Matches mockup exactly
   ============================================ */

type TabId = "by-origin" | "by-ferment" | "by-season";

const TABS: { id: TabId; label: string }[] = [
  { id: "by-origin", label: "By Origin" },
  { id: "by-ferment", label: "Fermentation" },
  { id: "by-season", label: "By Season" },
];

const ORIGIN_TEAS = [
  {
    name: "Yunnan Pu'erh",
    category: "Dark · Post-Fermented",
    description: "Earthy depth from ancient tea trees, 2019 vintage",
    price: 48,
    size: "50g · Loose Leaf",
    color: "bark",
    image: "yunnan-puerh-tea",
  },
  {
    name: "Longjing Dragon Well",
    category: "Green · Unoxidized",
    description: "Pan-fired sweetness from Hangzhou's West Lake",
    price: 62,
    size: "40g · Loose Leaf",
    color: "tea",
    image: "longjing-green",
  },
  {
    name: "Wuyi Rock Oolong",
    category: "Oolong · Semi-Oxidized",
    description: "Mineral complexity from Fujian's cliff gardens",
    price: 55,
    size: "45g · Loose Leaf",
    color: "terra",
    image: "oolong-wuyi",
  },
  {
    name: "Darjeeling First Flush",
    category: "Black · Fully Oxidized",
    description: "Muscatel floral notes from Himalayan slopes",
    price: 42,
    size: "50g · Loose Leaf",
    color: "terra",
    image: "darjeeling-first",
  },
];

const FERMENT_TEAS = [
  {
    type: "White",
    sub: "Delicate · 0% Oxidation",
    name: "Silver Needle",
    price: 58,
    size: "30g",
    gradient: "from-tea-200 to-tea-400",
  },
  {
    type: "Green",
    sub: "Fresh · 0-5% Oxidation",
    name: "Dragon Well",
    price: 62,
    size: "40g",
    gradient: "from-tea-300 to-tea-500",
  },
  {
    type: "Oolong",
    sub: "Complex · 15-70%",
    name: "Tie Guan Yin",
    price: 45,
    size: "50g",
    gradient: "from-terra-300 to-terra-500",
  },
  {
    type: "Black",
    sub: "Rich · 100% Oxidation",
    name: "Lapsang Souchong",
    price: 38,
    size: "50g",
    gradient: "from-terra-400 to-bark-700",
  },
  {
    type: "Pu'erh",
    sub: "Deep · Post-Fermented",
    name: "Raw Pu'erh 2018",
    price: 72,
    size: "50g",
    gradient: "from-bark-700 to-bark-900",
  },
];

const SEASON_TEAS = [
  {
    season: "Spring",
    months: "March — May",
    description: "First flush, delicate and vibrant. The most prized harvest of the year.",
    icon: "🌱",
    items: [
      { name: "Dragon Well", price: 62 },
      { name: "Bai Hao Yin Zhen", price: 58 },
      { name: "Shincha", price: 54 },
    ],
    color: "tea",
  },
  {
    season: "Summer",
    months: "June — August",
    description: "Full-bodied and robust. Warm weather brings deeper flavor profiles.",
    icon: "☀️",
    items: [
      { name: "Darjeeling 2nd", price: 38 },
      { name: "Assam BOP", price: 28 },
      { name: "Oriental Beauty", price: 66 },
    ],
    color: "gold",
  },
  {
    season: "Autumn",
    months: "September — November",
    description: "Rich and aromatic. Cool nights concentrate complex flavors in the leaf.",
    icon: "🍂",
    items: [
      { name: "Tie Guan Yin", price: 45 },
      { name: "Wuyi Rock", price: 55 },
      { name: "Dian Hong", price: 35 },
    ],
    color: "terra",
  },
  {
    season: "Winter",
    months: "December — February",
    description: "Warming and grounding. Aged teas and roasted oolongs for cozy moments.",
    icon: "❄️",
    items: [
      { name: "Ripe Pu'erh", price: 48 },
      { name: "Hojicha", price: 24 },
      { name: "Chai Masala", price: 22 },
    ],
    color: "bark",
  },
];

function OriginTab() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
{ORIGIN_TEAS.map((tea) => (
          <motion.div
            key={tea.name}
            variants={staggerItemVariants}
            {...(!prefersReducedMotion && { whileHover: "hover" })}
            className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white border border-ivory-300 hover:border-gold-400 transition-all hover:shadow-lg"
          >
          {/* Image */}
          <div className="aspect-[3/4] overflow-hidden">
            <motion.div
              variants={imageHoverVariants}
              initial="initial"
              whileHover="hover"
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(https://picsum.photos/seed/${tea.image}/600/800.jpg)`,
              }}
            />
          </div>
          {/* Content */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  tea.color === "bark"
                    ? "bg-bark-800"
                    : tea.color === "tea"
                    ? "bg-tea-500"
                    : "bg-terra-400"
                )}
              />
              <span className="text-[10px] tracking-[0.2em] uppercase text-bark-700/60 font-medium">
                {tea.category}
              </span>
            </div>
            <h3 className="font-display text-lg font-semibold text-bark-800 mb-1">
              {tea.name}
            </h3>
            <p className="text-sm text-bark-700/70 leading-relaxed mb-3">
              {tea.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-semibold text-gold-600">
                ${tea.price}
              </span>
              <span className="text-xs text-bark-700/50">{tea.size}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function FermentTab() {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-5 gap-6"
    >
      {FERMENT_TEAS.map((tea) => (
        <motion.div
          key={tea.name}
          variants={staggerItemVariants}
          className="text-center group cursor-pointer"
        >
          <div
            className={cn(
              "relative rounded-2xl overflow-hidden mb-4 aspect-[3/4] flex items-end justify-center bg-gradient-to-b",
              tea.gradient
            )}
          >
            <div className="p-6 text-white">
              <span className="font-display text-2xl font-bold">{tea.type}</span>
              <p className="text-xs opacity-80 mt-1">{tea.sub}</p>
            </div>
          </div>
          <h4 className="font-display font-semibold text-bark-800">{tea.name}</h4>
          <p className="text-sm text-gold-500 font-medium mt-1">
            ${tea.price} / {tea.size}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}

function SeasonTab() {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {SEASON_TEAS.map((season) => (
        <motion.div
          key={season.season}
          variants={staggerItemVariants}
          className="group bg-white rounded-2xl p-6 border border-ivory-300 transition-all cursor-pointer hover:border-gold-400 hover:-translate-y-1.5 hover:shadow-xl"
        >
          <div
            className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors",
              season.color === "tea"
                ? "bg-tea-100 group-hover:bg-tea-200"
                : season.color === "gold"
                ? "bg-gold-300/20 group-hover:bg-gold-300/30"
                : season.color === "terra"
                ? "bg-terra-300/20 group-hover:bg-terra-300/30"
                : "bg-bark-700/10 group-hover:bg-bark-700/20"
            )}
          >
            <span className="text-2xl">{season.icon}</span>
          </div>
          <h3 className="font-display text-xl font-semibold text-bark-800 mb-1">
            {season.season}
          </h3>
          <p
            className={cn(
              "text-xs font-medium tracking-wide mb-3",
              season.color === "tea"
                ? "text-tea-600"
                : season.color === "gold"
                ? "text-gold-500"
                : season.color === "terra"
                ? "text-terra-500"
                : "text-bark-700/60"
            )}
          >
            {season.months}
          </p>
          <p className="text-sm text-bark-700/70 leading-relaxed mb-4">
            {season.description}
          </p>
          <div className="space-y-2">
            {season.items.map((item) => (
              <div key={item.name} className="flex justify-between text-sm">
                <span className="text-bark-700/80">{item.name}</span>
                <span className="text-gold-500 font-medium">${item.price}</span>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function CollectionSection() {
  const prefersReducedMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<TabId>("by-origin");

  return (
    <section id="collection" className="bg-ivory-50 section-spacing relative">
      <div className="absolute top-0 left-0 right-0 h-px gold-line opacity-30" />

      <div className="container-chayuan">
        {/* Section Header */}
        <motion.div
          initial={prefersReducedMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={scrollRevealVariants}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-gold-500 text-xs tracking-[0.3em] uppercase font-medium mb-4">
            <span className="w-6 h-px bg-gold-500" />
            Our Collection
            <span className="w-6 h-px bg-gold-500" />
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-semibold text-bark-800 mb-4">
            Curated by <span className="text-tea-600 italic">Nature</span>
          </h2>
          <p className="text-bark-700/70 max-w-2xl mx-auto leading-relaxed">
            Explore our selection of premium teas, each telling the story of its
            terroir, season, and the artisan hands that crafted it.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={prefersReducedMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true }}
          variants={scrollRevealVariants}
          className="flex flex-wrap justify-center gap-2 mb-12 border-b border-ivory-400 pb-0"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-6 py-3 text-sm font-medium tracking-wide border-b-2 border-transparent transition-all",
                activeTab === tab.id
                  ? "text-bark-800 border-gold-500"
                  : "text-bark-700/60 hover:text-bark-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "by-origin" && <OriginTab />}
            {activeTab === "by-ferment" && <FermentTab />}
            {activeTab === "by-season" && <SeasonTab />}
          </motion.div>
        </AnimatePresence>

        {/* View All Link */}
        <motion.div
          initial={prefersReducedMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true }}
          variants={scrollRevealVariants}
          className="text-center mt-12"
        >
          <Link
            href="#shop"
            className="inline-flex items-center gap-2 text-gold-500 font-medium hover:text-gold-600 transition-colors group"
          >
            View Full Collection
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default CollectionSection;
