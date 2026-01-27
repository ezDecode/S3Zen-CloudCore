import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-aws': ['@aws-sdk/client-s3', '@aws-sdk/lib-storage', '@aws-sdk/client-sts', '@aws-sdk/s3-request-presigner'],
          'vendor-motion': ['motion'],
          'vendor-ui': ['@base-ui/react', '@radix-ui/react-dialog', '@radix-ui/react-slot', '@radix-ui/react-toast', 'vaul', 'sonner'],
          'vendor-react': ['react', 'react-dom'],
        },
      },
    },
  },
})
