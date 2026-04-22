import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth.store'
import type { Product, StockStatus } from '../types'

export type AlertCategory = 'stock' | 'equipment'
export type AlertSeverity = 'low' | 'critical' | 'error'

export interface AppAlert {
  id: string
  category: AlertCategory
  severity: AlertSeverity
  title: string
  subtitle: string
  detail: string
  triggeredAt: string
  acknowledged: boolean  // true = descartada (oculta del panel)
  read: boolean          // true = vista (baja del badge, sigue en panel)
  navigateTo: string
  // compat stock (DashboardView)
  productId?: string
  productName?: string
  stockStatus?: StockStatus
  currentStock?: number
  minStock?: number
  // compat equipment
  stationId?: number
}

export interface ToastAlert {
  id: string
  severity: AlertSeverity
  title: string
  subtitle: string
  detail: string
  navigateTo: string
}

// Alertas de equipos (estáticas hasta que llegue el backend)
const INITIAL_EQUIPMENT_ALERTS: AppAlert[] = []

function severityForStatus(status: StockStatus): AlertSeverity {
  return (status === 'critical' || status === 'out_of_stock') ? 'critical' : 'low'
}

function titleForStatus(status: StockStatus): string {
  if (status === 'out_of_stock') return 'Sin stock'
  if (status === 'critical') return 'Stock crítico'
  return 'Stock bajo'
}

function playAlertSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15)
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.5)
  } catch {
    // Audio no soportado
  }
}

