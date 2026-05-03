import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthUser, AuthToken, UserRole } from '../types'
import api from '../api'

// ─── Roles que pueden acceder a cada sección ──────────────────────────────────
export const ROLES_GERENTE: UserRole[] = ['gerente']
export const ROLES_VISOR: UserRole[] = ['gerente', 'supervisor']
export const ROLES_DASHBOARD: UserRole[] = ['gerente', 'supervisor']
export const ROLES_CAJA: UserRole[] = ['cajero', 'operador']

export const useAuthStore = defineStore(
  'auth',
  () => {
    const user = ref<AuthUser | null>(null)
    const token = ref<string | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const isAuthenticated = computed(() => !!token.value && !!user.value)
    const isGerente = computed(() => !!user.value && ROLES_GERENTE.includes(user.value.role))
    const isCajero = computed(() => !!user.value && ROLES_CAJA.includes(user.value.role))

    const redirectPathForRole = computed((): string => {
      if (!user.value) return '/login'
      if (ROLES_DASHBOARD.includes(user.value.role)) return '/gerente'
      if (ROLES_CAJA.includes(user.value.role)) return '/caja'
      return '/login'
    })

    async function login(email: string, password: string): Promise<boolean> {
      isLoading.value = true
      error.value = null
      try {
        const { data } = await api.post<AuthToken>('/auth/login', { email, password })
        token.value = data.access_token
        user.value = data.user
        return true
      } catch (err: any) {
        error.value = err.response?.data?.detail ?? 'Error al conectar con el servidor'
        return false
      } finally {
        isLoading.value = false
      }
    }

    function logout() {
      user.value = null
      token.value = null
      error.value = null
    }

    function clearError() {
      error.value = null
    }

    return {
      user,
      token,
      isLoading,
      error,
      isAuthenticated,
      isGerente,
      isCajero,
      redirectPathForRole,
      login,
      logout,
      clearError,
    }
  },
  {
    persist: {
      key: 'comerciales-auth',
      paths: ['user', 'token'],
      storage: sessionStorage,
    },
  }
)
