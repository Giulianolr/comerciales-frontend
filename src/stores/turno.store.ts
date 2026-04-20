import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTurnoStore = defineStore(
  'turno',
  () => {
    const nombreOperario = ref<string | null>(null)

    const iniciales = computed(() => {
      if (!nombreOperario.value) return '??'
      return nombreOperario.value
        .split(' ')
        .map(p => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    })

    function setNombre(nombre: string) {
      nombreOperario.value = nombre.trim()
    }

    function cerrarTurno() {
      nombreOperario.value = null
    }

    return { nombreOperario, iniciales, setNombre, cerrarTurno }
  },
  {
    persist: { key: 'comerciales-turno' }
  }
)
