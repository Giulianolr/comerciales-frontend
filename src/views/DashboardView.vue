<template>
  <div class="space-y-8">

    <!-- ─── Header ──────────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-primary">Panel General</h1>
      <button
        @click="refreshDashboard"
        :disabled="isRefreshing"
        class="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium transition-colors flex items-center gap-2"
      >
        <svg class="w-4 h-4" :class="isRefreshing ? 'animate-spin' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ isRefreshing ? 'Actualizando...' : 'Actualizar' }}
      </button>
    </div>

    <!-- ─── Filtros ─────────────────────────────────────────────────────── -->
    <div class="flex items-center gap-2 flex-wrap">

      <!-- Pills rápidos de período -->
      <span class="text-xs text-muted uppercase tracking-wider font-medium mr-1">Período:</span>
      <button
        v-for="p in periodos"
        :key="p"
        @click="periodoActivo = p; limpiarCalFiltro()"
        :class="!calHayFiltro && periodoActivo === p
          ? 'bg-brand-500 text-white border-brand-500'
          : 'bg-surface text-secondary border-border hover:border-brand-500/40 hover:text-primary'"
        class="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors"
      >
        {{ p }}
      </button>

      <!-- Separador -->
      <div class="w-px h-5 bg-border mx-1 self-center"></div>

      <!-- CalendarPicker -->
      <div>
        <CalendarPicker
          :singleDate="calFecha"
          :dateFrom="calDesde"
          :dateTo="calHasta"
          :filterMode="calMode"
          @update:singleDate="calFecha = $event"
          @update:dateFrom="calDesde = $event"
          @update:dateTo="calHasta = $event"
          @update:filterMode="calMode = $event"
        />
      </div>

      <!-- Limpiar filtro de calendario -->
      <button
        v-if="calHayFiltro"
        @click="limpiarCalFiltro"
        class="px-3 py-1.5 text-xs text-secondary hover:text-primary bg-surface-2 hover:bg-border rounded-lg border border-border transition-colors"
      >
        Limpiar fecha
      </button>

    </div>

    <!-- ─── KPI Cards ────────────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <KpiCard
        v-if="kpisFiltered"
        :label="kpiLabels.ventas"
        :value="`$${kpisFiltered.totalVentas.toLocaleString('es-CL')}`"
        :trend="kpisFiltered.ventasTrend"
        icon="banknotes"
        accent-color="brand"
      />
      <KpiCard
        v-if="kpisFiltered"
        :label="kpiLabels.transacciones"
        :value="`${kpisFiltered.totalTransacciones}`"
        :trend="kpisFiltered.transaccionesTrend"
        icon="receipt-refund"
        accent-color="info"
      />
      <KpiCard
        v-if="kpisFiltered"
        label="Ticket Promedio"
        :value="`$${kpisFiltered.ticketPromedio.toLocaleString('es-CL')}`"
        :trend="kpisFiltered.ticketTrend"
        icon="tag"
        accent-color="success"
      />
    </div>

    <!-- ─── Estado de Balanzas y Caja (sin filtro) ───────────────────────── -->
    <div>
      <h2 class="text-lg font-semibold text-primary mb-4">Estado de Balanzas y Caja</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StationCard
          v-for="station in dashboardStore.stations"
          :key="station.id"
          :station="station"
        />
      </div>
    </div>

    <!-- ─── Gráfico + Top productos ──────────────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-surface rounded-lg border border-border p-6">
        <h3 class="text-lg font-semibold text-primary mb-1">
          {{ periodoActivo === 'Hoy' || periodoActivo === 'Ayer' ? 'Ventas por Hora' : 'Ventas por Día' }}
        </h3>
        <p class="text-xs text-muted mb-4">{{ periodoActivo }}</p>
        <div id="chart-sales" style="height: 300px;">
          <p class="text-center text-secondary py-12">Gráfico de ventas (ApexCharts)</p>
        </div>
      </div>

      <div class="bg-surface rounded-lg border border-border p-6">
        <h3 class="text-lg font-semibold text-primary mb-1">Top 5 Productos</h3>
        <p class="text-xs text-muted mb-4">{{ periodoActivo }}</p>
        <div class="space-y-4">
          <div
            v-for="product in topProductosFiltrados"
            :key="product.productId"
            class="flex items-center justify-between pb-4 border-b border-border last:border-0"
          >
            <div>
              <p class="text-sm font-medium text-primary">{{ product.productName }}</p>
              <p class="text-xs text-secondary">{{ product.transactionCount }} transacciones</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-success-500">${{ product.totalRevenue.toLocaleString('es-CL') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Alertas de stock ──────────────────────────────────────────────── -->
    <div class="bg-surface rounded-lg border border-border p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-primary">⚠️ Alertas de Stock Bajo</h2>
        <span class="text-xs text-secondary">
          {{ alertsStore.unreadStockAlerts.length }} pendiente{{ alertsStore.unreadStockAlerts.length !== 1 ? 's' : '' }}
        </span>
      </div>
      <div v-if="alertsStore.unreadStockAlerts.length > 0" class="space-y-3">
        <div
          v-for="alert in alertsStore.unreadStockAlerts.slice(0, 5)"
          :key="alert.id"
          :class="[
            'flex items-center justify-between p-3 rounded-lg',
            alert.severity === 'critical' ? 'bg-danger-500/10 border border-danger-500/20' :
            alert.severity === 'low' ? 'bg-warning-500/10 border border-warning-500/20' :
            'bg-surface-2'
          ]"
        >
          <div>
            <p class="text-sm font-medium text-primary">{{ alert.productName }}</p>
            <p class="text-xs text-secondary">{{ alert.currentStock }} / {{ alert.minStock }} mín</p>
          </div>
          <div class="flex items-center gap-2">
            <button class="px-3 py-1 text-xs bg-brand-500 hover:bg-brand-600 text-white rounded transition-colors">
              Comprar
            </button>
            <button
              @click="alertsStore.acknowledge(alert.id)"
              class="px-3 py-1 text-xs bg-surface-2 hover:bg-border text-secondary rounded transition-colors"
            >
              Descartar
            </button>
          </div>
        </div>
      </div>
      <p v-else class="text-sm text-secondary text-center py-4">Sin alertas de stock pendientes</p>
    </div>

    <!-- ─── Arqueo de Caja + Cierre de Día ───────────────────────────────── -->
    <div class="bg-surface rounded-lg border border-border p-6">
      <div class="flex items-center justify-between mb-5">
        <div>
          <h2 class="text-lg font-semibold text-primary">Arqueo de Caja</h2>
          <p class="text-xs text-muted mt-0.5">Solo efectivo · Turno del día</p>
        </div>

        <div v-if="cierreStore.cierreEjecutado"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
          Cierre ejecutado · {{ cierreStore.horaCierre }}
        </div>

        <button
          v-else-if="canEdit"
          @click="modalCierre = true"
          class="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Cierre de Día
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        <!-- Monto esperado -->
        <div class="bg-surface-2 border border-border rounded-xl p-4">
          <p class="text-xs text-muted uppercase tracking-wider mb-1">Monto esperado</p>
          <p class="text-2xl font-bold text-primary">${{ arqueoEsperado.toLocaleString('es-CL') }}</p>
          <p class="text-xs text-muted mt-1">Ventas efectivo + fondo $50.000</p>
        </div>

        <!-- Monto contado -->
        <div class="bg-surface-2 border border-border rounded-xl p-4">
          <p class="text-xs text-muted uppercase tracking-wider mb-2">Monto contado (físico)</p>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
            <input
              v-model.number="arqueoContado"
              type="number"
              min="0"
              :disabled="!puedeEditarArqueo"
              class="bg-input border border-border rounded-lg pl-7 pr-3 py-2.5 text-sm text-primary
                     outline-none focus:border-indigo-500 transition-colors w-full text-right
                     disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <!-- Diferencia -->
        <div class="rounded-xl p-4 flex items-center justify-between"
          :class="arqueoDiferencia === 0 ? 'bg-green-500/10 border border-green-500/20'
                : arqueoDiferencia > 0 ? 'bg-sky-500/10 border border-sky-500/20'
                : 'bg-red-500/10 border border-red-500/20'">
          <div>
            <p class="text-xs font-medium mb-0.5"
              :class="arqueoDiferencia === 0 ? 'text-green-400' : arqueoDiferencia > 0 ? 'text-sky-400' : 'text-red-400'">
              {{ arqueoDiferencia === 0 ? 'Caja cuadrada' : arqueoDiferencia > 0 ? 'Sobrante' : 'Faltante' }}
            </p>
            <p class="text-xs text-muted">
              {{ arqueoDiferencia === 0 ? 'El físico coincide' : arqueoDiferencia > 0 ? 'Más del esperado' : 'Menos del esperado' }}
            </p>
          </div>
          <p class="text-xl font-bold"
            :class="arqueoDiferencia === 0 ? 'text-green-400' : arqueoDiferencia > 0 ? 'text-sky-400' : 'text-red-400'">
            {{ arqueoDiferencia >= 0 ? '+' : '' }}${{ arqueoDiferencia.toLocaleString('es-CL') }}
          </p>
        </div>
      </div>
    </div>

  </div>

  <!-- ─── Modal confirmación cierre ────────────────────────────────────────── -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modalCierre"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="modalCierre = false">
        <div class="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl scale-in">

          <div class="flex flex-col items-center pt-8 pb-2 px-8">
            <div class="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-primary text-center">¿Ejecutar cierre del día?</h3>
            <p class="text-sm text-muted text-center mt-2 mb-6">
              Los valores del día quedarán registrados. Mañana el sistema partirá desde cero.
            </p>
          </div>

          <div class="mx-8 mb-6 bg-input border border-border rounded-xl divide-y divide-border">
            <div class="flex justify-between px-4 py-3 text-sm">
              <span class="text-muted">Total ventas</span>
              <span class="font-semibold text-primary">${{ (dashboardStore.kpis?.totalVentas ?? 0).toLocaleString('es-CL') }}</span>
            </div>
            <div class="flex justify-between px-4 py-3 text-sm">
              <span class="text-muted">Transacciones</span>
              <span class="font-semibold text-primary">{{ dashboardStore.kpis?.totalTransacciones ?? 0 }}</span>
            </div>
            <div class="flex justify-between px-4 py-3 text-sm">
              <span class="text-muted">Diferencia arqueo</span>
              <span class="font-semibold" :class="arqueoDiferencia >= 0 ? 'text-green-400' : 'text-red-400'">
                {{ arqueoDiferencia >= 0 ? '+' : '' }}${{ arqueoDiferencia.toLocaleString('es-CL') }}
              </span>
            </div>
          </div>

          <div class="flex gap-3 px-8 pb-8">
            <button @click="modalCierre = false"
              class="flex-1 py-2.5 text-sm text-secondary hover:text-primary bg-surface-2 hover:bg-border rounded-lg transition-colors font-medium">
              Cancelar
            </button>
            <button @click="ejecutarCierreDia"
              class="flex-1 py-2.5 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors font-medium">
              Confirmar cierre
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useDashboardStore } from '../stores/dashboard.store'
import { useAlertsStore } from '../stores/alerts.store'
import { useAuthStore } from '../stores/auth.store'
import { useCierreStore } from '../stores/cierre.store'
import KpiCard from '../components/KpiCard.vue'
import StationCard from '../components/StationCard.vue'
import CalendarPicker from '../components/CalendarPicker.vue'

