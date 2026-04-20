import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "@/lib/auth-fetch";
import { toast } from "sonner";

// Types
export interface CartItem {
  product_id: number;
  quantity: number;
  name: string;
  slug: string;
  image: string | null;
  weight_grams: number;
  price_sgd: number;
  price_with_gst: number;
  gst_inclusive: boolean;
  subtotal: number;
}

export interface CartTotals {
  subtotal: string;
  gst_amount: string;
  total: string;
  item_count: number;
}

export interface CartResponse extends CartTotals {
  items: CartItem[];
}

// Query key
const CART_QUERY_KEY = ["cart"];

// Fetch cart
async function fetchCart(): Promise<CartResponse> {
  const res = await authFetch("/api/v1/cart/");
  if (!res.ok) {
    throw new Error("Failed to fetch cart");
  }
  return res.json();
}

// Add to cart
async function addToCart(productId: number, quantity: number = 1): Promise<CartResponse> {
  const res = await authFetch("/api/v1/cart/add/", {
    method: "POST",
    body: JSON.stringify({ product_id: productId, quantity }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to add item" }));
    throw new Error(error.detail || "Failed to add item");
  }
  return res.json();
}

// Update cart item
async function updateCartItem(productId: number, quantity: number): Promise<CartResponse> {
  const res = await authFetch("/api/v1/cart/update/", {
    method: "PUT",
    body: JSON.stringify({ product_id: productId, quantity }),
  });
  if (!res.ok) {
    throw new Error("Failed to update item");
  }
  return res.json();
}

// Remove from cart
async function removeFromCart(productId: number): Promise<CartResponse> {
  const res = await authFetch(`/api/v1/cart/remove/${productId}/`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to remove item");
  }
  return res.json();
}

// Clear cart
async function clearCart(): Promise<void> {
  const res = await authFetch("/api/v1/cart/clear/", {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to clear cart");
  }
}

// Hook
export function useCart() {
  const queryClient = useQueryClient();

  // Query - fetch cart
  const {
    data: cart,
    isLoading,
    error,
  } = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: fetchCart,
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutations
  const addItem = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity?: number }) =>
      addToCart(productId, quantity || 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      toast.success("Added to cart");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateItem = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      updateCartItem(productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
    onError: () => {
      toast.error("Failed to update quantity");
    },
  });

  const removeItem = useMutation({
    mutationFn: removeFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      toast.success("Item removed");
    },
    onError: () => {
      toast.error("Failed to remove item");
    },
  });

  const clear = useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      toast.success("Cart cleared");
    },
    onError: () => {
      toast.error("Failed to clear cart");
    },
  });

  return {
    cart,
    isLoading,
    error,
    itemCount: cart?.item_count || 0,
    totalItems: cart?.items.length || 0,
    subtotal: cart?.subtotal || "0.00",
    gstAmount: cart?.gst_amount || "0.00",
    total: cart?.total || "0.00",
    addItem,
    updateItem,
    removeItem,
    clear,
  };
}
