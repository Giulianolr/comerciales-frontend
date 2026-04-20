<template>
  <div class="h-full flex items-center justify-center fade-in">
    <div class="text-center max-w-sm scale-in">

      <!-- Ícono check -->
      <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-success-500/10 border-2 border-success-500/30 flex items-center justify-center">
        <svg class="w-10 h-10 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 class="text-2xl font-bold text-primary mb-2">Venta registrada</h2>
      <p class="text-sm text-secondary mb-6">
        ${{ cajaStore.total.toLocaleString('es-CL') }} ·
        {{ metodoPagoLabel }} ·
        {{ cajaStore.tabActivo?.preBoleta.balanzaNombre }} ·
        {{ cajaStore.items.length }} ítems
      </p>

      <!-- Detalles -->
      <div class="bg-surface-2 border border-border rounded-lg p-4 mb-6 text-left space-y-2">
        <div class="flex justify-between text-xs">
          <span class="text-muted">Boleta SII</span>
          <span class="text-warning-400 flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pendiente SII
          </span>
        </div>
        <div class="flex justify-between text-xs">
          <span class="text-muted">Cajero</span>
          <span class="text-secondary">Juan Pérez</span>
        </div>
      </div>

      <!-- Acciones -->
      <div class="flex gap-3">
        <button
          @click="cajaStore.nuevaVenta()"
          class="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl py-3 text-sm transition-colors"
        >
          Nueva venta
        </button>
        <button class="px-4 py-3 rounded-xl border border-border text-secondary hover:text-primary text-sm transition-colors">
          Detalle
        </button>
      </div>

      <p class="text-xs text-muted mt-4">
        Cerrando en <span class="font-mono">{{ countdown }}</span>s...
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCajaStore } from '../../stores/caja.store'

const cajaStore = useCajaStore()
const countdown = ref(3)

const metodoPagoLabel = computed(() => ({
  efectivo:      'Efectivo',
  debito:        'Débito',
  credito:       'Crédito',
  transferencia: 'Transferencia',
}[cajaStore.metodoPago] ?? cajaStore.metodoPago))

let intervalo: ReturnType<typeof setInterval>

onMounted(() => {
  countdown.value = 3
  intervalo = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(intervalo)
      cajaStore.nuevaVenta()
    }
  }, 1000)
})

onUnmounted(() => clearInterval(intervalo))
</script>
