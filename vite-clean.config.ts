import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Fresh Vite config to bypass all cache issues
export default defineConfig(() => ({
  // Different cache directory
  cacheDir: '.vite-clean',
  
  // Build configuration
  build: {
    outDir: 'dist-clean',
    emptyOutDir: true,
  },
  
  server: {
    host: "::",
    port: 8080,
    force: true, // Force dependency re-optimization
  },
  
  plugins: [react()],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Force fresh dependency scanning
  optimizeDeps: {
    force: true,
    entries: ['src/simple-main.tsx']
  },
}));