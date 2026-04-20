"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Leaf, Globe, MessageCircle, ExternalLink } from "lucide-react";

/* ============================================
   FOOTER SECTION
   Dark footer with links and newsletter
   Matches mockup exactly
   ============================================ */

const SHOP_LINKS = [
  { label: "All Teas", href: "/shop" },
  { label: "Teaware", href: "/shop/teaware" },
  { label: "Gift Sets", href: "/shop/gifts" },
  { label: "Subscriptions", href: "/subscribe" },
  { label: "New Arrivals", href: "/shop/new" },
];

const LEARN_LINKS = [
  { label: "Brewing Guides", href: "/guides/brewing" },
  { label: "Tea Types 101", href: "/learn/types" },
  { label: "Tea Ceremony", href: "/culture/ceremony" },
  { label: "Blog", href: "/blog" },
  { label: "Origin Stories", href: "/origins" },
];

const COMPANY_LINKS = [
  { label: "Our Story", href: "/about" },
  { label: "Sustainability", href: "/sustainability" },
  { label: "Partner Gardens", href: "/partners" },
  { label: "Contact Us", href: "/contact" },
  { label: "Wholesale", href: "/wholesale" },
];

const SOCIAL_LINKS = [
  { icon: Globe, href: "#", label: "Instagram", ariaLabel: "View our Instagram profile" },
  { icon: MessageCircle, href: "#", label: "Facebook", ariaLabel: "Visit our Facebook page" },
  { icon: ExternalLink, href: "#", label: "YouTube", ariaLabel: "Subscribe to our YouTube channel" },
  { icon: Globe, href: "#", label: "Twitter", ariaLabel: "Follow us on X (formerly Twitter)" },
] as const;

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      // Reset after 5 seconds
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-bark-900 text-ivory-400 pt-20 pb-10 relative">
      {/* Gold Line Divider */}
      <div className="absolute top-0 left-0 right-0 h-px gold-line opacity-40" />

      <div className="container-chayuan">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-1">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-tea-500 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-ivory-100" />
              </div>
              <div>
                <span className="font-display text-xl font-semibold text-ivory-100">
                  茶源
                </span>
                <span className="font-display text-xs block tracking-[0.25em] text-gold-400 -mt-0.5">
                  CHA YUAN
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-ivory-500 leading-relaxed mb-6">
              Where ancient tea wisdom meets modern life. Curating the world's
              finest teas since 1892.
            </p>

{/* Social Links */}
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.ariaLabel}
                className="w-9 h-9 rounded-full border border-ivory-700 flex items-center justify-center hover:border-gold-400 hover:text-gold-400 transition-all"
              >
                <social.icon className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">{social.label}</span>
              </a>
            ))}
          </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-display text-sm font-semibold text-ivory-100 tracking-wide uppercase mb-5">
              Shop
            </h4>
            <ul className="space-y-3">
              {SHOP_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-ivory-500 hover:text-gold-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn Links */}
          <div>
            <h4 className="font-display text-sm font-semibold text-ivory-100 tracking-wide uppercase mb-5">
              Learn
            </h4>
            <ul className="space-y-3">
              {LEARN_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-ivory-500 hover:text-gold-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display text-sm font-semibold text-ivory-100 tracking-wide uppercase mb-5">
              Company
            </h4>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-ivory-500 hover:text-gold-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Strip */}
        <div className="border-t border-b border-ivory-800 py-10 mb-8">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-display text-xl md:text-2xl font-semibold text-ivory-100 mb-2">
              Join the <span className="text-gold-400 italic">Inner Circle</span>
            </h3>
            <p className="text-ivory-500 text-sm mb-6">
              Receive tea wisdom, exclusive offers, and first access to seasonal
              releases.
            </p>

            {subscribed ? (
              <div className="bg-tea-900/50 rounded-xl p-4 text-tea-300 text-sm">
                Welcome to the Inner Circle! We will send tea wisdom to your
                inbox.
              </div>
            ) : (
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
              >
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-5 py-3.5 rounded-xl border border-ivory-700 bg-bark-800 text-ivory-100 text-sm placeholder:text-ivory-600 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
                />
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-xl bg-gold-500 text-bark-900 text-sm font-semibold tracking-wide hover:bg-gold-400 transition-all active:scale-[0.97]"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ivory-600">
            © {new Date().getFullYear()} Cha Yuan Tea House. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-xs text-ivory-600 hover:text-gold-400 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-ivory-600 hover:text-gold-400 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/shipping"
              className="text-xs text-ivory-600 hover:text-gold-400 transition-colors"
            >
              Shipping
            </Link>
            <Link
              href="/returns"
              className="text-xs text-ivory-600 hover:text-gold-400 transition-colors"
            >
              Returns
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
