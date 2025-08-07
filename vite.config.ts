import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// NUCLEAR CACHE CLEARING CONFIG
export default defineConfig(({ mode }) => ({
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
    port: 8080, // Required port
    force: true,
    hmr: {
      overlay: true
    }
  },
  
  // Nuclear dependency optimization
  optimizeDeps: {
    force: true,
    entries: ['src/main.tsx'], // Use main.tsx as entry
    include: ['react', 'react-dom']
  },
  
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  
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
