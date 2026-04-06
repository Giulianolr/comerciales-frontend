<template>
  <div>
    <h1 class="text-3xl font-bold text-primary mb-8">Reportes</h1>
    <div class="bg-surface rounded-lg border border-border p-8 text-center">
      <p class="text-secondary">Vista de reportes y analytics (en desarrollo)</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDashboardStore } from '../stores/dashboard.store'

useDashboardStore()
</script>
