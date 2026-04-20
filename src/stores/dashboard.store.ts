import { defineStore } from 'pinia'
import { ref } from 'vue'
import { DailyKPIs, StationStatus, StationType } from '../types'
import { mockKPIs } from '../mocks/kpis'

interface StationLocal {
  id: number
  name: string
  type: StationType
  status: StationStatus
  operatorName: string | null
  transactionsToday: number
  ventasToday: number
  lastActivityAt: string | null
  ipAddress: string
  firmwareVersion: string
}

const INITIAL_STATIONS: StationLocal[] = [
  { id: 1, name: 'Balanza 1', type: 'balanza', status: 'activa', operatorName: null, transactionsToday: 12, ventasToday: 48000,  lastActivityAt: new Date(Date.now() - 2 * 60000).toISOString(),   ipAddress: '192.168.1.10', firmwareVersion: 'v2.1.3' },
  { id: 2, name: 'Balanza 2', type: 'balanza', status: 'activa', operatorName: null, transactionsToday: 10, ventasToday: 42000,  lastActivityAt: new Date(Date.now() - 5 * 60000).toISOString(),   ipAddress: '192.168.1.11', firmwareVersion: 'v2.1.3' },
  { id: 3, name: 'Balanza 3', type: 'balanza', status: 'error',  operatorName: null, transactionsToday: 0,  ventasToday: 0,      lastActivityAt: new Date(Date.now() - 120 * 60000).toISOString(), ipAddress: '192.168.1.12', firmwareVersion: 'v2.1.3' },
  { id: 4, name: 'Balanza 4', type: 'balanza', status: 'activa', operatorName: null, transactionsToday: 14, ventasToday: 52000,  lastActivityAt: new Date().toISOString(),                          ipAddress: '192.168.1.13', firmwareVersion: 'v2.1.3' },
  { id: 5, name: 'Caja',      type: 'caja',    status: 'activa', operatorName: null, transactionsToday: 30, ventasToday: 125000, lastActivityAt: new Date().toISOString(),                          ipAddress: '192.168.1.14', firmwareVersion: 'v3.0.1' },
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

  return {
    kpis,
    isLive,
    lastUpdated,
    stations,
    updateKPIs,
    setIsLive,
    updateStationOperator
  }
  },
  {
    persist: {
      key: 'comerciales-dashboard',
      paths: ['stations']
    }
  }
)
