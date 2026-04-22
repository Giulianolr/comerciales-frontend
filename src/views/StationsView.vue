<template>
  <div class="space-y-6">

    <!-- ─── Header ──────────────────────────────────────────────────────────── -->
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-bold text-primary">Balanzas</h1>
        <p class="text-sm text-muted mt-1">Historial de turnos · {{ fechaHoy }}</p>
      </div>
      <div class="flex items-center gap-2 text-xs text-muted bg-surface border border-border rounded-lg px-3 py-2">
        <span class="w-2 h-2 rounded-full bg-success-500 inline-block"></span>
        {{ estacionesActivas }} activa{{ estacionesActivas !== 1 ? 's' : '' }} ·
        {{ totalTurnosHoy }} turno{{ totalTurnosHoy !== 1 ? 's' : '' }} cerrado{{ totalTurnosHoy !== 1 ? 's' : '' }} hoy
      </div>
    </div>

    <!-- ─── Grid de estaciones ───────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div
        v-for="station in dashboardStore.stations"
        :key="station.id"
        class="bg-surface border border-border rounded-xl overflow-hidden"
      >
        <!-- Card header: nombre + estado -->
        <div class="flex items-center gap-3 px-5 py-4 border-b border-border">
          <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            :class="station.status === 'error' ? 'bg-danger-500/10' : 'bg-surface-2'">
            <!-- Ícono caja -->
            <svg v-if="station.type === 'caja'" class="w-4.5 h-4.5"
              :class="station.status === 'error' ? 'text-danger-400' : 'text-muted'"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <!-- Ícono balanza -->
            <svg v-else class="w-4.5 h-4.5"
              :class="station.status === 'error' ? 'text-danger-400' : 'text-muted'"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-primary">{{ station.name }}</p>
            <p class="text-xs text-muted">{{ station.type === 'caja' ? 'Punto de venta' : 'Balanza comercial' }}</p>
          </div>
          <span class="text-xs px-2.5 py-1 rounded-full font-medium border"
            :class="statusClass(station.status)">
            {{ statusLabel(station.status) }}
          </span>
        </div>

        <!-- Turno activo -->
        <div class="px-5 py-3.5 border-b border-border">
          <p class="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">Turno activo</p>
          <div v-if="station.operatorId" class="flex items-center justify-between gap-2.5">
            <div class="flex items-center gap-2.5">
              <div class="w-7 h-7 rounded-full bg-brand-500/15 flex items-center justify-center text-brand-400 text-xs font-bold shrink-0">
                {{ initials(station.operatorName) }}
              </div>
              <div>
                <p class="text-sm font-medium text-primary">{{ station.operatorName }}</p>
                <p class="text-xs text-muted">
                  desde {{ station.assignedAt ? formatTime(station.assignedAt) : '—' }}
                  <span v-if="station.assignedAt" class="ml-1.5 text-brand-400 font-medium">
                    ({{ formatDurationSince(station.assignedAt) }})
                  </span>
                </p>
              </div>
            </div>
            <div class="text-right shrink-0">
              <p class="text-sm font-bold text-primary">{{ station.transactionsSinceAssigned ?? 0 }}</p>
              <p class="text-[10px] text-muted">ventas</p>
            </div>
          </div>
          <p v-else class="text-sm text-muted italic">Sin operario asignado</p>
        </div>

        <!-- Historial de turnos del día -->
        <div class="px-5 py-3.5">
          <div class="flex items-center justify-between mb-3">
            <p class="text-[10px] font-semibold text-muted uppercase tracking-wider">
              Historial hoy
              <span class="ml-1 normal-case font-normal text-secondary">
                {{ turnosDeEstacion(station.id).length > 0
                  ? `· ${turnosDeEstacion(station.id).length} turno${turnosDeEstacion(station.id).length !== 1 ? 's' : ''} cerrado${turnosDeEstacion(station.id).length !== 1 ? 's' : ''}`
                  : '' }}
              </span>
            </p>
            <button
              v-if="turnosDeEstacion(station.id).length > 0"
              @click="turnosStore.eliminarTurnosDeEstacion(station.id)"
              class="text-[10px] text-danger-400 hover:text-danger-300 transition-colors font-medium"
            >
              Borrar todo
            </button>
          </div>

          <table v-if="turnosDeEstacion(station.id).length > 0" class="w-full text-xs">
            <thead>
              <tr class="border-b border-border">
                <th class="text-left pb-2 font-medium text-muted">Operario</th>
                <th class="text-left pb-2 font-medium text-muted">Horario</th>
                <th class="text-right pb-2 font-medium text-muted">Duración</th>
                <th class="text-right pb-2 font-medium text-muted">Ventas</th>
                <th class="text-right pb-2 font-medium text-muted">Total</th>
                <th class="pb-2"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="t in turnosDeEstacion(station.id)" :key="t.id" class="group">
                <td class="py-2.5">
                  <div class="flex items-center gap-1.5">
                    <div class="w-5 h-5 rounded-full bg-surface-2 flex items-center justify-center text-muted text-[9px] font-bold shrink-0">
                      {{ initials(t.operatorName) }}
                    </div>
                    <span class="font-medium text-primary">{{ t.operatorName }}</span>
                  </div>
                </td>
                <td class="py-2.5 text-secondary">
                  {{ formatTime(t.startTime) }} – {{ formatTime(t.endTime) }}
                </td>
                <td class="py-2.5 text-right text-secondary">{{ formatDuration(t.startTime, t.endTime) }}</td>
                <td class="py-2.5 text-right text-secondary">{{ t.transacciones }}</td>
                <td class="py-2.5 text-right font-semibold text-primary">${{ (t.totalVentas ?? 0).toLocaleString('es-CL') }}</td>
                <td class="py-2.5 pl-2">
                  <button
                    @click="turnosStore.eliminarTurno(t.id)"
                    class="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-danger-400"
                    title="Eliminar registro"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
            <!-- Totales si hay más de un turno -->
            <tfoot v-if="turnosDeEstacion(station.id).length > 1" class="border-t-2 border-border">
              <tr>
                <td class="pt-2.5 text-[10px] font-semibold text-muted uppercase" colspan="3">Total del día</td>
                <td class="pt-2.5 text-right font-bold text-secondary">
                  {{ turnosDeEstacion(station.id).reduce((s, t) => s + (t.transacciones ?? 0), 0) }}
                </td>
                <td class="pt-2.5 text-right font-bold text-primary">
                  ${{ turnosDeEstacion(station.id).reduce((s, t) => s + (t.totalVentas ?? 0), 0).toLocaleString('es-CL') }}
                </td>
              </tr>
            </tfoot>
          </table>

          <p v-else class="text-xs text-muted text-center py-4 italic">Sin turnos cerrados hoy</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useDashboardStore } from '../stores/dashboard.store'
