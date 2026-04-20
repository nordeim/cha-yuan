"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Product, TeaCategory, TeaOrigin } from "@/lib/types/product";
import { ProductGrid } from "@/components/product-grid";
import { FilterSidebar } from "@/components/filter-sidebar";
import { Package } from "lucide-react";
import { motion } from "framer-motion";

interface ProductCatalogProps {
  products: Product[];
  categories: TeaCategory[];
  origins: TeaOrigin[];
}

/**
 * Product Catalog - Client Component
 * Handles filtering and interactivity
 */
export function ProductCatalog({
  products,
  categories,
  origins,
}: ProductCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse current filters from URL
  const [filters, setFilters] = useState<{
    category?: string | undefined;
    origin?: string | undefined;
    season?: string | undefined;
  }>({
    category: searchParams.get("category") || undefined,
    origin: searchParams.get("origin") || undefined,
    season: searchParams.get("season") || undefined,
  });

  const handleFilterChange = useCallback(
    (newFilters: {
      category?: string | undefined;
      origin?: string | undefined;
      season?: string | undefined;
    }) => {
      setFilters(newFilters);

    // Update URL with new filters
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

      const queryString = params.toString();
      router.push(`/products${queryString ? `?${queryString}` : ""}`);
    },
    [router]
  );

  // Filter products client-side
  const filteredProducts = products.filter((product) => {
    if (filters.category && product.category.slug !== filters.category) {
      return false;
    }
    if (filters.origin && product.origin.slug !== filters.origin) {
      return false;
    }
    if (filters.season && product.harvest_season !== filters.season) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar - Filters */}
      <div className="lg:w-64 flex-shrink-0">
        <FilterSidebar
          categories={categories}
          origins={origins}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Product Grid */}
      <div className="flex-1">
        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-bark-700/60 text-sm">
            Showing{" "}
            <span className="font-medium text-bark-900">
              {filteredProducts.length}
            </span>{" "}
            teas
          </p>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} columns={3} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-4"
          >
            <div className="w-16 h-16 rounded-full bg-ivory-100 flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-tea-500/50" />
            </div>
            <h3 className="font-serif text-xl text-bark-900 mb-2">
              No Teas Found
            </h3>
            <p className="text-bark-700/60 text-center max-w-md mb-6">
              We couldn&apos;t find any teas matching your criteria. Try
              adjusting your filters or browse our full collection.
            </p>
            <button
              onClick={() => handleFilterChange({
                category: undefined,
                origin: undefined,
                season: undefined,
              })}
              className="inline-flex items-center px-4 py-2 bg-tea-600 text-ivory-50
              rounded-lg hover:bg-tea-700 transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