const dashboardStore = useDashboardStore()
const alertsStore = useAlertsStore()
const authStore = useAuthStore()
const cierreStore = useCierreStore()
const canEdit = computed(() => authStore.isGerente)
const isRefreshing = ref(false)
const modalCierre = ref(false)

// ─── Filtros de período ───────────────────────────────────────────────────────
const periodos = ['Hoy', 'Ayer', 'Esta semana', 'Este mes'] as const
type Periodo = typeof periodos[number]
const periodoActivo = ref<Periodo>('Hoy')

// ─── Filtro por calendario ────────────────────────────────────────────────────
const calMode  = ref<'single' | 'range'>('single')
const calFecha = ref('')
const calDesde = ref('')
const calHasta = ref('')

const calHayFiltro = computed(() =>
  (calMode.value === 'single' && !!calFecha.value) ||
  (calMode.value === 'range' && !!(calDesde.value || calHasta.value))
)

function limpiarCalFiltro() {
  calFecha.value = ''
  calDesde.value = ''
  calHasta.value = ''
}

const calMultiplier = computed((): number => {
  if (calMode.value === 'single' && calFecha.value) return 1
  if (calMode.value === 'range' && calDesde.value && calHasta.value) {
    const from = new Date(calDesde.value)
    const to   = new Date(calHasta.value)
    return Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000) + 1)
  }
  return 0
})

