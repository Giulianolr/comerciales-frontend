import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'
import type { EventoCaja } from '../types'

const STORAGE_KEY = 'comerciales-anulaciones'

function cargarEventos(): EventoCaja[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') ?? []
  } catch {
    return []
  }
}

function persistirEventos(eventos: EventoCaja[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(eventos))
  } catch { /* noop */ }
}

export const useReportesStore = defineStore('reportes', () => {
  const eventosCaja = ref<EventoCaja[]>(cargarEventos())

  function registrarEventoCaja(evento: Omit<EventoCaja, 'id'>) {
    const nuevoEvento: EventoCaja = {
      id:            `evt-${Date.now()}`,
      station_id:    evento.station_id,
      station_name:  evento.station_name,
      numero_boleta: evento.numero_boleta,
      total:         evento.total,
      item_count:    evento.item_count,
      fecha:         evento.fecha,
      items:         (evento.items ?? []).map(i => ({
        id:         i.id,
        name:       i.name,
        qty:        i.qty,
        unit:       i.unit,
        price_unit: i.price_unit,
        supplier:   i.supplier,
      })),
    }
    const actual = cargarEventos()
    const nuevos = [nuevoEvento, ...actual]
    eventosCaja.value = nuevos
    persistirEventos(nuevos)
  }

  function eliminarEventoCaja(id: string) {
    const nuevos = cargarEventos().filter(e => e.id !== id)
    eventosCaja.value = nuevos
    persistirEventos(nuevos)
  }

  function limpiarEventosCaja() {
    eventosCaja.value = []
    persistirEventos([])
  }

  function recargarDesdeStorage() {
    eventosCaja.value = cargarEventos()
  }

  return { eventosCaja, registrarEventoCaja, eliminarEventoCaja, limpiarEventosCaja, recargarDesdeStorage }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useReportesStore, import.meta.hot))
}
