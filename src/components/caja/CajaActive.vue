<template>
  <div class="h-full flex fade-in">

    <!-- ── Panel izquierdo: lista de ítems ── -->
    <div class="flex-1 flex flex-col overflow-hidden border-r border-border">

      <!-- Header de la pre-boleta -->
      <div class="flex items-center justify-between px-5 py-3 border-b border-border bg-surface shrink-0">
        <div class="flex items-center gap-2 text-xs flex-wrap">
          <span class="text-muted">Pre-boleta</span>
          <span class="font-mono text-secondary">{{ cajaStore.tabActivo?.preBoleta.id }}</span>
          <span class="text-muted">·</span>
          <span class="text-secondary">{{ cajaStore.tabActivo?.preBoleta.balanzaNombre }}</span>
          <span class="text-muted">·</span>
          <span class="text-muted">{{ cajaStore.tabActivo?.preBoleta.creadaHace }}</span>

          <!-- Badge "Unidas" -->
          <span
            v-if="cajaStore.esMerged"
            class="flex items-center gap-1 ml-1 px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Unidas × {{ cajaStore.mergedCount }}
          </span>
        </div>

        <div class="flex items-center gap-3">
          <!-- Split button: [Unir pre-boleta] [▼ desplegable] -->
          <div v-if="cajaStore.otrosTabs.length > 0" class="relative flex" v-click-outside="() => showPicker = false">

            <!-- Parte principal: si hay 1 tab → abre modal directo; si varios → abre picker -->
            <button
              @click.stop="cajaStore.otrosTabs.length === 1
                ? cajaStore.abrirModalScan(cajaStore.otrosTabs[0].tabId)
                : (showPicker = !showPicker)"
              class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-l-lg border border-r-0 border-brand-500/30 text-brand-400 hover:bg-brand-500/10 hover:border-brand-500 transition-colors"
            >
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Unir pre-boleta
            </button>

            <!-- Flecha: siempre visible, siempre abre el picker -->
            <button
              @click.stop="showPicker = !showPicker"
              class="flex items-center px-2 py-1.5 rounded-r-lg border border-brand-500/30 text-brand-400 hover:bg-brand-500/10 hover:border-brand-500 transition-colors"
              title="Ver pre-boletas disponibles"
            >
              <svg class="w-3.5 h-3.5 transition-transform" :class="showPicker ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown: lista de pre-boletas disponibles -->
            <div
              v-if="showPicker"
              class="absolute top-full left-0 mt-1 z-20 bg-surface border border-border rounded-xl shadow-xl overflow-hidden min-w-[220px]"
            >
              <p class="text-xs text-muted px-3 pt-3 pb-1.5 font-medium uppercase tracking-wider">
                Pre-boletas disponibles
              </p>
              <button
                v-for="tab in cajaStore.otrosTabs"
                :key="tab.tabId"
                @click.stop="cajaStore.abrirModalScan(tab.tabId); showPicker = false"
                class="w-full flex items-center justify-between px-3 py-2.5 hover:bg-surface-2 transition-colors text-left border-t border-border"
              >
                <div>
                  <p class="text-xs font-medium text-primary">{{ tab.preBoleta.balanzaNombre }}</p>
                  <p class="text-xs text-muted">
                    {{ tab.preBoleta.items.length }} ítem{{ tab.preBoleta.items.length !== 1 ? 's' : '' }}
                    · {{ tab.preBoleta.creadaHace }}
                  </p>
                </div>
                <span class="text-xs font-semibold text-brand-400 ml-3 shrink-0">
                  ${{ tab.preBoleta.items.reduce((s, i) => s + Math.round(i.qty * i.priceUnit), 0).toLocaleString('es-CL') }}
                </span>
              </button>
            </div>
          </div>

          <!-- Cancelar venta -->
          <button
            @click="cajaStore.irA('idle')"
            class="text-xs text-muted hover:text-danger-400 transition-colors flex items-center gap-1"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancelar
          </button>
        </div>
      </div>

      <!-- Tabla de ítems -->
      <div class="flex-1 overflow-y-auto" ref="itemsWrap">
        <table class="w-full">
          <thead class="sticky top-0 bg-surface z-10">
            <tr class="border-b border-border">
              <th class="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Producto</th>
              <th class="text-right px-3 py-3 text-xs font-medium text-muted uppercase tracking-wider">Cant.</th>
              <th class="text-right px-3 py-3 text-xs font-medium text-muted uppercase tracking-wider">P/U</th>
              <th class="text-right px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Total</th>
              <th class="w-10"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in cajaStore.items"
              :key="item.id"
              class="border-b border-border hover:bg-surface-2 transition-colors group"
            >
              <td class="px-5 py-4">
                <p class="text-sm font-medium text-primary">{{ item.name }}</p>
                <p class="text-xs text-muted">{{ item.supplier }}</p>
              </td>
              <td class="px-3 py-4 text-right text-sm text-secondary">
                {{ item.unit === 'kg'
                  ? item.qty.toFixed(3) + ' kg'
                  : item.qty + ' ' + item.unit }}
              </td>
              <td class="px-3 py-4 text-right text-sm text-secondary">
                ${{ item.priceUnit.toLocaleString('es-CL') }}{{ item.unit === 'kg' ? '/kg' : '/un' }}
              </td>
              <td class="px-5 py-4 text-right text-sm font-semibold text-primary">
                ${{ Math.round(item.qty * item.priceUnit).toLocaleString('es-CL') }}
              </td>
              <td class="pr-3 py-4">
                <button
                  @click="cajaStore.abrirModalEdit(item.id)"
                  class="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-brand-500/10 text-muted hover:text-brand-400 transition-all"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer agregar producto -->
      <div class="shrink-0 border-t border-border p-4">
        <button class="flex items-center gap-2 text-xs text-brand-400 hover:text-brand-300 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Agregar producto (escanea código o busca)
        </button>
      </div>
    </div>

    <!-- ── Panel derecho: cobro ── -->
    <div class="w-72 flex flex-col bg-surface shrink-0">
      <div class="flex-1 p-5 flex flex-col gap-5 overflow-y-auto">

        <!-- Resumen -->
        <div>
          <p class="text-xs text-muted uppercase tracking-wider mb-3">Resumen</p>
          <div class="space-y-1.5">
            <div class="flex justify-between text-sm">
              <span class="text-secondary">Subtotal</span>
              <span class="text-primary">${{ cajaStore.neto.toLocaleString('es-CL') }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-secondary">IVA 19%</span>
              <span class="text-primary">${{ cajaStore.iva.toLocaleString('es-CL') }}</span>
            </div>
          </div>
          <div class="mt-3 pt-3 border-t border-border flex justify-between items-baseline">
            <span class="text-sm text-secondary">Total</span>
            <span class="text-2xl font-bold text-primary">${{ cajaStore.total.toLocaleString('es-CL') }}</span>
          </div>
          <div class="text-xs text-muted text-right mt-1">{{ cajaStore.items.length }} ítems</div>
        </div>

        <!-- Método de pago -->
        <div>
          <p class="text-xs text-muted uppercase tracking-wider mb-2">Método de pago</p>
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

        <!-- Panel vuelto (solo efectivo en vista active) -->
        <div v-if="cajaStore.metodoPago === 'efectivo'" class="space-y-3 slide-up">
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
            <span class="text-lg font-bold text-success-400">
              ${{ cajaStore.vuelto.toLocaleString('es-CL') }}
            </span>
          </div>
        </div>

      </div>

      <!-- Botón cobrar -->
      <div class="p-4 border-t border-border shrink-0">
        <button
          @click="cajaStore.procesarCobro()"
          class="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl py-4 text-sm transition-colors flex items-center justify-center gap-2"
        >
          Cobrar ${{ cajaStore.total.toLocaleString('es-CL') }}
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCajaStore } from '../../stores/caja.store'

const cajaStore = useCajaStore()
const showPicker = ref(false)

// Directiva para cerrar el picker al hacer click fuera
interface ClickOutsideEl extends HTMLElement { _clickOutside?: (e: Event) => void }
const vClickOutside = {
  mounted(el: ClickOutsideEl, binding: { value: () => void }) {
    el._clickOutside = (e: Event) => {
      if (!el.contains(e.target as Node)) binding.value()
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el: ClickOutsideEl) {
    if (el._clickOutside) document.removeEventListener('click', el._clickOutside)
  }
}

const metodos = [
  { key: 'efectivo',      emoji: '💵', label: 'Efectivo'  },
  { key: 'debito',        emoji: '💳', label: 'Débito'    },
  { key: 'credito',       emoji: '💳', label: 'Crédito'   },
  { key: 'transferencia', emoji: '🏦', label: 'Transfer.' },
]
</script>
