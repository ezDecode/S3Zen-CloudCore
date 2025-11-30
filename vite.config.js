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
          // React must be in its own chunk and loaded first
          'react-vendor': ['react', 'react-dom'],
          
          // UI libraries that depend on React - bundle together
          'ui-vendor': [
            'lucide-react',
            'hugeicons-react', 
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-slot',
            'vaul',
            'sonner',
            'framer-motion',
            'class-variance-authority',
            'clsx',
            'tailwind-merge'
          ],
          
          // AWS SDKs
          'aws-s3': [
            '@aws-sdk/client-s3',
            '@aws-sdk/lib-storage',
            '@aws-sdk/s3-request-presigner'
          ],
          'aws-auth': [
            '@aws-sdk/client-cognito-identity',
            '@aws-sdk/client-sts',
            '@aws-sdk/credential-provider-cognito-identity',
            'amazon-cognito-identity-js'
          ],
          
          // Markdown & syntax highlighting
          'markdown': [
            'react-markdown',
            'remark-gfm',
            'react-syntax-highlighter'
          ],
          
          // Utilities
          'utils': ['date-fns', 'buffer', 'stream-browserify', 'util']
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
