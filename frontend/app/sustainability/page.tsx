"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Navigation } from "@/components/sections/navigation";
import { Footer } from "@/components/sections/footer";
import {
  Leaf,
  Droplets,
  Sun,
  Heart,
  TreePine,
  Recycle,
  Users,
  Globe,
} from "lucide-react";
import Link from "next/link";

/* ============================================
SUSTAINABILITY PAGE - Environmental Commitment
Our pledge to the earth and future generations
============================================ */

const IMPACT_STATS = [
  { value: "100%", label: "Organic Gardens", description: "All partner gardens certified organic" },
  { value: "40%", label: "Above Market", description: "Premium paid to farmers for quality" },
  { value: "Carbon", label: "Neutral", description: "Shipping offset through reforestation" },
  { value: "Zero", label: "Waste Goal", description: "Commitment to plastic-free by 2026" },
];

const INITIATIVES = [
  {
    icon: TreePine,
    title: "Regenerative Agriculture",
    description:
      "Our partner gardens practice soil regeneration, using compost tea and cover crops to build healthy ecosystems. We never use chemical pesticides or synthetic fertilizers.",
  },
  {
    icon: Droplets,
    title: "Water Stewardship",
    description:
      "Tea processing requires significant water. Our gardens collect rainwater and use closed-loop systems that return clean water to local watersheds.",
  },
  {
    icon: Sun,
    title: "Solar Processing",
    description:
      "We are transitioning all partner facilities to solar-powered withering and drying. Currently, 60% of our teas are processed using renewable energy.",
  },
  {
    icon: Recycle,
    title: "Circular Packaging",
    description:
      "Our tea tins are infinitely recyclable aluminum. Our mailers are biodegradable, and our inner bags are plant-based cellulose, not plastic.",
  },
  {
    icon: Users,
    title: "Fair Partnerships",
    description:
      "We visit every partner garden personally. Long-term contracts give farmers security to invest in quality and sustainability rather than short-term yields.",
  },
  {
    icon: Heart,
    title: "Biodiversity Protection",
    description:
      "Our tea gardens maintain forest buffer zones, providing habitat for native species. Many of our farms are bird-friendly certified.",
  },
];

const CERTIFICATIONS = [
  { name: "USDA Organic", description: "Certified organic cultivation" },
  { name: "Fair Trade Certified", description: "Ethical labor practices" },
  { name: "Rainforest Alliance", description: "Environmental stewardship" },
  { name: "B Corp Pending", description: "Social and environmental performance" },
];

