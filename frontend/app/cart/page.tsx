"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navigation } from "@/components/sections/navigation";
import { Footer } from "@/components/sections/footer";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Lock,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart, type CartItem } from "@/lib/hooks/use-cart";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";

/* ============================================
CART PAGE - Dedicated shopping cart page
Displays items, allows updates, checkout with auth
============================================ */

// Cart Item Row Component
function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating,
}: {
  item: CartItem;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  isUpdating: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      layout
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? {} : { opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
      className="flex gap-4 py-6 border-b border-ivory-300 last:border-0"
    >
      {/* Product Image */}
      <Link
        href={`/products/${item.slug}`}
        className="relative w-24 h-24 bg-ivory-200 rounded-lg overflow-hidden shrink-0"
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-bark-700/30">
            <ShoppingBag className="w-8 h-8" />
          </div>
        )}
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Link href={`/products/${item.slug}`}>
          <h3 className="font-display text-lg font-semibold text-bark-800 hover:text-tea-600 transition-colors">
            {item.name}
          </h3>
        </Link>
        <p className="text-sm text-bark-700/60">{item.weight_grams}g</p>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-gold-600 font-medium text-lg">
            {formatPrice(item.price_with_gst)}
          </span>
          {item.gst_inclusive && (
            <span className="text-xs text-bark-700/50">incl. GST</span>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center border border-ivory-400 rounded-lg">
            <button
              onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
              className="p-2 hover:bg-ivory-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
              disabled={isUpdating}
              className="p-2 hover:bg-ivory-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => onRemove(item.product_id)}
            disabled={isUpdating}
            className="p-2 text-bark-700/50 hover:text-red-600 transition-colors"
            aria-label="Remove item"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="text-right min-w-[100px]">
        <span className="font-display text-lg font-semibold text-bark-800">
          {formatPrice(item.subtotal)}
        </span>
      </div>
    </motion.div>
  );
}

export default function CartPage() {
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  // Cart data
  const {
    cart,
    isLoading,
    itemCount,
    subtotal,
    gstAmount,
    total,
    updateItem,
    removeItem,
    clear,
  } = useCart();

  // Check if any mutation is pending
  const isUpdating = updateItem.isPending || removeItem.isPending;

  // Check authentication and proceed to checkout
  const handleCheckout = async () => {
    setIsCheckingAuth(true);

    try {
      // Check if user is authenticated
      const response = await fetch("/api/v1/auth/me/", {
        credentials: "include",
      });

      if (response.ok) {
        // User is authenticated, proceed to checkout
        router.push("/checkout");
      } else {
        // User is not authenticated, redirect to login with return URL
        const returnUrl = encodeURIComponent("/checkout");
        router.push(`/auth/login?returnTo=${returnUrl}`);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // On error, redirect to login
      const returnUrl = encodeURIComponent("/checkout");
      router.push(`/auth/login?returnTo=${returnUrl}`);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // Empty cart state
  if (!isLoading && (!cart || cart.items.length === 0)) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen pt-32 pb-20 paper-texture">
          <div className="container-chayuan">
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-md mx-auto text-center py-20"
            >
              <div className="w-20 h-20 rounded-full bg-ivory-200 flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-bark-700/40" />
              </div>
              <h1 className="font-display text-3xl font-semibold text-bark-800 mb-4">
                Your Cart is Empty
              </h1>
              <p className="text-bark-700/70 mb-8">
                Discover our curated collection of premium teas and add your
                favorites to the cart.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-tea-600 text-white px-8 py-4 rounded-full text-sm font-semibold tracking-wide hover:bg-tea-700 transition-all active:scale-[0.97]"
              >
                Browse Teas
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen pt-32 pb-20 paper-texture">
        <div className="container-chayuan">
          {/* Header */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h1 className="font-display text-4xl font-semibold text-bark-800 mb-2">
              Shopping Cart
            </h1>
            <p className="text-bark-700/70">
              {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
            </p>
          </motion.div>

          {isLoading ? (
            // Loading state
            <div className="max-w-4xl mx-auto">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-32 bg-ivory-200 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            </div>
          ) : cart ? (
            <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-ivory-300 p-6">
                  <ScrollArea className="max-h-[600px]">
                    <div className="space-y-2">
                      {cart.items.map((item) => (
                        <CartItemRow
                          key={item.product_id}
                          item={item}
                          onUpdateQuantity={(id, qty) =>
                            updateItem.mutate({ productId: id, quantity: qty })
                          }
                          onRemove={(id) => removeItem.mutate(id)}
                          isUpdating={isUpdating}
                        />
                      ))}
                    </div>
                  </ScrollArea>

                  <Separator className="my-6" />

                  {/* Clear Cart */}
                  <button
                    onClick={() => clear.mutate()}
                    disabled={clear.isPending}
                    className="text-sm text-bark-700/60 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    Clear cart
                  </button>
                </div>

                {/* Continue Shopping */}
                <div className="mt-6">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 text-bark-700 hover:text-tea-600 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Order Summary */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="bg-white rounded-2xl border border-ivory-300 p-6 sticky top-32">
                  <h2 className="font-display text-xl font-semibold text-bark-800 mb-6">
                    Order Summary
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-bark-700">
                      <span>Subtotal</span>
                      <span>{formatPrice(parseFloat(subtotal))}</span>
                    </div>
                    <div className="flex justify-between text-bark-700">
                      <span>GST (9%)</span>
                      <span>{formatPrice(parseFloat(gstAmount))}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-display text-lg font-semibold text-bark-800">
                      <span>Total</span>
                      <span>{formatPrice(parseFloat(total))}</span>
                    </div>
                  </div>

                  {/* Checkout Button with Auth Check */}
                  <Button
                    onClick={handleCheckout}
                    disabled={isCheckingAuth}
                    className="w-full bg-tea-600 hover:bg-tea-700 text-white py-4 rounded-full text-sm font-semibold tracking-wide transition-all active:scale-[0.97]"
                  >
                    {isCheckingAuth ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Secure Checkout
                      </>
                    )}
                  </Button>

                  {/* Auth Note */}
                  <div className="mt-4 flex items-center gap-2 text-xs text-bark-700/60">
                    <User className="w-4 h-4" />
                    <span>Login required for checkout</span>
                  </div>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-ivory-300">
                    <p className="text-xs text-bark-700/50 text-center mb-3">
                      Secure checkout powered by
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      <div className="text-xs font-medium text-bark-700">
                        Stripe
                      </div>
                      <div className="text-xs font-medium text-bark-700">
                        SSL Secure
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
