<template>
  <div class="h-full flex fade-in">

    <!-- Panel izquierdo: scanner + grid de balanzas -->
    <div class="flex-1 flex flex-col overflow-hidden">

      <!-- Scanner central -->
      <div class="flex-1 flex items-center justify-center p-8">
        <div class="text-center max-w-sm w-full">
          <div class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-surface-2 border border-border flex items-center justify-center">
            <svg class="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>

          <p class="text-secondary text-sm mb-1">Escanea el código de un producto</p>
          <p class="text-muted text-xs mb-2">o agrégalo manualmente desde el panel derecho</p>

          <p v-if="!cajaStore.balanzaSeleccionadaId" class="text-xs text-warning-400 mb-4">
            ← Selecciona una balanza primero
          </p>
          <p v-else class="text-xs text-brand-400 mb-4">
            Escaneando para {{ balanzaNombreSeleccionada }}
          </p>

          <div class="scanner-pulse rounded-xl">
            <input
              ref="scannerInput"
              type="text"
              placeholder="Esperando escáner..."
              :disabled="!cajaStore.balanzaSeleccionadaId"
              class="w-full bg-surface-2 border border-border rounded-xl px-4 py-3.5 text-sm text-primary placeholder-muted focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-center disabled:opacity-40"
              @keydown.enter="simularEscaneo"
            />
          </div>

          <p class="text-xs text-muted mt-3">
            Presiona
            <kbd class="px-1.5 py-0.5 rounded bg-surface-2 border border-border font-mono text-xs">Enter</kbd>
            para simular escaneo
          </p>
        </div>
      </div>

      <!-- Grid de balanzas -->
      <div class="shrink-0 border-t border-border bg-surface p-4">
        <p class="text-xs font-medium text-muted uppercase tracking-wider mb-3">Balanzas</p>
        <div class="grid grid-cols-4 gap-3">
          <button
            v-for="balanza in colaBalanzas"
            :key="balanza.id"
            @click="onClickBalanza(balanza.id)"
            :class="cajaStore.balanzaSeleccionadaId === balanza.id
              ? 'border-brand-500 bg-brand-500/10'
              : itemCount(balanza.id) > 0 && balanza.advertencia
                ? 'border-warning-500/30 hover:border-warning-500 bg-surface-2'
                : 'border-border hover:border-brand-500/50 bg-surface-2'"
            class="border rounded-lg p-3 text-left transition-all group"
          >
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-medium text-secondary group-hover:text-primary transition-colors">
                {{ balanza.nombre }}
              </span>
              <span
                v-if="itemCount(balanza.id) > 0"
                :class="balanza.advertencia ? 'bg-warning-400' : 'bg-brand-400 blink'"
                class="w-1.5 h-1.5 rounded-full"
              ></span>
              <span v-else class="w-1.5 h-1.5 rounded-full bg-muted opacity-40"></span>
            </div>
            <!-- Operario asignado -->
            <p class="text-xs truncate mb-1.5"
              :class="operatorName(balanza.id) ? 'text-brand-400 font-medium' : 'text-muted/50 italic'">
              {{ operatorName(balanza.id) ?? 'Sin asignar' }}
            </p>
            <p v-if="itemCount(balanza.id) > 0" class="text-sm font-semibold text-primary">
              ${{ totalBalanza(balanza.id).toLocaleString('es-CL') }}
            </p>
            <p
              :class="balanza.advertencia && itemCount(balanza.id) > 0 ? 'text-warning-400' : 'text-muted'"
              class="text-xs mt-0.5"
            >
              {{ itemCount(balanza.id) > 0
                  ? itemCount(balanza.id) + ' ítem' + (itemCount(balanza.id) !== 1 ? 's' : '')
                  : 'Libre' }}
            </p>
          </button>
        </div>
      </div>
    </div>

    <!-- Panel derecho: productos de la balanza seleccionada -->
    <div class="w-72 flex flex-col border-l border-border bg-surface shrink-0">

      <!-- Sin balanza seleccionada -->
      <div v-if="!cajaStore.balanzaSeleccionadaId" class="flex-1 flex items-center justify-center p-6">
        <div class="text-center">
          <div class="w-12 h-12 mx-auto mb-3 rounded-xl bg-surface-2 border border-border flex items-center justify-center">
            <svg class="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p class="text-sm text-muted">Selecciona una balanza</p>
          <p class="text-xs text-muted mt-1">para ver y agregar productos</p>
        </div>
      </div>

      <!-- Con balanza seleccionada -->
      <template v-else>

        <!-- Header balanza -->
        <div class="px-4 py-3 border-b border-border shrink-0">
          <div class="flex items-center justify-between">
            <p class="text-xs text-muted uppercase tracking-wider">{{ balanzaNombreSeleccionada }}</p>
            <span class="text-xs text-muted">{{ itemsSeleccionada.length }} ítem{{ itemsSeleccionada.length !== 1 ? 's' : '' }}</span>
          </div>
          <p class="text-xl font-bold text-primary mt-0.5">
            ${{ totalSeleccionada.toLocaleString('es-CL') }}
          </p>
        </div>

        <!-- Lista de productos -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="itemsSeleccionada.length === 0" class="flex flex-col items-center justify-center h-full gap-1 p-6">
            <p class="text-sm text-muted text-center">Sin productos</p>
            <p class="text-xs text-muted text-center">Escanea o agrega manualmente</p>
          </div>
          <div v-else>
            <div
              v-for="item in itemsSeleccionada"
              :key="item.id"
              class="flex items-center gap-2 px-4 py-3 border-b border-border hover:bg-surface-2 transition-colors group"
            >
              <div class="flex-1 min-w-0">
                <p class="text-sm text-primary truncate">{{ item.name }}</p>
                <p class="text-xs text-muted">
                  {{ item.unit === 'kg' ? item.qty.toFixed(3) + ' kg' : item.qty + ' ' + item.unit }}
                  · ${{ item.priceUnit.toLocaleString('es-CL') }}{{ item.unit === 'kg' ? '/kg' : '/un' }}
                </p>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <p class="text-sm font-semibold text-primary">
                  ${{ Math.round(item.qty * item.priceUnit).toLocaleString('es-CL') }}
                </p>
                <button
                  @click="cajaStore.eliminarItemDeBalanza(cajaStore.balanzaSeleccionadaId!, item.id)"
                  class="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-danger-500/10 text-muted hover:text-danger-400 transition-all"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Form agregar manual (colapsable) -->
        <div v-if="showFormManual" class="px-4 py-3 border-t border-border bg-surface-2 space-y-2 shrink-0">
          <p class="text-xs text-muted uppercase tracking-wider">Agregar manual</p>
          <input
            v-model="manualNombre"
            placeholder="Nombre del producto"
            class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-brand-500"
          />
          <div class="flex gap-2">
            <input
              v-model.number="manualPrecio"
              type="number"
              placeholder="Precio"
              class="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-brand-500"
            />
            <input
              v-model.number="manualQty"
              type="number"
              placeholder="Cant."
              class="w-20 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-brand-500"
            />
          </div>
          <select
            v-model="manualUnit"
            class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-primary focus:outline-none focus:border-brand-500"
          >
            <option value="UN">Unidad (UN)</option>
            <option value="kg">Kilogramo (kg)</option>
          </select>
          <div class="flex gap-2">
            <button
              @click="showFormManual = false"
              class="flex-1 text-xs px-3 py-2 rounded-lg border border-border text-muted hover:text-primary transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="agregarManual"
              :disabled="!manualNombre || !manualPrecio || !manualQty"
              class="flex-1 text-xs px-3 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white font-medium transition-colors"
            >
              Agregar
            </button>
          </div>
        </div>

        <!-- Footer acciones -->
        <div class="px-4 py-3 border-t border-border space-y-2 shrink-0">
          <button
            @click="showFormManual = !showFormManual"
            class="w-full flex items-center justify-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors py-1"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Agregar producto manual
          </button>
          <button
            @click="cajaStore.confirmarBalanzaParaCobro(cajaStore.balanzaSeleccionadaId!)"
            :disabled="itemsSeleccionada.length === 0"
            class="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2"
          >
            Confirmar cobro
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

      </template>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCajaStore, MOCK_COLA_BALANZAS } from '../../stores/caja.store'
