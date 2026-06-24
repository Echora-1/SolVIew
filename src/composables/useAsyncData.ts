import { ref, watch, type Ref } from 'vue'
import { useToast } from './useToast'
import { isRateLimitError, RATE_LIMIT_MESSAGE } from '../lib/rpcError'
import type { LoadStatus } from '../types/solana'

interface UseAsyncDataResult<T> {
  status: Ref<LoadStatus>
  data: Ref<T | null>
}

/**
 * Load data for a reactive key, tracking loading/error state and surfacing a
 * toast on failure. Reloads whenever the key changes; ignores empty keys.
 *
 * Centralises the fetch/try-catch/toast flow shared by the dashboard blocks.
 */
export function useAsyncData<T>(
  key: () => string | null,
  fetcher: (key: string) => Promise<T>,
  errorMessage: string,
): UseAsyncDataResult<T> {
  const { pushToast } = useToast()

  const status = ref<LoadStatus>('idle')
  const data = ref<T | null>(null) as Ref<T | null>

  async function load(current: string) {
    status.value = 'loading'
    data.value = null
    try {
      data.value = await fetcher(current)
      status.value = 'success'
    } catch (error) {
      status.value = 'error'
      pushToast(isRateLimitError(error) ? RATE_LIMIT_MESSAGE : errorMessage)
    }
  }

  watch(
    key,
    (current) => {
      if (current) load(current)
    },
    { immediate: true },
  )

  return { status, data }
}
