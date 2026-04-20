<template>
  <div
    class="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-xl shadow-xl z-50 flex flex-col overflow-hidden"
    style="max-height: 480px"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
      <div class="flex items-center gap-2">
        <span class="text-sm font-semibold text-primary">Alertas</span>
        <span
          v-if="alertsStore.unreadCount > 0"
          class="text-xs font-semibold bg-danger-500 text-white rounded-full px-1.5 py-0.5 leading-none"
        >
          {{ alertsStore.unreadCount }}
        </span>
      </div>
      <button
        v-if="alertsStore.panelAlerts.length > 0"
        @click="alertsStore.acknowledgeAll(); emit('close')"
        class="text-xs text-muted hover:text-secondary transition-colors"
      >
        Descartar todas
      </button>
    </div>

    <!-- Lista -->
    <div class="overflow-y-auto flex-1">

      <!-- Sin alertas -->
      <div v-if="alertsStore.panelAlerts.length === 0" class="flex flex-col items-center justify-center py-10 gap-2 text-muted">
        <svg class="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <p class="text-xs">Sin alertas pendientes</p>
      </div>

      <template v-else>
        <!-- Sección STOCK -->
        <div v-if="alertsStore.panelStockAlerts.length > 0">
          <div class="px-4 py-2 bg-surface-2 border-b border-border">
            <span class="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Stock ({{ alertsStore.panelStockAlerts.length }})
            </span>
          </div>
          <AlertRow
            v-for="alert in alertsStore.panelStockAlerts"
            :key="alert.id"
            :alert="alert"
            @acknowledge="alertsStore.acknowledge(alert.id)"
            @navigate="handleNavigate(alert)"
          />
        </div>

        <!-- Sección EQUIPOS -->
        <div v-if="alertsStore.panelEquipmentAlerts.length > 0">
          <div class="px-4 py-2 bg-surface-2 border-b border-border">
            <span class="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Equipos ({{ alertsStore.panelEquipmentAlerts.length }})
            </span>
          </div>
          <AlertRow
            v-for="alert in alertsStore.panelEquipmentAlerts"
            :key="alert.id"
            :alert="alert"
            @acknowledge="alertsStore.acknowledge(alert.id)"
            @navigate="handleNavigate(alert)"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAlertsStore, type AppAlert } from '../stores/alerts.store'
import { useRouter } from 'vue-router'
import AlertRow from './AlertRow.vue'

const emit = defineEmits<{ close: [] }>()

const alertsStore = useAlertsStore()
const router = useRouter()

function handleNavigate(alert: AppAlert) {
  alertsStore.markRead(alert.id)
  // Forzar navegación aunque ya estemos en la misma ruta (mismo sku)
  const dest = alert.navigateTo.includes('?sku=')
    ? alert.navigateTo + '&_t=' + Date.now()
    : alert.navigateTo
  router.push(dest)
  emit('close')
}
</script>
