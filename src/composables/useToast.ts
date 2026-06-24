import { reactive } from 'vue'

export type ToastType = 'error' | 'info' | 'success'

export interface Toast {
  id: number
  message: string
  type: ToastType
}

const TOAST_TIMEOUT_MS = 5000

const toasts = reactive<Toast[]>([])
let nextId = 0

export function useToast() {
  function pushToast(message: string, type: ToastType = 'error'): void {
    const id = nextId++
    toasts.push({ id, message, type })
    setTimeout(() => removeToast(id), TOAST_TIMEOUT_MS)
  }

  function removeToast(id: number): void {
    const index = toasts.findIndex((t) => t.id === id)
    if (index !== -1) toasts.splice(index, 1)
  }

  return { toasts, pushToast, removeToast }
}
