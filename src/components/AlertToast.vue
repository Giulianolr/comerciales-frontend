<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-4 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-2 opacity-0"
  >
    <div
      class="flex items-center gap-3 w-72 rounded-xl border shadow-xl cursor-pointer select-none pl-3"
      :class="containerClass"
      @click="handleClick"
    >
      <!-- Ícono severidad -->
      <div class="shrink-0">
        <svg v-if="toast.severity === 'critical'" class="w-4 h-4" :class="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <svg v-else-if="toast.severity === 'error'" class="w-4 h-4" :class="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <svg v-else class="w-4 h-4" :class="iconClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>

      <!-- Contenido -->
      <div class="flex-1 min-w-0 py-3">
        <p class="text-xs font-semibold" :class="titleClass">{{ toast.title }}</p>
        <p class="text-xs font-medium truncate" :class="subtitleClass">{{ toast.subtitle }}</p>
        <p class="text-xs mt-0.5" :class="detailClass">{{ toast.detail }}</p>
      </div>

      <!-- Cerrar -->
      <button
        @click.stop="$emit('dismiss', toast.id)"
        class="mr-2 shrink-0 p-1 rounded transition-colors"
        :class="closeClass"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '../stores/theme.store'
import { useAlertsStore, type ToastAlert } from '../stores/alerts.store'

const props = defineProps<{ toast: ToastAlert }>()
const emit = defineEmits<{ dismiss: [id: string] }>()

const themeStore = useThemeStore()
const alertsStore = useAlertsStore()
const router = useRouter()
const isDark = computed(() => themeStore.current === 'dark')

function handleClick() {
  alertsStore.markRead(props.toast.id)
  emit('dismiss', props.toast.id)
  // Forzar navegación aunque ya estemos en la misma ruta (mismo sku)
  const dest = props.toast.navigateTo.includes('?sku=')
    ? props.toast.navigateTo + '&_t=' + Date.now()
    : props.toast.navigateTo
  router.push(dest)
}

// Contraste invertido según tema:
// - Tema oscuro  → toast claro (fondo blanco/gris claro, texto oscuro)
// - Tema claro   → toast oscuro (fondo gris oscuro, texto claro)
const containerClass = computed(() =>
  isDark.value
    ? 'bg-gray-50 border-gray-200'
    : 'bg-gray-900 border-gray-700'
)

const iconClass = computed(() => {
  if (props.toast.severity === 'critical') return 'text-red-500'
  if (props.toast.severity === 'error')    return 'text-orange-500'
  return 'text-yellow-500'
})

const titleClass = computed(() => {
  const color = props.toast.severity === 'critical' ? 'text-red-600'
              : props.toast.severity === 'error'    ? 'text-orange-600'
              : 'text-yellow-600'
  return isDark.value ? color : color.replace('-600', '-400')
})

const subtitleClass = computed(() =>
  isDark.value ? 'text-gray-800' : 'text-gray-100'
)

const detailClass = computed(() =>
  isDark.value ? 'text-gray-500' : 'text-gray-400'
)

const closeClass = computed(() =>
  isDark.value
    ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700'
)
</script>
