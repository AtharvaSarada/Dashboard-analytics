import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Code splitting optimization
    rollupOptions: {
      output: {
        // Separate chunks for different parts of the app
        manualChunks: {
          // Vendor libraries
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-ui': ['@headlessui/vue', '@heroicons/vue'],
          'vendor-charts': ['chart.js'],
          'vendor-utils': ['socket.io-client'],
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000
  },
  // Development server optimization
  server: {
    hmr: {
      overlay: false
    }
  },
  // CSS optimization
  css: {
    devSourcemap: true
  },
  // Enable dependency pre-bundling for faster dev startup
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'chart.js',
      'socket.io-client',
      '@heroicons/vue/24/outline',
      '@headlessui/vue'
    ],
    exclude: ['@vueuse/core']
  },
  // Enable esbuild for faster builds
  esbuild: {
    target: 'es2020'
  }
})