export const useAlertsStore = defineStore('alerts', () => {
  const authStore = useAuthStore()

  const alerts = ref<AppAlert[]>([...INITIAL_EQUIPMENT_ALERTS])
  const toasts = ref<ToastAlert[]>([])

  // ── Preferencias de notificación (por usuario) ───────────────────────────────
  const notifPrefs = ref<Record<string, { sound: boolean; toasts: boolean }>>({})

  const soundEnabled = computed(() => {
    const userId = authStore.user?.email ?? 'default'
    return notifPrefs.value[userId]?.sound ?? true
  })

  const toastsEnabled = computed(() => {
    const userId = authStore.user?.email ?? 'default'
    return notifPrefs.value[userId]?.toasts ?? true
  })

  function toggleSound() {
    const userId = authStore.user?.email ?? 'default'
    const current = notifPrefs.value[userId] ?? { sound: true, toasts: true }
    notifPrefs.value = { ...notifPrefs.value, [userId]: { ...current, sound: !current.sound } }
  }

  function toggleToasts() {
    const userId = authStore.user?.email ?? 'default'
    const current = notifPrefs.value[userId] ?? { sound: true, toasts: true }
    notifPrefs.value = { ...notifPrefs.value, [userId]: { ...current, toasts: !current.toasts } }
  }

  function toggleBoth() {
    const userId = authStore.user?.email ?? 'default'
    const current = notifPrefs.value[userId] ?? { sound: true, toasts: true }
    const allOn = current.sound && current.toasts
    notifPrefs.value = { ...notifPrefs.value, [userId]: { sound: !allOn, toasts: !allOn } }
  }

  // ── Computed ────────────────────────────────────────────────────────────────

  // Alertas visibles en el panel (no descartadas), ordenadas de más reciente a más antigua
  const panelAlerts = computed(() =>
    [...alerts.value]
      .filter(a => !a.acknowledged)
      .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())
  )

  const panelStockAlerts = computed(() =>
    panelAlerts.value.filter(a => a.category === 'stock')
  )

  const panelEquipmentAlerts = computed(() =>
    panelAlerts.value.filter(a => a.category === 'equipment')
  )

  // Badge: solo las no leídas Y no descartadas
  const unreadCount = computed(() =>
    alerts.value.filter(a => !a.acknowledged && !a.read).length
  )

  // Compat con DashboardView (muestra alertas de stock no descartadas)
  const unreadStockAlerts = computed(() => panelStockAlerts.value)

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function isDev() {
    return authStore.user?.role === 'dev'
  }

  function pushToast(alert: AppAlert) {
    const toast: ToastAlert = {
      id: alert.id,
      severity: alert.severity,
      title: alert.title,
      subtitle: alert.subtitle,
      detail: alert.detail,
      navigateTo: alert.navigateTo
    }
    if (!toasts.value.find(t => t.id === toast.id)) {
      toasts.value.push(toast)
      setTimeout(() => dismissToast(toast.id), 4500)
    }
  }

  // ── Sincronización con inventario ────────────────────────────────────────────

  function syncProductAlert(product: Product, prevStatus: StockStatus) {
    const newStatus = product.stockStatus

    if (newStatus === 'ok') {
      alerts.value = alerts.value.map(a =>
        a.productId === product.sku ? { ...a, acknowledged: true } : a
      )
      return
    }

    const detail = `Stock actual: ${product.currentStock} ${product.unit}`
    const navigateTo = `/gerente/inventario?sku=${product.sku}`

    if (prevStatus === newStatus) {
      const latest = [...alerts.value]
        .filter(a => a.productId === product.sku && !a.acknowledged)
        .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())[0]
      if (latest) {
        alerts.value = alerts.value.map(a =>
          a.id === latest.id
            ? { ...a, detail, currentStock: product.currentStock, minStock: product.minStock }
            : a
        )
      }
      return
    }

    const newAlert: AppAlert = {
      id: `stock-${product.sku}-${Date.now()}`,
      category: 'stock',
      severity: severityForStatus(newStatus),
      title: titleForStatus(newStatus),
      subtitle: product.name,
      detail,
      triggeredAt: new Date().toISOString(),
      acknowledged: false,
      read: false,
      navigateTo,
      productId: product.sku,
      productName: product.name,
      stockStatus: newStatus,
      currentStock: product.currentStock,
      minStock: product.minStock
    }
    alerts.value = [...alerts.value, newAlert]
    if (!isDev()) {
      if (soundEnabled.value) playAlertSound()
      if (toastsEnabled.value) pushToast(newAlert)
    }
  }

  function seedFromInventory(products: Product[]) {
    const toAdd: AppAlert[] = []

    for (const product of products) {
      if (product.stockStatus === 'ok') continue

      const existing = [...alerts.value]
        .filter(a => a.productId === product.sku)
        .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime())[0]

      if (existing) {
        alerts.value = alerts.value.map(a =>
          a.id === existing.id
            ? {
                ...a,
                subtitle: product.name,
                productName: product.name,
                detail: `Stock actual: ${product.currentStock} ${product.unit}`,
                currentStock: product.currentStock,
                minStock: product.minStock,
                navigateTo: `/gerente/inventario?sku=${product.sku}`,
                stockStatus: product.stockStatus,
                severity: severityForStatus(product.stockStatus),
                title: titleForStatus(product.stockStatus),
              }
            : a
        )
      } else {
        toAdd.push({
          id: `stock-${product.sku}-${Date.now()}-${toAdd.length}`,
          category: 'stock',
          severity: severityForStatus(product.stockStatus),
          title: titleForStatus(product.stockStatus),
          subtitle: product.name,
          detail: `Stock actual: ${product.currentStock} ${product.unit}`,
          triggeredAt: new Date().toISOString(),
          acknowledged: false,
          read: false,
          navigateTo: `/gerente/inventario?sku=${product.sku}`,
          productId: product.sku,
          productName: product.name,
          stockStatus: product.stockStatus,
          currentStock: product.currentStock,
          minStock: product.minStock
        })
      }
    }

    if (toAdd.length > 0) {
      alerts.value = [...alerts.value, ...toAdd]
    }
  }

  // ── Acciones generales ───────────────────────────────────────────────────────

  function addAlert(alert: Omit<AppAlert, 'id' | 'acknowledged' | 'read'> & { id?: string }) {
    const id = alert.id ?? `${alert.category}-${Date.now()}`
    const exists = alerts.value.find(a => a.id === id)
    if (exists) return
    const newAlert: AppAlert = { ...alert, id, acknowledged: false, read: false }
    alerts.value = [...alerts.value, newAlert]
    if (!isDev()) {
      if (soundEnabled.value) playAlertSound()
      if (toastsEnabled.value) pushToast(newAlert)
    }
  }

  // Marcar como leída: baja del badge pero se queda en el panel
  function markRead(id: string) {
    alerts.value = alerts.value.map(a => a.id === id ? { ...a, read: true } : a)
  }

  // Descartar: oculta del panel (acción explícita del usuario)
  function acknowledge(id: string) {
    alerts.value = alerts.value.map(a => a.id === id ? { ...a, acknowledged: true } : a)
  }

  function acknowledgeAll() {
    alerts.value = alerts.value.map(a => ({ ...a, acknowledged: true }))
  }

  // compat con código anterior del DashboardView
  function acknowledgeAlert(productId: string) {
    alerts.value = alerts.value.map(a => a.productId === productId ? { ...a, acknowledged: true } : a)
  }

  function dismissToast(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return {
    alerts,
    toasts,
    panelAlerts,
    panelStockAlerts,
    panelEquipmentAlerts,
    unreadStockAlerts,
    unreadCount,
    soundEnabled,
    toastsEnabled,
    toggleSound,
    toggleToasts,
    toggleBoth,
    addAlert,
    markRead,
    acknowledge,
    acknowledgeAll,
    acknowledgeAlert,
    dismissToast,
    syncProductAlert,
    seedFromInventory
  }
}, {
  persist: {
    key: 'comerciales-alerts',
    paths: ['alerts', 'notifPrefs'],
    afterRestore: (ctx) => {
      ctx.store.alerts = (ctx.store.alerts as any[]).map((a: any) => {
        // Migración: alertas sin campo `read` → agregar read: false
        const withRead = 'read' in a ? a : { ...a, read: false }
        // Alertas de equipo estáticas (mocks) → marcar como leídas para no sumar al badge
        if (withRead.category === 'equipment') return { ...withRead, read: true }
        return withRead
      })
    }
  }
})
