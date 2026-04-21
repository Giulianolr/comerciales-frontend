<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-primary">Reportes de Proveedores</h1>
        <p class="text-sm text-muted mt-1">Facturas, órdenes de compra y estado de recepciones</p>
      </div>
      <div class="flex items-center gap-3">
        <select v-model="filterPeriodo"
          class="px-3 py-2 bg-input border border-border rounded-lg text-sm text-primary outline-none focus:border-indigo-500 transition-colors">
          <option value="mes">Este mes</option>
          <option value="semana">Esta semana</option>
          <option value="trimestre">Trimestre</option>
          <option value="todo">Todo</option>
        </select>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-surface border border-border rounded-xl p-4">
        <p class="text-xs text-muted uppercase tracking-wider mb-1">Total facturas</p>
        <p class="text-2xl font-bold text-primary">{{ facturas.length }}</p>
        <p class="text-xs text-muted mt-1">{{ proveedoresUnicos }} proveedores distintos</p>
      </div>
      <div class="bg-surface border border-border rounded-xl p-4">
        <p class="text-xs text-muted uppercase tracking-wider mb-1">Monto total</p>
        <p class="text-2xl font-bold text-primary">${{ montoTotal.toLocaleString('es-CL') }}</p>
        <p class="text-xs text-muted mt-1">IVA incluido</p>
      </div>
      <div class="bg-surface border border-border rounded-xl p-4">
        <p class="text-xs text-muted uppercase tracking-wider mb-1">Por pagar</p>
        <p class="text-2xl font-bold text-yellow-400">${{ montoPendiente.toLocaleString('es-CL') }}</p>
        <p class="text-xs text-muted mt-1">{{ countPago('pendiente') }} facturas pendientes</p>
      </div>
      <div class="bg-surface border border-border rounded-xl p-4">
        <p class="text-xs text-muted uppercase tracking-wider mb-1">Vencidas</p>
        <p class="text-2xl font-bold text-red-400">${{ montoVencido.toLocaleString('es-CL') }}</p>
        <p class="text-xs text-muted mt-1">{{ countPago('vencida') }} facturas vencidas</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="searchQuery" type="text" placeholder="Buscar proveedor o folio..."
          class="pl-9 pr-4 py-2 bg-input border border-border rounded-lg text-sm text-primary placeholder-muted outline-none focus:border-indigo-500 w-56 transition-colors" />
      </div>
      <select v-model="filterPago"
        class="px-3 py-2 bg-input border border-border rounded-lg text-sm text-primary outline-none focus:border-indigo-500 transition-colors">
        <option value="">Estado de pago</option>
        <option value="pendiente">Pendiente</option>
        <option value="pagada">Pagada</option>
        <option value="vencida">Vencida</option>
        <option value="anulada">Anulada</option>
      </select>
      <select v-model="filterRecepcion"
        class="px-3 py-2 bg-input border border-border rounded-lg text-sm text-primary outline-none focus:border-indigo-500 transition-colors">
        <option value="">Estado recepción</option>
        <option value="pendiente">Pendiente</option>
        <option value="parcial">Parcial</option>
        <option value="completa">Completa</option>
      </select>
      <button v-if="searchQuery || filterPago || filterRecepcion"
        @click="clearFilters"
        class="px-3 py-2 text-xs text-secondary hover:text-primary bg-surface-2 hover:bg-border rounded-lg transition-colors">
        Limpiar filtros
      </button>
    </div>

    <!-- Tabla -->
    <div class="bg-surface border border-border rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-input">
              <th class="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-8"></th>
              <th class="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-28">Folio / N° OC</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Proveedor</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-32">RUT</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-28">F. Emisión</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-28">F. Vencimiento</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-28">F. Entrega</th>
              <th class="text-right px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-32">Total</th>
              <th class="text-center px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-28">Estado pago</th>
              <th class="text-center px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-28">Recepción</th>
              <th class="text-center px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-16">Detalle</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <template v-for="factura in filteredFacturas" :key="factura.id">
              <!-- Fila principal -->
              <tr class="hover:bg-surface-2 transition-colors cursor-pointer" @click="toggleExpand(factura.id)">
                <!-- Expand icon -->
                <td class="px-4 py-3 text-center">
                  <svg class="w-3.5 h-3.5 text-muted transition-transform mx-auto"
                    :class="expandedId === factura.id ? 'rotate-90' : ''"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </td>
                <td class="px-4 py-3">
                  <p class="font-mono text-xs text-[#F1F5F9] font-medium">{{ factura.folioSII }}</p>
                  <p class="font-mono text-xs text-muted mt-0.5">OC {{ factura.nOrdenCompra }}</p>
                </td>
                <td class="px-4 py-3">
                  <p class="font-medium text-[#F1F5F9]">{{ factura.proveedorNombre }}</p>
                  <p class="text-xs text-muted mt-0.5">{{ factura.proveedorContacto }}</p>
                </td>
                <td class="px-4 py-3 font-mono text-xs text-secondary">{{ factura.proveedorRut }}</td>
                <td class="px-4 py-3 text-xs text-secondary">{{ formatDate(factura.fechaEmision) }}</td>
                <td class="px-4 py-3 text-xs"
                  :class="isVencida(factura) ? 'text-red-400 font-medium' : 'text-secondary'">
                  {{ formatDate(factura.fechaVencimiento) }}
                  <span v-if="isVencida(factura)" class="block text-[10px] text-red-400/70">Vencida</span>
                </td>
                <td class="px-4 py-3 text-xs text-secondary">
                  {{ factura.fechaRecepcion ? formatDate(factura.fechaRecepcion) : factura.fechaEntregaEstimada ? `Est. ${formatDate(factura.fechaEntregaEstimada)}` : '—' }}
                </td>
                <td class="px-4 py-3 text-right">
                  <p class="font-semibold text-[#F1F5F9]">${{ factura.total.toLocaleString('es-CL') }}</p>
                  <p class="text-xs text-muted mt-0.5">IVA ${{ factura.iva.toLocaleString('es-CL') }}</p>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
                    :class="badgePago(factura.estadoPago)">
                    <component :is="'svg'" class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        :d="iconPago(factura.estadoPago)" />
                    </component>
                    {{ labelPago(factura.estadoPago) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
                    :class="badgeRecepcion(factura.estadoRecepcion)">
                    {{ labelRecepcion(factura.estadoRecepcion) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="text-xs text-muted">{{ factura.items.length }} ítem{{ factura.items.length !== 1 ? 's' : '' }}</span>
                </td>
              </tr>

              <!-- Fila expandida: detalle de ítems -->
              <tr v-if="expandedId === factura.id" class="bg-input">
                <td colspan="11" class="px-6 py-4">
                  <div class="rounded-lg border border-border overflow-hidden">
                    <table class="w-full text-xs">
                      <thead>
                        <tr class="bg-surface border-b border-border">
                          <th class="text-left px-4 py-2 text-muted font-medium">Descripción</th>
                          <th class="text-right px-4 py-2 text-muted font-medium w-20">Cantidad</th>
                          <th class="text-left px-4 py-2 text-muted font-medium w-20">Unidad</th>
                          <th class="text-right px-4 py-2 text-muted font-medium w-32">P. Unitario</th>
                          <th class="text-right px-4 py-2 text-muted font-medium w-32">Total</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-border">
                        <tr v-for="(item, i) in factura.items" :key="i" class="hover:bg-surface">
                          <td class="px-4 py-2 text-[#F1F5F9]">{{ item.descripcion }}</td>
                          <td class="px-4 py-2 text-right text-secondary">{{ item.cantidad }}</td>
                          <td class="px-4 py-2 text-secondary uppercase">{{ item.unidad }}</td>
                          <td class="px-4 py-2 text-right text-secondary">${{ item.precioUnitario.toLocaleString('es-CL') }}</td>
                          <td class="px-4 py-2 text-right font-medium text-[#F1F5F9]">${{ item.total.toLocaleString('es-CL') }}</td>
                        </tr>
                      </tbody>
                      <tfoot class="border-t border-border bg-surface">
                        <tr>
                          <td colspan="4" class="px-4 py-2 text-right text-muted">Subtotal</td>
                          <td class="px-4 py-2 text-right text-secondary">${{ factura.subtotal.toLocaleString('es-CL') }}</td>
                        </tr>
                        <tr>
                          <td colspan="4" class="px-4 py-2 text-right text-muted">IVA (19%)</td>
                          <td class="px-4 py-2 text-right text-secondary">${{ factura.iva.toLocaleString('es-CL') }}</td>
                        </tr>
                        <tr>
                          <td colspan="4" class="px-4 py-2 text-right font-semibold text-[#F1F5F9]">Total</td>
                          <td class="px-4 py-2 text-right font-bold text-[#F1F5F9]">${{ factura.total.toLocaleString('es-CL') }}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  <p v-if="factura.observaciones" class="mt-3 text-xs text-muted">
                    <span class="text-secondary font-medium">Observaciones:</span> {{ factura.observaciones }}
                  </p>
                </td>
              </tr>
            </template>

            <tr v-if="filteredFacturas.length === 0">
              <td colspan="11" class="px-4 py-12 text-center text-muted text-sm">
                No se encontraron facturas con los filtros aplicados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div class="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted">
        <span>{{ filteredFacturas.length }} de {{ facturas.length }} facturas</span>
        <span>Total filtrado: <span class="text-[#F1F5F9] font-semibold">${{ montoFiltrado.toLocaleString('es-CL') }}</span></span>
      </div>
    </div>

    <!-- ── Anulaciones de Pre-boletas ──────────────────────────────────────── -->
    <div class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-primary">Anulaciones de Pre-boletas</h2>
          <p class="text-sm text-muted mt-0.5">Pre-boletas canceladas desde la Vista Caja</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-muted mr-2">{{ evtFiltrados.length }} de {{ reportesStore.eventosCaja.length }} registros</span>

          <!-- Filtros toggle -->
          <button
            @click="showEvtFiltros = !showEvtFiltros"
            :class="showEvtFiltros ? 'bg-brand-500/10 border-brand-500/40 text-brand-400' : 'bg-surface-2 border-border text-secondary hover:text-primary'"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filtros
          </button>

          <!-- Borrar todo -->
          <button
            @click="confirmarBorrarTodo"
            :disabled="reportesStore.eventosCaja.length === 0"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-danger-500/30 text-danger-400 hover:bg-danger-500/10 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Borrar todo
          </button>
        </div>
      </div>

      <!-- Panel de filtros -->
      <div v-if="showEvtFiltros" class="flex flex-wrap items-end gap-4 p-4 bg-surface border border-border rounded-xl">
        <div>
          <label class="text-xs text-muted uppercase tracking-wider block mb-1">Balanza</label>
          <select v-model="evtFiltroBalanza"
            class="px-3 py-2 bg-input border border-border rounded-lg text-sm text-primary outline-none focus:border-brand-500 transition-colors">
            <option value="">Todas</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="B3">B3</option>
            <option value="B4">B4</option>
          </select>
        </div>
        <div>
          <label class="text-xs text-muted uppercase tracking-wider block mb-1">Fecha</label>
          <CalendarPicker
            :singleDate="evtFiltroFecha"
            :dateFrom="evtFiltroDesde"
            :dateTo="evtFiltroHasta"
            :filterMode="evtFilterMode"
            @update:singleDate="evtFiltroFecha = $event"
            @update:dateFrom="evtFiltroDesde = $event"
            @update:dateTo="evtFiltroHasta = $event"
            @update:filterMode="evtFilterMode = $event"
          />
        </div>
        <button v-if="evtHayFiltros"
          @click="limpiarEvtFiltros"
          class="px-3 py-2 text-xs text-secondary hover:text-primary bg-surface-2 hover:bg-border rounded-lg transition-colors">
          Limpiar filtros
        </button>
      </div>

      <!-- Tabla -->
      <div class="bg-surface border border-border rounded-xl overflow-hidden">
        <div v-if="evtFiltrados.length === 0" class="px-4 py-12 text-center text-muted text-sm">
          {{ reportesStore.eventosCaja.length === 0 ? 'Sin cancelaciones registradas.' : 'No hay registros con los filtros aplicados.' }}
        </div>
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-input">
              <th class="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-8"></th>
              <th class="text-center px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-20">Balanza</th>
              <th class="text-center px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-28">N° Pre-boleta</th>
              <th class="text-right px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-32">Total</th>
              <th class="text-center px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-20">Ítems</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Fecha / Hora</th>
              <th class="w-10"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <template v-for="evt in evtFiltrados" :key="evt.id">
              <!-- Fila principal -->
              <tr
                @click="expandedEvtId = expandedEvtId === evt.id ? null : evt.id"
                class="hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <td class="px-4 py-3 text-center">
                  <svg class="w-3.5 h-3.5 text-muted transition-transform mx-auto"
                    :class="expandedEvtId === evt.id ? 'rotate-90' : ''"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </td>
                <td class="px-4 py-3 text-center font-semibold text-primary">{{ evt.balanzaId }}</td>
                <td class="px-4 py-3 text-center font-mono text-xs text-secondary">{{ evt.numeroBoleta }}</td>
                <td class="px-4 py-3 text-right font-semibold text-primary">${{ evt.total.toLocaleString('es-CL') }}</td>
                <td class="px-4 py-3 text-center text-xs text-secondary">{{ evt.itemCount }} ítem{{ evt.itemCount !== 1 ? 's' : '' }}</td>
                <td class="px-4 py-3 text-xs text-secondary">{{ formatEvtFecha(evt.fecha) }}</td>
                <td class="px-4 py-3 text-center">
                  <button
                    @click.stop="reportesStore.eliminarEventoCaja(evt.id)"
                    class="p-1 rounded text-muted hover:text-danger-400 hover:bg-danger-500/10 transition-colors"
                    title="Eliminar registro"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              </tr>

              <!-- Fila expandida: detalle de ítems -->
              <tr v-if="expandedEvtId === evt.id" class="bg-input">
                <td colspan="7" class="px-6 py-4">
                  <div class="rounded-lg border border-border overflow-hidden">
                    <table class="w-full text-xs">
                      <thead>
                        <tr class="bg-surface border-b border-border">
                          <th class="text-left px-4 py-2 text-muted font-medium">Producto</th>
                          <th class="text-right px-4 py-2 text-muted font-medium w-24">Cantidad</th>
                          <th class="text-right px-4 py-2 text-muted font-medium w-32">P. Unitario</th>
                          <th class="text-right px-4 py-2 text-muted font-medium w-32">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-border">
                        <tr v-for="item in evt.items" :key="item.id" class="hover:bg-surface">
                          <td class="px-4 py-2 text-primary">{{ item.name }}</td>
                          <td class="px-4 py-2 text-right text-secondary">
                            {{ item.unit === 'kg' ? item.qty.toFixed(3) + ' kg' : item.qty + ' UN' }}
                          </td>
                          <td class="px-4 py-2 text-right text-secondary">${{ item.priceUnit.toLocaleString('es-CL') }}</td>
                          <td class="px-4 py-2 text-right font-medium text-primary">${{ Math.round(item.qty * item.priceUnit).toLocaleString('es-CL') }}</td>
                        </tr>
                      </tbody>
                      <tfoot class="border-t border-border bg-surface">
                        <tr>
                          <td colspan="3" class="px-4 py-2 text-right font-semibold text-secondary">Total anulado</td>
                          <td class="px-4 py-2 text-right font-bold text-danger-400">${{ evt.total.toLocaleString('es-CL') }}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useReportesStore } from '../stores/reportes.store'
import CalendarPicker from '../components/CalendarPicker.vue'

const reportesStore = useReportesStore()

// ─── Anulaciones — filtros ────────────────────────────────────────────────────
const showEvtFiltros   = ref(false)
const evtFiltroBalanza = ref('')
const evtFilterMode    = ref<'single' | 'range'>('single')
const evtFiltroFecha   = ref('')
const evtFiltroDesde   = ref('')
const evtFiltroHasta   = ref('')
const expandedEvtId    = ref<string | null>(null)

const evtFiltrados = computed(() =>
  reportesStore.eventosCaja.filter(evt => {
    const matchBalanza = !evtFiltroBalanza.value || evt.balanzaNombre === evtFiltroBalanza.value
    let matchFecha = true
    if (evtFilterMode.value === 'single' && evtFiltroFecha.value) {
      matchFecha = evt.fecha.startsWith(evtFiltroFecha.value)
    } else if (evtFilterMode.value === 'range') {
      const d = evt.fecha.slice(0, 10)
      if (evtFiltroDesde.value) matchFecha = matchFecha && d >= evtFiltroDesde.value
      if (evtFiltroHasta.value) matchFecha = matchFecha && d <= evtFiltroHasta.value
    }
    return matchBalanza && matchFecha
  })
)

const evtHayFiltros = computed(() =>
  !!evtFiltroBalanza.value || !!evtFiltroFecha.value || !!evtFiltroDesde.value || !!evtFiltroHasta.value
)

function limpiarEvtFiltros() {
  evtFiltroBalanza.value = ''
  evtFiltroFecha.value   = ''
  evtFiltroDesde.value   = ''
  evtFiltroHasta.value   = ''
}

function confirmarBorrarTodo() {
  if (confirm('¿Borrar todos los registros de anulaciones? Esta acción no se puede deshacer.')) {
    reportesStore.limpiarEventosCaja()
  }
}

// ─── Tipos ────────────────────────────────────────────────────────────────────
type EstadoPago = 'pendiente' | 'pagada' | 'vencida' | 'anulada'
type EstadoRecepcion = 'pendiente' | 'parcial' | 'completa'

interface ItemFactura {
  descripcion: string
  cantidad: number
  unidad: string
  precioUnitario: number
  total: number
}

interface FacturaProveedor {
  id: string
  folioSII: string
  nOrdenCompra: string
  tipoDocumento: string
  proveedorNombre: string
  proveedorRut: string
  proveedorContacto: string
  fechaEmision: string
  fechaVencimiento: string
  fechaEntregaEstimada: string | null
  fechaRecepcion: string | null
  subtotal: number
  iva: number
  total: number
  estadoPago: EstadoPago
  estadoRecepcion: EstadoRecepcion
  items: ItemFactura[]
  observaciones: string | null
}

// ─── Mock (reemplazar por GET /facturas-proveedores cuando Allan entregue endpoint) ──
const facturas = ref<FacturaProveedor[]>([
  {
    id: '1', folioSII: 'F-00245871', nOrdenCompra: 'OC-2026-041',
    tipoDocumento: 'Factura Afecta',
    proveedorNombre: 'Carnes del Sur Ltda.', proveedorRut: '76.543.210-K',
    proveedorContacto: 'Pedro Saavedra / +56 9 8123 4567',
    fechaEmision: '2026-04-01', fechaVencimiento: '2026-04-30',
    fechaEntregaEstimada: '2026-04-05', fechaRecepcion: '2026-04-05',
    subtotal: 168_067, iva: 31_933, total: 200_000,
    estadoPago: 'pendiente', estadoRecepcion: 'completa',
    items: [
      { descripcion: 'Pollo entero x unidad', cantidad: 30, unidad: 'kg', precioUnitario: 3_490, total: 104_700 },
      { descripcion: 'Costillar de cerdo', cantidad: 12, unidad: 'kg', precioUnitario: 4_990, total: 59_880 },
      { descripcion: 'Carne posta centro', cantidad: 4, unidad: 'kg', precioUnitario: 8_370, total: 33_480 },
    ],
    observaciones: 'Entregar en bodega frigorífica. Requiere firma recepción.'
  },
  {
    id: '2', folioSII: 'F-00198432', nOrdenCompra: 'OC-2026-039',
    tipoDocumento: 'Factura Afecta',
    proveedorNombre: 'Distribuidora FrutVerd S.A.', proveedorRut: '77.112.345-2',
    proveedorContacto: 'Ana Cofré / +56 9 9234 5678',
    fechaEmision: '2026-03-25', fechaVencimiento: '2026-04-10',
    fechaEntregaEstimada: '2026-03-28', fechaRecepcion: '2026-03-29',
    subtotal: 100_840, iva: 19_160, total: 120_000,
    estadoPago: 'vencida', estadoRecepcion: 'completa',
    items: [
      { descripcion: 'Tomate cherry premium', cantidad: 20, unidad: 'kg', precioUnitario: 2_490, total: 49_800 },
      { descripcion: 'Plátano seda importado', cantidad: 30, unidad: 'kg', precioUnitario: 1_290, total: 38_700 },
      { descripcion: 'Manzana Fuji calibre 80', cantidad: 15, unidad: 'kg', precioUnitario: 1_990, total: 29_850 },
    ],
    observaciones: null
  },
  {
    id: '3', folioSII: 'F-00312654', nOrdenCompra: 'OC-2026-043',
    tipoDocumento: 'Factura Afecta',
    proveedorNombre: 'Lácteos Andes SpA', proveedorRut: '79.887.654-3',
    proveedorContacto: 'Jorge Tapia / +56 9 7654 3210',
    fechaEmision: '2026-04-07', fechaVencimiento: '2026-05-07',
    fechaEntregaEstimada: '2026-04-10', fechaRecepcion: null,
    subtotal: 58_824, iva: 11_176, total: 70_000,
    estadoPago: 'pendiente', estadoRecepcion: 'parcial',
    items: [
      { descripcion: 'Queso gouda laminado 500g', cantidad: 6, unidad: 'kg', precioUnitario: 8_490, total: 50_940 },
      { descripcion: 'Mantequilla sin sal 250g', cantidad: 8, unidad: 'unidad', precioUnitario: 1_990, total: 15_920 },
    ],
    observaciones: 'Falta despacho de 2 kg gouda. Pendiente coordinación proveedor.'
  },
  {
    id: '4', folioSII: 'F-00289011', nOrdenCompra: 'OC-2026-037',
    tipoDocumento: 'Factura Afecta',
    proveedorNombre: 'Embutidos Don Aurelio Ltda.', proveedorRut: '78.321.987-1',
    proveedorContacto: 'Claudia Vera / +56 9 6543 2109',
    fechaEmision: '2026-03-18', fechaVencimiento: '2026-04-17',
    fechaEntregaEstimada: '2026-03-22', fechaRecepcion: '2026-03-22',
    subtotal: 134_454, iva: 25_546, total: 160_000,
    estadoPago: 'pagada', estadoRecepcion: 'completa',
    items: [
      { descripcion: 'Jamón de pierna sin hueso', cantidad: 10, unidad: 'kg', precioUnitario: 5_990, total: 59_900 },
      { descripcion: 'Mortadela extra fina', cantidad: 8, unidad: 'kg', precioUnitario: 3_490, total: 27_920 },
      { descripcion: 'Salami italiano', cantidad: 6, unidad: 'kg', precioUnitario: 7_490, total: 44_940 },
    ],
    observaciones: null
  },
  {
    id: '5', folioSII: 'F-00327890', nOrdenCompra: 'OC-2026-044',
    tipoDocumento: 'Factura Afecta',
    proveedorNombre: 'Panadería y Repostería El Trigo', proveedorRut: '76.123.456-7',
    proveedorContacto: 'Luis Morales / +56 9 5432 1098',
    fechaEmision: '2026-04-09', fechaVencimiento: '2026-04-23',
    fechaEntregaEstimada: '2026-04-11', fechaRecepcion: null,
    subtotal: 42_017, iva: 7_983, total: 50_000,
    estadoPago: 'pendiente', estadoRecepcion: 'pendiente',
    items: [
      { descripcion: 'Queque marmolado familiar', cantidad: 10, unidad: 'unidad', precioUnitario: 3_290, total: 32_900 },
      { descripcion: 'Kuchén de manzana mediano', cantidad: 6, unidad: 'unidad', precioUnitario: 2_890, total: 17_340 },
    ],
    observaciones: 'Entrega programada viernes AM. Coordinar con encargado bodega.'
  },
])

// ─── Filtros ──────────────────────────────────────────────────────────────────
const searchQuery = ref('')
const filterPago = ref('')
const filterRecepcion = ref('')
const filterPeriodo = ref('mes')
const expandedId = ref<string | null>(null)

const filteredFacturas = computed(() => {
  return facturas.value.filter(f => {
    const matchSearch = !searchQuery.value ||
      f.proveedorNombre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      f.folioSII.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      f.nOrdenCompra.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      f.proveedorRut.includes(searchQuery.value)
    const matchPago = !filterPago.value || f.estadoPago === filterPago.value
    const matchRec = !filterRecepcion.value || f.estadoRecepcion === filterRecepcion.value
    return matchSearch && matchPago && matchRec
  })
})

function clearFilters() {
  searchQuery.value = ''
  filterPago.value = ''
  filterRecepcion.value = ''
}

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}

// ─── KPIs ─────────────────────────────────────────────────────────────────────
const montoTotal = computed(() => facturas.value.reduce((s, f) => s + f.total, 0))
const montoPendiente = computed(() => facturas.value.filter(f => f.estadoPago === 'pendiente').reduce((s, f) => s + f.total, 0))
const montoVencido = computed(() => facturas.value.filter(f => f.estadoPago === 'vencida').reduce((s, f) => s + f.total, 0))
const montoFiltrado = computed(() => filteredFacturas.value.reduce((s, f) => s + f.total, 0))
const proveedoresUnicos = computed(() => new Set(facturas.value.map(f => f.proveedorRut)).size)

function countPago(estado: EstadoPago) {
  return facturas.value.filter(f => f.estadoPago === estado).length
}

// ─── Helpers de formato ───────────────────────────────────────────────────────
function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function isVencida(f: FacturaProveedor) {
  return f.estadoPago !== 'pagada' && f.estadoPago !== 'anulada' &&
    new Date(f.fechaVencimiento) < new Date()
}

// ─── Badge helpers ────────────────────────────────────────────────────────────
function badgePago(e: EstadoPago) {
  return {
    pendiente: 'bg-yellow-500/10 text-yellow-400',
    pagada:    'bg-green-500/10 text-green-400',
    vencida:   'bg-red-500/10 text-red-400',
    anulada:   'bg-[#2E3348] text-muted',
  }[e]
}

function iconPago(e: EstadoPago) {
  return {
    pendiente: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    pagada:    'M5 13l4 4L19 7',
    vencida:   'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    anulada:   'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
  }[e]
}

function labelPago(e: EstadoPago) {
  return { pendiente: 'Pendiente', pagada: 'Pagada', vencida: 'Vencida', anulada: 'Anulada' }[e]
}

function badgeRecepcion(e: EstadoRecepcion) {
  return {
    pendiente: 'bg-[#2E3348] text-secondary',
    parcial:   'bg-sky-500/10 text-sky-400',
    completa:  'bg-teal-500/10 text-teal-400',
  }[e]
}

function labelRecepcion(e: EstadoRecepcion) {
  return { pendiente: 'Pendiente', parcial: 'Parcial', completa: 'Completa' }[e]
}

function formatEvtFecha(iso: string) {
  const d = new Date(iso)
  const fecha = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  const hora  = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return `${fecha} · ${hora}`
}
</script>
