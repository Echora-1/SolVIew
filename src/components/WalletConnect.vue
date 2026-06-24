<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWallet } from 'solana-wallets-vue'
import { WalletReadyState } from '@solana/wallet-adapter-base'
import type { WalletName } from '@solana/wallet-adapter-base'
import { useWalletStore } from '../stores/useWalletStore'
import { shortenAddress } from '../lib/format'
import { useToast } from '../composables/useToast'

const { wallets, publicKey, connecting, select, connect, disconnect } =
  useWallet()
const store = useWalletStore()
const route = useRoute()
const router = useRouter()
const { pushToast } = useToast()

// Make the connected wallet the active address everywhere by writing it into
// the URL: the `?address` query on the dashboard, or the route param on the
// detail pages (which read the address from the URL path).
function switchToWallet(walletAddress: string) {
  if (route.name === 'transactions' || route.name === 'nfts') {
    router.replace({ name: route.name, params: { address: walletAddress } })
    return
  }
  router.replace({ query: { ...route.query, address: walletAddress } })
}

watch(
  publicKey,
  (key) => {
    store.setWallet(key ? key.toBase58() : null)
    if (key) switchToWallet(key.toBase58())
  },
  { immediate: true },
)

function goToProfile() {
  menuOpen.value = false
  const walletAddress = store.walletAddress
  if (walletAddress) {
    router.push({ path: '/', query: { address: walletAddress } })
  }
}

const modalOpen = ref(false)
const menuOpen = ref(false)

const address = computed(() => store.walletAddress ?? '')

// Detected wallets first, then the rest.
const sortedWallets = computed(() =>
  [...wallets.value].sort((a, b) => {
    const ai = a.readyState === WalletReadyState.Installed ? 0 : 1
    const bi = b.readyState === WalletReadyState.Installed ? 0 : 1
    return ai - bi
  }),
)

function readyLabel(state: WalletReadyState): string {
  return state === WalletReadyState.Installed ? 'Обнаружен' : 'Не установлен'
}

async function choose(name: WalletName) {
  select(name)
  modalOpen.value = false
  await nextTick()
  try {
    await connect()
  } catch {
    pushToast('Не удалось подключить кошелёк')
  }
}

async function onDisconnect() {
  menuOpen.value = false
  try {
    await disconnect()
  } catch {
    // Ignore: local state is cleared regardless below.
  }
  // Drive the UI off the store rather than the adapter's publicKey, which does
  // not always update reactively on disconnect.
  store.setWallet(null)
}
</script>

<template>
  <div class="relative">
    <!-- disconnected -->
    <button
      v-if="!store.walletAddress"
      type="button"
      class="h-10 rounded-lg bg-accent px-4 text-sm font-medium text-white transition hover:bg-accent/90 disabled:opacity-60"
      :disabled="connecting"
      @click="modalOpen = true"
    >
      {{ connecting ? 'Подключение…' : 'Подключить кошелёк' }}
    </button>

    <!-- connected -->
    <button
      v-else
      type="button"
      class="h-10 rounded-lg border border-border bg-card px-4 text-sm font-medium text-gray-100 transition hover:bg-card/70"
      @click="menuOpen = !menuOpen"
    >
      {{ shortenAddress(address, 4) }}
    </button>

    <!-- connected dropdown -->
    <template v-if="menuOpen">
      <div class="fixed inset-0 z-40" @click="menuOpen = false" />
      <div
        class="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border border-border bg-card shadow-xl"
      >
        <button
          type="button"
          class="block w-full px-4 py-2.5 text-left text-sm text-gray-200 transition hover:bg-white/5"
          @click="goToProfile"
        >
          Мой профиль
        </button>
        <button
          type="button"
          class="block w-full border-t border-border px-4 py-2.5 text-left text-sm text-red-400 transition hover:bg-white/5"
          @click="onDisconnect"
        >
          Отключить
        </button>
      </div>
    </template>

    <!-- wallet selection modal -->
    <Teleport to="body">
      <div
        v-if="modalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        @click.self="modalOpen = false"
      >
        <div class="w-full max-w-sm rounded-2xl border border-border bg-card p-5">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-base font-semibold text-gray-100">
              Выберите кошелёк
            </h2>
            <button
              type="button"
              class="text-gray-500 transition hover:text-gray-200"
              @click="modalOpen = false"
            >
              ✕
            </button>
          </div>

          <div class="flex flex-col gap-2">
            <button
              v-for="w in sortedWallets"
              :key="w.adapter.name"
              type="button"
              class="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-left transition hover:bg-white/5"
              @click="choose(w.adapter.name)"
            >
              <img
                :src="w.adapter.icon"
                :alt="w.adapter.name"
                class="h-6 w-6 rounded"
              />
              <span class="flex-1 text-sm font-medium text-gray-100">
                {{ w.adapter.name }}
              </span>
              <span class="text-xs text-gray-500">
                {{ readyLabel(w.readyState) }}
              </span>
            </button>

            <p
              v-if="sortedWallets.length === 0"
              class="py-6 text-center text-sm text-gray-500"
            >
              Кошельки не найдены. Установите Phantom или Solflare.
            </p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
