"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Package, BookOpen, Gift, CheckCircle } from "lucide-react";
import { useReducedMotion } from "../../lib/hooks/use-reduced-motion";
import {
  scrollRevealVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from "@/lib/animations";
import { cn } from "@/lib/utils";

/* ============================================
   SUBSCRIPTION SECTION
   Dark background with pricing cards
   Matches mockup exactly
   ============================================ */

const SUBSCRIPTION_BENEFITS = [
  {
    icon: Package,
    title: "3-4 Curated Teas",
    description: "Seasonal selections, enough for 30+ cups",
  },
  {
    icon: BookOpen,
    title: "Tasting Journal",
    description: "Detailed notes, origin stories, brewing tips",
  },
  {
    icon: Gift,
    title: "Surprise Element",
    description: "Teaware, snacks, or rare limited editions",
  },
];

const SUBSCRIPTION_PLANS = [
  {
    name: "Discovery Box",
    description: "3 teas · Perfect for beginners",
    price: 29,
    popular: false,
    cta: "Start Discovery",
    plan: "discovery",
  },
  {
    name: "Connoisseur Box",
    description: "4 teas · Rare & seasonal selections",
    price: 49,
    popular: true,
    cta: "Subscribe Now",
    plan: "connoisseur",
  },
  {
    name: "Master's Reserve",
    description: "5 teas · Aged & limited edition",
    price: 79,
    popular: false,
    cta: "Join the Reserve",
    plan: "master",
  },
];

export function SubscribeSection() {
  const prefersReducedMotion = useReducedMotion();
  const [subscribedPlan, setSubscribedPlan] = useState<string | null>(null);

  const handleSubscribe = (plan: string) => {
    setSubscribedPlan(plan);
    // Reset after 3 seconds
    setTimeout(() => setSubscribedPlan(null), 3000);
  };

  return (
    <section id="subscribe" className="relative section-spacing overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(https://picsum.photos/seed/tea-box-subscription/1920/1080.jpg)`,
          }}
        />
        <div className="absolute inset-0 bg-bark-900/85" />
      </div>

      <div className="relative z-10 container-chayuan">
        <motion.div
          initial={prefersReducedMotion ? "visible" : "hidden"}
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={scrollRevealVariants}
          className="grid lg:grid-cols-2 gap-16 items-center"
        >
          {/* Text Side */}
          <div>
            <span className="inline-flex items-center gap-2 text-gold-400 text-xs tracking-[0.3em] uppercase font-medium mb-4">
              <span className="w-6 h-px bg-gold-400" />
              Monthly Curation
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-semibold text-ivory-100 leading-tight mb-6">
              A Journey Through
              <br />
              <span className="text-gold-400 italic">Tea, Delivered</span>
            </h2>
            <p className="text-ivory-300/80 text-base leading-relaxed mb-8">
              Each month, our tea masters curate a selection of seasonal, rare,
              and single-origin teas — accompanied by tasting notes, brewing
              guides, and the story behind each leaf. Experience the world's
              finest teas without leaving home.
            </p>

            {/* What's Inside */}
            <motion.div
              variants={staggerContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-4 mb-10"
            >
              {SUBSCRIPTION_BENEFITS.map((benefit) => (
                <motion.div
                  key={benefit.title}
                  variants={staggerItemVariants}
                  className="flex items-start gap-4"
                >
                  <div className="w-8 h-8 rounded-lg bg-gold-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <benefit.icon className="w-4 h-4 text-gold-400" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-semibold text-ivory-100">
                      {benefit.title}
                    </h4>
                    <p className="text-sm text-ivory-400/70 mt-0.5">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Pricing Cards */}
          <motion.div
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-5"
          >
            {SUBSCRIPTION_PLANS.map((plan) => (
              <motion.div
                key={plan.plan}
                variants={staggerItemVariants}
                className={cn(
                  "rounded-2xl p-6 relative cursor-pointer group transition-all",
                  plan.popular
                    ? "bg-gold-500/10 border border-gold-400/50"
                    : "bg-white/10 border border-white/10 hover:border-gold-400/40"
                )}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 right-6 bg-gold-500 text-bark-900 text-[10px] font-bold tracking-[0.2em] uppercase px-4 py-1 rounded-full">
                    Popular
                  </div>
                )}

                {/* Plan Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ivory-100">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-ivory-400/70 mt-0.5">
                      {plan.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-2xl font-bold text-gold-400">
                      ${plan.price}
                    </span>
                    <span className="text-ivory-400/60 text-sm">/mo</span>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSubscribe(plan.plan)}
                  disabled={subscribedPlan === plan.plan}
                  className={cn(
                    "w-full py-2.5 rounded-xl text-sm font-medium transition-all",
                    plan.popular
                      ? "bg-gold-500 text-bark-900 hover:bg-gold-400"
                      : "border border-gold-400/40 text-gold-400 hover:bg-gold-400/10",
                    subscribedPlan === plan.plan &&
                      "opacity-50 cursor-not-allowed"
                  )}
                >
                  {subscribedPlan === plan.plan ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Selected!
                    </span>
                  ) : (
                    plan.cta
                  )}
                </button>
              </motion.div>
            ))}

            {/* Disclaimer */}
            <p className="text-center text-ivory-500/60 text-xs mt-4">
              Free shipping worldwide · Cancel anytime · Gift options available
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default SubscribeSection;
