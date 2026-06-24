import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// web3.js and umi expect a Node-style Buffer/global in the browser.
export default defineConfig({
  plugins: [
    vue(),
    nodePolyfills({
      globals: { Buffer: true, global: true, process: true },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