const kpiMultiplier = computed((): number => {
  if (calMultiplier.value > 0) return calMultiplier.value
  switch (periodoActivo.value) {
    case 'Ayer':         return 0.92
    case 'Esta semana':  return 6.5
    case 'Este mes':     return 27
    default:             return 1
  }
})

const kpisFiltered = computed(() => {
  if (!dashboardStore.kpis) return null
  const m = kpiMultiplier.value
  return {
    ...dashboardStore.kpis,
    totalVentas:       Math.round(dashboardStore.kpis.totalVentas * m),
    totalTransacciones: Math.round(dashboardStore.kpis.totalTransacciones * m),
    ticketPromedio:    dashboardStore.kpis.ticketPromedio,
  }
})

const kpiLabels = computed(() => ({
  ventas:        periodoActivo.value === 'Hoy'          ? 'Ventas del Día'
               : periodoActivo.value === 'Ayer'         ? 'Ventas de Ayer'
               : periodoActivo.value === 'Esta semana'  ? 'Ventas de la Semana'
               : 'Ventas del Mes',
  transacciones: 'Transacciones',
}))

// ─── Top productos escalados por período ──────────────────────────────────────
const baseTopProducts = [
  { productId: 'POL-001', productName: 'Pollo (filete)',   category: 'carnes'    as const, totalSold: 182, totalRevenue: 125000, transactionCount: 28 },
  { productId: 'CAR-002', productName: 'Carne (costilla)', category: 'carnes'    as const, totalSold: 142, totalRevenue: 89500,  transactionCount: 24 },
  { productId: 'PAT-001', productName: 'Pastel (queque)',  category: 'panaderia' as const, totalSold: 155, totalRevenue: 65200,  transactionCount: 15 },
  { productId: 'VER-001', productName: 'Lechuga',          category: 'verduras'  as const, totalSold: 58,  totalRevenue: 34800,  transactionCount: 12 },
  { productId: 'FRU-001', productName: 'Plátano',          category: 'frutas'    as const, totalSold: 48,  totalRevenue: 28500,  transactionCount: 10 },
]

