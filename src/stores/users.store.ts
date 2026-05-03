import { defineStore } from 'pinia'
import { ref } from 'vue'
import { acceptHMRUpdate } from 'pinia'
import type { User } from '../types'

const STORAGE_KEY = 'comerciales-usuarios'

const MOCK_USERS: User[] = [
  {
    id: 'u1', rut: '12.345.678-9', name: 'Ana', last_name: 'López',
    email: 'admin@comerciales.cl', role: 'gerente', is_active: true,
    assigned_station_id: null, last_login_at: new Date().toISOString(), created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 'u2', rut: '11.222.333-4', name: 'Carlos', last_name: 'Martínez',
    email: 'supervisor@comerciales.cl', role: 'supervisor', is_active: true,
    assigned_station_id: null, last_login_at: new Date(Date.now() - 3600000).toISOString(), created_at: '2025-01-15T00:00:00Z'
  },
  {
    id: 'u3', rut: '22.333.444-5', name: 'Operario', last_name: '',
    email: 'caja@comerciales.cl', role: 'cajero', is_active: true,
    assigned_station_id: 5, last_login_at: new Date(Date.now() - 7200000).toISOString(), created_at: '2025-02-01T00:00:00Z'
  },
  {
    id: 'u4', rut: '33.444.555-6', name: 'María', last_name: 'González',
    email: 'maria.gonzalez@comerciales.cl', role: 'operador', is_active: true,
    assigned_station_id: null, last_login_at: new Date(Date.now() - 86400000).toISOString(), created_at: '2025-02-15T00:00:00Z'
  },
  {
    id: 'u5', rut: '44.555.666-7', name: 'Pedro', last_name: 'Rojas',
    email: 'pedro.rojas@comerciales.cl', role: 'operador', is_active: true,
    assigned_station_id: null, last_login_at: null, created_at: '2025-03-01T00:00:00Z'
  },
  {
    id: 'u6', rut: '55.666.777-8', name: 'Laura', last_name: 'Silva',
    email: 'laura.silva@comerciales.cl', role: 'cajero', is_active: false,
    assigned_station_id: null, last_login_at: null, created_at: '2025-03-15T00:00:00Z'
  },
]

function cargarUsuarios(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Formato nuevo: array directo
      if (Array.isArray(parsed)) return parsed
      // Formato viejo de pinia-plugin-persistedstate: { users: [...] }
      if (parsed && Array.isArray(parsed.users)) return parsed.users
    }
  } catch {}
  return [...MOCK_USERS]
}

function persistirUsuarios(u: User[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>(cargarUsuarios())

  function updateUser(id: string, changes: Partial<Pick<User, 'name' | 'last_name' | 'email' | 'phone' | 'role'>>) {
    const fresh = cargarUsuarios().map(u => u.id === id ? { ...u, ...changes } : u)
    persistirUsuarios(fresh)
    users.value = fresh
  }

  function addUser(data: Pick<User, 'name' | 'last_name' | 'email' | 'phone' | 'role'>) {
    const newUser: User = {
      id: `u${Date.now()}`,
      rut: null,
      name: data.name,
      last_name: data.last_name ?? null,
      email: data.email,
      phone: data.phone ?? '',
      role: data.role,
      is_active: true,
      assigned_station_id: null,
      last_login_at: null,
      created_at: new Date().toISOString()
    }
    const fresh = [...cargarUsuarios(), newUser]
    persistirUsuarios(fresh)
    users.value = fresh
  }

  function removeUser(id: string) {
    const fresh = cargarUsuarios().filter(u => u.id !== id)
    persistirUsuarios(fresh)
    users.value = fresh
  }

  function recargarDesdeStorage() {
    users.value = cargarUsuarios()
  }

  return { users, updateUser, addUser, removeUser, recargarDesdeStorage }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUsersStore, import.meta.hot))
}
