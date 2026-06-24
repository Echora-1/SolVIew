<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { addressSchema } from '../schemas/wallet.schema'
import { useWalletStore } from '../stores/useWalletStore'

const DEMO_DEFAULT_ADDRESS = 'HaRn6167N9tRH3XazRYfKmioE4okKhhxJ56FDirUnSq4'

const store = useWalletStore()
const route = useRoute()
const router = useRouter()

const { handleSubmit, errors, defineField, resetForm } = useForm({
  validationSchema: toTypedSchema(addressSchema),
})

const [address, addressAttrs] = defineField('address')

function readQueryAddress(): string | null {
  const raw = route.query.address
  const value = Array.isArray(raw) ? raw[0] : raw
  if (typeof value !== 'string') return null
  return addressSchema.safeParse({ address: value }).success ? value : null
}

// The URL query is the source of truth for the manual address, so a shared
// `/?address=...` link (and browser back/forward) loads that portfolio.
function syncFromQuery() {
  const value = readQueryAddress()
  if (value) {
    store.setManual(value)
  } else if (!route.query.address) {
    store.clearManual()
  }
}

syncFromQuery()
watch(() => route.query.address, syncFromQuery)

onMounted(() => {
  if (!store.activeAddress) {
    router.replace({ query: { ...route.query, address: DEMO_DEFAULT_ADDRESS } })
  }
})

// Mirror the active address (manual or connected wallet) in the input.
// resetForm also clears validation state, so this programmatic change never
// surfaces a "required"/"invalid" error.
watch(
  () => store.activeAddress,
  (addr) => resetForm({ values: { address: addr ?? '' } }),
  { immediate: true },
)

const onSubmit = handleSubmit((values) => {
  router.push({ query: { ...route.query, address: values.address } })
})

function onReset() {
  const query = { ...route.query }
  delete query.address
  router.push({ query })
}
</script>

<template>
  <form class="flex flex-col gap-2" @submit="onSubmit">
    <div class="flex flex-col gap-2 sm:flex-row">
      <input
        v-model="address"
        v-bind="addressAttrs"
        type="text"
        spellcheck="false"
        autocomplete="off"
        placeholder="Введите Solana-адрес для просмотра портфеля"
        class="h-11 appearance-none rounded-lg border border-border bg-card px-4 text-base text-gray-100 outline-none transition focus:border-accent sm:flex-1 sm:text-sm"
        :class="errors.address ? 'border-red-500/70' : ''"
      />
      <button
        type="submit"
        class="h-11 rounded-lg bg-accent px-5 text-sm font-medium text-white transition hover:bg-accent/90"
      >
        Поиск
      </button>
      <button
        v-if="store.isExternalSearch"
        type="button"
        class="h-11 rounded-lg border border-border px-5 text-sm text-gray-300 transition hover:bg-card"
        @click="onReset"
      >
        Сбросить
      </button>
    </div>
    <p v-if="errors.address" class="text-xs text-red-400">
      {{ errors.address }}
    </p>
  </form>
</template>
