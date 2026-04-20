<template>
  <div class="space-y-8">
    <!-- Header -->
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

    <!-- KPI Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <KpiCard
        v-if="dashboardStore.kpis"
        label="Ventas del Día"
        :value="`$${dashboardStore.kpis.totalVentas.toLocaleString('es-CL')}`"
        :trend="dashboardStore.kpis.ventasTrend"
        icon="banknotes"
        accent-color="brand"
      />
      <KpiCard
        v-if="dashboardStore.kpis"
        label="Transacciones"
        :value="`${dashboardStore.kpis.totalTransacciones}`"
        :trend="dashboardStore.kpis.transaccionesTrend"
        icon="receipt-refund"
        accent-color="info"
      />
      <KpiCard
        v-if="dashboardStore.kpis"
        label="Ticket Promedio"
        :value="`$${dashboardStore.kpis.ticketPromedio.toLocaleString('es-CL')}`"
        :trend="dashboardStore.kpis.ticketTrend"
        icon="tag"
        accent-color="success"
      />
    </div>

    <!-- Station Status -->
    <div>
      <h2 class="text-lg font-semibold text-primary mb-4">Estado de Balanzas y Caja</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StationCard
          v-for="station in dashboardStore.stations"
          :key="station.id"
          :station="station"
          :readonly="!canEdit"
          @update:operatorName="(name) => updateOperatorName(station.id, name)"
        />
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Sales Chart (60%) -->
      <div class="lg:col-span-2 bg-surface rounded-lg border border-border p-6">
        <h3 class="text-lg font-semibold text-primary mb-4">Ventas por Hora</h3>
        <div id="chart-sales" style="height: 300px;">
          <p class="text-center text-secondary py-12">Gráfico de ventas por hora (ApexCharts)</p>
        </div>
      </div>

      <!-- Top Products (40%) -->
      <div class="bg-surface rounded-lg border border-border p-6">
        <h3 class="text-lg font-semibold text-primary mb-4">Top 5 Productos</h3>
        <div class="space-y-4">
          <div
            v-for="product in mockTopProducts.slice(0, 5)"
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

    <!-- Low Stock Alerts -->
    <div class="bg-surface rounded-lg border border-border p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-primary">⚠️ Alertas de Stock Bajo</h2>
        <span class="text-xs text-secondary">{{ alertsStore.unreadStockAlerts.length }} pendiente{{ alertsStore.unreadStockAlerts.length !== 1 ? 's' : '' }}</span>
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useDashboardStore } from '../stores/dashboard.store'
import { useAlertsStore } from '../stores/alerts.store'
import { useAuthStore } from '../stores/auth.store'
import KpiCard from '../components/KpiCard.vue'
import StationCard from '../components/StationCard.vue'

const dashboardStore = useDashboardStore()
const alertsStore = useAlertsStore()
const authStore = useAuthStore()
const canEdit = computed(() => authStore.isGerente)
const isRefreshing = ref(false)

function updateOperatorName(stationId: number, name: string) {
  dashboardStore.updateStationOperator(stationId, name)
}

function refreshDashboard() {
  isRefreshing.value = true
  // Re-lee todos los stores persistidos desde localStorage
  ;(dashboardStore as any).$hydrate()
  setTimeout(() => { isRefreshing.value = false }, 600)
}

const mockTopProducts = [
  { productId: 'POL-001', productName: 'Pollo (filete)', category: 'carnes' as const, totalSold: 182, totalRevenue: 125000, transactionCount: 28 },
  { productId: 'CAR-002', productName: 'Carne (costilla)', category: 'carnes' as const, totalSold: 142, totalRevenue: 89500, transactionCount: 24 },
  { productId: 'PAT-001', productName: 'Pastel (queque)', category: 'panaderia' as const, totalSold: 155, totalRevenue: 65200, transactionCount: 15 },
  { productId: 'VER-001', productName: 'Lechuga', category: 'verduras' as const, totalSold: 58, totalRevenue: 34800, transactionCount: 12 },
  { productId: 'FRU-001', productName: 'Plátano', category: 'frutas' as const, totalSold: 48, totalRevenue: 28500, transactionCount: 10 }
]

onMounted(() => {
  // Mock KPI updates every 15 seconds
  setInterval(() => {
    if (dashboardStore.kpis) {
      dashboardStore.updateKPIs({
        ...dashboardStore.kpis,
        lastUpdatedAt: new Date().toISOString()
      })
    }
  }, 15000)
})
</script>

<style scoped>
#chart-sales {
  min-height: 300px;
}
</style>
