import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      include: ['buffer', 'stream', 'util', 'process'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      stream: 'stream-browserify',
      util: 'util',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core - MUST include react-window with React
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-window/')) {
            return 'react-vendor';
          }
          
          // AWS S3 SDK - separate chunk
          if (id.includes('@aws-sdk/client-s3') || 
              id.includes('@aws-sdk/lib-storage') || 
              id.includes('@aws-sdk/s3-request-presigner')) {
            return 'aws-s3';
          }
          
          // AWS Auth SDK - separate chunk
          if (id.includes('@aws-sdk/client-sts')) {
            return 'aws-auth';
          }
          
          // Markdown & syntax highlighting - lazy load
          if (id.includes('react-markdown') || 
              id.includes('remark-gfm') || 
              id.includes('react-syntax-highlighter')) {
            return 'markdown';
          }
          
          // UI libraries - bundle together
          if (id.includes('lucide-react') || 
              id.includes('hugeicons-react') || 
              id.includes('@radix-ui') ||
              id.includes('vaul') ||
              id.includes('sonner') ||
              id.includes('framer-motion')) {
            return 'ui-vendor';
          }
          
          // Utilities
          if (id.includes('date-fns') || 
              id.includes('buffer') || 
              id.includes('stream-browserify') ||
              id.includes('util') ||
              id.includes('clsx') ||
              id.includes('tailwind-merge') ||
              id.includes('class-variance-authority')) {
            return 'utils';
          }
          
          // All other node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    // FIXED: Reduced from 1500KB to 800KB with better code splitting
    chunkSizeWarningLimit: 800,
    // Use esbuild for faster minification
    minify: 'esbuild',
    target: 'es2015',
    // Enable source maps for production debugging
    sourcemap: false,
  },
});
