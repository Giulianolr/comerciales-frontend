<template>
  <div class="min-h-screen flex bg-canvas">
    <!-- Sidebar -->
    <aside class="w-60 bg-surface border-r border-border flex flex-col fixed left-0 top-0 h-screen">
      <!-- Logo -->
      <div class="px-6 py-5 border-b border-border flex items-center gap-3">
        <div class="w-9 h-9 shrink-0 rounded-xl overflow-hidden border border-white/10">
          <img :src="'/Optimind_Logo.jpg'" alt="OptiMind" class="w-full h-full object-cover" />
        </div>
        <div class="min-w-0">
          <span class="font-semibold text-sm text-primary leading-tight block truncate">Emporio Esperanza</span>
          <span class="text-[10px] text-muted leading-tight block">by OptiMind Solutions AI</span>
        </div>
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

      <!-- User Profile + Logout -->
      <div class="p-4 border-t border-border flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
          {{ userInitials }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-primary truncate">{{ authStore.user?.nombre }}</p>
          <p class="text-xs text-secondary capitalize">{{ authStore.user?.role }}</p>
        </div>
        <button
          @click="handleLogout"
          title="Cerrar sesión"
          class="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 ml-60 flex flex-col">
      <!-- Top Bar -->
      <header class="h-14 bg-surface border-b border-border sticky top-0 z-40 flex items-center justify-between px-6">
        <div class="flex items-center gap-2 text-sm text-secondary">
          <span>Emporio Esperanza</span>
          <span class="text-muted">/</span>
          <span class="text-primary">{{ currentPageTitle }}</span>
        </div>

        <div class="flex items-center gap-6">
          <!-- Live Indicator -->
          <div v-if="dashboardStore.isLive" class="flex items-center gap-2 text-xs text-success-500">
            <div class="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
            EN VIVO
          </div>

          <!-- Theme Toggle -->
          <button
            @click="themeStore.toggle()"
            :title="themeStore.current === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
            class="p-2 hover:bg-surface-2 rounded-lg transition-colors"
          >
            <!-- Sol: mostrado en modo oscuro (clic → claro) -->
            <svg v-if="themeStore.current === 'dark'" class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
            <!-- Luna: mostrado en modo claro (clic → oscuro) -->
            <svg v-else class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          <!-- Zoom Dropdown -->
          <div class="relative" v-click-outside="() => { zoomOpen = false }">
            <button
              @click="toggleZoom()"
              title="Zoom de pantalla"
              class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-secondary hover:text-primary hover:bg-surface-2 transition-colors"
            >
              <span>Zoom</span>
              <span class="text-primary font-semibold">{{ zoomLabel }}</span>
              <svg
                class="w-3 h-3 transition-transform duration-150"
                :class="zoomOpen ? 'rotate-180' : ''"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown panel -->
            <div
              v-if="zoomOpen"
              class="absolute right-0 top-full mt-1 w-36 bg-surface border border-border rounded-xl shadow-lg py-1 z-50"
            >
              <button
                v-for="level in ZOOM_LEVELS"
                :key="level"
                @click="selectZoom(level)"
                class="w-full flex items-center justify-between px-4 py-2 text-xs transition-colors"
                :class="zoomStore.current === level
                  ? 'text-brand-400 bg-brand-500/10 font-semibold'
                  : 'text-secondary hover:text-primary hover:bg-surface-2'"
              >
                <span>{{ level === 100 ? 'Normal' : level === 110 ? 'Cómodo' : level === 120 ? 'Grande' : 'Muy grande' }}</span>
                <span class="font-mono text-muted">{{ level }}%</span>
              </button>
            </div>
          </div>

          <!-- Notificaciones Dropdown (speaker) -->
          <div v-if="!isDevUser" class="relative" v-click-outside="() => { notifOpen = false }">
            <button
              @click="toggleNotif()"
              :title="alertsStore.soundEnabled ? 'Notificaciones activas' : 'Notificaciones silenciadas'"
              class="p-2 hover:bg-surface-2 rounded-lg transition-colors"
            >
              <!-- Speaker ON -->
              <svg v-if="alertsStore.soundEnabled" class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-3-3H5a1 1 0 01-1-1v-4a1 1 0 011-1h4l3-3z" />
              </svg>
              <!-- Speaker OFF / mute -->
              <svg v-else class="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            </button>

            <div
              v-if="notifOpen"
              class="absolute right-0 top-full mt-1 w-52 bg-surface border border-border rounded-xl shadow-lg z-50 overflow-hidden"
            >
              <div class="px-4 py-2.5 border-b border-border">
                <span class="text-xs font-semibold text-primary">Notificaciones</span>
              </div>
              <div class="py-1">
                <!-- Sonido -->
                <button
                  @click="alertsStore.toggleSound()"
                  class="w-full flex items-center justify-between px-4 py-2.5 hover:bg-surface-2 transition-colors"
                >
                  <span class="text-sm text-secondary">Sonido</span>
                  <span
                    class="text-xs font-semibold px-2 py-0.5 rounded-full"
                    :class="alertsStore.soundEnabled
                      ? 'bg-brand-500/15 text-brand-400'
                      : 'bg-surface-2 text-muted'"
                  >{{ alertsStore.soundEnabled ? 'ON' : 'OFF' }}</span>
                </button>
                <!-- Emergentes -->
                <button
                  @click="alertsStore.toggleToasts()"
                  class="w-full flex items-center justify-between px-4 py-2.5 hover:bg-surface-2 transition-colors"
                >
                  <span class="text-sm text-secondary">Emergentes</span>
                  <span
                    class="text-xs font-semibold px-2 py-0.5 rounded-full"
                    :class="alertsStore.toastsEnabled
                      ? 'bg-brand-500/15 text-brand-400'
                      : 'bg-surface-2 text-muted'"
                  >{{ alertsStore.toastsEnabled ? 'ON' : 'OFF' }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Alerts Bell -->
          <div
            v-if="!isDevUser"
            class="relative"
            v-click-outside="() => { alertsPanelOpen = false }"
          >
            <button
              @click="toggleAlertsPanel()"
              title="Alertas"
              class="relative p-2 hover:bg-surface-2 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span
                v-if="alertsStore.unreadCount > 0"
                class="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-sm"
              >
                {{ alertsStore.unreadCount > 9 ? '9+' : alertsStore.unreadCount }}
              </span>
            </button>

            <AlertsPanel v-if="alertsPanelOpen" @close="alertsPanelOpen = false" />
          </div>

          <!-- Clock -->
          <div class="text-sm text-secondary font-mono">{{ currentTime }}</div>

          <!-- User Avatar -->
          <div class="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
            {{ userInitials }}
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-auto">
        <div class="p-8">
          <RouterView />
        </div>
      </main>
    </div>

    <!-- Toasts (no dev) -->
    <AlertsToastContainer v-if="!isDevUser" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useDashboardStore } from '../stores/dashboard.store'
import { useInventoryStore } from '../stores/inventory.store'
import { useAuthStore } from '../stores/auth.store'
import { useThemeStore } from '../stores/theme.store'
import { useZoomStore, ZOOM_LEVELS } from '../stores/zoom.store'
import { useAlertsStore } from '../stores/alerts.store'
import { useReportesStore } from '../stores/reportes.store'
import { useUsersStore } from '../stores/users.store'
import { useTurnosStore } from '../stores/turnos.store'
import AlertsPanel from '../components/AlertsPanel.vue'
import AlertsToastContainer from '../components/AlertsToastContainer.vue'

const route = useRoute()
const router = useRouter()
const dashboardStore = useDashboardStore()
const inventoryStore = useInventoryStore()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const zoomStore = useZoomStore()
const alertsStore   = useAlertsStore()
const reportesStore = useReportesStore()
const usersStore    = useUsersStore()
const turnosStore   = useTurnosStore()

const alertsPanelOpen = ref(false)
const notifOpen = ref(false)
const isDevUser = computed(() => authStore.user?.role === 'dev')

// Directiva local: cierra el dropdown al hacer click fuera
const vClickOutside = {
  mounted(el: HTMLElement, binding: { value: () => void }) {
    el._clickOutside = (e: MouseEvent) => {
      if (!el.contains(e.target as Node)) binding.value()
    }
    document.addEventListener('mousedown', el._clickOutside)
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener('mousedown', el._clickOutside)
  }
}

const ZOOM_LABELS: Record<number, string> = { 100: 'Normal', 110: 'Cómodo', 120: 'Grande', 133: 'Muy grande' }
const zoomLabel = computed(() => ZOOM_LABELS[zoomStore.current] ?? 'Normal')

const zoomOpen = ref(false)
function toggleZoom() {
  notifOpen.value = false
  alertsPanelOpen.value = false
  zoomOpen.value = !zoomOpen.value
}
function toggleNotif() {
  zoomOpen.value = false
  alertsPanelOpen.value = false
  notifOpen.value = !notifOpen.value
}
function toggleAlertsPanel() {
  zoomOpen.value = false
  notifOpen.value = false
  alertsPanelOpen.value = !alertsPanelOpen.value
}
function selectZoom(level: typeof ZOOM_LEVELS[number]) {
  zoomStore.set(level)
  zoomOpen.value = false
}

const userInitials = computed(() => {
  const nombre = authStore.user?.nombre ?? ''
  return nombre.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
})

function handleLogout() {
  themeStore.reset()
  zoomStore.reset()
  authStore.logout()
  router.push('/login')
}

// Aplica el tema cada vez que cambia (toggle) o cuando el usuario cambia
watch(() => themeStore.current, () => themeStore.apply(), { immediate: false })

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
  const date = now.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Santiago'
  })
  const time = now.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Santiago'
  })
  currentTime.value = `${time} · ${date}`
}

