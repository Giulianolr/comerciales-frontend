import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref, computed } from 'vue'
import type { CajaEstado, ItemVenta, TabVenta, PreBoleta, BalanzaEnCola } from '../types'
import { useReportesStore } from './reportes.store'
import { useDashboardStore } from './dashboard.store'

// ── Mocks ────────────────────────────────────────────────────────────────────

const MOCK_ITEMS_TAB1: ItemVenta[] = [
  { id: 1, name: 'Jamón campo mitad',        qty: 0.500, unit: 'kg', price_unit: 10101, supplier: 'Omeñaca S.A.' },
  { id: 2, name: 'Queso cabeza pieza',        qty: 0.320, unit: 'kg', price_unit: 5450,  supplier: 'Omeñaca S.A.' },
  { id: 3, name: 'Arrollado huaso grande',    qty: 0.900, unit: 'kg', price_unit: 7180,  supplier: 'Omeñaca S.A.' },
  { id: 4, name: 'Pan Hamburguesa Sésamo 8p', qty: 2,     unit: 'UN', price_unit: 1748,  supplier: 'Ideal S.A.'   },
]

const MOCK_ITEMS_MERGE: ItemVenta[] = [
  { id: 5, name: 'Salame cocido pieza', qty: 0.450, unit: 'kg', price_unit: 8146, supplier: 'Omeñaca S.A.' },
]

const MOCK_PREBOLETA_TAB1: PreBoleta = {
  id: '9a3f-b821',
  station_id: 1,
  station_name: 'B1',
  items: [...MOCK_ITEMS_TAB1],
  created_ago: 'hace 1 min',
}

const MOCK_PREBOLETA_SCAN: PreBoleta = {
  id: 'c7d2-e094',
  station_id: 3,
  station_name: 'B3',
  items: [...MOCK_ITEMS_MERGE],
  created_ago: 'hace 8 min',
}

export const MOCK_COLA_BALANZAS: BalanzaEnCola[] = [
  { id: 1, nombre: 'B1', total: 21350, itemCount: 3, creadaHace: 'hace 1 min', activa: true,  advertencia: false },
  { id: 2, nombre: 'B2', total: 0,     itemCount: 0, creadaHace: '',           activa: false, advertencia: false },
  { id: 3, nombre: 'B3', total: 3200,  itemCount: 1, creadaHace: 'hace 8 min', activa: true,  advertencia: true  },
  { id: 4, nombre: 'B4', total: 0,     itemCount: 0, creadaHace: '',           activa: false, advertencia: false },
]

// ── Store ────────────────────────────────────────────────────────────────────

