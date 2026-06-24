<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useSolana } from '../composables/useSolana'
import { useAsyncData } from '../composables/useAsyncData'
import {
  formatSolChange,
  formatTxTime,
  shortenAddress,
  solChangeTone,
} from '../lib/format'
import SkeletonBox from './ui/SkeletonBox.vue'
import type { TxRow, TxStatus } from '../types/solana'

const props = withDefaults(
  defineProps<{
    address: string
    limit?: number
    viewAllTo?: string
    search?: string
    statusFilter?: TxStatus | 'all'
  }>(),
  { limit: 10, viewAllTo: '', search: '', statusFilter: 'all' },
)

const { getTransactions } = useSolana()

const { status, data } = useAsyncData<TxRow[]>(
  () => props.address,
  (address) => getTransactions(address, props.limit),
  'Не удалось загрузить транзакции.',
)

const rows = computed(() => data.value ?? [])

const visibleRows = computed(() => {
  const query = props.search.trim().toLowerCase()
  return rows.value.filter((row) => {
    const matchesStatus =
      props.statusFilter === 'all' || row.status === props.statusFilter
    const matchesQuery = !query || row.signature.toLowerCase().includes(query)
    return matchesStatus && matchesQuery
  })
})

function explorerUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}`
}
</script>

<template>
  <section class="rounded-xl border border-border bg-card p-5">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-sm font-medium text-gray-200">История транзакций</h2>
      <RouterLink
        v-if="viewAllTo"
        :to="viewAllTo"
        class="text-xs text-accent transition hover:underline"
      >
        Смотреть все →
      </RouterLink>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[560px] table-fixed text-left text-sm">
      <thead class="text-xs uppercase tracking-wide text-gray-500">
        <tr>
          <th class="pb-2 font-medium">Сигнатура</th>
          <th class="w-32 pb-2 font-medium">Время</th>
          <th class="w-32 pb-2 text-right font-medium">Изменение</th>
          <th class="w-24 pb-2 text-right font-medium">Статус</th>
        </tr>
      </thead>
      <tbody>
        <!-- loading: skeleton rows keep the layout stable -->
        <template v-if="status === 'loading'">
          <tr
            v-for="n in limit"
            :key="`s-${n}`"
            class="h-[42px] border-t border-border/60"
          >
            <td><SkeletonBox height="1rem" width="80%" /></td>
            <td><SkeletonBox height="1rem" width="5rem" /></td>
            <td>
              <div class="flex justify-end">
                <SkeletonBox height="1rem" width="5rem" />
              </div>
            </td>
            <td>
              <div class="flex justify-end">
                <SkeletonBox height="1rem" width="4rem" />
              </div>
            </td>
          </tr>
        </template>

        <tr v-else-if="status === 'error'" class="border-t border-border/60">
          <td colspan="4" class="py-6 text-center text-sm text-red-400">
            Не удалось загрузить транзакции.
          </td>
        </tr>

        <tr v-else-if="rows.length === 0" class="border-t border-border/60">
          <td colspan="4" class="py-6 text-center text-sm text-gray-500">
            Транзакции не найдены для этого адреса.
          </td>
        </tr>

        <tr
          v-else-if="visibleRows.length === 0"
          class="border-t border-border/60"
        >
          <td colspan="4" class="py-6 text-center text-sm text-gray-500">
            Ничего не найдено по вашему запросу.
          </td>
        </tr>

        <tr
          v-else
          v-for="row in visibleRows"
          :key="row.signature"
          class="h-[42px] border-t border-border/60"
        >
          <td>
            <a
              :href="explorerUrl(row.signature)"
              target="_blank"
              rel="noopener noreferrer"
              class="font-mono text-accent hover:underline"
            >
              {{ shortenAddress(row.signature, 6) }}
            </a>
          </td>
          <td class="text-gray-400">{{ formatTxTime(row.blockTime) }}</td>
          <td
            class="text-right font-mono"
            :class="{
              'text-gray-400': solChangeTone(row.change) === 'flat',
              'text-emerald-400': solChangeTone(row.change) === 'up',
              'text-red-400': solChangeTone(row.change) === 'down',
            }"
          >
            {{ formatSolChange(row.change) }}
          </td>
          <td class="text-right">
            <span
              class="rounded px-2 py-0.5 text-xs font-medium"
              :class="
                row.status === 'success'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-red-500/15 text-red-400'
              "
            >
              {{ row.status === 'success' ? 'Success' : 'Failed' }}
            </span>
          </td>
        </tr>
      </tbody>
      </table>
    </div>
  </section>
</template>
