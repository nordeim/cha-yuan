
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, MapPin, Lock, ArrowRight, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/lib/hooks/use-cart';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { formatPrice } from '@/lib/utils';
import { SgAddressForm } from '@/components/sg-address-form';
import { Navigation } from '@/components/sections/navigation';
import { Footer } from '@/components/sections/footer';

export default function CheckoutPage() {
  const prefersReducedMotion = useReducedMotion();
  const { cart, isLoading, subtotal, gstAmount, total } = useCart();

  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if cart is empty
  useEffect(() => {
    if (!isLoading && cart && cart.items.length === 0) {
      // Could redirect to cart or products page
      // For now, show empty state
    }
  }, [cart, isLoading]);

  const handleCheckout = async () => {
    if (!isAddressValid) return;

    setIsCreatingSession(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/checkout/create-session/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/checkout/cancel`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to create checkout session');
      }

      const data = await response.json();

      // Redirect to Stripe Checkout
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setIsCreatingSession(false);
    }
  };

  const hasItems = cart && cart.items.length > 0;

  return (
    <div className="min-h-screen bg-ivory-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <h1 className="font-serif text-3xl text-bark-900 mb-8">Checkout</h1>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-tea-600" />
          </div>
        ) : !hasItems ? (
          <EmptyCart />
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Order Summary */}
            <motion.section
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Cart Items */}
              <div className="bg-white rounded-xl border border-ivory-300 p-6">
                <h2 className="font-serif text-xl text-bark-900 mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-tea-600" />
                  Order Summary
                </h2>

                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item.product_id} className="flex justify-between">
                      <div>
                        <p className="font-medium text-bark-900">{item.name}</p>
                        <p className="text-sm text-bark-700/60">
                          {item.quantity} × {item.weight_grams}g
                        </p>
                      </div>
                      <span className="font-medium text-bark-900">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator className="my-4 bg-ivory-300" />

                {/* Totals with GST */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-bark-700/70">
                    <span>Subtotal</span>
                    <span>{formatPrice(parseFloat(subtotal))}</span>
                  </div>
                  <div className="flex justify-between text-bark-700/70">
                    <span>GST (9%)</span>
                    <span>{formatPrice(parseFloat(gstAmount))}</span>
                  </div>
                  <Separator className="bg-ivory-300" />
                  <div className="flex justify-between text-lg">
                    <span className="font-medium text-bark-900">Total</span>
                    <div className="text-right">
                      <span className="text-xl font-serif text-gold-600">
                        {formatPrice(parseFloat(total))}
                      </span>
                      <p className="text-xs text-bark-700/50">incl. GST</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address Form */}
              <div className="bg-white rounded-xl border border-ivory-300 p-6">
                <h2 className="font-serif text-xl text-bark-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-tea-600" />
                  Shipping Address
                </h2>
                <SgAddressForm onValidChange={setIsAddressValid} />
              </div>
            </motion.section>

            {/* Right: Payment */}
            <motion.section
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl border border-ivory-300 p-6 sticky top-24">
                <h2 className="font-serif text-xl text-bark-900 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-tea-600" />
                  Payment
                </h2>

                {error && (
                  <div className="mb-4 p-4 bg-terra-100 text-terra-700 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <p className="text-bark-700/70 text-sm">
                    You will be redirected to Stripe's secure checkout page.
                    We accept:
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <PaymentMethodBadge label="Credit Card" />
                    <PaymentMethodBadge label="GrabPay" />
                    <PaymentMethodBadge label="PayNow" />
                  </div>

                  <div className="p-4 bg-ivory-100 rounded-lg text-sm text-bark-700/70">
                    <p className="font-medium text-bark-900 mb-1">Singapore Only</p>
                    <p>Shipping is only available within Singapore.</p>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={!isAddressValid || isCreatingSession}
                  className="w-full bg-tea-600 hover:bg-tea-700 text-white h-12"
                >
                  {isCreatingSession ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      Proceed to Payment
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                <p className="mt-4 text-xs text-center text-bark-700/50">
                  Secured by Stripe. Your payment information is encrypted.
                </p>
              </div>
            </motion.section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function PaymentMethodBadge({ label }: { label: string }) {
  return (
    <span className="px-3 py-1 bg-ivory-200 text-bark-700 text-sm rounded-full">
      {label}
    </span>
  );
}

function EmptyCart() {
  const router = useRouter();

  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-ivory-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShoppingBag className="w-8 h-8 text-bark-700/30" />
      </div>
      <h2 className="font-serif text-2xl text-bark-900 mb-2">
        Your cart is empty
      </h2>
      <p className="text-bark-700/60 mb-6">
        Add some teas to your cart before checking out
      </p>
      <Button
        onClick={() => router.push('/products')}
        className="bg-tea-600 hover:bg-tea-700 text-white"
      >
        Browse Teas
      </Button>
    </div>
  );
}
