<script setup lang="ts">
import { useSolana } from '../composables/useSolana'
import { useAsyncData } from '../composables/useAsyncData'
import { formatSol } from '../lib/format'
import SkeletonBox from './ui/SkeletonBox.vue'

const props = defineProps<{ address: string }>()

const { getBalance } = useSolana()

const { status, data: balance } = useAsyncData(
  () => props.address,
  (address) => getBalance(address),
  'Не удалось загрузить баланс.',
)
</script>

<template>
  <section class="rounded-xl border border-border bg-card p-5">
    <p class="text-xs uppercase tracking-wide text-gray-500">Баланс</p>
    <div class="mt-3 flex h-9 items-center">
      <SkeletonBox v-if="status === 'loading'" width="9rem" height="2.25rem" />
      <p v-else-if="status === 'error'" class="text-sm text-red-400">
        Ошибка загрузки
      </p>
      <p v-else class="text-3xl font-semibold leading-9 text-accent2">
        {{ balance !== null ? formatSol(balance) : '0' }}
        <span class="text-lg font-normal text-gray-400">SOL</span>
      </p>
    </div>
  </section>
</template>
