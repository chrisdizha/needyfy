
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Ensure only one React instance
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    // Force pre-bundling of React to prevent duplicates
    include: ['react', 'react-dom'],
    force: true
  },
  build: {
    rollupOptions: {
      // Ensure React is properly externalized and deduplicated
      external: [],
      output: {
        globals: {}
      }
    }
  },
  define: {
    // Ensure consistent React version in development
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
}));
