
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Receipt, Mail, ArrowRight, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Navigation } from '@/components/sections/navigation';
import { Footer } from '@/components/sections/footer';
import { formatPrice } from '@/lib/utils';

interface OrderDetails {
  order_id: number;
  order_number: string;
  total: string;
  gst_amount: string;
  receipt_url: string | null;
}

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found');
      setIsLoading(false);
      return;
    }

    // In a real implementation, we would verify the session with the backend
    // For now, show success state
    setIsLoading(false);
    
    // Mock order details - in production, fetch from backend
    setOrder({
      order_id: 123,
      order_number: 'CY-20260415-001',
      total: '103.55',
      gst_amount: '8.55',
      receipt_url: 'https://pay.stripe.com/receipts/...',
    });
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-tea-600 mb-4" />
        <p className="text-bark-700/70">Confirming your order...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 bg-terra-100 rounded-full flex items-center justify-center mb-4">
          <Receipt className="w-8 h-8 text-terra-600" />
        </div>
        <h1 className="font-serif text-2xl text-bark-900 mb-2">
          Order Confirmation Issue
        </h1>
        <p className="text-bark-700/60 mb-6 max-w-md">{error}</p>
        <Button
          onClick={() => router.push('/products')}
          className="bg-tea-600 hover:bg-tea-700 text-white"
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 bg-tea-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-tea-600" />
        </div>
        <h1 className="font-serif text-3xl text-bark-900 mb-2">
          Thank You for Your Order!
        </h1>
        <p className="text-bark-700/70">
          Your order has been confirmed and will be shipped soon.
        </p>
      </motion.div>

      {/* Order Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-ivory-300 p-6 mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Package className="w-5 h-5 text-tea-600" />
          <h2 className="font-serif text-xl text-bark-900">Order Details</h2>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-bark-700/70">Order Number</span>
            <span className="font-medium text-bark-900">
              {order?.order_number || 'Pending'}
            </span>
          </div>

          <Separator className="bg-ivory-300" />

          <div className="flex justify-between">
            <span className="text-bark-700/70">Order Total</span>
            <span className="text-xl font-serif text-gold-600">
              {order ? formatPrice(parseFloat(order.total)) : '-'}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-bark-700/60">GST (9%)</span>
            <span className="text-bark-700/60">
              {order ? formatPrice(parseFloat(order.gst_amount)) : '-'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Email Confirmation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-ivory-100 rounded-xl p-6 mb-6"
      >
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-tea-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-bark-900 mb-1">
              Order Confirmation Email
            </h3>
            <p className="text-sm text-bark-700/70">
              We have sent a confirmation email with your order details and receipt.
              Please check your inbox.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Receipt Link */}
      {order?.receipt_url && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <a
            href={order.receipt_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-ivory-300 rounded-xl text-bark-700 hover:text-tea-600 hover:border-tea-300 transition-colors"
          >
            <Receipt className="w-5 h-5" />
            <span>View Receipt</span>
          </a>
        </motion.div>
      )}

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Button
          onClick={() => router.push('/products')}
          className="flex-1 bg-tea-600 hover:bg-tea-700 text-white h-12"
        >
          Continue Shopping
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <Button
          onClick={() => router.push('/dashboard/orders')}
          variant="outline"
          className="flex-1 h-12 border-ivory-300"
        >
          View Order History
        </Button>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-ivory-50">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <Loader2 className="w-12 h-12 animate-spin text-tea-600 mb-4" />
              <p className="text-bark-700/70">Loading order details...</p>
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
