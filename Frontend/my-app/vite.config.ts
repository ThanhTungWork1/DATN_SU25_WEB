import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        // Point to Laragon-served Laravel app (adjust if you use a virtual host)
        target: 'http://localhost/DATN_SU25_WEB/public',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});


