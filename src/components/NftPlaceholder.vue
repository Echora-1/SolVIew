<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ name?: string; seed?: string }>()

const initial = computed(() => {
  const char = props.name?.trim()?.[0]
  return char ? char.toUpperCase() : '◎'
})

// Deterministic hue from the seed so each NFT gets its own gradient.
const hue = computed(() => {
  const source = props.seed || props.name || ''
  let acc = 0
  for (let i = 0; i < source.length; i++) {
    acc = (acc * 31 + source.charCodeAt(i)) % 360
  }
  return acc
})

const gradient = computed(
  () =>
    `linear-gradient(135deg, hsl(${hue.value} 45% 32%), hsl(${(hue.value + 45) % 360} 50% 16%))`,
)
</script>

<template>
  <div
    class="flex items-center justify-center overflow-hidden"
    :style="{ backgroundImage: gradient }"
  >
    <span class="select-none text-4xl font-bold text-white/80">
      {{ initial }}
    </span>
  </div>
</template>
