import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  empleado: { codEmpleado: number; nombre: string; nivel: number } | null
  setAuth: (token: string, empleado: AuthState['empleado']) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      empleado: null,
      setAuth: (token, empleado) => set({ token, empleado }),
      logout: () => set({ token: null, empleado: null }),
    }),
    { name: 'erp-auth' }
  )
)
