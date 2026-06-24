import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type AddressSource = 'manual' | 'wallet'

export const useWalletStore = defineStore('wallet', () => {
  const manualAddress = ref<string | null>(null)
  const walletAddress = ref<string | null>(null)

  // A manually searched address takes priority, so users can inspect another
  // portfolio without disconnecting their own wallet.
  const activeAddress = computed<string | null>(
    () => manualAddress.value ?? walletAddress.value,
  )

  const source = computed<AddressSource | null>(() => {
    if (manualAddress.value) return 'manual'
    if (walletAddress.value) return 'wallet'
    return null
  })

  // True only when viewing a manually searched address that is not the
  // connected wallet's own address.
  const isExternalSearch = computed(
    () =>
      manualAddress.value !== null &&
      manualAddress.value !== walletAddress.value,
  )

  function setManual(address: string): void {
    manualAddress.value = address
  }

  function clearManual(): void {
    manualAddress.value = null
  }

  function setWallet(address: string | null): void {
    walletAddress.value = address
  }

  return {
    manualAddress,
    walletAddress,
    activeAddress,
    source,
    isExternalSearch,
    setManual,
    clearManual,
    setWallet,
  }
})
