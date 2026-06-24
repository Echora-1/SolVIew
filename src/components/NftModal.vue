<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import CopyableValue from './CopyableValue.vue'
import NftPlaceholder from './NftPlaceholder.vue'
import type { NftItem } from '../types/solana'

defineProps<{ nft: NftItem }>()
const emit = defineEmits<{ close: [] }>()

const broken = ref(false)

function explorerUrl(mint: string): string {
  return `https://explorer.solana.com/address/${mint}`
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      @click.self="$emit('close')"
    >
      <div
        class="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card"
      >
        <div class="relative flex shrink-0 justify-center bg-black/30">
          <img
            v-if="nft.image && !broken"
            :src="nft.image"
            :alt="nft.name"
            class="max-h-[55vh] max-w-full object-contain"
            @error="broken = true"
          />
          <NftPlaceholder
            v-else
            :name="nft.name"
            :seed="nft.mint"
            class="aspect-square w-full"
          />
          <button
            type="button"
            class="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-gray-200 transition hover:bg-black/70"
            @click="$emit('close')"
          >
            ✕
          </button>
        </div>

        <div class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-5">
          <h3 class="text-lg font-semibold text-gray-100">
            {{ nft.name || 'Без названия' }}
          </h3>

          <p
            v-if="nft.description"
            class="whitespace-pre-line text-sm leading-relaxed text-gray-400"
          >
            {{ nft.description }}
          </p>

          <div class="flex items-center gap-2 text-sm text-gray-400">
            <span>Mint:</span>
            <CopyableValue :value="nft.mint" copied-message="Mint скопирован" />
          </div>

          <a
            :href="explorerUrl(nft.mint)"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-accent transition hover:underline"
          >
            Открыть в Solana Explorer ↗
          </a>
        </div>
      </div>
    </div>
  </Teleport>
</template>
