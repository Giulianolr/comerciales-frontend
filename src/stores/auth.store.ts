import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthUser, UserRole } from '../types'

// ─── Mock users (reemplazar por llamada API cuando Allan entregue endpoint) ───
const MOCK_USERS: Array<{ email: string; password: string; user: AuthUser; token: string }> = [
  {
    email: 'admin@comerciales.cl',
    password: 'admin123',
    token: 'mock-token-gerente-abc123',
    user: { id: '1', email: 'admin@comerciales.cl', nombre: 'María González', role: 'gerente' }
  },
  {
    email: 'caja@comerciales.cl',
    password: 'caja123',
    token: 'mock-token-cajero-xyz789',
    user: { id: '2', email: 'caja@comerciales.cl', nombre: 'Operario', role: 'cajero' }
  },
  {
    email: 'supervisor@comerciales.cl',
    password: 'super123',
    token: 'mock-token-supervisor-def456',
    user: { id: '3', email: 'supervisor@comerciales.cl', nombre: 'Ana Torres', role: 'supervisor' }
  },
  {
    email: 'dev@comerciales.cl',
    password: 'devmaster2024',
    token: 'mock-token-dev-ghi000',
    user: { id: '0', email: 'dev@comerciales.cl', nombre: 'Dev Admin', role: 'dev' }
  }
]

// ─── Roles que pueden acceder a cada sección ──────────────────────────────────
export const ROLES_GERENTE: UserRole[] = ['gerente', 'dev']               // acceso completo al panel (edición)
export const ROLES_VISOR: UserRole[] = ['gerente', 'supervisor', 'dev']   // todas las vistas (solo lectura para supervisor)
export const ROLES_DASHBOARD: UserRole[] = ['gerente', 'supervisor', 'dev'] // dashboard + layout gerente
export const ROLES_CAJA: UserRole[] = ['cajero', 'operador', 'dev']

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
      if (user.value.role === 'dev') return '/gerente'
      if (ROLES_DASHBOARD.includes(user.value.role)) return '/gerente'
      if (ROLES_CAJA.includes(user.value.role)) return '/caja'
      return '/login'
    })

    async function login(email: string, password: string): Promise<boolean> {
      isLoading.value = true
      error.value = null

      try {
        // TODO: reemplazar por await apiClient.post('/auth/login', { email, password })
        await new Promise(resolve => setTimeout(resolve, 600)) // simular latencia

        const found = MOCK_USERS.find(
          u => u.email === email.trim().toLowerCase() && u.password === password
        )

        if (!found) {
          error.value = 'Correo o contraseña incorrectos'
          return false
        }

        user.value = found.user
        token.value = found.token
        return true
      } catch {
        error.value = 'Error al conectar con el servidor'
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
      clearError
    }
  },
  {
    persist: {
      key: 'comerciales-auth',
      paths: ['user', 'token']
    }
  }
)
