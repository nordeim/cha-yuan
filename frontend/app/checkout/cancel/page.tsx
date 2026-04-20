
'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircle, ShoppingCart, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/sections/navigation';
import { Footer } from '@/components/sections/footer';

export default function CheckoutCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-ivory-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Cancel Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="w-20 h-20 bg-terra-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-terra-600" />
            </div>
            <h1 className="font-serif text-3xl text-bark-900 mb-2">
              Payment Cancelled
            </h1>
            <p className="text-bark-700/70">
              Your payment was cancelled. Your cart items have been saved.
            </p>
          </motion.div>

          {/* Reason Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-ivory-100 rounded-xl p-6 mb-8"
          >
            <h2 className="font-medium text-bark-900 mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-tea-600" />
              What happened?
            </h2>
            <p className="text-bark-700/70 text-sm leading-relaxed">
              You cancelled the payment process on the Stripe checkout page. 
              This could be because you changed your mind, encountered an issue, 
              or decided to modify your order. Don&apos;t worry — your cart is still 
              saved and you can complete your purchase anytime.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={() => router.push('/checkout')}
              className="bg-tea-600 hover:bg-tea-700 text-white h-12 px-8"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={() => router.push('/products')}
              variant="outline"
              className="h-12 px-8 border-ivory-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Continue Shopping
            </Button>
          </motion.div>

          {/* Cart Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <button
              onClick={() => {
                // Open cart drawer - would need to integrate with cart state
                // For now, navigate to cart page or show cart
                router.push('/products');
              }}
              className="inline-flex items-center gap-2 text-tea-600 hover:text-tea-700 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>View Cart</span>
            </button>
          </motion.div>

          {/* Support Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 pt-8 border-t border-ivory-300"
          >
            <p className="text-sm text-bark-700/60">
              Need help? Contact us at{' '}
              <a
                href="mailto:hello@cha-yuan.sg"
                className="text-tea-600 hover:underline"
              >
                hello@cha-yuan.sg
              </a>
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
