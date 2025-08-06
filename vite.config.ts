import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Force cache invalidation for dev server
    hmr: {
      overlay: true
    }
  },
  // Force dependency re-bundling to clear cache
  optimizeDeps: {
    force: true,
    exclude: ['@contexts/OptimizedAuthContext']
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,vue,txt,woff2}']
      },
      manifest: {
        name: 'Needyfy - Equipment Rental Platform',
        short_name: 'Needyfy',
        description: 'Rent and hire equipment from trusted providers nearby. From cameras to tools, find what you need when you need it.',
        theme_color: '#0EA5E9',
        background_color: '#FFFFFF',
        display: 'standalone',
        start_url: '/',
        scope: '/'
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
