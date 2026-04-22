<template>
  <div class="space-y-6">

    <!-- ─── Header ──────────────────────────────────────────────────────────── -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-primary">Usuarios</h1>
        <p class="text-sm text-muted mt-1">{{ usersStore.users.length }} miembro{{ usersStore.users.length !== 1 ? 's' : '' }} del equipo</p>
      </div>
      <button
        v-if="canEdit"
        @click="abrirCrear"
        class="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Agregar trabajador
      </button>
    </div>

    <!-- ─── Tabla ─────────────────────────────────────────────────────────── -->
    <div class="bg-surface border border-border rounded-xl overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border bg-input">
            <th class="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Usuario</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Cargo</th>
            <th class="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider hidden md:table-cell">Email</th>
            <th class="text-center px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Estado</th>
            <th v-if="canEdit" class="text-center px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-32">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr
            v-for="user in usersStore.users"
            :key="user.id"
            :class="!isUserActive(user.id) ? 'opacity-50' : ''"
            class="hover:bg-surface-2 transition-colors"
          >
            <!-- Avatar + nombre -->
            <td class="px-5 py-3.5">
              <div class="flex items-center gap-3">
                <div
                  class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
                  :class="avatarBg(user.role)"
                >
                  {{ initials(user) }}
                </div>
                <div>
                  <p class="font-medium text-primary leading-tight">
                    {{ user.nombre }}{{ user.apellido ? ' ' + user.apellido : '' }}
                  </p>
                  <p class="text-xs text-muted mt-0.5">
                    {{ user.lastLoginAt ? 'Último acceso ' + tiempoRelativo(user.lastLoginAt) : 'Sin accesos registrados' }}
                  </p>
                </div>
              </div>
            </td>

            <!-- Cargo -->
            <td class="px-4 py-3.5">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                :class="roleBadge(user.role)"
              >
                {{ roleLabel(user.role) }}
              </span>
            </td>

            <!-- Email -->
            <td class="px-4 py-3.5 text-secondary hidden md:table-cell">
              {{ user.email || '—' }}
            </td>

            <!-- Estado -->
            <td class="px-4 py-3.5 text-center">
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                :class="isUserActive(user.id) ? 'bg-green-500/10 text-green-400' : 'bg-surface-2 text-muted'"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="isUserActive(user.id) ? 'bg-green-400' : 'bg-border'"></span>
                {{ isUserActive(user.id) ? 'Activo' : 'Inactivo' }}
              </span>
            </td>

            <!-- Acciones -->
            <td v-if="canEdit" class="px-4 py-3.5 text-center">
              <!-- Confirmación inline al hacer click en papelera -->
              <div v-if="confirmDeleteId === user.id" class="flex items-center justify-center gap-1.5">
                <span class="text-xs text-danger-400 mr-1">¿Eliminar?</span>
                <button
                  @click="eliminar(user)"
                  class="px-2.5 py-1.5 text-xs font-medium text-white bg-danger-500 hover:bg-danger-600 rounded-lg transition-colors"
                >
                  Sí
                </button>
                <button
                  @click="confirmDeleteId = null"
                  class="px-2.5 py-1.5 text-xs font-medium text-secondary hover:text-primary bg-surface-2 hover:bg-border border border-border rounded-lg transition-colors"
                >
                  No
                </button>
              </div>

              <div v-else class="flex items-center justify-center gap-2">
                <button
                  @click="abrirEditar(user)"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-secondary hover:text-primary bg-surface-2 hover:bg-border border border-border rounded-lg transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </button>
                <button
                  @click="confirmDeleteId = user.id"
                  class="inline-flex items-center px-2 py-1.5 text-xs font-medium text-danger-400 hover:text-white hover:bg-danger-500 border border-danger-500/30 rounded-lg transition-colors"
                  title="Eliminar trabajador"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>

          <!-- Estado vacío -->
          <tr v-if="usersStore.users.length === 0">
            <td :colspan="canEdit ? 5 : 4" class="px-5 py-12 text-center text-sm text-muted">
              No hay trabajadores registrados. Agrega el primero con el botón "Agregar trabajador".
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>

  <!-- ─── Modal crear / editar ─────────────────────────────────────────────── -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="modalOpen = false"
      >
        <div class="bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl scale-in">

          <!-- Header modal -->
          <div class="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                :class="avatarBg(form.role)"
              >
                {{ initials({ nombre: form.nombre, apellido: form.apellido }) }}
              </div>
              <div>
                <h3 class="text-base font-semibold text-primary">
                  {{ isCreating ? 'Agregar trabajador' : 'Editar usuario' }}
                </h3>
                <p class="text-xs text-muted">
                  {{ isCreating ? 'Nuevo miembro del equipo' : editingUser?.email }}
                </p>
              </div>
            </div>
            <button @click="modalOpen = false" class="text-muted hover:text-primary transition-colors p-1">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Campos -->
          <div class="px-6 py-5 space-y-4">

            <!-- Nombre + Apellido -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs text-muted uppercase tracking-wider block mb-1.5">Nombre *</label>
                <input
                  v-model="form.nombre"
                  type="text"
                  placeholder="Nombre"
                  class="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-primary
                         outline-none focus:border-brand-500 transition-colors placeholder-muted"
                />
              </div>
              <div>
                <label class="text-xs text-muted uppercase tracking-wider block mb-1.5">Apellido</label>
                <input
                  v-model="form.apellido"
                  type="text"
                  placeholder="Apellido"
                  class="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-primary
                         outline-none focus:border-brand-500 transition-colors placeholder-muted"
                />
              </div>
            </div>

            <!-- Email -->
            <div>
              <label class="text-xs text-muted uppercase tracking-wider block mb-1.5">Correo electrónico</label>
              <input
                v-model="form.email"
                type="email"
                placeholder="correo@ejemplo.cl (opcional)"
                class="w-full bg-input border border-border rounded-lg px-3 py-2.5 text-sm text-primary
                       outline-none focus:border-brand-500 transition-colors placeholder-muted"
              />
            </div>

            <!-- Cargo -->
            <div>
              <label class="text-xs text-muted uppercase tracking-wider block mb-1.5">Cargo</label>
              <div class="flex gap-2 flex-wrap">
                <button
                  v-for="r in rolesDisponibles"
                  :key="r.value"
                  @click="form.role = r.value"
                  :class="form.role === r.value
                    ? r.activeClass
                    : 'bg-surface-2 border-border text-secondary hover:border-brand-500/40 hover:text-primary'"
                  class="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
                >
                  <span class="w-2 h-2 rounded-full shrink-0" :class="r.dot"></span>
                  {{ r.label }}
                </button>
              </div>
            </div>

          </div>

          <!-- Botones -->
          <div class="flex gap-3 px-6 pb-6">
            <button
              @click="modalOpen = false"
              class="flex-1 py-2.5 text-sm text-secondary hover:text-primary bg-surface-2 hover:bg-border rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              @click="guardar"
              :disabled="!form.nombre.trim()"
              class="flex-1 py-2.5 text-sm text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
            >
              {{ isCreating ? 'Agregar' : 'Guardar cambios' }}
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useUsersStore } from '../stores/users.store'
import { useAuthStore } from '../stores/auth.store'
import { useDashboardStore } from '../stores/dashboard.store'
import type { User, UserRole } from '../types'

