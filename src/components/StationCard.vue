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
        <svg :class="['w-3 h-3', station.status === 'activa' ? 'animate-none' : '']" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        <span>{{ statusLabel }}</span>
      </div>
    </div>

    <!-- Operario -->
    <div class="mb-3 pb-3 border-b border-border">
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-xs text-secondary">Operario:</span>
        <button v-if="!isEditing && !props.readonly"
          @click="startEdit"
          title="Editar operario"
          class="p-0.5 rounded text-muted hover:text-indigo-400 transition-colors">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
      <!-- Input edición -->
      <div v-if="isEditing" class="flex items-center gap-1">
        <input
          ref="inputRef"
          v-model="localOperatorName"
          type="text"
          placeholder="Nombre del operario"
          maxlength="40"
          @keydown.enter="confirmEdit"
          @keydown.escape="cancelEdit"
          @blur="confirmEdit"
          class="flex-1 bg-input border border-indigo-500 rounded px-2 py-1 text-xs text-primary
                 placeholder-[#475569] outline-none min-w-0"
        />
      </div>
      <!-- Visualización -->
      <p v-else class="text-xs"
        :class="station.operatorName ? 'text-primary font-medium' : 'text-muted italic'">
        {{ station.operatorName || 'Sin asignar' }}
      </p>
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
import { computed, ref, nextTick } from 'vue'
import { Station } from '../types'

interface Props {
  station: Station
  readonly?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:operatorName': [name: string] }>()

// ─── Edición de operario ──────────────────────────────────────────────────────
const isEditing = ref(false)
const localOperatorName = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function startEdit() {
  localOperatorName.value = props.station.operatorName ?? ''
  isEditing.value = true
  nextTick(() => inputRef.value?.focus())
}

function confirmEdit() {
  isEditing.value = false
  emit('update:operatorName', localOperatorName.value)
}

function cancelEdit() {
  isEditing.value = false
}

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
