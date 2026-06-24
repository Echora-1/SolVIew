<script setup lang="ts">
import { shortenAddress } from '../lib/format'
import { useToast } from '../composables/useToast'

const props = withDefaults(
  defineProps<{ value: string; chars?: number; copiedMessage?: string }>(),
  { chars: 6, copiedMessage: 'Скопировано' },
)

const { pushToast } = useToast()

async function copy() {
  try {
    await navigator.clipboard.writeText(props.value)
    pushToast(props.copiedMessage, 'success')
  } catch {
    pushToast('Не удалось скопировать')
  }
}
</script>

<template>
  <span class="group relative inline-flex">
    <button
      type="button"
      :aria-label="value"
      class="cursor-pointer font-mono text-gray-200 transition hover:text-white"
      @click="copy"
    >
      {{ shortenAddress(value, chars) }}
    </button>

    <!-- custom tooltip: visible immediately, shows the full value.
         On mobile it anchors to the left edge, wraps and caps to the
         viewport width so a long address never overflows the screen. -->
    <span
      class="pointer-events-none absolute bottom-full left-0 z-20 mb-1.5 max-w-[calc(100vw-2rem)] break-all rounded-md border border-border bg-surface px-2 py-1 font-mono text-xs text-gray-100 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 sm:max-w-none sm:whitespace-nowrap sm:break-normal"
    >
      {{ value }}
    </span>
  </span>
</template>
