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
        manualChunks: {
          // React MUST be in its own chunk and loaded first
          'react-vendor': ['react', 'react-dom'],
          
          // UI libraries that depend on React
          'ui-vendor': [
            'framer-motion',
            'lucide-react',
            'hugeicons-react',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-slot',
            '@radix-ui/react-accordion',
            'vaul',
            'sonner',
          ],
          
          // AWS SDKs
          'aws-s3': [
            '@aws-sdk/client-s3',
            '@aws-sdk/lib-storage',
            '@aws-sdk/s3-request-presigner'
          ],
          'aws-auth': [
            '@aws-sdk/client-sts'
          ],
          
          // Markdown (lazy loaded)
          'markdown': [
            'react-markdown',
            'remark-gfm',
            'react-syntax-highlighter'
          ],
          
          // Utilities
          'utils': [
            'date-fns',
            'clsx',
            'tailwind-merge',
            'class-variance-authority'
          ]
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
