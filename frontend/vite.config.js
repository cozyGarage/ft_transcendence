import { defineConfig } from 'vite';
import compression from 'vite-plugin-compression';

export default defineConfig({
  root: './',
  publicDir: 'assets',
  
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        // Simplified code splitting to avoid circular dependencies
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          // Group all Components into one chunk to avoid circular deps
          if (id.includes('/Components/')) {
            return 'components';
          }
        }
      }
    },
    
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    }
  },
  
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/ws': {
        target: 'wss://localhost:8000',
        ws: true,
        secure: false
      }
    }
  },
  
  plugins: [
    // Gzip compression
    compression({
      algorithm: 'gzip',
      ext: '.gz'
    }),
    
    // Brotli compression (better than gzip)
    compression({
      algorithm: 'brotliCompress',
      ext: '.br'
    })
  ],
  
  // Optimize dependencies
  optimizeDeps: {
    include: []
  }
});
