import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["components/__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}"],
    exclude: ["node_modules", ".next", "tests/e2e"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@/components": path.resolve(__dirname, "./components"),
      "@/lib": path.resolve(__dirname, "./lib"),
      "@/app": path.resolve(__dirname, "./app"),
    },
  },
});
