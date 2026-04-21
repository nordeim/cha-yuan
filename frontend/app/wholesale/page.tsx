"use client";

import { useState, FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Navigation } from "@/components/sections/navigation";
import { Footer } from "@/components/sections/footer";
import {
  Building2,
  Users,
  Truck,
  Award,
  CheckCircle,
  Send,
  Coffee,
  Store,
  Utensils,
  Briefcase,
} from "lucide-react";
import Link from "next/link";

/* ============================================
WHOLESALE PAGE - B2B Inquiries
Partner with CHA YUAN for your business
============================================ */

const BENEFITS = [
  {
    icon: Award,
    title: "Premium Quality",
    description:
      "Access our full catalog of single-origin teas, each traceable to specific gardens and harvest dates.",
  },
  {
    icon: Truck,
    title: "Reliable Supply",
    description:
      "Consistent availability with forecasting support. Never worry about stockouts during peak seasons.",
  },
  {
    icon: Users,
    title: "Training & Support",
    description:
      "Complimentary staff training on tea knowledge, brewing techniques, and customer education.",
  },
  {
    icon: Building2,
    title: "Custom Solutions",
    description:
      "Private labeling, custom blends, and exclusive sourcing options for established partners.",
  },
];

const BUSINESS_TYPES = [
  { icon: Coffee, label: "Cafés & Coffee Shops", description: "Enhance your menu with premium tea offerings" },
  { icon: Utensils, label: "Restaurants", description: "Elevate your dining experience with curated tea pairings" },
  { icon: Store, label: "Retailers", description: "Stock your shelves with Singapore's finest teas" },
  { icon: Building2, label: "Hotels & Spas", description: "Delight guests with in-room tea amenities" },
  { icon: Briefcase, label: "Corporate Gifting", description: "Custom branded gifts for clients and employees" },
];

const MINIMUM_ORDERS = [
  { category: "Loose Leaf Teas", minimum: "2 kg per variety" },
  { category: "Tea Bags", minimum: "1,000 units" },
  { category: "Gift Sets", minimum: "50 sets" },
  { category: "Custom Blends", minimum: "5 kg" },
];

const TESTIMONIALS = [
  {
    quote:
      "CHA YUAN has transformed our tea program. Their quality is unmatched, and the training they provided our baristas was invaluable.",
    author: "Sarah Chen",
    role: "Owner, The Garden Café",
    location: "Tiong Bahru, Singapore",
  },
  {
    quote:
      "Our customers constantly ask about the tea we serve. CHA YUAN's single-origin selection has become a key differentiator for us.",
    author: "Michael Tan",
    role: "Director, Azure Hospitality Group",
    location: "Marina Bay, Singapore",
  },
];

