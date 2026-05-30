import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

const backendHost = process.env.BACKEND_HOST || 'localhost'

export default defineConfig({
  plugins: [svelte()],
  server: {
    host: '0.0.0.0',
    watch: {
      usePolling: true,
      interval: 300
    },
    proxy: {
      '/api': `http://${backendHost}:3000`,
      '/ws': {
        target: `ws://${backendHost}:3000`,
        ws: true,
        rewriteWsOrigin: true
      }
    }
  }
})