export const useCajaStore = defineStore('caja', () => {
  // Estado principal
  const estado       = ref<CajaEstado>('active')
  const tabs         = ref<TabVenta[]>([
    { tabId: 1, preBoleta: { ...MOCK_PREBOLETA_TAB1, items: [...MOCK_ITEMS_TAB1] }, mergedWith: [] },
    { tabId: 2, preBoleta: { ...MOCK_PREBOLETA_SCAN, items: [...MOCK_ITEMS_MERGE] }, mergedWith: [] },
  ])
  const tabActivoId  = ref<number>(1)
  const nextTabId    = ref<number>(3)

  // Pago
  const metodoPago           = ref<'efectivo' | 'debito' | 'credito' | 'transferencia'>('debito')
  const montoRecibido        = ref<number>(0)
  const pagoMixto            = ref<boolean>(false)
  const montoMixtoTarjeta    = ref<number>(0)
  const metodoPagoSecundario = ref<'debito' | 'credito' | 'transferencia' | null>(null)

  // Modales
  const showModalScan   = ref<boolean>(false)
  const showModalEdit   = ref<boolean>(false)
  const editingItemId   = ref<number | null>(null)
  const preboletaEscan  = ref<PreBoleta | null>(null)

  // Offline
  const offline = ref<boolean>(false)

  // Idle — items en curso por balanza (antes de confirmar cobro)
  const itemsPorBalanza = ref<Record<number, ItemVenta[]>>({
    1: [...MOCK_ITEMS_TAB1],
    2: [],
    3: [...MOCK_ITEMS_MERGE],
    4: [],
  })
  const balanzaSeleccionadaId = ref<number | null>(null)
  const nextItemId = ref<number>(200)

  // ── Computed ──────────────────────────────────────────────────────────────

  const tabActivo = computed(() =>
    tabs.value.find(t => t.tabId === tabActivoId.value) ?? null
  )

  const items = computed(() => tabActivo.value?.preBoleta.items ?? [])

  const total = computed(() =>
    items.value.reduce((s, i) => s + Math.round(i.qty * i.price_unit), 0)
  )

  const neto = computed(() => Math.round(total.value / 1.19))

  const iva = computed(() => total.value - neto.value)

  const vuelto = computed(() => Math.max(0, montoRecibido.value - total.value))

  const montoMixtoEfectivo = computed(() => Math.max(0, total.value - montoMixtoTarjeta.value))

  const esMerged = computed(() =>
    (tabActivo.value?.mergedWith.length ?? 0) > 0
  )

  const mergedCount = computed(() =>
    1 + (tabActivo.value?.mergedWith.length ?? 0)
  )

  const totalMergePreview = computed(() => {
    if (!preboletaEscan.value) return 0
    const extraTotal = preboletaEscan.value.items.reduce(
      (s, i) => s + Math.round(i.qty * i.price_unit), 0
    )
    return total.value + extraTotal
  })

  const itemsMergePreview = computed(() => {
    if (!preboletaEscan.value) return 0
    return items.value.length + preboletaEscan.value.items.length
  })

  const editingItem = computed(() =>
    items.value.find(i => i.id === editingItemId.value) ?? null
  )

  const otrosTabs = computed(() =>
    tabs.value.filter(t => t.tabId !== tabActivoId.value)
  )

  // ── Acciones — Estado ─────────────────────────────────────────────────────

  function irA(s: CajaEstado) {
    estado.value = s
  }

  function procesarCobro() {
    estado.value = 'processing'
    setTimeout(() => { estado.value = 'success' }, 1800)
  }

  function confirmarVenta() {
    const totalVenta = total.value
    const stationId  = tabActivo.value?.preBoleta.station_id
    const tabId      = tabActivo.value?.tabId
    if (tabId !== undefined) {
      cerrarTab(tabId)
      if (tabs.value.length > 0) irA('active')
    }
    const dashStore = useDashboardStore()
    if (stationId !== undefined) {
      dashStore.registrarTransaccion(stationId, totalVenta)
    }
    const cajaStation = dashStore.stations.find(s => s.type === 'caja')
    if (cajaStation) {
      dashStore.registrarTransaccion(cajaStation.id, totalVenta)
    }
  }

  function nuevaVenta() {
    if (tabActivo.value) {
      tabActivo.value.preBoleta.items = [...MOCK_ITEMS_TAB1]
      tabActivo.value.mergedWith = []
    }
    metodoPago.value  = 'debito'
    montoRecibido.value = 0
    estado.value = 'idle'
  }

  // ── Acciones — Tabs ───────────────────────────────────────────────────────

  function setTabActivo(tabId: number) {
    tabActivoId.value = tabId
    estado.value = 'active'
    pagoMixto.value = false
    montoRecibido.value = 0
    montoMixtoTarjeta.value = 0
    metodoPagoSecundario.value = null
  }

  function cerrarTab(tabId: number) {
    tabs.value = tabs.value.filter(t => t.tabId !== tabId)
    if (tabActivoId.value === tabId) {
      tabActivoId.value = tabs.value[0]?.tabId ?? -1
    }
    if (tabs.value.length === 0) {
      estado.value = 'idle'
    }
  }

  function cancelarTab(tabId: number) {
    try {
      const tab = tabs.value.find(t => t.tabId === tabId)
      if (tab && tab.preBoleta.items.length > 0) {
        const tabTotal = tab.preBoleta.items.reduce((s, i) => s + Math.round(i.qty * i.price_unit), 0)
        useReportesStore().registrarEventoCaja({
          station_id:    tab.preBoleta.station_id,
          station_name:  tab.preBoleta.station_name,
          numero_boleta: tab.tabId,
          total:         tabTotal,
          item_count:    tab.preBoleta.items.length,
          items:         tab.preBoleta.items.map(i => ({ id: i.id, name: i.name, qty: i.qty, unit: i.unit, price_unit: i.price_unit, supplier: i.supplier })),
          fecha:         new Date().toISOString(),
        })
      }
    } catch (_) { /* no bloquear el cierre del tab */ }
    cerrarTab(tabId)
  }

  // ── Acciones — Escaneo 2° QR ──────────────────────────────────────────────

  function abrirModalScan(tabId: number) {
    const tab = tabs.value.find(t => t.tabId === tabId)
    if (!tab) return
    preboletaEscan.value = { ...tab.preBoleta, items: [...tab.preBoleta.items] }
    showModalScan.value  = true
  }

  function cerrarModalScan() {
    showModalScan.value = false
  }

  function confirmarMerge() {
    if (!preboletaEscan.value || !tabActivo.value) return

    const idsExistentes = new Set(tabActivo.value.preBoleta.items.map(i => i.id))
    preboletaEscan.value.items.forEach(item => {
      if (!idsExistentes.has(item.id)) {
        tabActivo.value!.preBoleta.items.push(item)
      }
    })

    tabActivo.value.mergedWith.push(preboletaEscan.value.id)
    tabs.value = tabs.value.filter(t => t.preBoleta.id !== preboletaEscan.value!.id)

    showModalScan.value  = false
    preboletaEscan.value = null
  }

  function abrirEnNuevaTab() {
    if (!preboletaEscan.value) return

    const yaExiste = tabs.value.find(t => t.preBoleta.id === preboletaEscan.value!.id)
    if (!yaExiste) {
      const newTab: TabVenta = {
        tabId: nextTabId.value++,
        preBoleta: preboletaEscan.value,
        mergedWith: [],
      }
      tabs.value.push(newTab)
      setTabActivo(newTab.tabId)
    } else {
      setTabActivo(yaExiste.tabId)
    }

    showModalScan.value  = false
    preboletaEscan.value = null
  }

  // ── Acciones — Editar ítem ────────────────────────────────────────────────

  function abrirModalEdit(itemId: number) {
    editingItemId.value = itemId
    showModalEdit.value = true
  }

  function cerrarModalEdit() {
    showModalEdit.value = false
    editingItemId.value = null
  }

  function guardarEdicionItem(newQty: number) {
    const item = tabActivo.value?.preBoleta.items.find(i => i.id === editingItemId.value)
    if (item) item.qty = newQty
    cerrarModalEdit()
  }

  function eliminarItem() {
    if (!tabActivo.value || editingItemId.value === null) return
    tabActivo.value.preBoleta.items = tabActivo.value.preBoleta.items.filter(
      i => i.id !== editingItemId.value
    )
    cerrarModalEdit()
  }

  // ── Acciones — Pago ───────────────────────────────────────────────────────

  function setMetodoPago(m: typeof metodoPago.value) {
    if (m !== metodoPago.value) {
      pagoMixto.value = false
      montoMixtoTarjeta.value = 0
      metodoPagoSecundario.value = null
    }
    metodoPago.value = m
    if (m === 'efectivo') {
      montoRecibido.value = 0
      estado.value = 'cash'
    } else if (estado.value === 'cash') {
      estado.value = 'active'
    }
  }

  function togglePagoMixto() {
    pagoMixto.value = !pagoMixto.value
    montoMixtoTarjeta.value = 0
    metodoPagoSecundario.value = null
  }

  function setMontoMixtoTarjeta(v: number) {
    montoMixtoTarjeta.value = Math.min(Math.max(0, v), total.value)
  }

  function setMetodoPagoSecundario(m: 'debito' | 'credito' | 'transferencia') {
    metodoPagoSecundario.value = m
    montoMixtoTarjeta.value = 0
  }

  function setMontoRecibido(v: number) {
    montoRecibido.value = v
  }

  // ── Acciones — Offline ────────────────────────────────────────────────────

  function toggleOffline() {
    offline.value = !offline.value
  }

  // ── Acciones — Idle ───────────────────────────────────────────────────────

  function seleccionarBalanzaIdle(id: number) {
    balanzaSeleccionadaId.value = id
  }

  function agregarItemEscaneoBalanza(item: Omit<ItemVenta, 'id'>) {
    const id = balanzaSeleccionadaId.value
    if (id === null) return
    if (!itemsPorBalanza.value[id]) itemsPorBalanza.value[id] = []
    itemsPorBalanza.value[id].push({ ...item, id: nextItemId.value++ })
  }

  function eliminarItemDeBalanza(balanzaId: number, itemId: number) {
    if (!itemsPorBalanza.value[balanzaId]) return
    itemsPorBalanza.value[balanzaId] = itemsPorBalanza.value[balanzaId].filter(i => i.id !== itemId)
  }

  function confirmarBalanzaParaCobro(balanzaId: number) {
    const balanza = MOCK_COLA_BALANZAS.find(b => b.id === balanzaId)
    if (!balanza) return
    const nueva: TabVenta = {
      tabId: nextTabId.value++,
      preBoleta: {
        id: `${balanzaId}-${Date.now()}`,
        station_id: balanza.id,
        station_name: balanza.nombre,
        items: [...(itemsPorBalanza.value[balanzaId] ?? [])],
        created_ago: 'ahora',
      },
      mergedWith: [],
    }
    tabs.value.push(nueva)
    itemsPorBalanza.value[balanzaId] = []
    setTabActivo(nueva.tabId)
  }

  function seleccionarPreBoleta(balanzaId: number) {
    seleccionarBalanzaIdle(balanzaId)
  }

  return {
    // State
    estado, tabs, tabActivoId, nextTabId, nextItemId, metodoPago, montoRecibido,
    showModalScan, showModalEdit, editingItemId, preboletaEscan, offline,
    itemsPorBalanza, balanzaSeleccionadaId,
    pagoMixto, montoMixtoTarjeta, metodoPagoSecundario,
    // Computed
    tabActivo, items, total, neto, iva, vuelto, montoMixtoEfectivo,
    esMerged, mergedCount, totalMergePreview, itemsMergePreview, editingItem, otrosTabs,
    // Actions
    irA, procesarCobro, confirmarVenta, nuevaVenta,
    setTabActivo, cerrarTab, cancelarTab,
    abrirModalScan, cerrarModalScan, confirmarMerge, abrirEnNuevaTab,
    abrirModalEdit, cerrarModalEdit, guardarEdicionItem, eliminarItem,
    setMetodoPago, setMontoRecibido,
    toggleOffline, seleccionarPreBoleta,
    seleccionarBalanzaIdle, agregarItemEscaneoBalanza, eliminarItemDeBalanza, confirmarBalanzaParaCobro,
    togglePagoMixto, setMontoMixtoTarjeta, setMetodoPagoSecundario,
  }
}, {
  persist: {
    key: 'comerciales-caja',
    paths: [
      'tabs', 'tabActivoId', 'nextTabId', 'nextItemId',
      'estado', 'metodoPago', 'montoRecibido',
      'itemsPorBalanza', 'balanzaSeleccionadaId',
      'pagoMixto', 'montoMixtoTarjeta', 'metodoPagoSecundario',
    ],
    afterRestore(ctx) {
      const s = ctx.store.estado
      if (s === 'processing' || s === 'success') {
        ctx.store.estado = ctx.store.tabs.length > 0 ? 'active' : 'idle'
      }
      ctx.store.showModalScan        = false
      ctx.store.showModalEdit        = false
      ctx.store.editingItemId        = null
      ctx.store.preboletaEscan       = null
      ctx.store.pagoMixto            = false
      ctx.store.montoRecibido        = 0
      ctx.store.montoMixtoTarjeta    = 0
      ctx.store.metodoPagoSecundario = null
      ctx.store.balanzaSeleccionadaId = null
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCajaStore, import.meta.hot))
}
