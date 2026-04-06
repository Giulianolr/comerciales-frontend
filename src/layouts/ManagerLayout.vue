<template>
  <div class="min-h-screen flex bg-canvas">
    <!-- Sidebar -->
    <aside class="w-60 bg-surface border-r border-border flex flex-col fixed left-0 top-0 h-screen">
      <!-- Logo -->
      <div class="px-6 py-6 border-b border-border flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <span class="font-semibold text-lg text-primary">Comerciales</span>
      </div>

      <!-- Nav Items -->
      <nav class="flex-1 px-4 py-6 space-y-2">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
            'border-l-2 -ml-4 pl-[18px]',
            route.path === item.path
              ? 'bg-brand-500/10 border-l-brand-500 text-brand-400'
              : 'border-l-transparent text-secondary hover:text-primary hover:bg-surface-2'
          ]"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="iconPaths[item.icon]" />
          </svg>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <!-- User Profile -->
      <div class="p-4 border-t border-border flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-semibold">
          GL
        </div>
        <div>
          <p class="text-sm font-medium text-primary">Giuliano Larosa</p>
          <p class="text-xs text-secondary">Gerente</p>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 ml-60 flex flex-col">
      <!-- Top Bar -->
      <header class="h-14 bg-surface border-b border-border sticky top-0 z-40 flex items-center justify-between px-6">
        <div class="flex items-center gap-2 text-sm text-secondary">
          <span>Comerciales</span>
          <span class="text-muted">/</span>
          <span class="text-primary">{{ currentPageTitle }}</span>
        </div>

        <div class="flex items-center gap-6">
          <!-- Live Indicator -->
          <div v-if="dashboardStore.isLive" class="flex items-center gap-2 text-xs text-success-500">
            <div class="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
            EN VIVO
          </div>

          <!-- Alerts Bell -->
          <button class="relative p-2 hover:bg-surface-2 rounded-lg transition-colors">
            <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span v-if="dashboardStore.unreadAlerts.length > 0" class="absolute top-1 right-1 w-4 h-4 bg-danger-500 rounded-full text-white text-xs flex items-center justify-center">
              {{ dashboardStore.unreadAlerts.length }}
            </span>
          </button>

          <!-- Clock -->
          <div class="text-sm text-secondary font-mono">{{ currentTime }}</div>

          <!-- User Avatar -->
          <button class="p-2 hover:bg-surface-2 rounded-lg transition-colors">
            <div class="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-semibold">
              GL
            </div>
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-auto">
        <div class="p-8">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useDashboardStore } from '../stores/dashboard.store'

const route = useRoute()
const dashboardStore = useDashboardStore()

const navItems = [
  { label: 'Panel General', path: '/gerente', icon: 'chart-bar' },
  { label: 'Transacciones', path: '/gerente/transacciones', icon: 'bolt' },
  { label: 'Inventario', path: '/gerente/inventario', icon: 'cube' },
  { label: 'Balanzas', path: '/gerente/balanzas', icon: 'server-stack' },
  { label: 'Reportes', path: '/gerente/reportes', icon: 'document-chart-bar' },
  { label: 'Usuarios', path: '/gerente/usuarios', icon: 'users' },
  { label: 'Cierre del Día', path: '/gerente/cierre', icon: 'lock-closed' }
]

const iconPaths: Record<string, string> = {
  'chart-bar': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  'bolt': 'M13 10V3L4 14h7v7l9-11h-7z',
  'cube': 'M20.354 15.354A9 9 0 000.646.646a9 9 0 0019.708 14.708z',
  'server-stack': 'M5 12a1 1 0 11-2 0 1 1 0 012 0z M5 12a1 1 0 11-2 0 1 1 0 012 0z M5 12a1 1 0 11-2 0 1 1 0 012 0z',
  'document-chart-bar': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  'users': 'M12 4.354a4 4 0 110-8 4 4 0 010 8z M3 8H1m22 0h-2m-20 4h18a2 2 0 012 2v4a2 2 0 01-2 2H3a2 2 0 01-2-2v-4a2 2 0 012-2z',
  'lock-closed': 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
}

const currentTime = ref('')
const currentPageTitle = computed(() => {
  const item = navItems.find(i => i.path === route.path)
  return item?.label || 'Comerciales'
})

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  updateTime()
  const interval = setInterval(updateTime, 1000)
  onUnmounted(() => clearInterval(interval))
})
</script>

<style scoped>
.icon-path {
  @apply w-5 h-5;
}
</style>
