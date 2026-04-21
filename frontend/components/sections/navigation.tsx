"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Menu, X, ShoppingCart } from "lucide-react";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import {
  navbarVariants,
  mobileMenuVariants,
} from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/hooks/use-cart";

/* ============================================
NAVIGATION - Fixed header with mobile menu
Updated: Shop as normal link, Cart icon added
============================================ */

const NAV_ITEMS = [
  { href: "/#philosophy", label: "Philosophy" },
  { href: "/#collection", label: "Collection" },
  { href: "/#culture", label: "Tea Culture" },
  { href: "/#subscribe", label: "Subscribe" },
  { href: "/products", label: "Shop" },
] as const;

export function Navigation() {
  const prefersReducedMotion = useReducedMotion();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Cart data for badge
  const { cart, isLoading } = useCart();
  const cartItemCount = cart?.item_count ?? 0;

  // Handle scroll for navbar background
  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  if (!mounted) {
    return null;
  }

  return (
    <motion.nav
      {...(!prefersReducedMotion && {
        initial: "top",
        animate: isScrolled ? "scrolled" : "top",
        variants: navbarVariants,
      })}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-ivory-50/95 backdrop-blur-xl shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container-chayuan">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            onClick={closeMobileMenu}
          >
            <div className="w-10 h-10 rounded-full bg-tea-500 flex items-center justify-center group-hover:bg-tea-600 transition-colors">
              <Leaf className="w-5 h-5 text-ivory-100" />
            </div>
            <div>
              <span className="font-display text-xl font-semibold tracking-wide text-bark-800">
                茶源
              </span>
              <span className="font-display text-xs block tracking-[0.25em] text-gold-500 -mt-0.5">
                CHA YUAN
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-bark-700 hover:text-gold-500 transition-colors tracking-wide"
              >
                {item.label}
              </Link>
            ))}
            
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-ivory-200 hover:bg-ivory-300 transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-5 h-5 text-bark-700" />
              {/* Cart Count Badge */}
              {!isLoading && cartItemCount > 0 && (
                <span 
                  data-testid="cart-count"
                  className="absolute -top-1 -right-1 w-5 h-5 bg-tea-600 text-white text-xs font-semibold rounded-full flex items-center justify-center"
                >
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile: Cart + Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Cart Icon */}
            <Link
              href="/cart"
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-ivory-300 transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="w-5 h-5 text-bark-700" />
              {/* Mobile Cart Count Badge */}
              {!isLoading && cartItemCount > 0 && (
                <span 
                  data-testid="cart-count-mobile"
                  className="absolute -top-1 -right-1 w-5 h-5 bg-tea-600 text-white text-xs font-semibold rounded-full flex items-center justify-center"
                >
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </span>
              )}
            </Link>
            
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-ivory-300 transition-colors"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-bark-800" />
              ) : (
                <Menu className="w-6 h-6 text-bark-800" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            {...(!prefersReducedMotion && {
              initial: "closed",
              animate: "open",
              exit: "closed",
              variants: mobileMenuVariants,
            })}
            className="md:hidden bg-ivory-50/95 backdrop-blur-xl border-t border-ivory-300 fixed left-0 right-0 top-20"
          >
            <div className="px-6 py-6 space-y-4">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="block text-base font-medium text-bark-700 py-2 hover:text-gold-500 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default Navigation;
