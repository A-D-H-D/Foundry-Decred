import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  root: "frontend",
  publicDir: "public",
  envDir: resolve(__dirname), // ← tells Vite to look for .env at project root
  build: {
    outDir: "../dist",
  },
});
