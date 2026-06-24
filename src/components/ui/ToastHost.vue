<script setup lang="ts">
import { useToast } from '../../composables/useToast'

const { toasts, removeToast } = useToast()

const accent: Record<string, string> = {
  error: 'border-red-500/60',
  info: 'border-sky-500/60',
  success: 'border-accent2/60',
}
</script>

<template>
  <div class="fixed bottom-4 right-4 z-50 flex w-80 max-w-[90vw] flex-col gap-2">
    <button
      v-for="toast in toasts"
      :key="toast.id"
      type="button"
      class="rounded-lg border bg-card px-4 py-3 text-left text-sm text-gray-100 shadow-lg transition hover:bg-card/80"
      :class="accent[toast.type]"
      @click="removeToast(toast.id)"
    >
      {{ toast.message }}
    </button>
  </div>
</template>
