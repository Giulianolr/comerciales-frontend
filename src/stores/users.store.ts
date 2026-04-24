import { defineStore } from 'pinia'
import { ref } from 'vue'
import { acceptHMRUpdate } from 'pinia'
import type { User, UserRole } from '../types'

const STORAGE_KEY = 'comerciales-usuarios'

const MOCK_USERS: User[] = [
  {
    id: 'u1', rut: '12.345.678-9', nombre: 'Ana', apellido: 'López',
    email: 'admin@comerciales.cl', role: 'gerente', isActive: true,
    assignedStationId: null, lastLoginAt: new Date().toISOString(), createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'u2', rut: '11.222.333-4', nombre: 'Carlos', apellido: 'Martínez',
    email: 'supervisor@comerciales.cl', role: 'supervisor', isActive: true,
    assignedStationId: null, lastLoginAt: new Date(Date.now() - 3600000).toISOString(), createdAt: '2025-01-15T00:00:00Z'
  },
  {
    id: 'u3', rut: '22.333.444-5', nombre: 'Operario', apellido: '',
    email: 'caja@comerciales.cl', role: 'cajero', isActive: true,
    assignedStationId: 5, lastLoginAt: new Date(Date.now() - 7200000).toISOString(), createdAt: '2025-02-01T00:00:00Z'
  },
  {
    id: 'u4', rut: '33.444.555-6', nombre: 'María', apellido: 'González',
    email: 'maria.gonzalez@comerciales.cl', role: 'vendor', isActive: true,
    assignedStationId: null, lastLoginAt: new Date(Date.now() - 86400000).toISOString(), createdAt: '2025-02-15T00:00:00Z'
  },
  {
    id: 'u5', rut: '44.555.666-7', nombre: 'Pedro', apellido: 'Rojas',
    email: 'pedro.rojas@comerciales.cl', role: 'vendor', isActive: true,
    assignedStationId: null, lastLoginAt: null, createdAt: '2025-03-01T00:00:00Z'
  },
  {
    id: 'u6', rut: '55.666.777-8', nombre: 'Laura', apellido: 'Silva',
    email: 'laura.silva@comerciales.cl', role: 'cajero', isActive: false,
    assignedStationId: null, lastLoginAt: null, createdAt: '2025-03-15T00:00:00Z'
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

  function updateUser(id: string, changes: Partial<Pick<User, 'nombre' | 'apellido' | 'email' | 'telefono' | 'role'>>) {
    const fresh = cargarUsuarios().map(u => u.id === id ? { ...u, ...changes } : u)
    persistirUsuarios(fresh)
    users.value = fresh
  }

  function addUser(data: Pick<User, 'nombre' | 'apellido' | 'email' | 'telefono' | 'role'>) {
    const newUser: User = {
      id: `u${Date.now()}`,
      rut: '',
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      telefono: data.telefono ?? '',
      role: data.role,
      isActive: true,
      assignedStationId: null,
      lastLoginAt: null,
      createdAt: new Date().toISOString()
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
