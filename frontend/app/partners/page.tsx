"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Navigation } from "@/components/sections/navigation";
import { Footer } from "@/components/sections/footer";
import { MapPin, Leaf, Award, Clock } from "lucide-react";
import Link from "next/link";

/* ============================================
PARTNER GARDENS PAGE - Our Tea Origins
Showcase of our direct-trade partnerships
============================================ */

const PARTNER_GARDENS = [
  {
    id: 1,
    name: "Cloud Terrace Estate",
    location: "Wuyi Mountains, Fujian, China",
    region: "Fujian",
    elevation: "800-1,200m",
    established: "1842",
    specialty: "Rock Oolongs",
    description:
      "Nestled in the UNESCO World Heritage Wuyi Mountains, Cloud Terrace has cultivated Yan Cha (Rock Tea) for six generations. Their Da Hong Pao is legendary among connoisseurs.",
    practices: ["Traditional charcoal roasting", "Hand-picked", "Stone terroir"],
    image: "https://picsum.photos/seed/wuyi-mountains/800/600.jpg",
    featured: true,
  },
  {
    id: 2,
    name: "Dragon Well Heritage",
    location: "West Lake, Hangzhou, China",
    region: "Zhejiang",
    elevation: "150-300m",
    established: "1920",
    specialty: "Longjing Green Tea",
    description:
      "One of the original eight farms authorized to produce authentic Xi Hu Longjing. Their pre-Qingming first flush commands the highest prices at auction.",
    practices: ["Hand-pressed", "Traditional firing pans", "Spring harvest only"],
    image: "https://picsum.photos/seed/west-lake/800/600.jpg",
    featured: true,
  },
  {
    id: 3,
    name: "Mist Valley Plantation",
    location: "Alishan, Taiwan",
    region: "Taiwan",
    elevation: "1,200-1,500m",
    established: "1968",
    specialty: "High Mountain Oolongs",
    description:
      "At elevation where clouds kiss the tea bushes daily, Mist Valley produces ethereal Gao Shan teas with naturally sweet profiles and creamy textures.",
    practices: ["Winter dormant harvest", "Cold processing", "Organic certified"],
    image: "https://picsum.photos/seed/alishan/800/600.jpg",
    featured: false,
  },
  {
    id: 4,
    name: "Ancient Tree Gardens",
    location: "Xishuangbanna, Yunnan, China",
    region: "Yunnan",
    elevation: "1,400-1,800m",
    established: "Traditional lands",
    specialty: "Ancient Tree Pu'erh",
    description:
      "Working with 300-800 year old tea trees on lands stewarded by the Dai people for centuries. Each cake tells a story of ancient forests.",
    practices: ["Wild forest harvest", "Sun-dried", "Traditional fermentation"],
    image: "https://picsum.photos/seed/yunnan-forest/800/600.jpg",
    featured: true,
  },
  {
    id: 5,
    name: "Silver Needle Heights",
    location: "Fuding, Fujian, China",
    region: "Fujian",
    elevation: "600-900m",
    established: "1956",
    specialty: "White Teas",
    description:
      "The birthplace of Bai Hao Yin Zhen (Silver Needle). Their white teas are aged in clay vessels, developing extraordinary complexity over decades.",
    practices: ["Withered under moonlight", "Natural drying", "Aged storage"],
    image: "https://picsum.photos/seed/fuding/800/600.jpg",
    featured: false,
  },
  {
    id: 6,
    name: "Himalayan Dawn Estate",
    location: "Darjeeling, India",
    region: "India",
    elevation: "1,800-2,000m",
    established: "1888",
    specialty: "First Flush Darjeeling",
    description:
      "A legacy estate producing the Champagne of Teas. Their first flush muscatel is sought after by collectors worldwide.",
    practices: ["Orthodox rolling", "Seasonal harvest", "Rainforest Alliance"],
    image: "https://picsum.photos/seed/darjeeling/800/600.jpg",
    featured: false,
  },
];

const TRADING_PRINCIPLES = [
  {
    title: "Direct Relationships",
    description:
      "We visit every partner garden annually, building personal connections with farmers and their families that span decades.",
  },
  {
    title: "Fair Pricing",
    description:
      "We pay 40% above market rates, ensuring farmers can invest in quality, sustainability, and their communities.",
  },
  {
    title: "Long-term Contracts",
    description:
      "Multi-year agreements give farmers security to make sustainable decisions rather than chasing short-term yields.",
  },
  {
    title: "Knowledge Exchange",
    description:
      "We bring modern techniques to traditional gardens while learning ancient wisdom that has sustained tea culture for millennia.",
  },
];

