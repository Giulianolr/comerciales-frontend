import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CajaEstado, ItemVenta, TabVenta, PreBoleta, BalanzaEnCola } from '../types'

// ── Mocks ────────────────────────────────────────────────────────────────────

const MOCK_ITEMS_TAB1: ItemVenta[] = [
  { id: 1, name: 'Jamón campo mitad',        qty: 0.500, unit: 'kg', priceUnit: 10101, supplier: 'Omeñaca S.A.' },
  { id: 2, name: 'Queso cabeza pieza',        qty: 0.320, unit: 'kg', priceUnit: 5450,  supplier: 'Omeñaca S.A.' },
  { id: 3, name: 'Arrollado huaso grande',    qty: 0.900, unit: 'kg', priceUnit: 7180,  supplier: 'Omeñaca S.A.' },
  { id: 4, name: 'Pan Hamburguesa Sésamo 8p', qty: 2,     unit: 'UN', priceUnit: 1748,  supplier: 'Ideal S.A.'   },
]

const MOCK_ITEMS_MERGE: ItemVenta[] = [
  { id: 5, name: 'Salame cocido pieza', qty: 0.450, unit: 'kg', priceUnit: 8146, supplier: 'Omeñaca S.A.' },
]

const MOCK_PREBOLETA_TAB1: PreBoleta = {
  id: '9a3f-b821',
  balanzaId: 1,
  balanzaNombre: 'Balanza 1',
  items: [...MOCK_ITEMS_TAB1],
  creadaHace: 'hace 1 min',
}

const MOCK_PREBOLETA_SCAN: PreBoleta = {
  id: 'c7d2-e094',
  balanzaId: 3,
  balanzaNombre: 'Balanza 3',
  items: [...MOCK_ITEMS_MERGE],
  creadaHace: 'hace 8 min',
}

export const MOCK_COLA_BALANZAS: BalanzaEnCola[] = [
  { id: 1, nombre: 'Balanza 1', total: 21350, itemCount: 3, creadaHace: 'hace 1 min', activa: true,  advertencia: false },
  { id: 2, nombre: 'Balanza 2', total: 0,     itemCount: 0, creadaHace: '',           activa: false, advertencia: false },
  { id: 3, nombre: 'Balanza 3', total: 3200,  itemCount: 1, creadaHace: 'hace 8 min', activa: true,  advertencia: true  },
  { id: 4, nombre: 'Balanza 4', total: 0,     itemCount: 0, creadaHace: '',           activa: false, advertencia: false },
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
  const metodoPago     = ref<'efectivo' | 'debito' | 'credito' | 'transferencia'>('debito')
  const montoRecibido  = ref<number>(25000)

  // Modales
  const showModalScan   = ref<boolean>(false)
  const showModalEdit   = ref<boolean>(false)
  const editingItemId   = ref<number | null>(null)
  const preboletaEscan  = ref<PreBoleta | null>(null)  // pre-boleta del 2° QR

  // Offline
  const offline = ref<boolean>(false)

  // ── Computed ──────────────────────────────────────────────────────────────

  const tabActivo = computed(() =>
    tabs.value.find(t => t.tabId === tabActivoId.value) ?? null
  )

  const items = computed(() => tabActivo.value?.preBoleta.items ?? [])

  const total = computed(() =>
    items.value.reduce((s, i) => s + Math.round(i.qty * i.priceUnit), 0)
  )

  const neto = computed(() => Math.round(total.value / 1.19))

  const iva = computed(() => total.value - neto.value)

  const vuelto = computed(() => Math.max(0, montoRecibido.value - total.value))

  const esMerged = computed(() =>
    (tabActivo.value?.mergedWith.length ?? 0) > 0
  )

  const mergedCount = computed(() =>
    1 + (tabActivo.value?.mergedWith.length ?? 0)
  )

  const totalMergePreview = computed(() => {
    if (!preboletaEscan.value) return 0
    const extraTotal = preboletaEscan.value.items.reduce(
      (s, i) => s + Math.round(i.qty * i.priceUnit), 0
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

  // Tabs que NO son el tab activo (candidatos a unir)
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

  function nuevaVenta() {
    // Resetear tab activo a estado inicial
    if (tabActivo.value) {
      tabActivo.value.preBoleta.items = [...MOCK_ITEMS_TAB1]
      tabActivo.value.mergedWith = []
    }
    metodoPago.value  = 'debito'
    montoRecibido.value = 25000
    estado.value = 'idle'
  }

  // ── Acciones — Tabs ───────────────────────────────────────────────────────

  function setTabActivo(tabId: number) {
    tabActivoId.value = tabId
    estado.value = 'active'
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

  // ── Acciones — Escaneo 2° QR ──────────────────────────────────────────────

  // tabId: el tab que se quiere unir al tab activo
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

    // Agregar ítems de la pre-boleta escaneada a la activa
    const idsExistentes = new Set(tabActivo.value.preBoleta.items.map(i => i.id))
    preboletaEscan.value.items.forEach(item => {
      if (!idsExistentes.has(item.id)) {
        tabActivo.value!.preBoleta.items.push(item)
      }
    })

    // Registrar merge
    tabActivo.value.mergedWith.push(preboletaEscan.value.id)

    // Remover el tab de la pre-boleta absorbida
    tabs.value = tabs.value.filter(t => t.preBoleta.id !== preboletaEscan.value!.id)

    showModalScan.value  = false
    preboletaEscan.value = null
  }

  function abrirEnNuevaTab() {
    if (!preboletaEscan.value) return

    // Verificar si ya existe tab para esta pre-boleta
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
    metodoPago.value = m
    if (m === 'efectivo') {
      estado.value = 'cash'
    } else if (estado.value === 'cash') {
      estado.value = 'active'
    }
  }

  function setMontoRecibido(v: number) {
    montoRecibido.value = v
  }

  // ── Acciones — Offline ────────────────────────────────────────────────────

  function toggleOffline() {
    offline.value = !offline.value
  }

  // ── Acciones — Idle (seleccionar pre-boleta de la cola) ───────────────────

  function seleccionarPreBoleta(balanzaId: number) {
    const balanza = MOCK_COLA_BALANZAS.find(b => b.id === balanzaId)
    if (!balanza || !balanza.activa) return

    const nueva: TabVenta = {
      tabId: nextTabId.value++,
      preBoleta: {
        id: `mock-${balanzaId}-${Date.now()}`,
        balanzaId: balanza.id,
        balanzaNombre: balanza.nombre,
        items: [...MOCK_ITEMS_TAB1],
        creadaHace: balanza.creadaHace,
      },
      mergedWith: [],
    }
    tabs.value.push(nueva)
    setTabActivo(nueva.tabId)
  }

  return {
    // State
    estado, tabs, tabActivoId, metodoPago, montoRecibido,
    showModalScan, showModalEdit, editingItemId, preboletaEscan, offline,
    // Computed
    tabActivo, items, total, neto, iva, vuelto,
    esMerged, mergedCount, totalMergePreview, itemsMergePreview, editingItem, otrosTabs,
    // Actions
    irA, procesarCobro, nuevaVenta,
    setTabActivo, cerrarTab,
    abrirModalScan, cerrarModalScan, confirmarMerge, abrirEnNuevaTab,
    abrirModalEdit, cerrarModalEdit, guardarEdicionItem, eliminarItem,
    setMetodoPago, setMontoRecibido,
    toggleOffline, seleccionarPreBoleta,
  }
})
