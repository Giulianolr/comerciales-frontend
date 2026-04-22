<template>
  <!-- Toast turno finalizado -->
  <Teleport to="body">
    <Transition name="toast">
      <div
        v-if="toastVisible"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-2.5 px-4 py-2.5 bg-success-600 text-white rounded-lg shadow-lg text-sm font-medium whitespace-nowrap"
      >
        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
        </svg>
        Turno finalizado correctamente
      </div>
    </Transition>
  </Teleport>

  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[200] flex items-center justify-center bg-black/60"
      @click.self="close"
    >
      <div class="bg-surface border border-border rounded-2xl shadow-2xl w-[500px] max-h-[88vh] flex flex-col overflow-hidden">

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-brand-500/15 flex items-center justify-center">
              <svg class="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 class="font-semibold text-primary text-base">Asignación de Balanza</h2>
          </div>
          <button @click="close" class="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-2 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Búsqueda — fija, no scrollea -->
        <div class="px-6 pt-5 pb-4 border-b border-border shrink-0">
          <p class="text-xs font-medium text-muted uppercase tracking-wider mb-3">Busca tu nombre</p>

          <!-- Sin usuario seleccionado: mostrar buscador -->
          <template v-if="!selectedUser">
            <div class="relative">
              <svg class="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                v-model="search"
                ref="searchInput"
                type="text"
                placeholder="Escribe tu nombre..."
                class="w-full bg-input border border-border rounded-lg pl-9 pr-8 py-2.5 text-sm text-primary placeholder-muted outline-none focus:border-brand-500 transition-colors"
              />
              <button v-if="search" @click="search = ''"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Resultados de búsqueda -->
            <div v-if="filteredUsers.length > 0"
              class="mt-2 border border-border rounded-xl overflow-hidden max-h-40 overflow-y-auto">
              <button
                v-for="user in filteredUsers"
                :key="user.id"
                @click="selectUser(user)"
                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left text-secondary hover:text-primary hover:bg-surface-2"
              >
                <div class="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center text-muted text-xs font-semibold shrink-0">
                  {{ initials(user) }}
                </div>
                <span class="font-medium">{{ user.nombre }} {{ user.apellido }}</span>
                <span class="ml-auto text-xs text-muted">{{ ROLE_LABELS[user.role] ?? user.role }}</span>
              </button>
            </div>

            <div v-else-if="search" class="pt-3 text-center">
              <p class="text-sm text-muted">Sin resultados para "{{ search }}"</p>
              <p class="text-xs text-muted/60 mt-1">Solo aparecen trabajadores registrados en el panel → Usuarios</p>
            </div>
            <p v-else class="text-xs text-muted text-center pt-2">
              Escribe tu nombre para encontrarte en la lista
            </p>
          </template>

          <!-- Con usuario seleccionado: mostrar card con "Cambiar" -->
          <div v-else class="flex items-center gap-3 px-4 py-3 bg-brand-500/10 border border-brand-500/25 rounded-xl">
            <div class="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 text-sm font-semibold shrink-0">
              {{ initials(selectedUser) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-brand-400">{{ selectedUser.nombre }} {{ selectedUser.apellido }}</p>
              <p class="text-xs text-muted">{{ ROLE_LABELS[selectedUser.role] ?? selectedUser.role }}</p>
            </div>
            <button
              @click="clearSelection"
              class="text-xs px-3 py-1.5 rounded-lg border border-border text-muted hover:text-primary hover:border-primary transition-colors shrink-0"
            >
              Cambiar
            </button>
          </div>
        </div>

        <!-- Estaciones — scrollable -->
        <div class="flex-1 overflow-y-auto px-6 py-5">
          <p class="text-xs font-medium text-muted uppercase tracking-wider mb-3">Estaciones</p>

          <div class="space-y-2">
            <div
              v-for="station in dashboardStore.stations"
              :key="station.id"
              class="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors border"
              :class="isOccupied(station)
                ? 'bg-brand-500/8 border-brand-500/30'
                : 'bg-surface border-border'"
            >
              <!-- Ícono -->
              <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                :class="isOccupied(station) ? 'bg-brand-500/15' : 'bg-surface-2'">
                <svg v-if="station.type === 'caja'" class="w-4 h-4"
                  :class="isOccupied(station) ? 'text-brand-500' : 'text-muted'"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <svg v-else class="w-4 h-4"
                  :class="isOccupied(station) ? 'text-brand-500' : 'text-muted'"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-primary">{{ station.name }}</p>
                <p class="text-xs mt-0.5 font-medium"
                  :class="isOccupied(station) ? 'text-brand-500' : 'text-success-500'">
                  {{ station.operatorName || 'Libre' }}
                </p>
              </div>

              <!-- Acción -->
              <div class="shrink-0">
                <!-- Ocupada → Finalizar turno -->
                <button
                  v-if="isOccupied(station)"
                  @click="finalizarTurno(station.id)"
                  class="text-xs px-3 py-1.5 rounded-lg bg-danger-500 border border-danger-500 text-white hover:bg-danger-600 transition-colors font-medium"
                >
                  Finalizar turno
                </button>

                <!-- Libre + nombre seleccionado → Asignarme -->
                <button
                  v-else-if="selectedUserId"
                  @click="asignarme(station.id)"
                  class="text-xs px-3 py-1.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-colors font-medium"
                >
                  Asignarme aquí
                </button>

                <!-- Libre + sin selección → badge -->
                <span v-else class="text-xs px-2.5 py-1 rounded-full bg-success-500/10 text-success-500 font-medium border border-success-500/25">
                  Libre
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-3.5 border-t border-border shrink-0 flex justify-end">
          <button @click="close" class="px-4 py-2 text-sm text-muted hover:text-primary transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useUsersStore } from '../../stores/users.store'
import { useTurnosStore } from '../../stores/turnos.store'
import { useCajaStore } from '../../stores/caja.store'
import type { User } from '../../types'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>()

const dashboardStore = useDashboardStore()
const usersStore = useUsersStore()
const turnosStore = useTurnosStore()
const cajaStore = useCajaStore()

const ROLE_LABELS: Record<string, string> = {
  gerente: 'Gerente', supervisor: 'Supervisor',
  cajero: 'Cajero', operador: 'Operador', vendor: 'Vendor', dev: 'Dev',
}

const search = ref('')
const selectedUserId = ref<string | null>(null)
const searchInput = ref<HTMLInputElement | null>(null)
const toastVisible = ref(false)

function mostrarToast() {
  toastVisible.value = true
  setTimeout(() => { toastVisible.value = false }, 2000)
}

const selectedUser = computed(() =>
  selectedUserId.value
    ? usersStore.users.find(u => u.id === selectedUserId.value) ?? null
    : null
)

const filteredUsers = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return []
  // Muestra todos los activos — mismos que aparecen en UsersView
  return usersStore.users.filter(u =>
    u.isActive &&
    `${u.nombre} ${u.apellido}`.toLowerCase().includes(q)
  )
})

