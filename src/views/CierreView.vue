<template>
  <div class="space-y-6">

    <!-- ─── Header ──────────────────────────────────────────────────────────── -->
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-bold text-primary">Cierre del Día</h1>
        <p class="text-sm text-muted mt-1">{{ fechaHoy }} · Turno completo</p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Estado del cierre -->
        <div v-if="cierrEjecutado"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
          Cierre ejecutado {{ horaCierre }}
        </div>

        <button v-if="!cierrEjecutado && puedeEjecutarCierre"
          @click="modalConfirmar = true"
          class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Ejecutar cierre
        </button>

        <button
          @click="imprimirResumen"
          class="flex items-center gap-2 px-4 py-2.5 bg-surface-2 hover:bg-border text-secondary hover:text-primary text-sm font-medium rounded-lg border border-border transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir resumen
        </button>
      </div>
    </div>

    <!-- ─── Resumen financiero ────────────────────────────────────────────── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-surface border border-border rounded-xl p-4">
        <p class="text-xs text-muted uppercase tracking-wider mb-1">Ventas totales</p>
        <p class="text-2xl font-bold text-primary">${{ kpis.totalVentas.toLocaleString('es-CL') }}</p>
        <p class="text-xs text-green-400 mt-1">↑ {{ kpis.ventasTrend.percentage }}% vs ayer</p>
      </div>
      <div class="bg-surface border border-border rounded-xl p-4">
        <p class="text-xs text-muted uppercase tracking-wider mb-1">Transacciones</p>
        <p class="text-2xl font-bold text-primary">{{ kpis.totalTransacciones }}</p>
        <p class="text-xs text-green-400 mt-1">↑ {{ kpis.transaccionesTrend.percentage }}% vs ayer</p>
      </div>
      <div class="bg-surface border border-border rounded-xl p-4">
        <p class="text-xs text-muted uppercase tracking-wider mb-1">Ticket promedio</p>
        <p class="text-2xl font-bold text-primary">${{ kpis.ticketPromedio.toLocaleString('es-CL') }}</p>
        <p class="text-xs text-red-400 mt-1">↓ {{ Math.abs(kpis.ticketTrend.percentage) }}% vs ayer</p>
      </div>
      <div class="bg-surface border border-border rounded-xl p-4">
        <p class="text-xs text-muted uppercase tracking-wider mb-1">Horas activo</p>
        <p class="text-2xl font-bold text-primary">6h 15m</p>
        <p class="text-xs text-muted mt-1">08:00 – 14:15</p>
      </div>
    </div>

    <!-- ─── Métodos de pago + Desglose por estación ──────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Métodos de pago -->
      <div class="bg-surface border border-border rounded-xl p-5">
        <h2 class="text-base font-semibold text-primary mb-4">Métodos de pago</h2>
        <div class="space-y-3">
          <div v-for="metodo in metodosPago" :key="metodo.tipo" class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              :class="metodo.bgColor">
              <svg class="w-4 h-4" :class="metodo.textColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="metodo.icon" />
              </svg>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm text-primary">{{ metodo.label }}</span>
                <div class="text-right">
                  <span class="text-sm font-semibold text-primary">${{ metodo.monto.toLocaleString('es-CL') }}</span>
                  <span class="text-xs text-muted ml-2">{{ metodo.pct }}%</span>
                </div>
              </div>
              <div class="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-700"
                  :class="metodo.barColor"
                  :style="{ width: metodo.pct + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Desglose por estación -->
      <div class="bg-surface border border-border rounded-xl p-5">
        <h2 class="text-base font-semibold text-primary mb-4">Ventas por estación</h2>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border">
              <th class="text-left pb-2 text-xs font-medium text-muted uppercase tracking-wider">Estación</th>
              <th class="text-left pb-2 text-xs font-medium text-muted uppercase tracking-wider">Operario</th>
              <th class="text-right pb-2 text-xs font-medium text-muted uppercase tracking-wider">Ventas</th>
              <th class="text-right pb-2 text-xs font-medium text-muted uppercase tracking-wider">Ventas</th>
              <th class="text-right pb-2 text-xs font-medium text-muted uppercase tracking-wider">T. Prom.</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="est in estaciones" :key="est.stationId"
              :class="est.ventas === 0 ? 'opacity-40' : ''">
              <td class="py-2.5 text-[#F1F5F9] font-medium">{{ est.stationName }}</td>
              <td class="py-2.5 text-secondary">
                {{ dashboardStore.stations.find(s => s.id === est.stationId)?.operatorName || '—' }}
              </td>
              <td class="py-2.5 text-right text-[#F1F5F9]">
                {{ est.ventas > 0 ? `$${est.ventas.toLocaleString('es-CL')}` : '—' }}
              </td>
              <td class="py-2.5 text-right text-secondary">{{ est.transacciones }}</td>
              <td class="py-2.5 text-right text-secondary">
                {{ est.ticketPromedio > 0 ? `$${est.ticketPromedio.toLocaleString('es-CL')}` : '—' }}
              </td>
            </tr>
          </tbody>
          <tfoot class="border-t-2 border-border">
            <tr>
              <td class="pt-2.5 text-xs font-semibold text-muted uppercase">Total</td>
              <td class="pt-2.5"></td>
              <td class="pt-2.5 text-right font-bold text-primary">${{ totalEstaciones.ventas.toLocaleString('es-CL') }}</td>
              <td class="pt-2.5 text-right font-bold text-secondary">{{ totalEstaciones.transacciones }}</td>
              <td class="pt-2.5 text-right text-muted">—</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- ─── Arqueo de caja + Top productos ──────────────────────────────── -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Arqueo de caja -->
      <div class="bg-surface border border-border rounded-xl p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-semibold text-primary">Arqueo de caja</h2>
          <span class="text-xs text-muted">Solo efectivo</span>
        </div>

        <div class="space-y-3 mb-5">
          <div class="flex items-center justify-between py-3 border-b border-border">
            <span class="text-sm text-secondary">Monto esperado (ventas efectivo)</span>
            <span class="text-sm font-semibold text-primary">${{ arqueoEsperado.toLocaleString('es-CL') }}</span>
          </div>
          <div class="flex items-center justify-between py-3 border-b border-border">
            <span class="text-sm text-secondary">Fondo inicial de caja</span>
            <span class="text-sm text-secondary">+ ${{ arqueoFondoInicial.toLocaleString('es-CL') }}</span>
          </div>
          <div class="flex items-center justify-between py-2">
            <label class="text-sm text-secondary">Monto contado (físico)</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
              <input
                v-model.number="arqueoContado"
                type="number"
                min="0"
                :disabled="!puedeEditar"
                class="bg-input border border-border rounded-lg pl-7 pr-3 py-2 text-sm text-primary
                       outline-none focus:border-indigo-500 transition-colors w-36 text-right
                       disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <!-- Diferencia -->
        <div class="rounded-lg p-4 flex items-center justify-between"
          :class="diferencia === 0 ? 'bg-green-500/10 border border-green-500/20'
                : diferencia > 0 ? 'bg-sky-500/10 border border-sky-500/20'
                : 'bg-red-500/10 border border-red-500/20'">
          <div>
            <p class="text-xs font-medium mb-0.5"
              :class="diferencia === 0 ? 'text-green-400' : diferencia > 0 ? 'text-sky-400' : 'text-red-400'">
              {{ diferencia === 0 ? 'Caja cuadrada' : diferencia > 0 ? 'Sobrante' : 'Faltante' }}
            </p>
            <p class="text-xs text-muted">
              {{ diferencia === 0 ? 'El físico coincide con el sistema' : diferencia > 0 ? 'Más efectivo del esperado' : 'Menos efectivo del esperado' }}
            </p>
          </div>
          <p class="text-xl font-bold"
            :class="diferencia === 0 ? 'text-green-400' : diferencia > 0 ? 'text-sky-400' : 'text-red-400'">
            {{ diferencia >= 0 ? '+' : '' }}${{ diferencia.toLocaleString('es-CL') }}
          </p>
        </div>
      </div>

      <!-- Top 5 productos -->
      <div class="bg-surface border border-border rounded-xl p-5">
        <h2 class="text-base font-semibold text-primary mb-4">Top 5 productos del día</h2>
        <div class="space-y-3">
          <div v-for="(p, i) in topProductos" :key="p.productId"
            class="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
            <span class="text-xs font-bold w-5 text-center"
              :class="i === 0 ? 'text-yellow-400' : i === 1 ? 'text-secondary' : 'text-muted'">
              {{ i + 1 }}
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-[#F1F5F9] truncate">{{ p.productName }}</p>
              <p class="text-xs text-muted">{{ p.transactionCount }} transacciones · {{ p.totalSold }} vendidos</p>
            </div>
            <p class="text-sm font-semibold text-green-400 shrink-0">${{ p.totalRevenue.toLocaleString('es-CL') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Alertas de stock del día ─────────────────────────────────────── -->
    <div class="bg-surface border border-border rounded-xl p-5">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-semibold text-primary">Alertas de stock generadas hoy</h2>
        <span class="text-xs text-muted">{{ alertas.length }} alerta{{ alertas.length !== 1 ? 's' : '' }}</span>
      </div>
      <div v-if="alertas.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div v-for="a in alertas" :key="a.id"
          class="flex items-center justify-between p-3 rounded-lg border"
          :class="a.stockStatus === 'critical' ? 'bg-orange-500/5 border-orange-500/20' : 'bg-yellow-500/5 border-yellow-500/20'">
          <div class="flex items-center gap-2.5">
            <svg class="w-4 h-4 shrink-0" :class="a.stockStatus === 'critical' ? 'text-orange-400' : 'text-yellow-400'"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p class="text-sm font-medium text-[#F1F5F9]">{{ a.productName }}</p>
              <p class="text-xs text-muted">Stock: {{ a.currentStock }} / mín {{ a.minStock }}</p>
            </div>
          </div>
          <span class="text-xs font-medium px-2 py-1 rounded-full"
            :class="a.stockStatus === 'critical' ? 'bg-orange-500/10 text-orange-400' : 'bg-yellow-500/10 text-yellow-400'">
            {{ a.stockStatus === 'critical' ? 'Crítico' : 'Stock bajo' }}
          </span>
        </div>
      </div>
      <p v-else class="text-sm text-muted text-center py-4">Sin alertas de stock hoy</p>
    </div>

    <!-- ─── Observaciones ────────────────────────────────────────────────── -->
    <div class="bg-surface border border-border rounded-xl p-5">
      <h2 class="text-base font-semibold text-primary mb-3">Observaciones del turno</h2>
      <textarea
        v-model="observaciones"
        :disabled="!puedeEditar"
        placeholder="Agrega notas sobre incidencias, anomalías o comentarios del día..."
        rows="3"
        class="w-full bg-input border border-border rounded-lg px-4 py-3 text-sm text-primary
               placeholder-muted outline-none focus:border-indigo-500 transition-colors resize-none
               disabled:opacity-50 disabled:cursor-not-allowed"
      ></textarea>
    </div>

  </div>

  <!-- ─── Modal confirmación de cierre ────────────────────────────────────── -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modalConfirmar"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="modalConfirmar = false">
        <div class="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl scale-in">

          <!-- Ícono -->
          <div class="flex flex-col items-center pt-8 pb-2 px-8">
            <div class="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-4">
              <svg class="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-primary text-center">¿Ejecutar cierre del día?</h3>
            <p class="text-sm text-muted text-center mt-2 mb-6">
              Esta acción cerrará el turno actual. Los datos quedarán registrados y no podrán modificarse.
            </p>
          </div>

          <!-- Resumen rápido -->
          <div class="mx-8 mb-6 bg-input border border-border rounded-xl divide-y divide-border">
            <div class="flex justify-between px-4 py-3 text-sm">
              <span class="text-muted">Total ventas</span>
              <span class="font-semibold text-primary">${{ kpis.totalVentas.toLocaleString('es-CL') }}</span>
            </div>
            <div class="flex justify-between px-4 py-3 text-sm">
              <span class="text-muted">Transacciones</span>
              <span class="font-semibold text-primary">{{ kpis.totalTransacciones }}</span>
            </div>
            <div class="flex justify-between px-4 py-3 text-sm">
              <span class="text-muted">Diferencia arqueo</span>
              <span class="font-semibold"
                :class="diferencia >= 0 ? 'text-green-400' : 'text-red-400'">
                {{ diferencia >= 0 ? '+' : '' }}${{ diferencia.toLocaleString('es-CL') }}
              </span>
            </div>
          </div>

          <!-- Botones -->
          <div class="flex gap-3 px-8 pb-8">
            <button @click="modalConfirmar = false"
              class="flex-1 py-2.5 text-sm text-secondary hover:text-primary bg-surface-2 hover:bg-border rounded-lg transition-colors font-medium">
              Cancelar
            </button>
            <button @click="ejecutarCierre"
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
import { ref, computed, onMounted } from 'vue'
import { useDashboardStore } from '../stores/dashboard.store'
import { useCierreStore } from '../stores/cierre.store'
import { useAuthStore } from '../stores/auth.store'
import { useAlertsStore } from '../stores/alerts.store'
import { mockTopProducts } from '../mocks/kpis'

const dashboardStore = useDashboardStore()
const cierreStore = useCierreStore()
const authStore = useAuthStore()
const alertsStore = useAlertsStore()
const kpis = dashboardStore.kpis!

const puedeEjecutarCierre = computed(() => authStore.isGerente)
const puedeEditar = computed(() => authStore.isGerente && !cierreStore.cierreEjecutado)

// ─── Estado del cierre (persistido) ──────────────────────────────────────────
const modalConfirmar = ref(false)

// Alias directos al store
const cierrEjecutado = computed(() => cierreStore.cierreEjecutado)
const horaCierre = computed(() => cierreStore.horaCierre)
const observaciones = computed({
  get: () => cierreStore.observaciones,
  set: (v) => { cierreStore.observaciones = v }
})

onMounted(() => cierreStore.checkAndResetIfNewDay())

function ejecutarCierre() {
  cierreStore.ejecutarCierre()
  modalConfirmar.value = false
}

function imprimirResumen() {
  window.print()
}

// ─── Fecha ────────────────────────────────────────────────────────────────────
const fechaHoy = new Date().toLocaleDateString('es-CL', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
})

// ─── Métodos de pago (mock) ───────────────────────────────────────────────────
const total = kpis.totalVentas
const metodosPago = [
  {
    tipo: 'efectivo', label: 'Efectivo', monto: Math.round(total * 0.44), pct: 44,
    bgColor: 'bg-green-500/10', textColor: 'text-green-400', barColor: 'bg-green-500',
    icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
  },
  {
    tipo: 'debito', label: 'Débito', monto: Math.round(total * 0.35), pct: 35,
    bgColor: 'bg-sky-500/10', textColor: 'text-sky-400', barColor: 'bg-sky-500',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
  },
  {
    tipo: 'credito', label: 'Crédito', monto: Math.round(total * 0.15), pct: 15,
    bgColor: 'bg-violet-500/10', textColor: 'text-violet-400', barColor: 'bg-violet-500',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
  },
  {
    tipo: 'transferencia', label: 'Transferencia', monto: Math.round(total * 0.06), pct: 6,
    bgColor: 'bg-indigo-500/10', textColor: 'text-indigo-400', barColor: 'bg-indigo-500',
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
  },
]

// ─── Estaciones — datos reales del dashboardStore ─────────────────────────────
const estaciones = computed(() =>
  dashboardStore.stations.map(s => ({
    stationId:     s.id,
    stationName:   s.name,
    ventas:        s.ventasToday,
    transacciones: s.transactionsToday,
    ticketPromedio: s.transactionsToday > 0
      ? Math.round(s.ventasToday / s.transactionsToday)
      : 0,
  }))
)

const totalEstaciones = computed(() => ({
  ventas:        estaciones.value.reduce((s, e) => s + e.ventas, 0),
  transacciones: estaciones.value.reduce((s, e) => s + e.transacciones, 0),
}))

// ─── Top productos ────────────────────────────────────────────────────────────
const topProductos = mockTopProducts ?? []

// ─── Arqueo ───────────────────────────────────────────────────────────────────
const arqueoEsperado = Math.round(total * 0.44)
const arqueoFondoInicial = 50000

const arqueoContado = computed({
  get: () => cierreStore.montoCont ?? (arqueoEsperado + arqueoFondoInicial),
  set: (v: number) => { cierreStore.montoCont = v }
})

const diferencia = computed(() =>
  arqueoContado.value - (arqueoEsperado + arqueoFondoInicial)
)

// ─── Alertas ──────────────────────────────────────────────────────────────────
const alertas = computed(() => alertsStore.panelStockAlerts)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
