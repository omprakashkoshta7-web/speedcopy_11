import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('fabric')) {
            return 'fabric';
          }

          if (id.includes('lucide-react')) {
            return 'icons';
          }

          if (id.includes('react-router') || id.includes('react-dom') || id.includes('\\react\\') || id.includes('/react/')) {
            return 'react-vendor';
          }

          return 'vendor';
        },
      },
    },
  },
})
