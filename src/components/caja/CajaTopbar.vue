<template>
  <header class="h-12 bg-surface border-b border-border flex items-center justify-between px-5 shrink-0 z-50">
    <!-- Izquierda: nombre caja + cajero -->
    <div class="flex items-center gap-3">
      <div class="w-7 h-7 rounded-md bg-brand-500 flex items-center justify-center">
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <span class="font-semibold text-primary text-sm">Caja Principal</span>
      <span class="text-muted text-sm">/</span>
      <span class="text-brand-400 text-sm">Operario</span>
      <span class="text-muted text-sm">/</span>
      <span class="text-brand-400 text-sm">{{ operadorNombre }}</span>
    </div>

    <!-- Derecha: estado conexión, sync badge, reloj, toggle tema, avatar, logout -->
    <div class="flex items-center gap-5">
      <!-- Botón conexión -->
      <button @click="cajaStore.toggleOffline()"
        :class="cajaStore.offline
          ? 'border-danger-500/30 text-danger-400 hover:bg-danger-500/10'
          : 'border-success-500/30 text-success-400 hover:bg-success-500/10'"
        class="flex items-center gap-1.5 text-xs px-2 py-1 rounded border transition-colors">
        <div :class="cajaStore.offline ? 'bg-danger-500' : 'bg-success-500 blink'"
          class="w-1.5 h-1.5 rounded-full"></div>
        <span>{{ cajaStore.offline ? 'Sin conexión' : 'En línea' }}</span>
      </button>

      <!-- Badge items por sincronizar -->
      <div v-if="cajaStore.offline" class="flex items-center gap-1.5 text-xs text-warning-400">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>2 por sincronizar</span>
      </div>

      <!-- Theme Toggle -->
      <button
        @click="themeStore.toggle()"
        :title="themeStore.current === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
        class="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-surface-2 transition-colors"
      >
        <svg v-if="themeStore.current === 'dark'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>

      <!-- Zoom Dropdown -->
      <div class="relative">
        <button
          @click="zoomOpen = !zoomOpen"
          title="Zoom de pantalla"
          class="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-secondary hover:text-primary hover:bg-surface-2 transition-colors"
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

        <div
          v-if="zoomOpen"
          v-click-outside="() => { zoomOpen = false }"
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
            <span>{{ ZOOM_LABELS[level] }}</span>
            <span class="font-mono text-muted">{{ level }}%</span>
          </button>
        </div>
      </div>

      <!-- Reloj -->
      <div class="text-xs text-secondary font-mono">{{ hora }}</div>

      <!-- Avatar dropdown -->
      <div class="relative">
        <button
          @click="toggleAvatarMenu"
          class="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-semibold hover:bg-brand-600 transition-colors"
          title="Opciones de operario"
        >
          {{ iniciales }}
        </button>

        <div
          v-if="avatarMenuOpen"
          v-click-outside="() => { avatarMenuOpen = false }"
          class="absolute right-0 top-full mt-1.5 w-48 bg-surface border border-border rounded-xl shadow-lg py-1 z-50"
        >
          <button
            @click="openAsignacion"
            class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-secondary hover:text-primary hover:bg-surface-2 transition-colors text-left"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Asignación de balanza</span>
          </button>
        </div>
      </div>

      <ModalAsignacionBalanza v-model="showAsignacion" />

      <!-- Logout -->
      <button
        @click="handleLogout"
        title="Cerrar sesión"
        class="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCajaStore } from '../../stores/caja.store'
import { useAuthStore } from '../../stores/auth.store'
import { useDashboardStore } from '../../stores/dashboard.store'
import { useThemeStore } from '../../stores/theme.store'
import { useZoomStore, ZOOM_LEVELS } from '../../stores/zoom.store'
import ModalAsignacionBalanza from './ModalAsignacionBalanza.vue'

const cajaStore = useCajaStore()
const authStore = useAuthStore()
const dashboardStore = useDashboardStore()

const operadorNombre = computed(() => {
  const cajaStation = dashboardStore.stations.find(s => s.type === 'caja')
  return cajaStation?.operatorName ?? authStore.user?.nombre ?? '—'
})
const themeStore = useThemeStore()
const zoomStore = useZoomStore()
const router = useRouter()

const ZOOM_LABELS: Record<number, string> = { 100: 'Normal', 110: 'Cómodo', 120: 'Grande', 133: 'Muy grande' }
const zoomLabel = computed(() => ZOOM_LABELS[zoomStore.current] ?? 'Normal')

const zoomOpen = ref(false)
function selectZoom(level: typeof ZOOM_LEVELS[number]) {
  zoomStore.set(level)
  zoomOpen.value = false
}

const avatarMenuOpen = ref(false)
const showAsignacion = ref(false)

function toggleAvatarMenu() {
  zoomOpen.value = false
  avatarMenuOpen.value = !avatarMenuOpen.value
}

function openAsignacion() {
  avatarMenuOpen.value = false
  showAsignacion.value = true
}

// Directiva local click-outside
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

const iniciales = computed(() => {
  const nombre = authStore.user?.nombre ?? ''
  return nombre.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() || '?'
})

function handleLogout() {
  themeStore.reset()
  zoomStore.reset()
  authStore.logout()
  router.push('/login')
}

// Aplica tema y zoom al entrar a la caja y cuando cambian
onMounted(() => { themeStore.apply(); zoomStore.apply() })
watch(() => themeStore.current, () => themeStore.apply())

const hora = ref('')

function actualizarHora() {
  const now = new Date()
  const time = now.toLocaleTimeString('es-CL', {
    hour: '2-digit', minute: '2-digit',
    hour12: false,
    timeZone: 'America/Santiago'
  })
  const date = now.toLocaleDateString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    timeZone: 'America/Santiago'
  })
  hora.value = `${time} · ${date}`
}

let intervalo: ReturnType<typeof setInterval>

onMounted(() => {
  actualizarHora()
  intervalo = setInterval(actualizarHora, 1000)
})

onUnmounted(() => clearInterval(intervalo))
</script>
