<template>
  <div class="h-full flex fade-in">

    <!-- Panel izquierdo: resumen items -->
    <div class="flex-1 flex flex-col overflow-hidden border-r border-border">
      <div class="flex items-center justify-between px-5 py-3 border-b border-border bg-surface shrink-0">
        <div class="flex items-center gap-2 text-xs flex-wrap">
          <span class="text-muted">Pre-boleta</span>
          <span class="font-mono text-secondary">{{ cajaStore.tabActivo?.preBoleta.id }}</span>
          <span class="text-muted">·</span>
          <span class="text-secondary">{{ cajaStore.tabActivo?.preBoleta.balanzaNombre }}</span>
          <span class="text-muted">·</span>
          <span class="text-muted">{{ cajaStore.tabActivo?.preBoleta.creadaHace }}</span>
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
          <!-- Split button: Unir pre-boleta -->
          <div v-if="cajaStore.otrosTabs.length > 0" class="relative flex" v-click-outside="() => showPicker = false">
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
            <button
              @click.stop="showPicker = !showPicker"
              class="flex items-center px-2 py-1.5 rounded-r-lg border border-brand-500/30 text-brand-400 hover:bg-brand-500/10 hover:border-brand-500 transition-colors"
              title="Ver pre-boletas disponibles"
            >
              <svg class="w-3.5 h-3.5 transition-transform" :class="showPicker ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              v-if="showPicker"
              class="absolute top-full left-0 mt-1 z-20 bg-surface border border-border rounded-xl shadow-xl overflow-hidden min-w-[220px]"
            >
              <p class="text-xs text-muted px-3 pt-3 pb-1.5 font-medium uppercase tracking-wider">Pre-boletas disponibles</p>
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

      <div class="flex-1 overflow-y-auto">
        <table class="w-full">
          <thead class="sticky top-0 bg-surface">
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
              <td class="px-5 py-3 text-sm text-primary">{{ item.name }}</td>
              <td class="px-3 py-3 text-right text-sm text-secondary">
                {{ item.unit === 'kg' ? item.qty.toFixed(3) + ' kg' : item.qty + ' UN' }}
              </td>
              <td class="px-3 py-3 text-right text-sm text-secondary">
                ${{ item.priceUnit.toLocaleString('es-CL') }}{{ item.unit === 'kg' ? '/kg' : '/un' }}
              </td>
              <td class="px-5 py-3 text-right text-sm font-semibold text-primary">
                ${{ Math.round(item.qty * item.priceUnit).toLocaleString('es-CL') }}
              </td>
              <td class="pr-3 py-3">
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
    </div>

    <!-- Panel derecho: cobro efectivo -->
    <div class="w-72 flex flex-col bg-surface shrink-0 overflow-hidden">
      <div class="flex-1 px-4 py-3 flex flex-col gap-3 overflow-y-auto">

        <!-- min-h iguala la altura del bloque Resumen de CajaActive (Subtotal+IVA+Total+ítems) -->
        <div class="min-h-[120px]">
          <div class="flex justify-between items-baseline pt-1 border-b border-border pb-2">
            <span class="text-xs text-muted uppercase tracking-wider">Total</span>
            <span class="text-xl font-bold text-primary">${{ cajaStore.total.toLocaleString('es-CL') }}</span>
          </div>
        </div>

        <!-- Método (permite cambiar) -->
        <div>
          <p class="text-xs text-muted uppercase tracking-wider mb-1.5">Método de pago</p>
          <div class="flex gap-1.5">
            <div class="grid grid-cols-2 gap-1.5 flex-1">
              <button
                v-for="m in metodos"
                :key="m.key"
                @click="cajaStore.setMetodoPago(m.key as any)"
                :class="cajaStore.metodoPago === m.key ? 'active' : ''"
                class="btn-pay-method border rounded-lg px-3 py-2 text-xs font-medium text-left"
              >
                <div class="text-sm mb-0.5">{{ m.emoji }}</div>
                {{ m.label }}
              </button>
            </div>
            <!-- Toggle pago mixto -->
            <button
              @click="cajaStore.togglePagoMixto()"
              :class="cajaStore.pagoMixto
                ? 'bg-brand-500 border-brand-500 text-white'
                : 'bg-surface-2 border-border text-muted hover:border-brand-500/50 hover:text-secondary'"
              class="border rounded-lg px-2 flex flex-col items-center justify-center gap-1 transition-colors shrink-0 w-12"
              title="Pago mixto"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span class="text-[10px] font-medium leading-tight text-center">Mixto</span>
            </button>
          </div>
        </div>

        <!-- Efectivo: input siempre visible (con o sin mixto) -->
        <div class="space-y-2">
          <div>
            <p class="text-xs text-muted mb-1">Monto efectivo</p>
            <input
              type="number"
              :value="cajaStore.montoRecibido"
              @input="e => cajaStore.setMontoRecibido(Number((e.target as HTMLInputElement).value))"
              class="w-full bg-surface-2 border border-border rounded-lg px-3 py-3 text-xl text-primary text-left focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>
          <div class="flex gap-1 flex-wrap">
            <button v-for="v in [5000, 10000, 20000]" :key="v"
              @click="cajaStore.setMontoRecibido(v)" class="cash-quick">
              ${{ v.toLocaleString('es-CL') }}
            </button>
            <button @click="cajaStore.setMontoRecibido(cajaStore.pagoMixto ? cajaStore.montoRecibido : cajaStore.total)" class="cash-quick exact">Exacto</button>
            <button @click="cajaStore.setMontoRecibido(cajaStore.montoRecibido + 1000)" class="cash-quick exact">+$1.000</button>
            <button @click="cajaStore.setMontoRecibido(cajaStore.montoRecibido + 100)"  class="cash-quick exact">+$100</button>
            <button @click="cajaStore.setMontoRecibido(Math.max(0, cajaStore.montoRecibido - 1000))" class="cash-quick cash-quick--minus">−$1.000</button>
            <button @click="cajaStore.setMontoRecibido(Math.max(0, cajaStore.montoRecibido - 100))"  class="cash-quick cash-quick--minus">−$100</button>
          </div>
        </div>

        <!-- Sin mixto: vuelto normal -->
        <div v-if="!cajaStore.pagoMixto" class="bg-surface-2 border border-border rounded-lg px-3 py-3 flex items-center justify-between mt-1">
          <span class="text-xl font-bold" :class="cajaStore.vuelto < 0 ? 'text-danger-400' : 'text-success-400'">
            {{ cajaStore.vuelto < 0 ? '−' : '' }}${{ Math.abs(cajaStore.vuelto).toLocaleString('es-CL') }}
          </span>
          <span class="text-[18px] text-muted">Vuelto</span>
        </div>

        <!-- Con mixto: selector segundo método + monto tarjeta auto -->
        <div v-if="cajaStore.pagoMixto" class="space-y-2 slide-up">
          <div>
            <p class="text-xs text-muted uppercase tracking-wider mb-1.5">Segundo método</p>
            <div class="grid grid-cols-3 gap-1.5">
              <button
                v-for="m in metodosSecundarios"
                :key="m.key"
                @click="cajaStore.setMetodoPagoSecundario(m.key as any)"
                :class="cajaStore.metodoPagoSecundario === m.key ? 'active' : ''"
                class="btn-pay-method border rounded-lg px-2 py-2 text-xs font-medium text-left"
              >
                <div class="text-sm mb-0.5">{{ m.emoji }}</div>
                {{ m.label }}
              </button>
            </div>
          </div>
          <!-- Monto tarjeta auto = total - efectivo -->
          <div v-if="cajaStore.metodoPagoSecundario" class="bg-surface-2 border border-border rounded-lg px-3 py-3 flex items-center justify-between">
            <span class="text-xl font-bold" :class="montoTarjetaAuto < 0 ? 'text-danger-400' : 'text-primary'">
              {{ montoTarjetaAuto < 0 ? '−' : '' }}${{ Math.abs(montoTarjetaAuto).toLocaleString('es-CL') }}
            </span>
            <span class="text-[18px] text-muted">{{ segundoMetodoLabel }}</span>
          </div>
        </div>
      </div>

      <!-- Cobrar -->
      <div class="px-4 py-3 border-t border-border">
        <button
          @click="cajaStore.procesarCobro()"
          :disabled="!puedeCobrar"
          class="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-colors"
        >
          Cobrar ${{ cajaStore.total.toLocaleString('es-CL') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCajaStore } from '../../stores/caja.store'

const cajaStore = useCajaStore()
const showPicker = ref(false)

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

const metodosSecundarios = [
  { key: 'debito',        emoji: '💳', label: 'Débito'    },
  { key: 'credito',       emoji: '💳', label: 'Crédito'   },
  { key: 'transferencia', emoji: '🏦', label: 'Transfer.' },
]

const metodoLabels: Record<string, string> = {
  efectivo: 'Efectivo', debito: 'Débito', credito: 'Crédito', transferencia: 'Transferencia',
}
const segundoMetodoLabel = computed(() => metodoLabels[cajaStore.metodoPagoSecundario ?? ''] ?? '')

// En base efectivo: tarjeta = total - efectivo ingresado
const montoTarjetaAuto = computed(() => cajaStore.total - cajaStore.montoRecibido)

const puedeCobrar = computed(() => {
  if (!cajaStore.pagoMixto) return cajaStore.vuelto >= 0
  const r = cajaStore.montoRecibido
  const t = cajaStore.total
  return cajaStore.metodoPagoSecundario !== null && r > 0 && r < t
})
</script>
