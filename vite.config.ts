import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// web3.js and umi expect a Node-style Buffer/global in the browser.
export default defineConfig(({ command }) => ({
  // Served from a project subpath on GitHub Pages; root during local dev.
  base: command === 'build' ? '/SolVIew/' : '/',
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
}))
