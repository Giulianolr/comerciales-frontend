<template>
  <div class="h-full flex fade-in">

    <!-- Panel izquierdo: resumen items -->
    <div class="flex-1 flex flex-col overflow-hidden border-r border-border">
      <div class="flex items-center justify-between px-5 py-3 border-b border-border bg-surface shrink-0">
        <span class="text-xs text-secondary">
          {{ cajaStore.tabActivo?.preBoleta.balanzaNombre }} · {{ cajaStore.items.length }} ítems
        </span>
        <button
          @click="cajaStore.irA('active')"
          class="text-xs text-muted hover:text-secondary transition-colors flex items-center gap-1"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>
      </div>

      <div class="flex-1 overflow-y-auto">
        <table class="w-full">
          <thead class="sticky top-0 bg-surface">
            <tr class="border-b border-border">
              <th class="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Producto</th>
              <th class="text-right px-3 py-3 text-xs font-medium text-muted uppercase tracking-wider">Cant.</th>
              <th class="text-right px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in cajaStore.items"
              :key="item.id"
              class="border-b border-border"
            >
              <td class="px-5 py-3 text-sm text-primary">{{ item.name }}</td>
              <td class="px-3 py-3 text-right text-sm text-secondary">
                {{ item.unit === 'kg' ? item.qty.toFixed(3) + ' kg' : item.qty + ' UN' }}
              </td>
              <td class="px-5 py-3 text-right text-sm font-semibold text-primary">
                ${{ Math.round(item.qty * item.priceUnit).toLocaleString('es-CL') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Panel derecho: cobro efectivo -->
    <div class="w-72 flex flex-col bg-surface shrink-0">
      <div class="flex-1 p-5 flex flex-col gap-5">

        <!-- Total -->
        <div>
          <p class="text-xs text-muted uppercase tracking-wider mb-3">Total</p>
          <div class="pt-3 border-t border-border flex justify-between items-baseline">
            <span class="text-sm text-secondary">Total</span>
            <span class="text-2xl font-bold text-primary">${{ cajaStore.total.toLocaleString('es-CL') }}</span>
          </div>
        </div>

        <!-- Método (permite cambiar) -->
        <div>
          <p class="text-xs text-muted uppercase tracking-wider mb-2">Método</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="m in metodos"
              :key="m.key"
              @click="cajaStore.setMetodoPago(m.key as any)"
              :class="cajaStore.metodoPago === m.key ? 'active' : ''"
              class="btn-pay-method border rounded-lg px-3 py-2.5 text-xs font-medium text-left"
            >
              <div class="text-base mb-0.5">{{ m.emoji }}</div>
              {{ m.label }}
            </button>
          </div>
        </div>

        <!-- Monto recibido + vuelto -->
        <div class="space-y-3 slide-up">
          <div>
            <p class="text-xs text-muted mb-1.5">Monto recibido</p>
            <input
              type="number"
              :value="cajaStore.montoRecibido"
              @input="e => cajaStore.setMontoRecibido(Number((e.target as HTMLInputElement).value))"
              class="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-primary text-right focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>
          <div class="flex gap-1.5 flex-wrap">
            <button v-for="v in [5000, 10000, 20000, 50000]" :key="v"
              @click="cajaStore.setMontoRecibido(v)"
              class="cash-quick">
              ${{ v.toLocaleString('es-CL') }}
            </button>
            <button @click="cajaStore.setMontoRecibido(cajaStore.total)" class="cash-quick exact">
              Exacto
            </button>
          </div>
          <div class="bg-surface-2 rounded-lg p-3 flex justify-between items-center">
            <span class="text-xs text-muted">Vuelto</span>
            <span
              class="text-xl font-bold"
              :class="cajaStore.vuelto < 0 ? 'text-danger-400' : 'text-success-400'"
            >
              {{ cajaStore.vuelto < 0 ? '−' : '' }}${{ Math.abs(cajaStore.vuelto).toLocaleString('es-CL') }}
            </span>
          </div>
        </div>
      </div>

      <!-- Cobrar -->
      <div class="p-4 border-t border-border">
        <button
          @click="cajaStore.procesarCobro()"
          :disabled="cajaStore.vuelto < 0"
          class="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-4 text-sm transition-colors"
        >
          Cobrar ${{ cajaStore.total.toLocaleString('es-CL') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCajaStore } from '../../stores/caja.store'

const cajaStore = useCajaStore()

const metodos = [
  { key: 'efectivo',      emoji: '💵', label: 'Efectivo'  },
  { key: 'debito',        emoji: '💳', label: 'Débito'    },
  { key: 'credito',       emoji: '💳', label: 'Crédito'   },
  { key: 'transferencia', emoji: '🏦', label: 'Transfer.' },
]
</script>
