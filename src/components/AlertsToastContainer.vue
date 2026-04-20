<template>
  <Teleport to="body">
    <div class="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      <div
        v-for="toast in alertsStore.toasts"
        :key="toast.id"
        class="pointer-events-auto"
      >
        <AlertToast :toast="toast" @dismiss="alertsStore.dismissToast" />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useAlertsStore } from '../stores/alerts.store'
import AlertToast from './AlertToast.vue'

const alertsStore = useAlertsStore()
</script>
