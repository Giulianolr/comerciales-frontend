import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCierreStore = defineStore(
  'cierre',
  () => {
    // Fecha del cierre guardado (para detectar cambio de día y resetear)
    const fechaCierre = ref<string>('')
    const cierreEjecutado = ref(false)
    const horaCierre = ref('')
    const observaciones = ref('')
    const montoCont = ref<number | null>(null)  // null = sin modificar

    const hoy = () => new Date().toLocaleDateString('es-CL')

    // Si el día cambió respecto al guardado, resetea todo
    function checkAndResetIfNewDay() {
      if (fechaCierre.value && fechaCierre.value !== hoy()) {
        resetCierre()
      }
    }

    function ejecutarCierre() {
      cierreEjecutado.value = true
      horaCierre.value = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
      fechaCierre.value = hoy()
    }

    function resetCierre() {
      cierreEjecutado.value = false
      horaCierre.value = ''
      observaciones.value = ''
      montoCont.value = null
      fechaCierre.value = hoy()
    }

    const diferencia = computed(() => {
      // se calcula en la vista con los KPIs, solo persiste el monto contado
      return montoCont.value
    })

    return {
      fechaCierre,
      cierreEjecutado,
      horaCierre,
      observaciones,
      montoCont,
      checkAndResetIfNewDay,
      ejecutarCierre,
      resetCierre,
    }
  },
  {
    persist: {
      key: 'comerciales-cierre',
      paths: ['fechaCierre', 'cierreEjecutado', 'horaCierre', 'observaciones', 'montoCont']
    }
  }
)
