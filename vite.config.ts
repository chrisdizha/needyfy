import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// NUCLEAR CACHE CLEARING CONFIG
export default defineConfig(() => ({
  // Nuclear cache directory change
  cacheDir: '.vite-nuclear-' + Date.now(),
  
  // Aggressive build settings
  build: {
    outDir: 'dist-nuclear',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  
  server: {
    host: "::",
    port: 8081, // Different port to avoid conflicts
    force: true,
    hmr: {
      overlay: true,
      port: 24679 // Different HMR port
    }
  },
  
  // Nuclear dependency optimization
  optimizeDeps: {
    force: true,
    entries: ['src/nuclear-main.tsx'],
    include: ['react', 'react-dom'],
    esbuildOptions: {
      target: 'es2020'
    }
  },
  
  plugins: [react()],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Force single React version
    dedupe: ['react', 'react-dom']
  },
  
  // Clear all module cache
  define: {
    __VITE_CACHE_BUST__: JSON.stringify(Date.now())
  }
}));
