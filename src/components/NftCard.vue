<script setup lang="ts">
import { ref } from 'vue'
import NftPlaceholder from './NftPlaceholder.vue'
import type { NftItem } from '../types/solana'

defineProps<{ nft: NftItem }>()

const loaded = ref(false)
const broken = ref(false)
</script>

<template>
  <article
    class="flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:border-accent/50"
  >
    <div class="relative aspect-square overflow-hidden bg-black/30">
      <img
        v-if="nft.image && !broken"
        :src="nft.image"
        :alt="nft.name"
        loading="lazy"
        class="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
        :class="loaded ? 'opacity-100' : 'opacity-0'"
        @load="loaded = true"
        @error="broken = true"
      />

      <NftPlaceholder
        v-if="!nft.image || broken"
        :name="nft.name"
        :seed="nft.mint"
        class="absolute inset-0"
      />

      <!-- overlay skeleton while the image is loading; does not affect layout -->
      <div
        v-if="nft.image && !loaded && !broken"
        class="absolute inset-0 animate-pulse bg-white/10"
      />
    </div>

    <div class="p-3">
      <p class="truncate text-sm font-medium text-gray-100" :title="nft.name">
        {{ nft.name || 'Без названия' }}
      </p>
      <p class="mt-1 line-clamp-2 h-8 text-xs leading-4 text-gray-500">
        {{ nft.description }}
      </p>
    </div>
  </article>
</template>
