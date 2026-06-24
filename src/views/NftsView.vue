<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import CopyableValue from '../components/CopyableValue.vue'
import NftGallery from '../components/NftGallery.vue'

defineProps<{ address: string }>()

const search = ref('')
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 py-8">
    <RouterLink
      :to="{ path: '/', query: { address } }"
      class="mb-6 inline-flex items-center gap-1 text-sm text-gray-400 transition hover:text-gray-200"
    >
      ← На главную
    </RouterLink>

    <div class="mb-4 flex items-center gap-2 text-sm text-gray-400">
      <span>Все NFT для</span>
      <CopyableValue :value="address" copied-message="Адрес скопирован" />
    </div>

    <input
      v-model="search"
      type="text"
      spellcheck="false"
      autocomplete="off"
      placeholder="Поиск по названию"
      class="mb-4 h-11 w-full appearance-none rounded-lg border border-border bg-card px-4 text-base text-gray-100 outline-none transition focus:border-accent sm:text-sm"
    />

    <NftGallery :address="address" :limit="50" :search="search" />
  </main>
</template>
