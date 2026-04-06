<template>
  <div class="bg-surface rounded-lg border border-border p-6 hover:shadow-lg transition-shadow">
    <!-- Top Section: Icon + Trend -->
    <div class="flex items-start justify-between mb-4">
      <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', accentBgClass]">
        <svg :class="['w-6 h-6', accentTextClass]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="iconPath" />
        </svg>
      </div>
      <div class="text-right">
        <div :class="[
          'flex items-center gap-1 text-xs font-medium',
          trend.direction === 'up' ? 'text-success-500' :
          trend.direction === 'down' ? 'text-danger-500' :
          'text-secondary'
        ]">
          <svg v-if="trend.direction === 'up'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V9.414l-4.293 4.293a1 1 0 01-1.414-1.414L13.586 8H12z" clip-rule="evenodd" />
          </svg>
          <svg v-else-if="trend.direction === 'down'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1V9a1 1 0 112 0v3.586l4.293-4.293a1 1 0 011.414 1.414L10.414 12H12z" clip-rule="evenodd" />
          </svg>
          <span>{{ Math.abs(trend.percentage) }}%</span>
        </div>
      </div>
    </div>

    <!-- Main Value -->
    <div class="mb-2">
      <p class="text-3xl font-semibold text-primary">{{ value }}</p>
    </div>

    <!-- Label + Context -->
    <div>
      <p class="text-xs text-secondary mb-1">{{ label }}</p>
      <p class="text-xs text-muted">{{ trend.vsLabel }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrendValue } from '../types'

interface Props {
  label: string
  value: string
  trend: TrendValue
  icon: 'banknotes' | 'receipt-refund' | 'tag' | 'server-stack'
  accentColor: 'brand' | 'info' | 'success' | 'warning'
}

const props = defineProps<Props>()

const iconPaths: Record<string, string> = {
  'banknotes': 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  'receipt-refund': 'M9 14l6-6m-5.5.5h.01m4 4h.01M9 20H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-5m-7-5l5.586 5.586a1 1 0 001.414-1.414l-5.586-5.586',
  'tag': 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
  'server-stack': 'M5 12a1 1 0 11-2 0 1 1 0 012 0z M5 12a1 1 0 11-2 0 1 1 0 012 0z M5 12a1 1 0 11-2 0 1 1 0 012 0z'
}

const iconPath = computed(() => iconPaths[props.icon])

const accentBgClass = computed(() => {
  const classes: Record<string, string> = {
    brand: 'bg-brand-500/10',
    info: 'bg-info-500/10',
    success: 'bg-success-500/10',
    warning: 'bg-warning-500/10'
  }
  return classes[props.accentColor]
})

const accentTextClass = computed(() => {
  const classes: Record<string, string> = {
    brand: 'text-brand-500',
    info: 'text-info-500',
    success: 'text-success-500',
    warning: 'text-warning-500'
  }
  return classes[props.accentColor]
})
</script>
