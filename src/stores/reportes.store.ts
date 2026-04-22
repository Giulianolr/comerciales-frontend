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
      balanzaId:     evento.balanzaId,
      balanzaNombre: evento.balanzaNombre,
      numeroBoleta:  evento.numeroBoleta,
      total:         evento.total,
      itemCount:     evento.itemCount,
      fecha:         evento.fecha,
      items:         (evento.items ?? []).map(i => ({
        id:        i.id,
        name:      i.name,
        qty:       i.qty,
        unit:      i.unit,
        priceUnit: i.priceUnit,
        supplier:  i.supplier,
      })),
    }
    // Siempre leer desde localStorage para evitar estado desincronizado entre vistas
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

// Soporte HMR para Vite — evita instancias duplicadas del store al editar código
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useReportesStore, import.meta.hot))
}