import { useDashboardStore } from '../../stores/dashboard.store'

const cajaStore      = useCajaStore()
const dashboardStore = useDashboardStore()
const scannerInput   = ref<HTMLInputElement | null>(null)
const colaBalanzas   = MOCK_COLA_BALANZAS

function operatorName(balanzaId: number): string | null {
  return dashboardStore.stations.find(s => s.id === balanzaId)?.operatorName ?? null
}

// Form manual
const showFormManual = ref(false)
const manualNombre   = ref('')
const manualPrecio   = ref<number | null>(null)
const manualQty      = ref<number | null>(null)
const manualUnit     = ref<'UN' | 'kg'>('UN')

onMounted(() => {
  scannerInput.value?.focus()
})

// Computed helpers
const balanzaNombreSeleccionada = computed(() => {
  const id = cajaStore.balanzaSeleccionadaId
  return MOCK_COLA_BALANZAS.find(b => b.id === id)?.nombre ?? ''
})

const itemsSeleccionada = computed(() => {
  const id = cajaStore.balanzaSeleccionadaId
  return id !== null ? (cajaStore.itemsPorBalanza[id] ?? []) : []
})

const totalSeleccionada = computed(() =>
  itemsSeleccionada.value.reduce((s, i) => s + Math.round(i.qty * i.priceUnit), 0)
)

function onClickBalanza(balanzaId: number) {
  // Siempre selecciona la balanza para escaneo — el tab existente
  // es accesible desde "En cobro #N →" o desde la tabs bar
  cajaStore.seleccionarBalanzaIdle(balanzaId)
}

function itemCount(balanzaId: number): number {
  return cajaStore.itemsPorBalanza[balanzaId]?.length ?? 0
}

function totalBalanza(balanzaId: number): number {
  const items = cajaStore.itemsPorBalanza[balanzaId] ?? []
  return items.reduce((s, i) => s + Math.round(i.qty * i.priceUnit), 0)
}

// Simula escaneo agregando un item mock a la balanza seleccionada
function simularEscaneo() {
  if (!cajaStore.balanzaSeleccionadaId) return
  cajaStore.agregarItemEscaneoBalanza({
    name: 'Producto escaneado',
    qty: 1,
    unit: 'UN',
    priceUnit: 1500,
    supplier: '',
  })
  if (scannerInput.value) scannerInput.value.value = ''
}

function agregarManual() {
  if (!manualNombre.value || !manualPrecio.value || !manualQty.value) return
  cajaStore.agregarItemEscaneoBalanza({
    name: manualNombre.value,
    qty: manualQty.value,
    unit: manualUnit.value,
    priceUnit: manualPrecio.value,
    supplier: '',
  })
  manualNombre.value  = ''
  manualPrecio.value  = null
  manualQty.value     = null
  manualUnit.value    = 'UN'
  showFormManual.value = false
}
</script>
