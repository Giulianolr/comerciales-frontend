import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import type { TurnoRecord } from '../types'

const KEY = 'comerciales-turnos'

function cargarTurnos(): TurnoRecord[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistirTurnos(turnos: TurnoRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(turnos))
}

export const useTurnosStore = defineStore('turnos', () => {
  const turnos = ref<TurnoRecord[]>(cargarTurnos())

  function registrarTurno(record: TurnoRecord) {
    const fresh = [...cargarTurnos(), record]
    persistirTurnos(fresh)
    turnos.value = fresh
  }

  function turnosPorEstacion(stationId: number, fecha?: string): TurnoRecord[] {
    const f = fecha ?? new Date().toISOString().split('T')[0]
    return turnos.value.filter(t => t.station_id === stationId && t.fecha === f)
  }

  function turnosHoy(): TurnoRecord[] {
    const hoy = new Date().toISOString().split('T')[0]
    return turnos.value.filter(t => t.fecha === hoy)
  }

  function eliminarTurno(turnoId: string) {
    const fresh = turnos.value.filter(t => t.id !== turnoId)
    persistirTurnos(fresh)
    turnos.value = fresh
  }

  function eliminarTurnosDeEstacion(stationId: number, fecha?: string) {
    const f = fecha ?? new Date().toISOString().split('T')[0]
    const fresh = turnos.value.filter(t => !(t.station_id === stationId && t.fecha === f))
    persistirTurnos(fresh)
    turnos.value = fresh
  }

  function recargarDesdeStorage() {
    turnos.value = cargarTurnos()
  }

  return {
    turnos,
    registrarTurno,
    turnosPorEstacion,
    turnosHoy,
    eliminarTurno,
    eliminarTurnosDeEstacion,
    recargarDesdeStorage,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTurnosStore, import.meta.hot))
}
