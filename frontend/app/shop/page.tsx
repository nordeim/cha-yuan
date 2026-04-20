import { redirect } from "next/navigation";
import type { Metadata } from "next";

/**
 * Shop Page - Redirects to /products
 * 
 * Option B: /products is the canonical route
 * /shop redirects to /products for user convenience
 */

export const metadata: Metadata = {
  title: "Shop Premium Teas | CHA YUAN (茶源)",
  robots: {
    index: false,
    follow: true,
  },
};

export default function ShopPage() {
  // Permanent redirect to canonical products page
  redirect("/products");
}