// Sincronización automática entre tabs: cuando otra pestaña escribe en localStorage,
// re-hidratamos los stores para que el estado sea siempre coherente.
const PERSISTED_KEYS: Record<string, () => void> = {
  'comerciales-dashboard':  () => (dashboardStore as any).$hydrate(),
  'comerciales-inventory':  () => (inventoryStore as any).$hydrate(),
  'comerciales-anulaciones': () => reportesStore.recargarDesdeStorage(),
  'comerciales-usuarios':    () => usersStore.recargarDesdeStorage(),
  'comerciales-turnos':      () => turnosStore.recargarDesdeStorage(),
}

function onStorageChange(event: StorageEvent) {
  if (event.key && PERSISTED_KEYS[event.key]) {
    PERSISTED_KEYS[event.key]()
  }
}

onMounted(() => {
  // Aplica el tema y zoom guardados del usuario actual al entrar al panel
  themeStore.apply()
  zoomStore.apply()
  // Carga silenciosa de alertas desde el estado actual del inventario
  alertsStore.seedFromInventory(inventoryStore.products)
  updateTime()
  const interval = setInterval(updateTime, 1000)
  window.addEventListener('storage', onStorageChange)
  onUnmounted(() => {
    clearInterval(interval)
    window.removeEventListener('storage', onStorageChange)
  })
})
</script>

<style scoped>
.icon-path {
  @apply w-5 h-5;
}
</style>