const topProductosFiltrados = computed(() => {
  const m = kpiMultiplier.value
  return baseTopProducts.map(p => ({
    ...p,
    totalRevenue:     Math.round(p.totalRevenue * m),
    totalSold:        Math.round(p.totalSold * m),
    transactionCount: Math.round(p.transactionCount * m),
  }))
})

// ─── Arqueo de caja ───────────────────────────────────────────────────────────
const arqueoEsperado = computed(() => {
  const ventas = dashboardStore.kpis?.totalVentas ?? 0
  return Math.round(ventas * 0.44) + 50000
})

const puedeEditarArqueo = computed(() => canEdit.value && !cierreStore.cierreEjecutado)

const arqueoContado = computed({
  get: () => cierreStore.montoCont ?? arqueoEsperado.value,
  set: (v: number) => { cierreStore.montoCont = v },
})

const arqueoDiferencia = computed(() => arqueoContado.value - arqueoEsperado.value)

function ejecutarCierreDia() {
  cierreStore.ejecutarCierre()
  modalCierre.value = false
}

// ─── Refresh ──────────────────────────────────────────────────────────────────
function refreshDashboard() {
  isRefreshing.value = true
  ;(dashboardStore as any).$hydrate()
  setTimeout(() => { isRefreshing.value = false }, 600)
}

onMounted(() => {
  cierreStore.checkAndResetIfNewDay()
  setInterval(() => {
    if (dashboardStore.kpis) {
      dashboardStore.updateKPIs({ ...dashboardStore.kpis, lastUpdatedAt: new Date().toISOString() })
    }
  }, 15000)
})
</script>

<style scoped>
#chart-sales { min-height: 300px; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