export default function WholesalePage() {
  const prefersReducedMotion = useReducedMotion();
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    businessType: "",
    estimatedVolume: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset after 5 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        businessName: "",
        contactName: "",
        email: "",
        phone: "",
        businessType: "",
        estimatedVolume: "",
        message: "",
      });
    }, 5000);
  };

  return (
    <>
      <Navigation />

      <main className="relative">
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-bark-900">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `url(https://picsum.photos/seed/tea-wholesale/1920/1080.jpg)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-bark-900/80 via-bark-900/70 to-bark-900" />
          </div>

          {/* Content */}
          <div className="relative z-10 container-chayuan text-center pt-32 pb-20">
            <motion.span
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 text-gold-400 text-xs tracking-[0.3em] uppercase font-medium mb-6"
            >
              <Building2 className="w-4 h-4" />
              Business Partnerships
            </motion.span>

            <motion.h1
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold text-ivory-100 leading-tight mb-6"
            >
              Wholesale
              <br />
              <span className="text-tea-400 italic">Inquiry</span>
            </motion.h1>

            <motion.p
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl text-ivory-400 max-w-2xl mx-auto leading-relaxed mb-8"
            >
              Partner with CHA YUAN to serve Singapore's finest teas in your
              café, restaurant, hotel, or retail establishment.
            </motion.p>

            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <a
                href="#inquiry"
                className="inline-flex items-center justify-center gap-2 bg-gold-500 text-bark-900 px-8 py-4 rounded-full text-sm font-semibold tracking-wide hover:bg-gold-400 transition-all active:scale-[0.97]"
              >
                Request Wholesale Account
                <Send className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="paper-texture py-24 md:py-32">
          <div className="container-chayuan">
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <span className="inline-flex items-center gap-2 text-gold-500 text-xs tracking-[0.3em] uppercase font-medium mb-4">
                <span className="w-6 h-px bg-gold-500" />
                Why Partner
                <span className="w-6 h-px bg-gold-500" />
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-bark-800">
                Wholesale Benefits
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {BENEFITS.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center p-8 rounded-2xl bg-white border border-ivory-300 hover:shadow-lg transition-shadow"
                >
                  <div className="w-14 h-14 rounded-full bg-tea-100 flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-7 h-7 text-tea-600" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-bark-800 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-bark-700/70 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Business Types Section */}
        <section className="py-24 md:py-32 bg-ivory-50">
          <div className="container-chayuan">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 max-w-6xl mx-auto">
              {/* Left: Business Types */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <span className="inline-flex items-center gap-2 text-gold-500 text-xs tracking-[0.3em] uppercase font-medium mb-4">
                  <span className="w-6 h-px bg-gold-500" />
                  Who We Serve
                  <span className="w-6 h-px bg-gold-500" />
                </span>
                <h2 className="font-display text-3xl font-semibold text-bark-800 mb-6">
                  Perfect For Your Business
                </h2>
                <p className="text-bark-700/80 mb-8 leading-relaxed">
                  Whether you run a cozy café, a fine dining restaurant, or a
                  boutique hotel, we have flexible solutions to meet your needs.
                </p>

                <div className="space-y-4">
                  {BUSINESS_TYPES.map((type, index) => (
                    <motion.div
                      key={type.label}
                      initial={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white border border-ivory-300"
                    >
                      <div className="w-10 h-10 rounded-lg bg-tea-100 flex items-center justify-center flex-shrink-0">
                        <type.icon className="w-5 h-5 text-tea-600" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-bark-800">
                          {type.label}
                        </h3>
                        <p className="text-bark-700/70 text-sm">{type.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Right: Minimum Orders */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div className="p-8 rounded-2xl bg-bark-900 text-ivory-100">
                  <h3 className="font-display text-xl font-semibold mb-2">
                    Minimum Order Quantities
                  </h3>
                  <p className="text-ivory-400/70 mb-6">
                    Competitive pricing with reasonable minimums for businesses of
                    all sizes.
                  </p>

                  <div className="space-y-4">
                    {MINIMUM_ORDERS.map((item) => (
                      <div
                        key={item.category}
                        className="flex justify-between items-center py-3 border-b border-ivory-800 last:border-0"
                      >
                        <span className="text-ivory-300">{item.category}</span>
                        <span className="text-gold-400 font-medium">
                          {item.minimum}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 rounded-2xl bg-tea-900 text-ivory-100">
                  <h3 className="font-display text-xl font-semibold mb-2">
                    Volume Discounts
                  </h3>
                  <p className="text-ivory-400/70 mb-4">
                    The more you order, the more you save. Our tiered pricing
                    rewards growing partnerships.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-ivory-400">$500 - $1,999</span>
                      <span className="text-tea-400">15% off retail</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ivory-400">$2,000 - $4,999</span>
                      <span className="text-tea-400">25% off retail</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ivory-400">$5,000+</span>
                      <span className="text-tea-400">35% off retail</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
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
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 text-gold-400 text-xs tracking-[0.3em] uppercase font-medium mb-4">
                <span className="w-6 h-px bg-gold-400" />
                Testimonials
                <span className="w-6 h-px bg-gold-400" />
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-semibold">
                What Our Partners Say
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {TESTIMONIALS.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="p-8 rounded-2xl bg-bark-800/50 border border-ivory-800"
                >
                  <p className="text-ivory-300/90 text-lg leading-relaxed mb-6 italic">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <p className="font-display font-semibold text-gold-400">
                      {testimonial.author}
                    </p>
                    <p className="text-ivory-400/70 text-sm">{testimonial.role}</p>
                    <p className="text-ivory-500/50 text-xs">{testimonial.location}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Inquiry Form Section */}
        <section id="inquiry" className="py-24 md:py-32 paper-texture">
          <div className="container-chayuan">
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto"
            >
              <div className="text-center mb-12">
                <span className="inline-flex items-center gap-2 text-gold-500 text-xs tracking-[0.3em] uppercase font-medium mb-4">
                  <span className="w-6 h-px bg-gold-500" />
                  Get Started
                  <span className="w-6 h-px bg-gold-500" />
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-bark-800 mb-4">
                  Request a Wholesale Account
                </h2>
                <p className="text-bark-700/80">
                  Fill out the form below and our wholesale team will respond within
                  2 business days.
                </p>
              </div>

              {isSubmitted ? (
                <div className="p-12 rounded-2xl bg-tea-50 border border-tea-200 text-center">
                  <CheckCircle className="w-16 h-16 text-tea-600 mx-auto mb-4" />
                  <h3 className="font-display text-2xl font-semibold text-bark-800 mb-2">
                    Inquiry Received!
                  </h3>
                  <p className="text-bark-700/70">
                    Thank you for your interest. Our wholesale team will contact
                    you within 2 business days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="businessName"
                        className="block text-sm font-medium text-bark-700 mb-2"
                      >
                        Business Name *
                      </label>
                      <input
                        type="text"
                        id="businessName"
                        required
                        value={formData.businessName}
                        onChange={(e) =>
                          setFormData({ ...formData, businessName: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-ivory-400 bg-white text-bark-900 placeholder:text-bark-700/40 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
                        placeholder="Your Business Name"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="contactName"
                        className="block text-sm font-medium text-bark-700 mb-2"
                      >
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        id="contactName"
                        required
                        value={formData.contactName}
                        onChange={(e) =>
                          setFormData({ ...formData, contactName: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-ivory-400 bg-white text-bark-900 placeholder:text-bark-700/40 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
                        placeholder="Your Name"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-bark-700 mb-2"
                      >
                        Business Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-ivory-400 bg-white text-bark-900 placeholder:text-bark-700/40 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
                        placeholder="you@business.com"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-bark-700 mb-2"
                      >
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-ivory-400 bg-white text-bark-900 placeholder:text-bark-700/40 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
                        placeholder="+65 6123 4567"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="businessType"
                        className="block text-sm font-medium text-bark-700 mb-2"
                      >
                        Business Type *
                      </label>
                      <select
                        id="businessType"
                        required
                        value={formData.businessType}
                        onChange={(e) =>
                          setFormData({ ...formData, businessType: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-ivory-400 bg-white text-bark-900 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
                      >
                        <option value="">Select type</option>
                        <option value="cafe">Café / Coffee Shop</option>
                        <option value="restaurant">Restaurant</option>
                        <option value="retail">Retail Store</option>
                        <option value="hotel">Hotel / Spa</option>
                        <option value="corporate">Corporate Gifting</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="estimatedVolume"
                        className="block text-sm font-medium text-bark-700 mb-2"
                      >
                        Estimated Monthly Volume *
                      </label>
                      <select
                        id="estimatedVolume"
                        required
                        value={formData.estimatedVolume}
                        onChange={(e) =>
                          setFormData({ ...formData, estimatedVolume: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-ivory-400 bg-white text-bark-900 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
                      >
                        <option value="">Select range</option>
                        <option value="500-2000">$500 - $2,000</option>
                        <option value="2000-5000">$2,000 - $5,000</option>
                        <option value="5000+">$5,000+</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-bark-700 mb-2"
                    >
                      Additional Information
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-ivory-400 bg-white text-bark-900 placeholder:text-bark-700/40 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all resize-none"
                      placeholder="Tell us about your business and tea needs..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 bg-tea-600 text-white px-8 py-4 rounded-full text-sm font-semibold tracking-wide hover:bg-tea-700 transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Inquiry
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-bark-600/70 text-sm">
                    By submitting, you agree to our{" "}
                    <Link href="/privacy" className="text-tea-600 hover:underline">
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link href="/terms" className="text-tea-600 hover:underline">
                      Terms of Service
                    </Link>
                    .
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
