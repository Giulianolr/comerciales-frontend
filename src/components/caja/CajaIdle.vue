<template>
  <div class="h-full flex flex-col fade-in">

    <!-- Scanner central -->
    <div class="flex-1 flex items-center justify-center p-8">
      <div class="text-center max-w-sm w-full">
        <div class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-surface-2 border border-border flex items-center justify-center">
          <svg class="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        </div>

        <p class="text-secondary text-sm mb-1">Escanea el QR del boucher</p>
        <p class="text-muted text-xs mb-6">o el código de barras de un producto</p>

        <div class="scanner-pulse rounded-xl">
          <input
            ref="scannerInput"
            type="text"
            placeholder="Esperando escáner..."
            class="w-full bg-surface-2 border border-border rounded-xl px-4 py-3.5 text-sm text-primary placeholder-muted focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-center"
            @keydown.enter="simularEscaneo"
          />
        </div>

        <p class="text-xs text-muted mt-3">
          Presiona
          <kbd class="px-1.5 py-0.5 rounded bg-surface-2 border border-border font-mono text-xs">Enter</kbd>
          para simular escaneo
        </p>
      </div>
    </div>

    <!-- Cola de balanzas -->
    <div class="shrink-0 border-t border-border bg-surface p-4">
      <p class="text-xs font-medium text-muted uppercase tracking-wider mb-3">Pre-boletas esperando</p>
      <div class="grid grid-cols-4 gap-3">
        <template v-for="balanza in colaBalanzas" :key="balanza.id">
          <!-- Balanza activa con pre-boleta -->
          <button
            v-if="balanza.activa"
            @click="cajaStore.seleccionarPreBoleta(balanza.id)"
            :class="balanza.advertencia
              ? 'border-warning-500/30 hover:border-warning-500'
              : 'border-border hover:border-brand-500'"
            class="bg-surface-2 hover:bg-border border rounded-lg p-3 text-left transition-all group"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-medium text-secondary group-hover:text-primary transition-colors">
                {{ balanza.nombre }}
              </span>
              <span
                :class="balanza.advertencia ? 'bg-warning-400' : 'bg-brand-400 blink'"
                class="w-1.5 h-1.5 rounded-full"
              ></span>
            </div>
            <p class="text-sm font-semibold text-primary">${{ balanza.total.toLocaleString('es-CL') }}</p>
            <p :class="balanza.advertencia ? 'text-warning-400' : 'text-muted'" class="text-xs">
              {{ balanza.itemCount }} ítem{{ balanza.itemCount !== 1 ? 's' : '' }} · {{ balanza.creadaHace }}
            </p>
          </button>

          <!-- Balanza sin actividad -->
          <div
            v-else
            class="bg-surface-2 border border-border rounded-lg p-3 opacity-40"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-medium text-secondary">{{ balanza.nombre }}</span>
              <span class="w-1.5 h-1.5 rounded-full bg-muted"></span>
            </div>
            <p class="text-xs text-muted mt-4">Sin actividad</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCajaStore, MOCK_COLA_BALANZAS } from '../../stores/caja.store'

const cajaStore = useCajaStore()
const scannerInput = ref<HTMLInputElement | null>(null)
const colaBalanzas = MOCK_COLA_BALANZAS

onMounted(() => {
  scannerInput.value?.focus()
})

function simularEscaneo() {
  cajaStore.seleccionarPreBoleta(1)
}
</script>