import { useTurnosStore } from '../stores/turnos.store'
import type { StationStatus } from '../types'

const dashboardStore = useDashboardStore()
const turnosStore = useTurnosStore()

const fechaHoy = new Date().toLocaleDateString('es-CL', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
})

const now = ref(new Date())
let ticker: ReturnType<typeof setInterval>
onMounted(() => { ticker = setInterval(() => { now.value = new Date() }, 30000) })
onUnmounted(() => clearInterval(ticker))

const estacionesActivas = computed(() =>
  dashboardStore.stations.filter(s => s.status === 'activa').length
)

const totalTurnosHoy = computed(() => turnosStore.turnosHoy().length)

function turnosDeEstacion(stationId: number) {
  return turnosStore.turnosPorEstacion(stationId)
}

// ─── Helpers visuales ─────────────────────────────────────────────────────────

function statusLabel(status: StationStatus): string {
  const map: Record<StationStatus, string> = {
    activa: 'Activa', inactiva: 'Inactiva', error: 'Error', mantenimiento: 'Mantención'
  }
  return map[status] ?? status
}

function statusClass(status: StationStatus): string {
  const map: Record<StationStatus, string> = {
    activa:        'bg-success-500/10 text-success-500 border-success-500/25',
    inactiva:      'bg-surface-2 text-muted border-border',
    error:         'bg-danger-500/10 text-danger-400 border-danger-500/25',
    mantenimiento: 'bg-warning-500/10 text-warning-400 border-warning-500/25',
  }
  return map[status] ?? ''
}

function initials(name: string | null): string {
  if (!name) return '?'
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-CL', {
    hour: '2-digit', minute: '2-digit', hour12: false
  })
}

function formatDuration(startIso: string, endIso: string): string {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime()
  const totalMin = Math.max(0, Math.floor(ms / 60000))
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function formatDurationSince(startIso: string): string {
  return formatDuration(startIso, now.value.toISOString())
}
</script>
