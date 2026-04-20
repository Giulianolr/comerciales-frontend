import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth.store'

export type Theme = 'dark' | 'light'

export const useThemeStore = defineStore('theme', () => {
  // Persistido: mapa de userId → preferencia de tema (independiente por cuenta)
  const preferences = ref<Record<string, Theme>>({})

  const authStore = useAuthStore()

  const userId = computed(() => authStore.user?.id ?? '_guest')

  const current = computed((): Theme => preferences.value[userId.value] ?? 'dark')

  function toggle() {
    preferences.value[userId.value] = current.value === 'dark' ? 'light' : 'dark'
    apply()
  }

  function apply() {
    if (current.value === 'light') {
      document.documentElement.classList.add('theme-light')
    } else {
      document.documentElement.classList.remove('theme-light')
    }
  }

  function reset() {
    document.documentElement.classList.remove('theme-light')
  }

  return { preferences, current, toggle, apply, reset }
}, {
  persist: {
    key: 'comerciales-theme',
    paths: ['preferences']
  }
})
