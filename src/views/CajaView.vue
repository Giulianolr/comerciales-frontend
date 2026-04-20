<template>
  <div class="h-screen flex flex-col bg-canvas text-primary">

    <!-- Topbar -->
    <CajaTopbar />

    <!-- Toasts alertas (cajero) -->
    <AlertsToastContainer />

    <!-- Banner offline -->
    <div
      v-if="cajaStore.offline"
      class="bg-warning-500/10 border-b border-warning-500/30 px-5 py-2 flex items-center justify-between shrink-0"
    >
      <div class="flex items-center gap-2 text-xs text-warning-400">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Sin conexión — las ventas se guardan localmente y sincronizan al recuperar la red.
      </div>
      <button @click="cajaStore.toggleOffline()" class="text-xs text-warning-400 hover:text-warning-300 underline">
        Reintentar
      </button>
    </div>

    <!-- Barra de tabs (solo cuando hay venta activa o múltiples tabs) -->
    <CajaTabsBar v-if="cajaStore.tabs.length > 0 || cajaStore.estado !== 'idle'" />

    <!-- Contenido principal -->
    <div class="flex-1 overflow-hidden relative">

      <!-- Idle: scanner + cola balanzas -->
      <CajaIdle v-if="cajaStore.estado === 'idle'" />

      <!-- Venta activa: tabla + cobro -->
      <CajaActive v-else-if="cajaStore.estado === 'active'" />

      <!-- Efectivo: vista dedicada -->
      <CajaCash v-else-if="cajaStore.estado === 'cash'" />

      <!-- Procesando -->
      <div
        v-else-if="cajaStore.estado === 'processing'"
        class="h-full flex items-center justify-center fade-in"
      >
        <div class="text-center">
          <div class="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin"></div>
          <p class="text-lg font-semibold text-primary mb-1">Registrando venta...</p>
          <p class="text-sm text-muted">Enviando al servidor</p>
        </div>
      </div>

      <!-- Éxito -->
      <CajaSuccess v-else-if="cajaStore.estado === 'success'" />

    </div>

    <!-- Modales -->
    <ModalScanActivo />
    <ModalEditarItem />

  </div>

</template>

<script setup lang="ts">
import { useCajaStore } from '../stores/caja.store'
import AlertsToastContainer from '../components/AlertsToastContainer.vue'
import CajaTopbar      from '../components/caja/CajaTopbar.vue'
import CajaTabsBar     from '../components/caja/CajaTabsBar.vue'
import CajaIdle        from '../components/caja/CajaIdle.vue'
import CajaActive      from '../components/caja/CajaActive.vue'
import CajaCash        from '../components/caja/CajaCash.vue'
import CajaSuccess     from '../components/caja/CajaSuccess.vue'
import ModalScanActivo from '../components/caja/ModalScanActivo.vue'
import ModalEditarItem from '../components/caja/ModalEditarItem.vue'

const cajaStore = useCajaStore()
</script>