export default function SustainabilityPage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <Navigation />

      <main className="relative">
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-bark-900">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: `url(https://picsum.photos/seed/tea-garden-sustainable/1920/1080.jpg)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-bark-900/80 via-bark-900/60 to-bark-900" />
          </div>

          {/* Content */}
          <div className="relative z-10 container-chayuan text-center pt-32 pb-20">
            <motion.span
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 text-gold-400 text-xs tracking-[0.3em] uppercase font-medium mb-6"
            >
              <Leaf className="w-4 h-4" />
              Our Promise
            </motion.span>

            <motion.h1
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold text-ivory-100 leading-tight mb-6"
            >
              Rooted in
              <br />
              <span className="text-tea-400 italic">Responsibility</span>
            </motion.h1>

            <motion.p
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl text-ivory-400 max-w-2xl mx-auto leading-relaxed"
            >
              Tea is a gift from the earth. We believe in giving back through
              regenerative practices, fair partnerships, and unwavering commitment
              to sustainability.
            </motion.p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-tea-900">
          <div className="container-chayuan">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {IMPACT_STATS.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="font-display text-4xl md:text-5xl font-semibold text-gold-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-ivory-200 font-medium mb-1">{stat.label}</div>
                  <div className="text-ivory-400/70 text-sm">{stat.description}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="paper-texture py-24 md:py-32">
          <div className="container-chayuan">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16"
              >
                <span className="inline-flex items-center gap-2 text-gold-500 text-xs tracking-[0.3em] uppercase font-medium mb-4">
                  <span className="w-6 h-px bg-gold-500" />
                  Philosophy
                  <span className="w-6 h-px bg-gold-500" />
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-bark-800 mb-6">
                  Tea Should Give Back
                </h2>
                <p className="text-bark-700/80 text-lg leading-relaxed">
                  We believe that exceptional tea cannot come at the cost of the
                  environment or the wellbeing of farming communities. Our
                  sustainability approach addresses three pillars: ecological
                  stewardship, fair economics, and cultural preservation.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0 }}
                  className="text-center p-8 rounded-2xl bg-white border border-ivory-300"
                >
                  <div className="w-16 h-16 rounded-full bg-tea-100 flex items-center justify-center mx-auto mb-4">
                    <TreePine className="w-8 h-8 text-tea-600" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-bark-800 mb-2">
                    Planet
                  </h3>
                  <p className="text-bark-700/70">
                    Regenerative practices that restore soil health, protect
                    biodiversity, and combat climate change.
                  </p>
                </motion.div>

                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-center p-8 rounded-2xl bg-white border border-ivory-300"
                >
                  <div className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gold-600" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-bark-800 mb-2">
                    People
                  </h3>
                  <p className="text-bark-700/70">
                    Fair wages, safe conditions, and long-term partnerships that
                    honor the skilled hands behind every leaf.
                  </p>
                </motion.div>

                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-center p-8 rounded-2xl bg-white border border-ivory-300"
                >
                  <div className="w-16 h-16 rounded-full bg-terra-100 flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-terra-600" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-bark-800 mb-2">
                    Culture
                  </h3>
                  <p className="text-bark-700/70">
                    Preserving traditional tea knowledge and supporting the
                    communities that have cultivated tea for centuries.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Initiatives Section */}
        <section className="py-24 md:py-32 bg-ivory-50">
          <div className="container-chayuan">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 text-gold-500 text-xs tracking-[0.3em] uppercase font-medium mb-4">
                <span className="w-6 h-px bg-gold-500" />
                In Action
                <span className="w-6 h-px bg-gold-500" />
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-bark-800">
                Our Initiatives
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {INITIATIVES.map((initiative, index) => (
                <motion.div
                  key={initiative.title}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="p-8 rounded-2xl bg-white border border-ivory-300 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-tea-100 flex items-center justify-center mb-4">
                    <initiative.icon className="w-6 h-6 text-tea-600" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-bark-800 mb-3">
                    {initiative.title}
                  </h3>
                  <p className="text-bark-700/70 text-sm leading-relaxed">
                    {initiative.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Certifications Section */}
        <section className="py-24 md:py-32 bg-bark-900 text-ivory-100">
          <div className="container-chayuan">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 text-gold-400 text-xs tracking-[0.3em] uppercase font-medium mb-4">
                <span className="w-6 h-px bg-gold-400" />
                Trusted
                <span className="w-6 h-px bg-gold-400" />
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-semibold">
                Our Certifications
              </h2>
            </div>

            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {CERTIFICATIONS.map((cert, index) => (
                <motion.div
                  key={cert.name}
                  initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center p-6 rounded-xl bg-bark-800/50 border border-ivory-800"
                >
                  <div className="font-display text-lg font-semibold text-gold-400 mb-1">
                    {cert.name}
                  </div>
                  <div className="text-ivory-400/70 text-sm">{cert.description}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 paper-texture">
          <div className="container-chayuan">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-bark-800 mb-6">
                Taste the Difference
              </h2>
              <p className="text-bark-700/80 text-lg mb-8 leading-relaxed">
                Every purchase supports sustainable agriculture and fair wages for
                farming families. Great tea that does good — that is our promise.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 bg-tea-600 text-white px-8 py-4 rounded-full text-sm font-semibold tracking-wide hover:bg-tea-700 transition-all active:scale-[0.97]"
              >
                Shop Sustainable Teas
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
