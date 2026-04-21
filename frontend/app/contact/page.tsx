"use client";

import { useState, FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Navigation } from "@/components/sections/navigation";
import { Footer } from "@/components/sections/footer";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Send,
  Globe,
  CheckCircle,
} from "lucide-react";

/* ============================================
CONTACT PAGE - Get in Touch
Visit our teahouse or send us a message
============================================ */

const CONTACT_METHODS = [
  {
    icon: MapPin,
    title: "Visit Us",
    details: [
      "123 Tea Merchant Road",
      "Chinatown, Singapore 058400",
    ],
    action: "Get Directions",
    href: "https://maps.google.com/?q=123+Tea+Merchant+Road+Singapore",
  },
  {
    icon: Phone,
    title: "Call Us",
    details: ["+65 6123 4567", "Monday - Sunday"],
    action: "Call Now",
    href: "tel:+6561234567",
  },
  {
    icon: Mail,
    title: "Email Us",
    details: ["hello@chayuan.sg", "We reply within 24 hours"],
    action: "Send Email",
    href: "mailto:hello@chayuan.sg",
  },
  {
    icon: Clock,
    title: "Opening Hours",
    details: [
      "Mon - Fri: 10:00 - 20:00",
      "Sat - Sun: 09:00 - 21:00",
    ],
    action: "View Events",
    href: "#events",
  },
];

const SOCIAL_LINKS = [
  { icon: Globe, label: "Instagram", href: "#" },
  { icon: Globe, label: "Facebook", href: "#" },
  { icon: Globe, label: "WhatsApp", href: "#" },
];

const FAQ_ITEMS = [
  {
    question: "Do you offer same-day delivery in Singapore?",
    answer:
      "Yes, for orders placed before 2 PM within Singapore. We deliver to all addresses including condos, HDBs, and offices.",
  },
  {
    question: "Can I visit your teahouse for a tasting?",
    answer:
      "Absolutely! We offer complimentary guided tastings every Saturday at 2 PM. Private sessions can be arranged by appointment.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Currently, we ship within Singapore only. International shipping to Malaysia, Hong Kong, and Taiwan is coming soon.",
  },
  {
    question: "What is your return policy?",
    answer:
      "Unopened teas can be returned within 14 days for a full refund. Opened teas are not eligible for returns due to food safety regulations.",
  },
];

