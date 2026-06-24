<script setup lang="ts">
import { useWalletStore } from '../stores/useWalletStore'
import CopyableValue from '../components/CopyableValue.vue'
import SearchForm from '../components/SearchForm.vue'
import BalanceCard from '../components/BalanceCard.vue'
import TransactionTable from '../components/TransactionTable.vue'
import NftGallery from '../components/NftGallery.vue'
import EmptyState from '../components/ui/EmptyState.vue'

const store = useWalletStore()
</script>

<template>
  <main class="mx-auto max-w-7xl px-4 py-8">
    <SearchForm class="mb-8" />

    <EmptyState
      v-if="!store.activeAddress"
      message="Пожалуйста, подключите кошелёк или введите адрес вручную."
    />

    <div v-else class="flex flex-col gap-6">
      <div class="flex items-center gap-2 text-sm text-gray-400">
        <span>Адрес:</span>
        <CopyableValue :value="store.activeAddress" copied-message="Адрес скопирован" />
      </div>

      <BalanceCard :address="store.activeAddress" />
      <TransactionTable
        :address="store.activeAddress"
        :limit="5"
        :view-all-to="`/transactions/${store.activeAddress}`"
      />
      <NftGallery
        :address="store.activeAddress"
        :limit="4"
        :view-all-to="`/nfts/${store.activeAddress}`"
      />
    </div>
  </main>
</template>
