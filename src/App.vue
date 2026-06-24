<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import WalletConnect from './components/WalletConnect.vue'
import ToastHost from './components/ui/ToastHost.vue'

const route = useRoute()

// Logo returns to the dashboard but keeps the current address (from the
// ?address query, or the route param on the detail pages).
const homeLink = computed(() => {
  const raw = route.query.address ?? route.params.address
  const address = Array.isArray(raw) ? raw[0] : raw
  return address ? { path: '/', query: { address } } : { path: '/' }
})
</script>

<template>
  <div class="min-h-screen">
    <header class="border-b border-border">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <RouterLink :to="homeLink" class="flex items-center gap-2">
          <span class="text-xl">◎</span>
          <h1 class="text-lg font-semibold">Sol View</h1>
        </RouterLink>
        <WalletConnect />
      </div>
    </header>

    <RouterView />

    <ToastHost />
  </div>
</template>
