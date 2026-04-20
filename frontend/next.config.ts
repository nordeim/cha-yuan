import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permit external origin for dev server validation (Cloudflare Tunnel)
  allowedDevOrigins: ["cha-yuan.jesspete.shop"],

  // Turbopack configuration
  turbopack: {
    // Resolve the workspace root warning
    root: ".",
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
      },
    ],
    unoptimized: true, // For static export compatibility
  },

  // Logging configuration (reduce noise)
  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  // Trailing slashes for consistency
  trailingSlash: true,
};

export default nextConfig;