export default function PartnersPage() {
  const prefersReducedMotion = useReducedMotion();
  const featuredGardens = PARTNER_GARDENS.filter((g) => g.featured);
  const otherGardens = PARTNER_GARDENS.filter((g) => !g.featured);

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
                backgroundImage: `url(https://picsum.photos/seed/tea-garden-aerial/1920/1080.jpg)`,
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
              <MapPin className="w-4 h-4" />
              Direct Trade
            </motion.span>

            <motion.h1
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold text-ivory-100 leading-tight mb-6"
            >
              Partner
              <br />
              <span className="text-tea-400 italic">Gardens</span>
            </motion.h1>

            <motion.p
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl text-ivory-400 max-w-2xl mx-auto leading-relaxed"
            >
              We work directly with legendary tea gardens across Asia, building
              lasting relationships with the artisans who craft the world's
              finest teas.
            </motion.p>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="paper-texture py-24 md:py-32">
          <div className="container-chayuan">
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto text-center mb-16"
            >
              <span className="inline-flex items-center gap-2 text-gold-500 text-xs tracking-[0.3em] uppercase font-medium mb-4">
                <span className="w-6 h-px bg-gold-500" />
                Our Approach
                <span className="w-6 h-px bg-gold-500" />
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-bark-800 mb-6">
                From Garden to Cup
              </h2>
              <p className="text-bark-700/80 text-lg leading-relaxed">
                Every tea in our collection can be traced to a specific garden, a
                specific harvest, and specific hands. This transparency is not
                just good business — it is our moral commitment to honor the
                people and places behind every leaf.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {TRADING_PRINCIPLES.map((principle, index) => (
                <motion.div
                  key={principle.title}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center p-6 rounded-2xl bg-white border border-ivory-300"
                >
                  <h3 className="font-display text-lg font-semibold text-bark-800 mb-3">
                    {principle.title}
                  </h3>
                  <p className="text-bark-700/70 text-sm leading-relaxed">
                    {principle.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Gardens Section */}
        <section className="py-24 md:py-32 bg-ivory-50">
          <div className="container-chayuan">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 text-gold-500 text-xs tracking-[0.3em] uppercase font-medium mb-4">
                <span className="w-6 h-px bg-gold-500" />
                Featured
                <span className="w-6 h-px bg-gold-500" />
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-bark-800">
                Legendary Gardens
              </h2>
            </div>

            <div className="space-y-16 max-w-6xl mx-auto">
              {featuredGardens.map((garden, index) => (
                <motion.div
                  key={garden.id}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className={`grid md:grid-cols-2 gap-8 lg:gap-12 items-center ${
                    index % 2 === 1 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Image */}
                  <div className={index % 2 === 1 ? "md:order-2" : ""}>
                    <div className="rounded-2xl overflow-hidden shadow-lg">
                      <div
                        className="w-full aspect-[4/3] bg-cover bg-center"
                        style={{ backgroundImage: `url(${garden.image})` }}
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className={index % 2 === 1 ? "md:order-1" : ""}>
                    <div className="flex items-center gap-2 text-tea-600 text-sm font-medium mb-3">
                      <MapPin className="w-4 h-4" />
                      {garden.location}
                    </div>

                    <h3 className="font-display text-2xl md:text-3xl font-semibold text-bark-800 mb-4">
                      {garden.name}
                    </h3>

                    <p className="text-bark-700/80 mb-6 leading-relaxed">
                      {garden.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-2 text-sm text-bark-700">
                        <Clock className="w-4 h-4 text-gold-500" />
                        <span>Est. {garden.established}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-bark-700">
                        <Award className="w-4 h-4 text-gold-500" />
                        <span>{garden.elevation}</span>
                      </div>
                    </div>

                    <div className="mb-6">
                      <span className="text-xs text-bark-600 font-medium uppercase tracking-wide">
                        Signature:
                      </span>
                      <span className="text-sm text-bark-700 ml-2">
                        {garden.specialty}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {garden.practices.map((practice) => (
                        <span
                          key={practice}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-tea-100 text-tea-700 text-xs font-medium"
                        >
                          <Leaf className="w-3 h-3" />
                          {practice}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Other Gardens Grid */}
        <section className="py-24 md:py-32 paper-texture">
          <div className="container-chayuan">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 text-gold-500 text-xs tracking-[0.3em] uppercase font-medium mb-4">
                <span className="w-6 h-px bg-gold-500" />
                Extended Family
                <span className="w-6 h-px bg-gold-500" />
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-bark-800">
                More Partner Gardens
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {otherGardens.map((garden, index) => (
                <motion.div
                  key={garden.id}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group rounded-2xl overflow-hidden bg-white border border-ivory-300 hover:shadow-lg transition-all"
                >
                  <div
                    className="w-full aspect-[16/10] bg-cover bg-center"
                    style={{ backgroundImage: `url(${garden.image})` }}
                  />
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-tea-600 text-xs font-medium mb-2">
                      <MapPin className="w-3 h-3" />
                      {garden.region}
                    </div>
                    <h3 className="font-display text-lg font-semibold text-bark-800 mb-2">
                      {garden.name}
                    </h3>
                    <p className="text-bark-700/70 text-sm mb-4 line-clamp-2">
                      {garden.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {garden.practices.slice(0, 2).map((practice) => (
                        <span
                          key={practice}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ivory-100 text-bark-700 text-xs"
                        >
                          {practice}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 bg-bark-900 text-ivory-100 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(https://picsum.photos/seed/tea-leaves-pattern/800/800.jpg)`,
                backgroundSize: "400px",
              }}
            />
          </div>

          <div className="container-chayuan relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-display text-3xl md:text-4xl font-semibold mb-6">
                Taste the Terroir
              </h2>
              <p className="text-ivory-400 text-lg mb-8 leading-relaxed">
                Each garden imparts its unique character to the teas it produces.
                Explore our collection and discover the distinctive flavors of
                these legendary origins.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 bg-gold-500 text-bark-900 px-8 py-4 rounded-full text-sm font-semibold tracking-wide hover:bg-gold-400 transition-all active:scale-[0.97]"
              >
                Explore Teas by Origin
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
