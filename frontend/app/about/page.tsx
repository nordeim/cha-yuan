"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Navigation } from "@/components/sections/navigation";
import { Footer } from "@/components/sections/footer";
import { Leaf, Award, Globe, Heart } from "lucide-react";
import Link from "next/link";

/* ============================================
OUR STORY PAGE - About CHA YUAN
Heritage, craftsmanship, and journey
============================================ */

const TIMELINE_EVENTS = [
  {
    year: "1892",
    title: "The Beginning",
    description:
      "Founded in the misty mountains of Fujian, our family began cultivating tea with a simple philosophy: honor the leaf, respect the land.",
    icon: Leaf,
  },
  {
    year: "1956",
    title: "Crossing Oceans",
    description:
      "Grandmaster Chen brought our finest oolongs to Singapore, establishing the first CHA YUAN teahouse on Telok Ayer Street.",
    icon: Globe,
  },
  {
    year: "1989",
    title: "Recognition",
    description:
      "Awarded the Golden Leaf Medal for preserving traditional tea processing methods while innovating for modern palates.",
    icon: Award,
  },
  {
    year: "Today",
    title: "A New Chapter",
    description:
      "Now in our fifth generation, we continue to bridge ancient wisdom with contemporary life, serving Singapore's tea community.",
    icon: Heart,
  },
];

const VALUES = [
  {
    title: "Authenticity",
    description:
      "Every tea we sell is traceable to its garden of origin. We work directly with farmers, building relationships spanning decades.",
  },
  {
    title: "Craftsmanship",
    description:
      "Our master tea blenders train for minimum ten years before grading teas. This expertise ensures every cup meets our exacting standards.",
  },
  {
    title: "Sustainability",
    description:
      "We practice regenerative agriculture, paying farmers 40% above market rates to ensure quality and environmental stewardship.",
  },
  {
    title: "Community",
    description:
      "Tea is meant to be shared. We host monthly cupping sessions, teach brewing workshops, and support local cultural initiatives.",
  },
];

export default function AboutPage() {
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
                backgroundImage: `url(https://picsum.photos/seed/tea-mountains-heritage/1920/1080.jpg)`,
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
              <span className="w-8 h-px bg-gold-400" />
              Since 1892
              <span className="w-8 h-px bg-gold-400" />
            </motion.span>

            <motion.h1
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold text-ivory-100 leading-tight mb-6"
            >
              Our Story
            </motion.h1>

            <motion.p
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl text-ivory-400 max-w-2xl mx-auto leading-relaxed"
            >
              Five generations of tea mastery, from the misty mountains of
              Fujian to the heart of Singapore
            </motion.p>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="paper-texture py-24 md:py-32">
          <div className="container-chayuan">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <p className="text-2xl md:text-3xl font-display text-bark-800 leading-relaxed mb-8">
                  <span className="text-gold-500 italic">茶源</span> — Tea
                  Source — is more than a name. It is our promise to honor the
                  origins of every leaf we touch.
                </p>
                <p className="text-bark-700/80 text-lg leading-relaxed">
                  For over 130 years, our family has dedicated itself to the art
                  of tea. We have walked the terraced gardens of Fujian at dawn,
                  watched the first flush being plucked by skilled hands, and
                  learned the ancient processing techniques passed down through
                  generations. This is not merely commerce — it is our heritage,
                  our calling, and our gift to share with you.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-24 md:py-32 bg-ivory-50">
          <div className="container-chayuan">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 text-gold-500 text-xs tracking-[0.3em] uppercase font-medium mb-4">
                <span className="w-6 h-px bg-gold-500" />
                Heritage
                <span className="w-6 h-px bg-gold-500" />
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-bark-800">
                Our Journey
              </h2>
            </div>

            <div className="max-w-4xl mx-auto">
              {TIMELINE_EVENTS.map((event, index) => (
                <motion.div
                  key={event.year}
                  initial={prefersReducedMotion ? {} : { opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="relative flex flex-col md:flex-row gap-8 mb-12 last:mb-0"
                >
                  {/* Year */}
                  <div className="md:w-32 flex-shrink-0">
                    <span className="font-display text-2xl font-semibold text-gold-500">
                      {event.year}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-12 border-b border-ivory-300 last:border-0">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-tea-100 flex items-center justify-center flex-shrink-0">
                        <event.icon className="w-6 h-6 text-tea-600" />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-semibold text-bark-800 mb-2">
                          {event.title}
                        </h3>
                        <p className="text-bark-700/70 leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 md:py-32 bg-bark-900 text-ivory-100 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(https://picsum.photos/seed/tea-pattern/800/800.jpg)`,
                backgroundSize: "400px",
              }}
            />
          </div>

          <div className="container-chayuan relative z-10">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 text-gold-400 text-xs tracking-[0.3em] uppercase font-medium mb-4">
                <span className="w-6 h-px bg-gold-400" />
                Principles
                <span className="w-6 h-px bg-gold-400" />
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-semibold">
                Our Values
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {VALUES.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="p-8 rounded-2xl bg-bark-800/50 border border-ivory-800"
                >
                  <h3 className="font-display text-xl font-semibold text-gold-400 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-ivory-400/80 leading-relaxed">
                    {value.description}
                  </p>
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
                Begin Your Tea Journey
              </h2>
              <p className="text-bark-700/80 text-lg mb-8 leading-relaxed">
                Experience the heritage and craftsmanship that define CHA YUAN.
                Every cup is an invitation to slow down and savor the moment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 bg-tea-600 text-white px-8 py-4 rounded-full text-sm font-semibold tracking-wide hover:bg-tea-700 transition-all active:scale-[0.97]"
                >
                  Explore Our Teas
                </Link>
                <Link
                  href="/sustainability"
                  className="inline-flex items-center justify-center gap-2 border-2 border-bark-800 text-bark-800 px-8 py-4 rounded-full text-sm font-semibold tracking-wide hover:bg-bark-800 hover:text-white transition-all"
                >
                  Our Commitment
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
