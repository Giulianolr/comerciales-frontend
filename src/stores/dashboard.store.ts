import { defineStore } from 'pinia'
import { ref } from 'vue'
import { DailyKPIs, StationStatus, StationType } from '../types'
import { mockKPIs } from '../mocks/kpis'

interface StationLocal {
  id: number
  name: string
  type: StationType
  status: StationStatus
  operatorId: string | null
  operatorName: string | null
  assignedAt: string | null
  transactionsToday: number
  ventasToday: number
  lastActivityAt: string | null
  ipAddress: string
  firmwareVersion: string
  transactionsSinceAssigned: number
  ventasSinceAssigned: number
}

const INITIAL_STATIONS: StationLocal[] = [
  { id: 1, name: 'Balanza 1', type: 'balanza', status: 'activa', operatorId: null, operatorName: null, assignedAt: null, transactionsToday: 12, ventasToday: 48000,  lastActivityAt: new Date(Date.now() - 2 * 60000).toISOString(),  ipAddress: '192.168.1.10', firmwareVersion: 'v2.1.3', transactionsSinceAssigned: 0, ventasSinceAssigned: 0 },
  { id: 2, name: 'Balanza 2', type: 'balanza', status: 'activa', operatorId: null, operatorName: null, assignedAt: null, transactionsToday: 10, ventasToday: 42000,  lastActivityAt: new Date(Date.now() - 5 * 60000).toISOString(),  ipAddress: '192.168.1.11', firmwareVersion: 'v2.1.3', transactionsSinceAssigned: 0, ventasSinceAssigned: 0 },
  { id: 3, name: 'Balanza 3', type: 'balanza', status: 'activa', operatorId: null, operatorName: null, assignedAt: null, transactionsToday: 8,  ventasToday: 31500,  lastActivityAt: new Date(Date.now() - 3 * 60000).toISOString(), ipAddress: '192.168.1.12', firmwareVersion: 'v2.1.3', transactionsSinceAssigned: 0, ventasSinceAssigned: 0 },
  { id: 4, name: 'Balanza 4', type: 'balanza', status: 'activa', operatorId: null, operatorName: null, assignedAt: null, transactionsToday: 14, ventasToday: 52000,  lastActivityAt: new Date().toISOString(),                         ipAddress: '192.168.1.13', firmwareVersion: 'v2.1.3', transactionsSinceAssigned: 0, ventasSinceAssigned: 0 },
  { id: 5, name: 'Caja',      type: 'caja',    status: 'activa', operatorId: null, operatorName: null, assignedAt: null, transactionsToday: 30, ventasToday: 125000, lastActivityAt: new Date().toISOString(),                         ipAddress: '192.168.1.14', firmwareVersion: 'v3.0.1', transactionsSinceAssigned: 0, ventasSinceAssigned: 0 },
]

export const useDashboardStore = defineStore(
  'dashboard',
  () => {
  // State
  const kpis = ref<DailyKPIs | null>(mockKPIs)
  const isLive = ref(true)
  const lastUpdated = ref(new Date())
  const stations = ref<StationLocal[]>(INITIAL_STATIONS)

  // Actions
  const updateKPIs = (newKPIs: DailyKPIs) => {
    kpis.value = newKPIs
    lastUpdated.value = new Date()
  }

  const setIsLive = (live: boolean) => {
    isLive.value = live
  }

  const updateStationOperator = (stationId: number, name: string) => {
    const station = stations.value.find(s => s.id === stationId)
    if (station) station.operatorName = name.trim() || null
  }

  const assignOperator = (stationId: number, userId: string, userName: string) => {
    const station = stations.value.find(s => s.id === stationId)
    if (station) {
      station.operatorId = userId
      station.operatorName = userName
      station.assignedAt = new Date().toISOString()
      station.transactionsSinceAssigned = 0
      station.ventasSinceAssigned = 0
    }
  }

  const releaseOperator = (stationId: number) => {
    const station = stations.value.find(s => s.id === stationId)
    if (station) {
      station.operatorId = null
      station.operatorName = null
      station.assignedAt = null
      station.transactionsSinceAssigned = 0
      station.ventasSinceAssigned = 0
    }
  }

  const registrarTransaccion = (stationId: number, totalVenta: number) => {
    const station = stations.value.find(s => s.id === stationId)
    if (station) {
      station.transactionsSinceAssigned++
      station.ventasSinceAssigned += totalVenta
      station.transactionsToday++
      station.ventasToday += totalVenta
      station.lastActivityAt = new Date().toISOString()
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
        // Solo conservar la asignación de operario desde localStorage.
        // El resto (status, transacciones, ventas, lastActivity) viene siempre
        // fresco desde INITIAL_STATIONS para evitar datos obsoletos.
        ctx.store.stations = INITIAL_STATIONS.map((initial: StationLocal) => {
          const saved = ctx.store.stations.find((s: StationLocal) => s.id === initial.id)
          const hasOperator = !!saved?.operatorId
          return {
            ...initial,
            operatorId:                 hasOperator ? saved.operatorId                  : null,
            operatorName:               hasOperator ? (saved.operatorName ?? null)       : null,
            assignedAt:                 hasOperator ? (saved.assignedAt  ?? null)        : null,
            transactionsSinceAssigned:  hasOperator ? (saved.transactionsSinceAssigned ?? 0) : 0,
            ventasSinceAssigned:        hasOperator ? (saved.ventasSinceAssigned        ?? 0) : 0,
          }
        })
      }
    }
  }
)
