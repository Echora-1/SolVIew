<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import CopyableValue from '../components/CopyableValue.vue'
import TransactionTable from '../components/TransactionTable.vue'
import type { TxStatus } from '../types/solana'

defineProps<{ address: string }>()

const search = ref('')
const statusFilter = ref<TxStatus | 'all'>('all')
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
      <span>Все транзакции для</span>
      <CopyableValue :value="address" copied-message="Адрес скопирован" />
    </div>

    <div class="mb-4 flex flex-col gap-2 sm:flex-row">
      <input
        v-model="search"
        type="text"
        spellcheck="false"
        autocomplete="off"
        placeholder="Поиск по сигнатуре"
        class="h-11 appearance-none rounded-lg border border-border bg-card px-4 text-base text-gray-100 outline-none transition focus:border-accent sm:flex-1 sm:text-sm"
      />
      <div class="relative">
        <select
          v-model="statusFilter"
          class="h-11 w-full appearance-none rounded-lg border border-border bg-card pl-3 pr-9 text-base text-gray-100 outline-none transition focus:border-accent sm:text-sm"
        >
          <option value="all">Все статусы</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
        <svg
          class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>

    <TransactionTable
      :address="address"
      :limit="25"
      :search="search"
      :status-filter="statusFilter"
    />
  </main>
</template>
