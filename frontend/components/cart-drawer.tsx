
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCart, type CartItem } from '@/lib/hooks/use-cart';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';

// Cart Drawer Props
interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
      className="flex gap-4 py-4 group"
    >
      {/* Product Image */}
      <div className="relative w-20 h-20 bg-ivory-200 rounded-lg overflow-hidden shrink-0">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-bark-700/30">
            <ShoppingBag className="w-8 h-8" />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-serif text-bark-900 font-medium truncate">
          {item.name}
        </h3>
        <p className="text-sm text-bark-700/60">
          {item.weight_grams}g
        </p>

        {/* Price */}
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-gold-600 font-medium">
            {formatPrice(item.price_with_gst)}
          </span>
          {item.gst_inclusive && (
            <span className="text-xs text-bark-700/50">
              incl. GST
            </span>
          )}
        </div>

        {/* Quantity Controls */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center border border-ivory-300 rounded-lg">
            <button
              onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
              className="p-2 hover:bg-ivory-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
              disabled={isUpdating || item.quantity >= 99}
              className="p-2 hover:bg-ivory-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(item.product_id)}
            disabled={isUpdating}
            className="p-2 text-terra-500 hover:text-terra-700 hover:bg-terra-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            aria-label={`Remove ${item.name} from cart`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="text-right shrink-0">
        <span className="font-medium text-bark-900">
          {formatPrice(item.subtotal)}
        </span>
      </div>
    </motion.div>
  );
}

// Empty Cart State
function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-16 h-16 bg-ivory-200 rounded-full flex items-center justify-center mb-4">
        <ShoppingBag className="w-8 h-8 text-bark-700/30" />
      </div>
      <h3 className="font-serif text-lg text-bark-900 mb-2">
        Your cart is empty
      </h3>
      <p className="text-bark-700/60 text-sm mb-6">
        Discover our premium teas and add them to your cart
      </p>
      <SheetClose asChild>
        <Button
          variant="tea"
          className="bg-tea-600 hover:bg-tea-700 text-white"
        >
          Browse Teas
        </Button>
      </SheetClose>
    </div>
  );
}

// Main Cart Drawer Component
export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const router = useRouter();

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

  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    if (quantity > 99) return;
    updateItem.mutate({ productId, quantity });
  };

  const handleRemove = (productId: number) => {
    removeItem.mutate(productId);
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    onOpenChange(false);
    router.push('/checkout');
  };

  const hasItems = cart && cart.items.length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col bg-ivory-50 border-l border-ivory-300"
      >
        <SheetHeader className="border-b border-ivory-300 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-serif text-xl text-bark-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-tea-600" />
              Your Cart
              {itemCount > 0 && (
                <span className="text-sm font-sans text-bark-700/60">
                  ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </span>
              )}
            </SheetTitle>
          </div>
        </SheetHeader>

        {isLoading ? (
          // Loading Skeleton
          <div className="flex-1 flex flex-col gap-4 p-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-20 h-20 bg-ivory-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-ivory-200 rounded w-3/4" />
                  <div className="h-3 bg-ivory-200 rounded w-1/2" />
                  <div className="h-8 bg-ivory-200 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : !hasItems ? (
          <EmptyCart />
        ) : (
          <>
            {/* Cart Items */}
            <ScrollArea className="flex-1 -mx-6 px-6">
              <AnimatePresence mode="popLayout">
                {cart.items.map((item) => (
                  <CartItemRow
                    key={item.product_id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemove}
                    isUpdating={updateItem.isPending}
                  />
                ))}
              </AnimatePresence>

              {/* Clear Cart Button */}
              <div className="pt-4 pb-2">
                <button
                  onClick={() => clear.mutate()}
                  disabled={clear.isPending}
                  className="text-sm text-terra-500 hover:text-terra-700 transition-colors"
                >
                  Clear cart
                </button>
              </div>
            </ScrollArea>

            {/* Cart Summary */}
            <SheetFooter className="border-t border-ivory-300 pt-4 flex-col gap-4">
              {/* GST Breakdown */}
              <div className="w-full space-y-2 text-sm">
                <div className="flex justify-between text-bark-700/70">
                  <span>Subtotal</span>
                  <span>{formatPrice(parseFloat(subtotal))}</span>
                </div>
                <div className="flex justify-between text-bark-700/70">
                  <span>GST (9%)</span>
                  <span>{formatPrice(parseFloat(gstAmount))}</span>
                </div>
                <Separator className="bg-ivory-300" />
                <div className="flex justify-between items-baseline">
                  <span className="font-medium text-bark-900">Total</span>
                  <div className="text-right">
                    <span className="text-xl font-serif text-gold-600">
                      {formatPrice(parseFloat(total))}
                    </span>
                    <span className="block text-xs text-bark-700/50">
                      incl. GST
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-tea-600 hover:bg-tea-700 text-white h-12 text-base"
              >
                {isCheckingOut ? (
                  'Redirecting...'
                ) : (
                  <>
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              {/* Payment Methods Note */}
              <p className="text-xs text-center text-bark-700/50">
                Secure checkout with Stripe. Accepts GrabPay & PayNow.
              </p>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Cart Trigger Button with Badge
export function CartButton() {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative p-2 text-bark-800 hover:text-tea-600 transition-colors"
        aria-label={`Open cart (${itemCount} items)`}
      >
        <ShoppingBag className="w-6 h-6" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-tea-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>
      <CartDrawer open={open} onOpenChange={setOpen} />
    </>
  );
}
