<template>
  <Teleport to="body">
    <div
      v-if="cajaStore.showModalScan"
      class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center fade-in"
      @click.self="cajaStore.cerrarModalScan()"
    >
      <div class="bg-surface border border-border rounded-2xl w-96 shadow-2xl overflow-hidden scale-in">

        <!-- Header -->
        <div class="px-6 pt-6 pb-4 border-b border-border">
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <div class="w-6 h-6 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
                  <svg class="w-3.5 h-3.5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 class="text-sm font-semibold text-primary">Pre-boleta detectada</h3>
              </div>
              <p class="text-xs text-muted">Ya tienes una venta activa. ¿Qué deseas hacer?</p>
            </div>
            <button @click="cajaStore.cerrarModalScan()" class="text-muted hover:text-primary transition-colors mt-0.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Comparación de pre-boletas -->
        <div class="px-6 py-4 grid grid-cols-2 gap-3">
          <!-- Venta activa -->
          <div class="bg-surface-2 rounded-xl p-3 border border-border">
            <p class="text-xs text-muted mb-2">Venta activa</p>
            <p class="text-xs font-medium text-secondary mb-1">
              {{ cajaStore.tabActivo?.preBoleta.balanzaNombre }}
            </p>
            <p class="text-sm font-bold text-primary">${{ cajaStore.total.toLocaleString('es-CL') }}</p>
            <p class="text-xs text-muted">{{ cajaStore.items.length }} ítems</p>
          </div>
          <!-- Nueva pre-boleta -->
          <div class="bg-brand-500/5 rounded-xl p-3 border border-brand-500/20">
            <p class="text-xs text-muted mb-2">Nueva pre-boleta</p>
            <p class="text-xs font-medium text-secondary mb-1">
              {{ cajaStore.preboletaEscan?.balanzaNombre }}
            </p>
            <p class="text-sm font-bold text-primary">
              ${{ totalEscan.toLocaleString('es-CL') }}
            </p>
            <p class="text-xs text-muted">{{ cajaStore.preboletaEscan?.items.length }} ítem</p>
          </div>
        </div>

        <!-- Preview del merge -->
        <div class="px-6 pb-4">
          <div class="bg-surface-2 rounded-xl p-3 border border-brand-500/20 mb-4 slide-up">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs text-brand-400 font-medium flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Si unes las dos pre-boletas
              </p>
            </div>
            <div class="space-y-1 text-xs text-secondary">
              <div class="flex justify-between">
                <span>Total ítems</span>
                <span class="text-primary font-medium">{{ cajaStore.itemsMergePreview }} ítems</span>
              </div>
              <div class="flex justify-between">
                <span>Total a cobrar</span>
                <span class="text-primary font-bold text-sm">
                  ${{ cajaStore.totalMergePreview.toLocaleString('es-CL') }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="px-6 pb-6 space-y-2">
          <!-- Unir -->
          <button
            @click="cajaStore.confirmarMerge()"
            class="w-full flex items-center gap-3 p-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-colors text-left"
          >
            <div class="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold">Unir a venta actual</p>
              <p class="text-xs text-white/70">
                {{ cajaStore.preboletaEscan?.balanzaNombre }} → venta actual · Total ${{ cajaStore.totalMergePreview.toLocaleString('es-CL') }}
              </p>
            </div>
          </button>

          <!-- Nueva pestaña -->
          <button
            @click="cajaStore.abrirEnNuevaTab()"
            class="w-full flex items-center gap-3 p-3.5 rounded-xl bg-surface-2 hover:bg-border border border-border hover:border-brand-500/40 text-left transition-colors"
          >
            <div class="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-primary">Abrir en pestaña separada</p>
              <p class="text-xs text-muted">Cobrar por separado después</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCajaStore } from '../../stores/caja.store'

const cajaStore = useCajaStore()

const totalEscan = computed(() =>
  cajaStore.preboletaEscan?.items.reduce((s, i) => s + Math.round(i.qty * i.priceUnit), 0) ?? 0
)
</script>
