<template>
  <div class="bg-surface border-b border-border flex items-end px-4 shrink-0">

    <!-- Tabs de pre-boletas activas -->
    <button
      v-for="tab in cajaStore.tabs"
      :key="tab.tabId"
      @click="cajaStore.setTabActivo(tab.tabId)"
      :class="tab.tabId === cajaStore.tabActivoId ? 'tab-active' : 'tab-inactive'"
      class="px-4 py-2.5 text-xs font-medium flex items-center gap-2 rounded-t transition-colors relative"
      :style="tab.tabId === cajaStore.tabActivoId ? '' : '--tw-group: tab-inactivo'"
    >
      <!-- Dot de color según advertencia -->
      <span
        :class="tab.preBoleta.balanzaId === 3 ? 'bg-warning-400' : 'bg-brand-400'"
        class="w-1.5 h-1.5 rounded-full shrink-0"
      ></span>

      <span>{{ tabLabel(tab) }}</span>

      <!-- Botón unir (solo en tab inactivo cuando hay tab activo con venta) -->
      <span
        v-if="tab.tabId !== cajaStore.tabActivoId && cajaStore.tabActivo"
        @click.stop="cajaStore.abrirModalScan(tab.tabId)"
        title="Unir a venta activa"
        class="ml-1 flex items-center gap-0.5 text-brand-400 hover:text-brand-300 px-1.5 py-0.5 rounded hover:bg-brand-500/10 transition-colors border border-brand-500/20 hover:border-brand-500/50"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        Unir
      </span>

      <!-- Cerrar tab -->
      <span
        @click.stop="cajaStore.cerrarTab(tab.tabId)"
        class="ml-0.5 text-muted hover:text-danger-400 leading-none transition-colors"
      >✕</span>
    </button>

    <!-- Nueva venta -->
    <button
      @click="cajaStore.irA('idle')"
      class="tab-inactive px-4 py-2.5 text-xs font-medium flex items-center gap-1.5 rounded-t transition-colors ml-1"
    >
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      Nueva venta
    </button>
  </div>
</template>

<script setup lang="ts">
import { useCajaStore } from '../../stores/caja.store'
import type { TabVenta } from '../../types'

const cajaStore = useCajaStore()

function tabLabel(tab: TabVenta): string {
  const total = tab.preBoleta.items.reduce((s, i) => s + Math.round(i.qty * i.priceUnit), 0)
  const merged = tab.mergedWith.length > 0
  const origen = merged
    ? tab.preBoleta.balanzaNombre.replace('Balanza ', 'Bal. ') + '+' + tab.mergedWith.length
    : tab.preBoleta.balanzaNombre
  return `${origen} · $${total.toLocaleString('es-CL')}`
}
</script>
