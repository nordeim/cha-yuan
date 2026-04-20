import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Noto_Serif_SC } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

/* ============================================
   FONT CONFIGURATION - Optimized via Next.js
   ============================================ */

/**
 * Inter - Clean, modern sans-serif for body text
 * Weights: 400 (Regular), 500 (Medium), 600 (Semibold)
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  preload: true,
});

/**
 * Playfair Display - Elegant serif for headings
 * Weights: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
 */
const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  preload: true,
});

/**
 * Noto Serif SC - Chinese serif font for 茶源 and Chinese content
 * Weights: 400 (Regular), 700 (Bold)
 */
const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-chinese",
  weight: ["400", "700"],
  preload: true,
});

/* ============================================
   METADATA - SEO & PWA Configuration
   ============================================ */

export const metadata: Metadata = {
  title: {
    default: "CHA YUAN (茶源) | Premium Tea E-Commerce",
    template: "%s | CHA YUAN (茶源)",
  },
  description:
    "Discover the finest teas from around the world at CHA YUAN (茶源), Singapore's premier tea e-commerce destination. Curated collections, expert guidance, and authentic tea culture.",
  keywords: [
    "tea",
    "premium tea",
    "Singapore",
    "茶源",
    "chinese tea",
    "oolong",
    "pu-erh",
    "green tea",
    "white tea",
    "tea ceremony",
  ],
  authors: [{ name: "CHA YUAN (茶源)" }],
  creator: "CHA YUAN (茶源)",
  publisher: "CHA YUAN (茶源)",
  metadataBase: new URL("https://chayuan.sg"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_SG",
    alternateLocale: ["zh_SG"],
    url: "https://chayuan.sg",
    siteName: "CHA YUAN (茶源)",
    title: "CHA YUAN (茶源) | Premium Tea E-Commerce",
    description:
      "Discover the finest teas from around the world at CHA YUAN (茶源), Singapore's premier tea e-commerce destination.",
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "CHA YUAN (茶源) - Premium Tea E-Commerce",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CHA YUAN (茶源) | Premium Tea E-Commerce",
    description:
      "Discover the finest teas from around the world at CHA YUAN (茶源).",
    images: ["/images/og-default.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
  other: {
    "apple-mobile-web-app-title": "CHA YUAN",
    "application-name": "CHA YUAN",
    "msapplication-TileColor": "#3d5f3d",
    "theme-color": "#f4f7f4",
  },
};

/**
 * Viewport configuration for responsive design
 * Color scheme matches our tea brand palette
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#262626" },
  ],
  colorScheme: "light dark",
};

/* ============================================
   ROOT LAYOUT
   ============================================ */

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${notoSerifSC.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen font-sans antialiased" suppressHydrationWarning>
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-tea-green-600 focus:text-white focus:rounded-md"
        >
          Skip to main content
        </a>

      {/* Main content wrapper with Providers */}
      <div id="main-content" className="flex min-h-screen flex-col">
        <Providers>
          {children}
        </Providers>
      </div>
    </body>
  </html>
  );
}
