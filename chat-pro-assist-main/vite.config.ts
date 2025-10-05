import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // --- FIX START: Adding 'base' for reliable Netlify/CDN deployments ---
  // Setting base to './' (relative path) ensures that asset paths (like /assets/...)
  // are correctly resolved relative to the index.html file during the build.
  base: './',
  // --- FIX END ---
  
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      // Alias is correctly configured to use paths starting with '@/' for your 'src' folder
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
