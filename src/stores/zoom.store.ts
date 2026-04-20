import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth.store'

export type ZoomLevel = 100 | 110 | 120 | 133

export const ZOOM_LEVELS: ZoomLevel[] = [100, 110, 120, 133]

export const useZoomStore = defineStore('zoom', () => {
  const preferences = ref<Record<string, ZoomLevel>>({})

  const authStore = useAuthStore()
  const userId = computed(() => authStore.user?.id ?? '_guest')
  const current = computed((): ZoomLevel => preferences.value[userId.value] ?? 100)

  function set(level: ZoomLevel) {
    preferences.value[userId.value] = level
    apply()
  }

  function apply() {
    document.documentElement.style.fontSize = current.value === 100
      ? ''
      : `${current.value}%`
  }

  function reset() {
    document.documentElement.style.fontSize = ''
  }

  return { preferences, current, set, apply, reset }
}, {
  persist: {
    key: 'comerciales-zoom',
    paths: ['preferences']
  }
})
