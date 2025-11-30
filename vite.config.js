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
          // React core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }

          // AWS S3 SDK
          if (id.includes('@aws-sdk/client-s3') || 
              id.includes('@aws-sdk/lib-storage') || 
              id.includes('@aws-sdk/s3-request-presigner')) {
            return 'aws-s3';
          }

          // AWS Auth SDK
          if (id.includes('@aws-sdk/client-cognito-identity') || 
              id.includes('@aws-sdk/client-sts') || 
              id.includes('@aws-sdk/credential-provider-cognito-identity') || 
              id.includes('amazon-cognito-identity-js')) {
            return 'aws-auth';
          }

          // Framer Motion
          if (id.includes('framer-motion')) {
            return 'animations';
          }

          // UI Components
          if (id.includes('@radix-ui') || 
              id.includes('vaul') || 
              id.includes('sonner')) {
            return 'ui-components';
          }

          // Icons
          if (id.includes('hugeicons-react') || id.includes('lucide-react')) {
            return 'icons';
          }

          // Utilities
          if (id.includes('date-fns') || 
              id.includes('clsx') || 
              id.includes('tailwind-merge') || 
              id.includes('class-variance-authority')) {
            return 'utils';
          }

          // Split large preview libraries into separate chunks
          if (id.includes('react-syntax-highlighter')) {
            // Split syntax highlighter by language groups
            if (id.includes('refractor')) {
              return 'syntax-refractor';
            }
            return 'syntax-highlighter';
          }

          if (id.includes('react-markdown') || id.includes('remark-gfm')) {
            return 'markdown';
          }

          // Split other large dependencies
          if (id.includes('unified') || id.includes('micromark') || id.includes('mdast')) {
            return 'markdown-parser';
          }

          // Polyfills
          if (id.includes('buffer') || 
              id.includes('stream-browserify') || 
              id.includes('util')) {
            return 'polyfills';
          }

          // Default: let Vite handle other node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    // Increase chunk size warning limit (syntax-highlighter is large but necessary)
    chunkSizeWarningLimit: 1500,
    // Use esbuild for faster minification
    minify: 'esbuild',
    target: 'es2015',
  },
});