export default function ContactPage() {
  const prefersReducedMotion = useReducedMotion();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
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
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 5000);
  };

  return (
    <>
      <Navigation />

      <main className="relative">
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-bark-900">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `url(https://picsum.photos/seed/tea-house-interior/1920/1080.jpg)`,
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
              <span className="w-8 h-px bg-gold-400" />
              Get in Touch
              <span className="w-8 h-px bg-gold-400" />
            </motion.span>

            <motion.h1
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-semibold text-ivory-100 leading-tight mb-6"
            >
              Contact Us
            </motion.h1>

            <motion.p
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl text-ivory-400 max-w-2xl mx-auto leading-relaxed"
            >
              Visit our teahouse in Chinatown, send us a message, or connect on
              social media. We would love to hear from you.
            </motion.p>
          </div>
        </section>

        {/* Contact Methods Grid */}
        <section className="paper-texture py-24 md:py-32">
          <div className="container-chayuan">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {CONTACT_METHODS.map((method, index) => (
                <motion.div
                  key={method.title}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="p-8 rounded-2xl bg-white border border-ivory-300 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-14 h-14 rounded-full bg-tea-100 flex items-center justify-center mx-auto mb-4">
                    <method.icon className="w-7 h-7 text-tea-600" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-bark-800 mb-3">
                    {method.title}
                  </h3>
                  <div className="space-y-1 mb-4">
                    {method.details.map((detail, i) => (
                      <p key={i} className="text-bark-700/70 text-sm">
                        {detail}
                      </p>
                    ))}
                  </div>
                  <a
                    href={method.href}
                    target={method.href.startsWith("http") ? "_blank" : undefined}
                    rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center text-tea-600 text-sm font-medium hover:text-tea-700 transition-colors"
                  >
                    {method.action}
                    <Send className="w-3 h-3 ml-1" />
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Map Section */}
        <section className="py-24 md:py-32 bg-ivory-50">
          <div className="container-chayuan">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 max-w-6xl mx-auto">
              {/* Contact Form */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <span className="inline-flex items-center gap-2 text-gold-500 text-xs tracking-[0.3em] uppercase font-medium mb-4">
                  <span className="w-6 h-px bg-gold-500" />
                  Send a Message
                  <span className="w-6 h-px bg-gold-500" />
                </span>
                <h2 className="font-display text-3xl font-semibold text-bark-800 mb-6">
                  Write to Us
                </h2>
                <p className="text-bark-700/80 mb-8">
                  Have a question about our teas, need brewing advice, or want to
                  arrange a private tasting? Fill out the form below and we will
                  get back to you within 24 hours.
                </p>

                {isSubmitted ? (
                  <div className="p-8 rounded-2xl bg-tea-50 border border-tea-200 text-center">
                    <CheckCircle className="w-12 h-12 text-tea-600 mx-auto mb-4" />
                    <h3 className="font-display text-xl font-semibold text-bark-800 mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-bark-700/70">
                      Thank you for reaching out. We will respond within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-bark-700 mb-2"
                        >
                          Your Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-xl border border-ivory-400 bg-white text-bark-900 placeholder:text-bark-700/40 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-bark-700 mb-2"
                        >
                          Email Address
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
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-bark-700 mb-2"
                      >
                        Subject
                      </label>
                      <select
                        id="subject"
                        required
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-ivory-400 bg-white text-bark-900 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
                      >
                        <option value="">Select a topic</option>
                        <option value="general">General Inquiry</option>
                        <option value="order">Order Status</option>
                        <option value="tasting">Tea Tasting Appointment</option>
                        <option value="wholesale">Wholesale Inquiry</option>
                        <option value="feedback">Feedback</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-bark-700 mb-2"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl border border-ivory-400 bg-white text-bark-900 placeholder:text-bark-700/40 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all resize-none"
                        placeholder="Tell us how we can help..."
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
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>

              {/* Map Placeholder & Store Info */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                {/* Map */}
                <div className="rounded-2xl overflow-hidden border border-ivory-300 h-[400px] bg-ivory-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-gold-500 mx-auto mb-4" />
                      <p className="text-bark-700 font-medium">
                        123 Tea Merchant Road
                      </p>
                      <p className="text-bark-600 text-sm">
                        Chinatown, Singapore 058400
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="p-8 rounded-2xl bg-white border border-ivory-300">
                  <h3 className="font-display text-lg font-semibold text-bark-800 mb-4">
                    Connect With Us
                  </h3>
                  <div className="flex gap-4">
                    {SOCIAL_LINKS.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-ivory-100 text-bark-700 hover:bg-tea-100 hover:text-tea-700 transition-colors"
                      >
                        <social.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {social.label}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Events */}
                <div id="events" className="p-8 rounded-2xl bg-tea-900 text-ivory-100">
                  <h3 className="font-display text-lg font-semibold mb-4">
                    Upcoming Events
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-lg bg-gold-500/20 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-gold-400 text-xs font-bold">APR</span>
                        <span className="text-gold-400 text-lg font-bold">26</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-ivory-200">
                          Spring Tea Tasting
                        </h4>
                        <p className="text-ivory-400/70 text-sm">
                          2:00 PM • Free guided tasting
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-lg bg-gold-500/20 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-gold-400 text-xs font-bold">MAY</span>
                        <span className="text-gold-400 text-lg font-bold">03</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-ivory-200">
                          Tea Ceremony Workshop
                        </h4>
                        <p className="text-ivory-400/70 text-sm">
                          10:00 AM • $45 per person
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 md:py-32 paper-texture">
          <div className="container-chayuan">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <span className="inline-flex items-center gap-2 text-gold-500 text-xs tracking-[0.3em] uppercase font-medium mb-4">
                  <span className="w-6 h-px bg-gold-500" />
                  FAQ
                  <span className="w-6 h-px bg-gold-500" />
                </span>
                <h2 className="font-display text-3xl font-semibold text-bark-800">
                  Common Questions
                </h2>
              </motion.div>

              <div className="space-y-4">
                {FAQ_ITEMS.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="p-6 rounded-2xl bg-white border border-ivory-300"
                  >
                    <h3 className="font-display text-lg font-semibold text-bark-800 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-bark-700/70">{faq.answer}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
