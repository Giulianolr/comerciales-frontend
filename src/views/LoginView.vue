<template>
  <div class="min-h-screen bg-canvas flex items-center justify-center px-4 py-12">

    <!-- Card -->
    <div class="w-full max-w-sm">

      <!-- Logo + Branding -->
      <div class="flex flex-col items-center mb-8">
        <div class="w-full h-36 mb-5 rounded-xl overflow-hidden shadow-lg shadow-black/40 bg-white flex items-center justify-center">
          <img :src="'/Optimind_Logo.jpg'" alt="OptiMind Solutions AI" class="h-full w-full object-cover scale-[1.20] origin-center" />
        </div>
        <h1 class="text-xl font-semibold text-primary">Emporio Esperanza</h1>
        <p class="text-sm text-secondary mt-1">Sistema de punto de venta</p>
      </div>

      <!-- Form card -->
      <div class="bg-surface border border-[#2E3348] rounded-2xl p-8">
        <h2 class="text-base font-semibold text-primary mb-6">Iniciar sesión</h2>

        <form @submit.prevent="handleLogin" novalidate>

          <!-- Email -->
          <div class="mb-4">
            <label class="block text-xs font-medium text-secondary mb-1.5" for="email">
              Correo electrónico
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              placeholder="usuario@comerciales.cl"
              :disabled="authStore.isLoading"
              :class="[
                'w-full bg-[#12141C] border rounded-lg px-3.5 py-2.5 text-sm text-primary',
                'placeholder-[#475569] outline-none transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                fieldError && !email ? 'border-red-500/70 focus:border-red-500' : 'border-[#2E3348] focus:border-indigo-500'
              ]"
              @input="authStore.clearError()"
            />
          </div>

          <!-- Password -->
          <div class="mb-5">
            <label class="block text-xs font-medium text-secondary mb-1.5" for="password">
              Contraseña
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="••••••••"
                :disabled="authStore.isLoading"
                :class="[
                  'w-full bg-[#12141C] border rounded-lg px-3.5 py-2.5 text-sm text-primary pr-10',
                  'placeholder-[#475569] outline-none transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  fieldError && !password ? 'border-red-500/70 focus:border-red-500' : 'border-[#2E3348] focus:border-indigo-500'
                ]"
                @input="authStore.clearError()"
              />
              <button
                type="button"
                tabindex="-1"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-secondary transition-colors"
                @click="showPassword = !showPassword"
              >
                <!-- Eye open -->
                <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <!-- Eye closed -->
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Error message -->
          <div
            v-if="authStore.error || fieldError"
            class="mb-4 flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5"
          >
            <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd" />
            </svg>
            {{ fieldError || authStore.error }}
          </div>

          <!-- Submit button -->
          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed
                   text-white font-medium text-sm py-2.5 rounded-lg transition-colors
                   flex items-center justify-center gap-2"
          >
            <svg
              v-if="authStore.isLoading"
              class="w-4 h-4 animate-spin"
              fill="none" viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>{{ authStore.isLoading ? 'Ingresando...' : 'Ingresar' }}</span>
          </button>

        </form>
      </div>

      <!-- Mock hint (solo en dev) -->
      <div v-if="isDev" class="mt-5 bg-[#1A1D27] border border-[#2E3348] rounded-xl p-4 text-xs text-secondary space-y-1">
        <p class="text-[#475569] font-medium mb-2">Credenciales de prueba</p>
        <div class="flex justify-between">
          <span>Admin (dueña)</span>
          <span class="font-mono text-indigo-400">admin@comerciales.cl / admin123</span>
        </div>
        <div class="flex justify-between">
          <span>Cajero (operario)</span>
          <span class="font-mono text-indigo-400">caja@comerciales.cl / caja123</span>
        </div>
        <div class="flex justify-between">
          <span>Supervisor (solo dashboard)</span>
          <span class="font-mono text-indigo-400">supervisor@comerciales.cl / super123</span>
        </div>
        <div class="flex justify-between">
          <span>Dev (acceso total)</span>
          <span class="font-mono text-indigo-400">dev@comerciales.cl / devmaster2024</span>
        </div>
      </div>

      <!-- Footer -->
      <p class="text-[10px] text-muted text-center mt-5">© 2026 OptiMind Solutions AI</p>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const fieldError = ref('')

const isDev = import.meta.env.DEV

async function handleLogin() {
  fieldError.value = ''

  if (!email.value.trim()) {
    fieldError.value = 'Ingresa tu correo electrónico'
    return
  }
  if (!password.value) {
    fieldError.value = 'Ingresa tu contraseña'
    return
  }

  const ok = await authStore.login(email.value, password.value)
  if (ok) {
    router.push(authStore.redirectPathForRole)
  }
}
</script>
