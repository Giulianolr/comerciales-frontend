<template>
  <div
    class="flex items-center gap-3 px-4 py-3 border-b border-border hover:bg-surface-2 transition-colors cursor-pointer group"
    @click="$emit('navigate')"
  >
    <!-- Texto -->
    <div class="flex-1 min-w-0">
      <p class="text-xs font-semibold" :class="titleClass">{{ alert.title }}</p>
      <p class="text-xs text-primary font-medium truncate">{{ alert.subtitle }}</p>
      <p class="text-xs text-secondary mt-0.5">{{ alert.detail }}</p>
      <p class="text-[10px] text-muted mt-1">{{ timeAgo }}</p>
    </div>

    <!-- Indicador no leída (derecha): ícono rojo si no fue clickeada, nada si ya se vio -->
    <div v-if="!alert.read" class="shrink-0">
      <svg v-if="alert.severity === 'critical'" class="w-4 h-4 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <svg v-else-if="alert.severity === 'error'" class="w-4 h-4 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <svg v-else class="w-4 h-4 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    </div>

    <!-- Descartar -->
    <button
      @click.stop="$emit('acknowledge')"
      title="Descartar"
      class="shrink-0 p-1 rounded text-muted hover:text-secondary hover:bg-surface transition-colors opacity-0 group-hover:opacity-100"
    >
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppAlert } from '../stores/alerts.store'

const props = defineProps<{ alert: AppAlert }>()
defineEmits<{ acknowledge: []; navigate: [] }>()

const titleClass = computed(() => {
  if (props.alert.severity === 'critical') return 'text-danger-400'
  if (props.alert.severity === 'error')    return 'text-orange-400'
  return 'text-warning-400'
})

const timeAgo = computed(() => {
  const diff = Date.now() - new Date(props.alert.triggeredAt).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'Hace un momento'
  if (mins < 60) return `Hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  return `Hace ${hrs}h`
})
</script>
