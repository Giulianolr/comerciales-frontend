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
        <h2 class="text-lg font-semibold text-primary">Alertas de stock</h2>
        <div class="flex items-center gap-3">
          <span class="text-xs text-secondary">
            {{ alertsStore.panelAlerts.length }} activa{{ alertsStore.panelAlerts.length !== 1 ? 's' : '' }}
          </span>
          <button
            v-if="alertsStore.panelAlerts.length > 0"
            @click="alertsStore.acknowledgeAll()"
            class="px-3 py-1.5 text-xs font-medium text-secondary hover:text-danger-400 bg-surface-2 hover:bg-danger-500/10 border border-border hover:border-danger-500/30 rounded-lg transition-colors"
          >
            Borrar todas
          </button>
        </div>
      </div>

      <div v-if="alertsStore.panelAlerts.length > 0" class="space-y-2">
        <div
          v-for="alert in alertsStore.panelAlerts"
          :key="alert.id"
          class="flex items-center justify-between px-3 py-2.5 rounded-lg border group cursor-pointer transition-opacity hover:opacity-90"
          :class="alert.severity === 'critical' || alert.severity === 'error'
            ? 'bg-danger-500/10 border-danger-500/20'
            : 'bg-warning-500/10 border-warning-500/20'"
          @click="navigateAlert(alert)"
        >
          <div class="flex items-center gap-3 min-w-0">
            <!-- Ícono severity -->
            <div
              class="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
              :class="alert.severity === 'critical' || alert.severity === 'error'
                ? 'bg-danger-500/20 text-danger-400'
                : 'bg-warning-500/20 text-warning-400'"
            >
              <svg v-if="alert.category === 'equipment'" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-primary leading-tight">
                <span
                  class="text-xs font-semibold mr-1.5"
                  :class="alert.severity === 'critical' || alert.severity === 'error' ? 'text-danger-400' : 'text-warning-400'"
                >{{ alert.title }}</span>{{ alert.subtitle }}
              </p>
              <p class="text-xs text-muted mt-0.5">{{ alert.detail }}</p>
            </div>
          </div>
          <button
            @click.stop="alertsStore.acknowledge(alert.id)"
            class="shrink-0 ml-3 p-1.5 rounded-lg text-muted hover:text-danger-400 hover:bg-danger-500/10 opacity-0 group-hover:opacity-100 transition-all"
            title="Descartar alerta"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <p v-else class="text-sm text-secondary text-center py-4">Sin alertas activas</p>
    </div>

  </div>

</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDashboardStore } from '../stores/dashboard.store'
import { useAlertsStore, type AppAlert } from '../stores/alerts.store'
import KpiCard from '../components/KpiCard.vue'
import CalendarPicker from '../components/CalendarPicker.vue'

const router = useRouter()
const dashboardStore = useDashboardStore()
const alertsStore = useAlertsStore()
const isRefreshing = ref(false)

function navigateAlert(alert: AppAlert) {
  alertsStore.markRead(alert.id)
  const dest = alert.navigateTo.includes('?sku=')
    ? alert.navigateTo + '&_t=' + Date.now()
    : alert.navigateTo
  router.push(dest)
}

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

// ─── Refresh ──────────────────────────────────────────────────────────────────
function refreshDashboard() {
  isRefreshing.value = true
  ;(dashboardStore as any).$hydrate()
  setTimeout(() => { isRefreshing.value = false }, 600)
}

onMounted(() => {
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
