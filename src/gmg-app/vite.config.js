import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001',
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true
      }
    }
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: './src/setupTests.js',
    server: {
      deps: {
        // chart.js 3 resolves to its CommonJS build under Node, which breaks
        // chartjs-adapter-date-fns' named ESM import. Let Vite transform these
        // so tests resolve modules the same way the browser build does.
        inline: [/chart\.js/, /chartjs-/]
      }
    }
  }
})