function isOccupied(station: { operatorId: string | null; operatorName: string | null }) {
  return !!(station.operatorId || station.operatorName)
}

function initials(user: User) {
  return ((user.nombre[0] ?? '') + (user.apellido?.[0] ?? '')).toUpperCase() || '?'
}

function selectUser(user: User) {
  selectedUserId.value = user.id
  search.value = ''
}

function clearSelection() {
  selectedUserId.value = null
  search.value = ''
  nextTick(() => searchInput.value?.focus())
}

function asignarme(stationId: number) {
  if (!selectedUserId.value || !selectedUser.value) return
  const nombre = `${selectedUser.value.nombre} ${selectedUser.value.apellido}`.trim()
  dashboardStore.assignOperator(stationId, selectedUserId.value, nombre)
  // Auto-seleccionar la balanza en CajaIdle para que los ítems escaneados
  // vayan a la balanza correcta del operario recién asignado
  const station = dashboardStore.stations.find(s => s.id === stationId)
  if (station?.type === 'balanza') {
    cajaStore.seleccionarBalanzaIdle(stationId)
  }
  close()
}

function finalizarTurno(stationId: number) {
  const station = dashboardStore.stations.find(s => s.id === stationId)
  if (station?.operatorId && station.operatorName && station.assignedAt) {
    const endTime = new Date().toISOString()
    const user = usersStore.users.find(u => u.id === station.operatorId)
    turnosStore.registrarTurno({
      id: `turno-${Date.now()}`,
      stationId: station.id,
      stationName: station.name,
      operatorId: station.operatorId,
      operatorName: station.operatorName,
      operatorRole: user?.role ?? '',
      startTime: station.assignedAt,
      endTime,
      transacciones: station.transactionsSinceAssigned,
      totalVentas: station.ventasSinceAssigned,
      fecha: new Date().toISOString().split('T')[0],
    })
  }
  dashboardStore.releaseOperator(stationId)
  close()
  mostrarToast()
}

function close() {
  emit('update:modelValue', false)
}

watch(() => props.modelValue, open => {
  if (!open) {
    search.value = ''
    selectedUserId.value = null
  }
})
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(12px); }
</style>
