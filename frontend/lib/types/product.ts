/**
 * Product TypeScript Types
 * Singapore context: GST 9%, SGD currency
 */

// Category Types
export interface TeaCategory {
  id: number;
  name: string;
  slug: string;
  fermentation_level: number;
  description: string;
  brewing_temp_celsius: number;
  brewing_time_seconds: number;
  product_count?: number;
}

// Origin Types
export interface TeaOrigin {
  id: number;
  name: string;
  slug: string;
  region: string;
  description: string;
  image?: string;
  product_count?: number;
}

// Product Types
export interface Product {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  price_sgd: string;
  price_with_gst: string;
  gst_amount: string;
  currency: string;
  weight_grams: number;
  weight_display: string;
  is_in_stock: boolean;
  is_new_arrival: boolean;
  harvest_season: string | null;
  harvest_year: number | null;
  category: TeaCategory;
  origin: TeaOrigin;
  image: string | null;
}

// Product Detail extends Product with additional fields
export interface ProductDetail extends Product {
  description: string;
  stock: number;
  brewing_guide: {
    temperature_celsius: number;
    time_seconds: number;
    time_display: string;
  };
  images: string[];
  related_products: Product[];
}

// API Response Types
export interface PaginatedResponse<T> {
  items: T[];
  count: number;
  page?: number;
  pages?: number;
}

export type ProductsResponse = PaginatedResponse<Product>;
export type CategoriesResponse = TeaCategory[];
export type OriginsResponse = TeaOrigin[];

// Filter Types
export interface ProductFilters {
  category?: string | undefined;
  origin?: string | undefined;
  season?: string | undefined;
  priceRange?: [number, number] | undefined;
  search?: string | undefined;
  page?: number | undefined;
  page_size?: number | undefined;
}

// GST Calculation Helper
export function formatSGDPrice(price: string | number): string {
  const formatter = new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    minimumFractionDigits: 2,
  });
  return formatter.format(Number(price));
}

export function calculateGST(price: number): number {
  return Number((price * 0.09).toFixed(2));
}
