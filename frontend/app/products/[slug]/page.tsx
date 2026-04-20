/**
 * Product Detail Page
 * Dynamic route for displaying full product details
 * Server Component with data fetching
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/lib/api/products";
import { ProductGallery } from "@/components/product-gallery";
import { RelatedProducts } from "@/components/related-products";
import { GstBadge } from "@/components/gst-badge";
import { Button } from "@/components/ui/button";
import {
  Leaf,
  MapPin,
  Droplets,
  Thermometer,
  Clock,
  ChevronLeft,
  Package,
  Check,
} from "lucide-react";

interface ProductDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    return {
      title: `${product.name} | CHA YUAN (茶源)`,
      description: product.short_description,
      openGraph: {
        title: product.name,
        description: product.short_description,
        type: "website",
        images: product.image ? [{ url: product.image }] : undefined,
      },
    };
  } catch {
    return {
      title: "Product | CHA YUAN (茶源)",
    };
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  let product;

  try {
    const { slug } = await params;
    product = await getProductBySlug(slug);
  } catch (error) {
    notFound();
  }

  const hasHarvestInfo = product.harvest_season && product.harvest_year;

  return (
    <div className="min-h-screen bg-ivory-100">
      {/* Back Link */}
      <div className="container-chayuan pt-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-bark-700 hover:text-tea-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Shop
        </Link>
      </div>

      {/* Product Hero Section */}
      <section className="section-spacing">
        <div className="container-chayuan">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Product Gallery */}
            <div>
              <ProductGallery
                images={product.images}
                alt={product.name}
                fallbackImage={product.image}
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              {/* Category & Origin */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-tea-50 text-tea-700 text-sm rounded-full hover:bg-tea-100 transition-colors"
                >
                  <Leaf className="w-3.5 h-3.5" />
                  {product.category.name}
                </Link>
                <Link
                  href={`/products?origin=${product.origin.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-50 text-gold-700 text-sm rounded-full hover:bg-gold-100 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {product.origin.region}
                </Link>
                {product.is_new_arrival && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-aurora-magenta/10 text-aurora-magenta text-sm rounded-full">
                    <Package className="w-3.5 h-3.5" />
                    New Arrival
                  </span>
                )}
              </div>

              {/* Name */}
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-bark-900 mb-4">
                {product.name}
              </h1>

              {/* Weight */}
              <p className="text-bark-700/60 mb-6">
                {product.weight_display}
              </p>

              {/* Price */}
              <div className="mb-8">
                <GstBadge
                  price={product.price_sgd}
                  gstAmount={product.gst_amount}
                  size="xl"
                />
              </div>

              {/* Short Description */}
              <p className="text-bark-700 leading-relaxed mb-8">
                {product.short_description}
              </p>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mb-8">
                {product.is_in_stock ? (
                  <>
                    <Check className="w-5 h-5 text-tea-600" />
                    <span className="text-tea-700 font-medium">
                      In Stock ({product.stock} units)
                    </span>
                  </>
                ) : (
                  <>
                    <Package className="w-5 h-5 text-bark-500" />
                    <span className="text-bark-600">
                      Out of Stock
                    </span>
                  </>
                )}
              </div>

              {/* Harvest Info */}
              {hasHarvestInfo && (
                <div className="p-4 bg-ivory-200/50 rounded-lg mb-8">
                  <p className="text-sm text-bark-700">
                    <span className="font-medium">Harvest:</span>{" "}
                    {product.harvest_season} {product.harvest_year}
                  </p>
                </div>
              )}

              {/* Add to Cart Button */}
              <div className="mt-auto pt-6 border-t border-ivory-300">
                <Button
                  size="lg"
                  className="w-full md:w-auto"
                  disabled={!product.is_in_stock}
                >
                  {product.is_in_stock ? "Add to Cart" : "Out of Stock"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description & Brewing Guide */}
      <section className="section-spacing bg-ivory-200/30">
        <div className="container-chayuan">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Description */}
            <div className="lg:col-span-2">
              <h2 className="font-serif text-2xl text-bark-900 mb-6">
                About this Tea
              </h2>
              <div className="prose prose-bark max-w-none">
                <p className="text-bark-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Brewing Guide */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 border border-ivory-300 shadow-sm">
                <h3 className="font-serif text-xl text-bark-900 mb-6 flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-tea-600" />
                  Brewing Guide
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-tea-50 flex items-center justify-center flex-shrink-0">
                      <Thermometer className="w-5 h-5 text-tea-600" />
                    </div>
                    <div>
                      <p className="text-sm text-bark-500">Temperature</p>
                      <p className="font-medium text-bark-900">
                        {product.brewing_guide.temperature_celsius}°C
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-tea-50 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-tea-600" />
                    </div>
                    <div>
                      <p className="text-sm text-bark-500">Brewing Time</p>
                      <p className="font-medium text-bark-900">
                        {product.brewing_guide.time_display}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Origin Info */}
              <div className="mt-6 bg-ivory-50 rounded-xl p-6 border border-ivory-300">
                <h3 className="font-serif text-lg text-bark-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gold-600" />
                  Origin
                </h3>
                <p className="font-medium text-bark-900 mb-2">
                  {product.origin.name}
                </p>
                <p className="text-sm text-bark-600 leading-relaxed">
                  {product.origin.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {product.related_products && product.related_products.length > 0 && (
        <RelatedProducts products={product.related_products} />
      )}
    </div>
  );
}
