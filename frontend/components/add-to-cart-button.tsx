"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/hooks/use-cart";
import { Loader2, ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
  productId: number;
  disabled?: boolean;
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function AddToCartButton({
  productId,
  disabled = false,
  size = "lg",
  className,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (disabled || isAdding) return;

    setIsAdding(true);
    try {
      await addItem.mutateAsync({ productId, quantity: 1 });
    } finally {
      setIsAdding(false);
    }
  };

  const isDisabled = disabled || isAdding || addItem.isPending;

  return (
    <Button
      size={size}
      className={className}
      disabled={isDisabled}
      onClick={handleAddToCart}
    >
      {isAdding || addItem.isPending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Adding...
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </>
      )}
    </Button>
  );
}
