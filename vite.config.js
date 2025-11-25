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
          // React core
          'react-vendor': ['react', 'react-dom'],

          // AWS SDK - split into separate chunks (these are large)
          'aws-s3': [
            '@aws-sdk/client-s3',
            '@aws-sdk/lib-storage',
            '@aws-sdk/s3-request-presigner',
          ],
          'aws-auth': [
            '@aws-sdk/client-cognito-identity',
            '@aws-sdk/client-sts',
            '@aws-sdk/credential-provider-cognito-identity',
            'amazon-cognito-identity-js',
          ],

          // Animation libraries
          'animations': ['framer-motion'],

          // UI component libraries
          'ui-components': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-slot',
            'vaul',
            'sonner',
          ],

          // Icons
          'icons': ['hugeicons-react', 'lucide-react'],

          // Utility libraries
          'utils': [
            'date-fns',
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
          ],
        },
      },
    },
    // Increase chunk size warning limit (optional, but makes build output cleaner)
    chunkSizeWarningLimit: 600,
  },
});
