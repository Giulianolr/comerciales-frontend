import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { DailyKPIs, LowStockAlert } from '../types'
import { mockKPIs, mockAlerts } from '../mocks/kpis'

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const kpis = ref<DailyKPIs | null>(mockKPIs)
  const alerts = ref<LowStockAlert[]>(mockAlerts)
  const isLive = ref(true)
  const lastUpdated = ref(new Date())

  // Computed
  const unreadAlerts = computed(() => alerts.value.filter(a => !a.acknowledged))
  const criticalAlerts = computed(() => alerts.value.filter(a => a.stockStatus === 'critical'))

  // Actions
  const updateKPIs = (newKPIs: DailyKPIs) => {
    kpis.value = newKPIs
    lastUpdated.value = new Date()
  }

  const addAlert = (alert: LowStockAlert) => {
    const exists = alerts.value.find(a => a.productId === alert.productId)
    if (!exists) {
      alerts.value.push(alert)
    }
  }

  const acknowledgeAlert = (productId: string) => {
    const alert = alerts.value.find(a => a.productId === productId)
    if (alert) {
      alert.acknowledged = true
    }
  }

  const setIsLive = (live: boolean) => {
    isLive.value = live
  }

  return {
    // State
    kpis,
    alerts,
    isLive,
    lastUpdated,
    // Computed
    unreadAlerts,
    criticalAlerts,
    // Actions
    updateKPIs,
    addAlert,
    acknowledgeAlert,
    setIsLive
  }
})
