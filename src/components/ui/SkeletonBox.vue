<script setup lang="ts">
withDefaults(
  defineProps<{ width?: string; height?: string; rounded?: string }>(),
  { width: '100%', height: '1rem', rounded: '0.375rem' },
)
</script>

<template>
  <div
    class="animate-pulse bg-white/10"
    :style="{ width, height, borderRadius: rounded }"
  />
</template>
