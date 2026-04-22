<template>
  <div class="space-y-6">

    <!-- ─── Header ──────────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-primary">Transacciones</h1>
      <div class="flex items-center gap-2 text-xs text-muted bg-surface border border-border rounded-lg px-3 py-2">
        <span class="w-2 h-2 rounded-full bg-success-500 animate-pulse inline-block"></span>
        Actualizado hace unos segundos
      </div>
    </div>

    <!-- ─── KPI Cards ────────────────────────────────────────────────────────── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-surface border border-border rounded-xl p-4">
        <p class="text-xs text-muted uppercase tracking-wider mb-1">Transacciones</p>
        <p class="text-2xl font-bold text-primary">{{ kpis.totalTxn }}</p>
        <p class="text-xs text-secondary mt-1">hoy · {{ periodoActivo }}</p>
      </div>
      <div class="bg-surface border border-border rounded-xl p-4">
        <p class="text-xs text-muted uppercase tracking-wider mb-1">Total vendido</p>
        <p class="text-2xl font-bold text-success-500">${{ kpis.totalVentas.toLocaleString('es-CL') }}</p>
        <p class="text-xs text-secondary mt-1">completadas</p>
      </div>
      <div class="bg-surface border border-border rounded-xl p-4">
        <p class="text-xs text-muted uppercase tracking-wider mb-1">Ticket promedio</p>
        <p class="text-2xl font-bold text-primary">${{ kpis.ticketPromedio.toLocaleString('es-CL') }}</p>
        <p class="text-xs text-secondary mt-1">por transacción</p>
      </div>
      <div class="bg-surface border border-border rounded-xl p-4">
        <p class="text-xs text-muted uppercase tracking-wider mb-1">Anuladas / Error</p>
        <p class="text-2xl font-bold" :class="kpis.anuladas > 0 ? 'text-danger-400' : 'text-primary'">
          {{ kpis.anuladas }}
        </p>
        <p class="text-xs text-secondary mt-1">
          <span v-if="kpis.errores > 0">incl. {{ kpis.errores }} error{{ kpis.errores !== 1 ? 'es' : '' }}</span>
          <span v-else>sin problemas</span>
        </p>
      </div>
    </div>

    <!-- ─── Filtros ──────────────────────────────────────────────────────────── -->
    <div class="bg-surface border border-border rounded-xl px-4 py-3">
      <div class="flex items-center gap-2 flex-wrap">

        <!-- Buscador -->
        <div class="relative">
          <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Folio o cajero..."
            class="pl-8 pr-3 py-1.5 bg-input border border-border rounded-lg text-xs text-primary placeholder-muted outline-none focus:border-indigo-500 w-44 transition-colors"
          />
        </div>

        <div class="w-px h-5 bg-border mx-0.5 self-center"></div>

        <!-- Period pills -->
        <span class="text-xs text-muted uppercase tracking-wider font-medium">Período:</span>
        <button
          v-for="p in periodos"
          :key="p"
          @click="periodoActivo = p"
          :class="periodoActivo === p
            ? 'bg-brand-500 text-white border-brand-500'
            : 'bg-input text-secondary border-border hover:border-brand-500/40 hover:text-primary'"
          class="px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors"
        >
          {{ p }}
        </button>

        <div class="w-px h-5 bg-border mx-0.5 self-center"></div>

        <!-- Estado -->
        <select
          v-model="filterStatus"
          class="px-2.5 py-1.5 bg-input border border-border rounded-lg text-xs text-primary outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="">Todo estado</option>
          <option value="completada">Completadas</option>
          <option value="anulada">Anuladas</option>
          <option value="error">Error</option>
          <option value="pendiente">Pendiente</option>
        </select>

        <!-- Pago -->
        <select
          v-model="filterPago"
          class="px-2.5 py-1.5 bg-input border border-border rounded-lg text-xs text-primary outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="">Todo pago</option>
          <option value="efectivo">Efectivo</option>
          <option value="debito">Débito</option>
          <option value="credito">Crédito</option>
          <option value="transferencia">Transferencia</option>
        </select>

        <!-- Estación -->
        <select
          v-model="filterStation"
          class="px-2.5 py-1.5 bg-input border border-border rounded-lg text-xs text-primary outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="">Todas las estaciones</option>
          <option v-for="s in stationsAvailable" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>

        <!-- Limpiar -->
        <button
          v-if="hayFiltros"
          @click="limpiarFiltros"
          class="px-2.5 py-1.5 text-xs text-secondary hover:text-primary bg-input hover:bg-border rounded-lg border border-border transition-colors"
        >
          Limpiar filtros
        </button>

      </div>
    </div>

    <!-- ─── Tabla ─────────────────────────────────────────────────────────────── -->
    <div class="bg-surface border border-border rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-input">
              <th class="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-24">Folio</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-28">Hora</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-28">Estación</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Cajero</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Productos</th>
              <th class="text-center px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-28">Pago</th>
              <th class="text-right px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-28">Monto</th>
              <th class="text-center px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-28">Estado</th>
              <th class="text-center px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-12"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="txn in txnsFiltradas"
              :key="txn.id"
              @click="openDetail(txn)"
              class="hover:bg-surface-2 cursor-pointer transition-colors"
            >
              <td class="px-4 py-3 font-mono text-xs font-semibold text-primary">{{ txn.folio }}</td>
              <td class="px-4 py-3 text-xs text-secondary">{{ formatTime(txn.createdAt) }}</td>
              <td class="px-4 py-3">
                <span class="text-xs font-medium text-secondary">{{ store.stationName(txn.balanzaId) }}</span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full bg-brand-500/15 flex items-center justify-center text-brand-400 text-[9px] font-bold shrink-0">
                    {{ initials(txn.cajeroNombre) }}
                  </div>
                  <span class="text-sm text-primary font-medium">{{ txn.cajeroNombre }}</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <p class="text-xs text-primary truncate max-w-[180px]">
                  {{ txn.items[0].productName }}
                  <span v-if="txn.items.length > 1" class="text-muted ml-1">+{{ txn.items.length - 1 }}</span>
                </p>
                <p class="text-[10px] text-muted mt-0.5">{{ txn.items.length }} ítem{{ txn.items.length !== 1 ? 's' : '' }}</p>
              </td>
              <td class="px-4 py-3 text-center">
                <span class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium"
                  :class="pagoStyle(txn.paymentMethod)">
                  {{ pagoLabel(txn.paymentMethod) }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <span class="font-semibold text-sm" :class="txn.status === 'anulada' || txn.status === 'error' ? 'text-muted line-through' : 'text-primary'">
                  ${{ txn.totalAmount.toLocaleString('es-CL') }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <span class="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border"
                  :class="statusStyle(txn.status)">
                  <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="statusDot(txn.status)"></span>
                  {{ statusLabel(txn.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <button
                  @click.stop="openDetail(txn)"
                  class="p-1 rounded text-muted hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                  title="Ver detalle"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </td>
            </tr>
            <tr v-if="txnsFiltradas.length === 0">
              <td colspan="9" class="px-4 py-14 text-center text-muted text-sm">
                No se encontraron transacciones con los filtros aplicados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer tabla -->
      <div class="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted">
        <span>
          {{ txnsFiltradas.length }} de {{ store.transactions.length }} transacciones
        </span>
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-success-500"></span>
            Completadas: {{ countByStatus('completada') }}
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-danger-500"></span>
            Anuladas: {{ countByStatus('anulada') }}
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-warning-500"></span>
            Error: {{ countByStatus('error') }}
          </span>
        </div>
      </div>
    </div>

  </div>

  <!-- ─── Modal detalle ─────────────────────────────────────────────────────── -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="detailTxn"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="detailTxn = null"
      >
        <div class="bg-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl scale-in">

          <!-- Modal Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-border">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center">
                <svg class="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p class="font-semibold text-primary">{{ detailTxn.folio }}</p>
                <p class="text-xs text-muted">{{ formatDateTime(detailTxn.createdAt) }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border"
                :class="statusStyle(detailTxn.status)">
                <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="statusDot(detailTxn.status)"></span>
                {{ statusLabel(detailTxn.status) }}
              </span>
              <button @click="detailTxn = null" class="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-2 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Info general -->
          <div class="px-6 pt-4 pb-2">
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="bg-input border border-border rounded-lg px-3 py-2.5">
                <p class="text-muted mb-0.5">Estación</p>
                <p class="font-semibold text-primary">{{ store.stationName(detailTxn.balanzaId) }}</p>
              </div>
              <div class="bg-input border border-border rounded-lg px-3 py-2.5">
                <p class="text-muted mb-0.5">Cajero</p>
                <p class="font-semibold text-primary">{{ detailTxn.cajeroNombre }}</p>
              </div>
              <div class="bg-input border border-border rounded-lg px-3 py-2.5">
                <p class="text-muted mb-0.5">Método de pago</p>
                <p class="font-semibold text-primary">{{ pagoLabel(detailTxn.paymentMethod) }}</p>
              </div>
              <div class="bg-input border border-border rounded-lg px-3 py-2.5">
                <p class="text-muted mb-0.5">Documento SII</p>
                <p class="font-semibold text-primary">
                  {{ detailTxn.siiDocumentType
                    ? `${detailTxn.siiDocumentType.charAt(0).toUpperCase() + detailTxn.siiDocumentType.slice(1)} #${detailTxn.siiDocumentNumber}`
                    : 'Sin documento' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Items -->
          <div class="px-6 py-3">
            <p class="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">
              Ítems ({{ detailTxn.items.length }})
            </p>
            <div class="bg-input border border-border rounded-xl overflow-hidden">
              <table class="w-full text-xs">
                <thead>
                  <tr class="border-b border-border">
                    <th class="text-left px-3 py-2 font-medium text-muted">Producto</th>
                    <th class="text-right px-3 py-2 font-medium text-muted w-20">Cant.</th>
                    <th class="text-right px-3 py-2 font-medium text-muted w-20">P. Unit.</th>
                    <th class="text-right px-3 py-2 font-medium text-muted w-24">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  <tr v-for="item in detailTxn.items" :key="item.productId">
                    <td class="px-3 py-2.5">
                      <p class="font-medium text-primary">{{ item.productName }}</p>
                      <p class="text-[10px] text-muted font-mono">{{ item.sku }}</p>
                    </td>
                    <td class="px-3 py-2.5 text-right text-secondary">
                      {{ item.isWeighed ? `${item.quantity.toFixed(3)} kg` : `${item.quantity} un` }}
                    </td>
                    <td class="px-3 py-2.5 text-right text-secondary">${{ item.unitPrice.toLocaleString('es-CL') }}</td>
                    <td class="px-3 py-2.5 text-right font-semibold text-primary">${{ item.totalPrice.toLocaleString('es-CL') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Total -->
          <div class="mx-6 mb-5 flex items-center justify-between py-3 px-4 rounded-xl"
            :class="detailTxn.status === 'completada' ? 'bg-success-500/10 border border-success-500/20' : 'bg-surface-2 border border-border'">
            <span class="text-sm font-semibold" :class="detailTxn.status === 'completada' ? 'text-success-500' : 'text-muted'">
              TOTAL
            </span>
            <span class="text-xl font-bold" :class="detailTxn.status === 'completada' ? 'text-success-500' : 'text-muted line-through'">
              ${{ detailTxn.totalAmount.toLocaleString('es-CL') }}
            </span>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTransactionsStore } from '../stores/transactions.store'
import type { Transaction, TransactionStatus, PaymentMethod } from '../types'

const store = useTransactionsStore()

// ─── Filtros ──────────────────────────────────────────────────────────────────
const periodos = ['Hoy', 'Ayer', 'Esta semana', 'Este mes'] as const
const periodoActivo = ref<typeof periodos[number]>('Hoy')
const searchQuery   = ref('')
const filterStatus  = ref('')
const filterPago    = ref('')
const filterStation = ref<number | ''>('')

const hayFiltros = computed(() =>
  !!searchQuery.value || !!filterStatus.value || !!filterPago.value || filterStation.value !== ''
)

function limpiarFiltros() {
  searchQuery.value   = ''
  filterStatus.value  = ''
  filterPago.value    = ''
  filterStation.value = ''
}

const stationsAvailable = [
  { id: 1, name: 'Balanza 1' },
  { id: 2, name: 'Balanza 2' },
  { id: 3, name: 'Balanza 3' },
  { id: 4, name: 'Balanza 4' },
  { id: 5, name: 'Caja' },
]

const txnsFiltradas = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return store.transactions.filter(t => {
    const matchSearch = !q ||
      t.folio.toLowerCase().includes(q) ||
      t.cajeroNombre.toLowerCase().includes(q)
    const matchStatus  = !filterStatus.value  || t.status         === filterStatus.value
    const matchPago    = !filterPago.value    || t.paymentMethod  === filterPago.value
    const matchStation = filterStation.value === '' || t.balanzaId === filterStation.value
    return matchSearch && matchStatus && matchPago && matchStation
  })
})

// ─── KPIs ─────────────────────────────────────────────────────────────────────
const kpis = computed(() => {
  const completadas = store.transactions.filter(t => t.status === 'completada')
  const totalVentas = completadas.reduce((s, t) => s + t.totalAmount, 0)
  return {
    totalTxn:     store.transactions.length,
    totalVentas,
    ticketPromedio: completadas.length ? Math.round(totalVentas / completadas.length) : 0,
    anuladas: store.transactions.filter(t => t.status === 'anulada' || t.status === 'error').length,
    errores:  store.transactions.filter(t => t.status === 'error').length,
  }
})

function countByStatus(s: TransactionStatus) {
  return txnsFiltradas.value.filter(t => t.status === s).length
}

// ─── Detail modal ─────────────────────────────────────────────────────────────
const detailTxn = ref<Transaction | null>(null)
function openDetail(txn: Transaction) { detailTxn.value = txn }

// ─── Helpers display ──────────────────────────────────────────────────────────
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-CL', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

function initials(name: string): string {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

function statusLabel(s: TransactionStatus): string {
  const m: Record<TransactionStatus, string> = {
    completada: 'Completada', anulada: 'Anulada', pendiente: 'Pendiente', error: 'Error',
  }
  return m[s] ?? s
}

function statusStyle(s: TransactionStatus): string {
  const m: Record<TransactionStatus, string> = {
    completada: 'bg-success-500/10 text-success-500 border-success-500/20',
    anulada:    'bg-surface-2 text-muted border-border',
    pendiente:  'bg-warning-500/10 text-warning-400 border-warning-500/20',
    error:      'bg-danger-500/10 text-danger-400 border-danger-500/20',
  }
  return m[s] ?? ''
}

function statusDot(s: TransactionStatus): string {
  const m: Record<TransactionStatus, string> = {
    completada: 'bg-success-500',
    anulada:    'bg-muted bg-[#6B7280]',
    pendiente:  'bg-warning-500',
    error:      'bg-danger-500',
  }
  return m[s] ?? ''
}

function pagoLabel(p: PaymentMethod): string {
  const m: Record<PaymentMethod, string> = {
    efectivo: 'Efectivo', debito: 'Débito', credito: 'Crédito', transferencia: 'Transfer.',
  }
  return m[p] ?? p
}

function pagoStyle(p: PaymentMethod): string {
  const m: Record<PaymentMethod, string> = {
    efectivo:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    debito:        'bg-sky-500/10 text-sky-400 border-sky-500/20',
    credito:       'bg-violet-500/10 text-violet-400 border-violet-500/20',
    transferencia: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  }
  return m[p] ?? ''
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