const usersStore     = useUsersStore()
const authStore      = useAuthStore()
const dashboardStore = useDashboardStore()

function isUserActive(userId: string): boolean {
  return dashboardStore.stations.some(s => s.operatorId === userId)
}

const canEdit = computed(() => authStore.isGerente)

// ─── Modal ────────────────────────────────────────────────────────────────────
const modalOpen       = ref(false)
const isCreating      = ref(false)
const editingUser     = ref<User | null>(null)
const confirmDeleteId = ref<string | null>(null)

const form = reactive({
  nombre:   '',
  apellido: '',
  email:    '',
  role:     'cajero' as UserRole,
})

function resetForm() {
  form.nombre   = ''
  form.apellido = ''
  form.email    = ''
  form.role     = 'cajero'
}

function abrirCrear() {
  isCreating.value  = true
  editingUser.value = null
  resetForm()
  modalOpen.value   = true
}

function abrirEditar(user: User) {
  isCreating.value  = false
  editingUser.value = user
  form.nombre   = user.nombre
  form.apellido = user.apellido
  form.email    = user.email
  form.role     = user.role
  modalOpen.value = true
}

function guardar() {
  if (!form.nombre.trim()) return
  if (isCreating.value) {
    usersStore.addUser({
      nombre:   form.nombre.trim(),
      apellido: form.apellido.trim(),
      email:    form.email.trim(),
      role:     form.role,
    })
  } else if (editingUser.value) {
    usersStore.updateUser(editingUser.value.id, {
      nombre:   form.nombre.trim(),
      apellido: form.apellido.trim(),
      email:    form.email.trim(),
      role:     form.role,
    })
  }
  modalOpen.value = false
}

function eliminar(user: User) {
  usersStore.removeUser(user.id)
  confirmDeleteId.value = null
}

// ─── Roles disponibles para trabajadores ─────────────────────────────────────
const rolesDisponibles = [
  { value: 'cajero'   as UserRole, label: 'Cajero',   dot: 'bg-sky-400',   activeClass: 'bg-sky-500/10  border-sky-500/40  text-sky-400'  },
  { value: 'vendor'   as UserRole, label: 'Vendor',   dot: 'bg-amber-400', activeClass: 'bg-amber-500/10 border-amber-500/40 text-amber-400' },
]

function roleLabel(role: UserRole): string {
  const map: Record<UserRole, string> = {
    gerente: 'Gerente', supervisor: 'Supervisor',
    cajero: 'Cajero', operador: 'Operador', vendor: 'Vendor', dev: 'Dev'
  }
  return map[role] ?? role
}

function roleBadge(role: UserRole): string {
  const map: Record<UserRole, string> = {
    gerente:    'bg-indigo-500/10 text-indigo-400',
    supervisor: 'bg-violet-500/10 text-violet-400',
    cajero:     'bg-sky-500/10    text-sky-400',
    operador:   'bg-teal-500/10   text-teal-400',
    vendor:     'bg-amber-500/10  text-amber-400',
    dev:        'bg-orange-500/10 text-orange-400',
  }
  return map[role] ?? 'bg-surface-2 text-muted'
}

function avatarBg(role: UserRole): string {
  const map: Record<UserRole, string> = {
    gerente:    'bg-indigo-600',
    supervisor: 'bg-violet-600',
    cajero:     'bg-sky-600',
    operador:   'bg-teal-600',
    vendor:     'bg-amber-600',
    dev:        'bg-orange-600',
  }
  return map[role] ?? 'bg-surface-2'
}

function initials(user: { nombre: string; apellido: string }): string {
  const n = (user.nombre?.[0] ?? '').toUpperCase()
  const a = (user.apellido?.[0] ?? '').toUpperCase()
  return n + a || '?'
}

function tiempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min  = Math.floor(diff / 60000)
  if (min < 1)   return 'hace un momento'
  if (min < 60)  return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24)    return `hace ${h}h`
  const d = Math.floor(h / 24)
  return `hace ${d} día${d !== 1 ? 's' : ''}`
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
