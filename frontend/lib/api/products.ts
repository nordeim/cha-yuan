/**
 * Products API Functions
 * BFF proxy communication with Django backend
 */

import { authFetch } from "@/lib/auth-fetch";
import {
  type ProductDetail,
  type ProductsResponse,
  type CategoriesResponse,
  type OriginsResponse,
  type ProductFilters,
} from "@/lib/types/product";

const BASE_URL = "/api/v1/products";

/**
 * Get paginated list of products with optional filters.
 * Public endpoint - no auth required.
 */
export async function getProducts(
  filters: ProductFilters = {}
): Promise<ProductsResponse> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  const url = `${BASE_URL}/${queryString ? `?${queryString}` : ""}`;

  const response = await authFetch(url, { skipAuth: true });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get single product by slug.
 * Public endpoint - no auth required.
 */
export async function getProductBySlug(slug: string): Promise<ProductDetail> {
  const response = await authFetch(`${BASE_URL}/${slug}/`, {
    skipAuth: true,
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Product not found");
    }
    throw new Error(`Failed to fetch product: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get all tea categories.
 * Public endpoint - no auth required.
 */
export async function getCategories(): Promise<CategoriesResponse> {
  try {
    const response = await authFetch(`${BASE_URL}/categories/`, {
      skipAuth: true,
    });

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch {
    return [];
  }
}

/**
 * Get all tea origins.
 * Public endpoint - no auth required.
 */
export async function getOrigins(): Promise<OriginsResponse> {
  try {
    const response = await authFetch(`${BASE_URL}/origins/`, { skipAuth: true });

    if (!response.ok) {
      return [];
    }

    return response.json();
  } catch {
    return [];
  }
}

/**
 * Get products by category slug.
 * Convenience wrapper around getProducts.
 */
export async function getProductsByCategory(
  categorySlug: string
): Promise<ProductsResponse> {
  return getProducts({ category: categorySlug });
}

/**
 * Get products by origin slug.
 * Convenience wrapper around getProducts.
 */
export async function getProductsByOrigin(
  originSlug: string
): Promise<ProductsResponse> {
  return getProducts({ origin: originSlug });
}

/**
 * Search products by keyword.
 * Uses the backend search functionality.
 */
export async function searchProducts(
  query: string
): Promise<ProductsResponse> {
  return getProducts({ search: query });
}
