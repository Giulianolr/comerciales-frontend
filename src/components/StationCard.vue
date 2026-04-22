<template>
  <div class="bg-surface rounded-lg border border-border p-4">
    <!-- Header: Name + Status -->
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-semibold text-primary text-sm">{{ station.name }}</h3>
      <div :class="[
        'px-2 py-1 rounded text-xs font-medium flex items-center gap-1',
        station.status === 'activa' ? 'bg-success-500/10 text-success-500' :
        station.status === 'error' ? 'bg-danger-500/10 text-danger-500' :
        station.status === 'mantenimiento' ? 'bg-warning-500/10 text-warning-500' :
        'bg-muted/10 text-muted'
      ]">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        <span>{{ statusLabel }}</span>
      </div>
    </div>

    <!-- Operario -->
    <div class="mb-3 pb-3 border-b border-border">
      <span class="text-xs text-secondary block mb-1">Operario:</span>
      <div class="flex items-center gap-2">
        <div v-if="station.operatorName"
          class="w-5 h-5 rounded-full bg-brand-500/15 flex items-center justify-center text-brand-400 text-[10px] font-semibold shrink-0">
          {{ operatorInitials }}
        </div>
        <p class="text-xs"
          :class="station.operatorName ? 'text-primary font-medium' : 'text-muted italic'">
          {{ station.operatorName || 'Sin asignar' }}
        </p>
      </div>
    </div>

    <!-- Stats -->
    <div class="space-y-2 mb-3 pb-3 border-b border-border">
      <div class="flex items-center justify-between">
        <span class="text-xs text-secondary">Transacciones:</span>
        <span class="text-sm font-semibold text-primary">{{ station.transactionsToday }}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="text-xs text-secondary">Ventas hoy:</span>
        <span class="text-sm font-semibold text-success-500">${{ station.ventasToday.toLocaleString('es-CL') }}</span>
      </div>
    </div>

    <!-- Last Activity -->
    <div>
      <p class="text-xs text-secondary">Último evento:</p>
      <p class="text-xs text-primary">{{ lastActivityLabel }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Station } from '../types'

interface Props {
  station: Station
}

const props = defineProps<Props>()

const operatorInitials = computed(() => {
  if (!props.station.operatorName) return ''
  return props.station.operatorName
    .split(' ')
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

const statusLabel = computed(() => {
  const labels: Record<string, string> = {
    activa: 'Activa',
    inactiva: 'Inactiva',
    error: 'Error',
    mantenimiento: 'Mantenimiento'
  }
  return labels[props.station.status]
})

const lastActivityLabel = computed(() => {
  if (!props.station.lastActivityAt) return 'Nunca'

  const lastActivity = new Date(props.station.lastActivityAt)
  const now = new Date()
  const diffMs = now.getTime() - lastActivity.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Hace unos segundos'
  if (diffMins < 60) return `Hace ${diffMins}min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays === 1) return 'Ayer'

  return lastActivity.toLocaleString('es-CL')
})
</script>
