import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DailyKPIs, Station } from '../types'
import { mockKPIs } from '../mocks/kpis'

const INITIAL_STATIONS: Station[] = [
  { id: 1, uuid: 'station-mock-1', name: 'Balanza 1', type: 'balanza', status: 'activa', operator_id: null, operator_name: null, assigned_at: null, transactions_today: 12, sales_today: 48000,  last_activity_at: new Date(Date.now() - 2 * 60000).toISOString(),  ip_address: '192.168.1.10' },
  { id: 2, uuid: 'station-mock-2', name: 'Balanza 2', type: 'balanza', status: 'activa', operator_id: null, operator_name: null, assigned_at: null, transactions_today: 10, sales_today: 42000,  last_activity_at: new Date(Date.now() - 5 * 60000).toISOString(),  ip_address: '192.168.1.11' },
  { id: 3, uuid: 'station-mock-3', name: 'Balanza 3', type: 'balanza', status: 'activa', operator_id: null, operator_name: null, assigned_at: null, transactions_today: 8,  sales_today: 31500,  last_activity_at: new Date(Date.now() - 3 * 60000).toISOString(), ip_address: '192.168.1.12' },
  { id: 4, uuid: 'station-mock-4', name: 'Balanza 4', type: 'balanza', status: 'activa', operator_id: null, operator_name: null, assigned_at: null, transactions_today: 14, sales_today: 52000,  last_activity_at: new Date().toISOString(),                         ip_address: '192.168.1.13' },
  { id: 5, uuid: 'station-mock-5', name: 'Caja',      type: 'caja',    status: 'activa', operator_id: null, operator_name: null, assigned_at: null, transactions_today: 30, sales_today: 125000, last_activity_at: new Date().toISOString(),                         ip_address: '192.168.1.14' },
]

export const useDashboardStore = defineStore(
  'dashboard',
  () => {
  const kpis = ref<DailyKPIs | null>(mockKPIs)
  const isLive = ref(true)
  const lastUpdated = ref(new Date())
  const stations = ref<Station[]>(INITIAL_STATIONS)

  const updateKPIs = (newKPIs: DailyKPIs) => {
    kpis.value = newKPIs
    lastUpdated.value = new Date()
  }

  const setIsLive = (live: boolean) => {
    isLive.value = live
  }

  const updateStationOperator = (stationId: number, name: string) => {
    const station = stations.value.find(s => s.id === stationId)
    if (station) station.operator_name = name.trim() || null
  }

  const assignOperator = (stationId: number, userId: string, userName: string) => {
    const station = stations.value.find(s => s.id === stationId)
    if (station) {
      station.operator_id   = userId
      station.operator_name = userName
      station.assigned_at   = new Date().toISOString()
    }
  }

  const releaseOperator = (stationId: number) => {
    const station = stations.value.find(s => s.id === stationId)
    if (station) {
      station.operator_id   = null
      station.operator_name = null
      station.assigned_at   = null
    }
  }

  const registrarTransaccion = (stationId: number, totalVenta: number) => {
    const station = stations.value.find(s => s.id === stationId)
    if (station) {
      station.transactions_today++
      station.sales_today      += totalVenta
      station.last_activity_at  = new Date().toISOString()
    }
  }

  return {
    kpis,
    isLive,
    lastUpdated,
    stations,
    updateKPIs,
    setIsLive,
    updateStationOperator,
    assignOperator,
    releaseOperator,
    registrarTransaccion,
  }
  },
  {
    persist: {
      key: 'comerciales-dashboard',
      paths: ['stations'],
      afterRestore(ctx) {
        // Solo conservar la asignación de operario; el resto viene fresco desde INITIAL_STATIONS.
        ctx.store.stations = INITIAL_STATIONS.map((initial: Station) => {
          const saved = ctx.store.stations.find((s: Station) => s.id === initial.id)
          const hasOperator = !!saved?.operator_id
          return {
            ...initial,
            operator_id:   hasOperator ? saved.operator_id              : null,
            operator_name: hasOperator ? (saved.operator_name ?? null)   : null,
            assigned_at:   hasOperator ? (saved.assigned_at  ?? null)    : null,
          }
        })
      }
    }
  }
)
