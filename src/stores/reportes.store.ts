import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { EventoCaja } from '../types'

export const useReportesStore = defineStore('reportes', () => {
  const eventosCaja = ref<EventoCaja[]>([])

  function registrarEventoCaja(evento: Omit<EventoCaja, 'id'>) {
    eventosCaja.value = [
      { ...evento, id: `evt-${Date.now()}` },
      ...eventosCaja.value,
    ]
  }

  function eliminarEventoCaja(id: string) {
    eventosCaja.value = eventosCaja.value.filter(e => e.id !== id)
  }

  function limpiarEventosCaja() {
    eventosCaja.value = []
  }

  return { eventosCaja, registrarEventoCaja, eliminarEventoCaja, limpiarEventosCaja }
}, {
  persist: {
    key: 'comerciales-reportes',
    paths: ['eventosCaja'],
  },
})
