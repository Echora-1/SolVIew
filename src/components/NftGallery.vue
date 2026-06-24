<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useSolana } from '../composables/useSolana'
import { useAsyncData } from '../composables/useAsyncData'
import NftCard from './NftCard.vue'
import NftModal from './NftModal.vue'
import SkeletonBox from './ui/SkeletonBox.vue'
import EmptyState from './ui/EmptyState.vue'
import type { NftItem } from '../types/solana'

const props = withDefaults(
  defineProps<{
    address: string
    limit?: number
    viewAllTo?: string
    search?: string
    gridClass?: string
  }>(),
  {
    limit: 24,
    viewAllTo: '',
    search: '',
    gridClass: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  },
)

const SKELETON_LIMIT = 8

const { getNfts } = useSolana()

const { status, data } = useAsyncData<NftItem[]>(
  () => props.address,
  (address) => getNfts(address, props.limit),
  'Не удалось загрузить NFT.',
)

const nfts = computed(() => data.value ?? [])
const selectedNft = ref<NftItem | null>(null)

const skeletonCount = computed(() => Math.min(props.limit, SKELETON_LIMIT))

const visibleNfts = computed(() => {
  const query = props.search.trim().toLowerCase()
  if (!query) return nfts.value
  return nfts.value.filter((nft) => nft.name.toLowerCase().includes(query))
})
</script>

<template>
  <section class="flex h-full flex-col rounded-xl border border-border bg-card p-5">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-sm font-medium text-gray-200">NFT-галерея</h2>
      <RouterLink
        v-if="viewAllTo"
        :to="viewAllTo"
        class="text-xs text-accent transition hover:underline"
      >
        Смотреть все →
      </RouterLink>
    </div>

    <div v-if="status === 'loading'" class="grid gap-4" :class="gridClass">
      <SkeletonBox
        v-for="n in skeletonCount"
        :key="n"
        height="14rem"
        rounded="0.75rem"
      />
    </div>

    <p v-else-if="status === 'error'" class="text-sm text-red-400">
      Не удалось загрузить NFT.
    </p>

    <EmptyState
      v-else-if="nfts.length === 0"
      class="flex-1"
      message="На этом кошельке не найдено NFT."
    />

    <EmptyState
      v-else-if="visibleNfts.length === 0"
      class="flex-1"
      message="Ничего не найдено по вашему запросу."
    />

    <div v-else class="grid gap-4" :class="gridClass">
      <NftCard
        v-for="nft in visibleNfts"
        :key="nft.mint"
        :nft="nft"
        @click="selectedNft = nft"
      />
    </div>

    <NftModal
      v-if="selectedNft"
      :nft="selectedNft"
      @close="selectedNft = null"
    />
  </section>
</template>
