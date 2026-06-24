<script setup lang="ts">
defineProps<{ message: string; icon?: string }>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/40 px-6 py-12 text-center"
  >
    <span class="text-3xl opacity-70">{{ icon ?? '◎' }}</span>
    <p class="max-w-sm text-sm text-gray-400">{{ message }}</p>
  </div>
</template>
