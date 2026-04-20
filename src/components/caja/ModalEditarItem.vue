<template>
  <Teleport to="body">
    <div
      v-if="cajaStore.showModalEdit && cajaStore.editingItem"
      class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center fade-in"
      @click.self="cajaStore.cerrarModalEdit()"
    >
      <div class="bg-surface border border-border rounded-2xl w-80 p-6 shadow-2xl scale-in">

        <!-- Header -->
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-base font-semibold text-primary">{{ cajaStore.editingItem.name }}</h3>
          <button @click="cajaStore.cerrarModalEdit()" class="text-muted hover:text-primary transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Precio unitario -->
        <p class="text-xs text-muted mb-4">
          ${{ cajaStore.editingItem.priceUnit.toLocaleString('es-CL') }} / {{ cajaStore.editingItem.unit.toLowerCase() }}
        </p>

        <!-- Control cantidad -->
        <div class="mb-4">
          <p class="text-xs text-muted mb-2">
            Cantidad ({{ cajaStore.editingItem.unit.toLowerCase() }})
          </p>
          <div class="flex items-center gap-3 bg-surface-2 rounded-xl border border-border p-1">
            <button
              @click="adjustQty(-step)"
              class="w-10 h-10 rounded-lg bg-surface border border-border text-secondary hover:text-primary hover:border-brand-500 transition-colors text-xl font-light"
            >−</button>
            <input
              type="number"
              v-model.number="localQty"
              :step="step"
              min="0.001"
              @input="clampQty"
              class="flex-1 bg-transparent text-center text-xl font-semibold text-primary focus:outline-none"
            />
            <button
              @click="adjustQty(step)"
              class="w-10 h-10 rounded-lg bg-surface border border-border text-secondary hover:text-primary hover:border-brand-500 transition-colors text-xl font-light"
            >+</button>
          </div>
        </div>

        <!-- Subtotal -->
        <div class="bg-surface-2 rounded-lg p-3 flex justify-between items-center mb-5">
          <span class="text-xs text-muted">Subtotal</span>
          <span class="text-lg font-bold text-primary">
            ${{ subtotal.toLocaleString('es-CL') }}
          </span>
        </div>

        <!-- Acciones -->
        <div class="flex gap-2">
          <button
            @click="cajaStore.eliminarItem()"
            class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-danger-500/30 text-danger-400 hover:bg-danger-500/10 text-xs transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
          </button>
          <button
            @click="guardar"
            class="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg py-2 text-sm transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCajaStore } from '../../stores/caja.store'

const cajaStore = useCajaStore()

const localQty = ref(0)

// Inicializar cuando cambia el item editado
watch(() => cajaStore.editingItem, (item) => {
  if (item) localQty.value = item.qty
}, { immediate: true })

const step = computed(() => cajaStore.editingItem?.unit === 'kg' ? 0.1 : 1)

const subtotal = computed(() => {
  const pu = cajaStore.editingItem?.priceUnit ?? 0
  return Math.round(localQty.value * pu)
})

function adjustQty(delta: number) {
  const val = Math.round((localQty.value + delta) * 1000) / 1000
  localQty.value = Math.max(0.001, val)
}

function clampQty() {
  if (localQty.value < 0.001) localQty.value = 0.001
}

function guardar() {
  cajaStore.guardarEdicionItem(localQty.value)
}
</script>
