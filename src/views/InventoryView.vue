<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold text-primary">Inventario</h1>
      <div class="flex items-center gap-3">
        <!-- Buscador -->
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar producto..."
            class="pl-9 pr-4 py-2 bg-input border border-border rounded-lg text-sm text-primary placeholder-muted outline-none focus:border-indigo-500 w-56 transition-colors"
          />
        </div>
        <!-- Filtro categoría -->
        <select
          v-model="filterCategory"
          class="px-3 py-2 bg-input border border-border rounded-lg text-sm text-primary outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="">Todas las categorías</option>
          <option v-for="cat in CATEGORIES" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
        </select>
        <!-- Filtro estado -->
        <select
          v-model="filterStatus"
          class="px-3 py-2 bg-input border border-border rounded-lg text-sm text-primary outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="">Todos los estados</option>
          <option value="ok">OK</option>
          <option value="low">Stock bajo</option>
          <option value="critical">Stock crítico</option>
          <option value="out_of_stock">Sin stock</option>
        </select>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-surface border border-border rounded-xl overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-input">
              <th class="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-24">Cód. barra</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">Producto</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-28">Categoría</th>
              <th class="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-20">Unidad</th>
              <th class="text-right px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-28">Stock Actual</th>
              <th class="text-right px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-24" title="Stock mínimo: cantidad umbral bajo la cual se activa alerta">Stk. Mín.</th>
              <th class="text-right px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-24">Crítico</th>
              <th class="text-right px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-32">Precio / Unid.</th>
              <th class="text-center px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-28">Estado</th>
              <th v-if="canEdit" class="text-center px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider w-20">Editar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="product in filteredProducts"
              :key="product.id"
              :id="`row-${product.sku}`"
              :class="[
                'hover:bg-surface-2',
                fadingSku === product.sku ? 'transition-all duration-700' : 'transition-colors',
                highlightedSku === product.sku ? 'ring-2 ring-inset ring-brand-500 bg-brand-500/5' : ''
              ]"
            >
              <td class="px-4 py-3 font-mono text-xs text-secondary">{{ product.sku }}</td>
              <td class="px-4 py-3 font-medium text-primary">{{ product.name }}</td>
              <td class="px-4 py-3">
                <span class="text-xs px-2 py-0.5 rounded-full border"
                  :class="categoryStyle(product.category)">
                  {{ categoryLabel(product.category) }}
                </span>
              </td>
              <td class="px-4 py-3 text-secondary text-xs uppercase">{{ product.unit }}</td>
              <td class="px-4 py-3 text-right font-semibold"
                :class="stockColor(product.stockStatus)">
                {{ product.currentStock.toLocaleString('es-CL') }}
              </td>
              <td class="px-4 py-3 text-right text-secondary">{{ product.minStock }}</td>
              <td class="px-4 py-3 text-right text-secondary">{{ product.criticalStock }}</td>
              <td class="px-4 py-3 text-right text-primary">${{ product.pricePerUnit.toLocaleString('es-CL') }}</td>
              <td class="px-4 py-3 text-center">
                <!-- OK -->
                <span v-if="product.stockStatus === 'ok'"
                  class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-green-500/10 text-green-400">
                  <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  OK
                </span>
                <!-- Stock bajo -->
                <span v-else-if="product.stockStatus === 'low'"
                  class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-yellow-500/10 text-yellow-400">
                  <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Stock bajo
                </span>
                <!-- Stock crítico -->
                <span v-else-if="product.stockStatus === 'critical'"
                  class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-orange-500/10 text-orange-400">
                  <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Stock crítico
                </span>
                <!-- Sin stock -->
                <span v-else
                  class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-red-500/10 text-red-400">
                  <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Sin stock
                </span>
              </td>
              <td v-if="canEdit" class="px-4 py-3 text-center">
                <button
                  @click="openEdit(product)"
                  class="p-1.5 rounded-lg text-muted hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                  title="Editar"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </td>
            </tr>
            <tr v-if="filteredProducts.length === 0">
              <td colspan="10" class="px-4 py-12 text-center text-muted text-sm">
                No se encontraron productos con los filtros aplicados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer con conteo -->
      <div class="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted">
        <span>{{ filteredProducts.length }} de {{ products.length }} productos</span>
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-red-500"></span>Sin stock: {{ countByStatus('out_of_stock') }}
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-orange-500"></span>Crítico: {{ countByStatus('critical') }}
          </span>
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-yellow-500"></span>Stock bajo: {{ countByStatus('low') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Modal Editar Producto -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="editingProduct"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          @click.self="closeEdit"
        >
          <div class="bg-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl scale-in">
            <!-- Modal Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h3 class="font-semibold text-primary">Editar producto</h3>
                <p class="text-xs text-muted mt-0.5 font-mono">Cód. barra: {{ editingProduct.sku }}</p>
              </div>
              <button @click="closeEdit" class="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-2 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="px-6 py-5 space-y-4">
              <!-- Nombre -->
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                  <label class="block text-xs font-medium text-secondary mb-1.5">Nombre del producto</label>
                  <input v-model="editForm.name" type="text"
                    class="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-indigo-500 transition-colors" />
                </div>

                <!-- Categoría -->
                <div>
                  <label class="block text-xs font-medium text-secondary mb-1.5">Categoría</label>
                  <select v-model="editForm.category"
                    class="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-indigo-500 transition-colors">
                    <option v-for="cat in CATEGORIES" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
                  </select>
                </div>

                <!-- Unidad -->
                <div>
                  <label class="block text-xs font-medium text-secondary mb-1.5">Unidad</label>
                  <select v-model="editForm.unit"
                    class="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-indigo-500 transition-colors">
                    <option value="kg">kg</option>
                    <option value="unidad">unidad</option>
                    <option value="litro">litro</option>
                  </select>
                </div>
              </div>

              <!-- Stock -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-secondary mb-1.5">Stock actual</label>
                  <input v-model.number="editForm.currentStock" type="number" min="0"
                    class="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-secondary mb-1.5">Stock mínimo</label>
                  <input v-model.number="editForm.minStock" type="number" min="0"
                    class="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-primary outline-none focus:border-indigo-500 transition-colors" />
                </div>
              </div>
              <!-- Umbrales calculados (solo lectura) -->
              <div class="bg-input border border-border rounded-lg px-4 py-3 flex items-center justify-between text-xs">
                <span class="text-muted">Umbrales automáticos (sobre stock mínimo)</span>
                <div class="flex items-center gap-4">
                  <span class="text-orange-400">Crítico ≤ {{ Math.max(1, Math.ceil(editForm.minStock * 0.05)) }} <span class="text-muted">(5%)</span></span>
                  <span class="text-yellow-400">Bajo ≤ {{ Math.max(1, Math.ceil(editForm.minStock * 0.20)) }} <span class="text-muted">(20%)</span></span>
                </div>
              </div>

              <!-- Precio -->
              <div>
                <label class="block text-xs font-medium text-secondary mb-1.5">Precio por unidad (CLP)</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                  <input v-model.number="editForm.pricePerUnit" type="number" min="0"
                    class="w-full bg-input border border-border rounded-lg pl-7 pr-3 py-2 text-sm text-primary outline-none focus:border-indigo-500 transition-colors" />
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button @click="closeEdit"
                class="px-4 py-2 text-sm text-secondary hover:text-primary bg-surface-2 hover:bg-border rounded-lg transition-colors">
                Cancelar
              </button>
              <button @click="saveEdit"
                class="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors font-medium">
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, nextTick, watch } from 'vue'
import type { Product, ProductCategory } from '../types'
import { useInventoryStore } from '../stores/inventory.store'
import { useAuthStore } from '../stores/auth.store'
import { useRoute } from 'vue-router'

const inventoryStore = useInventoryStore()
const authStore = useAuthStore()
const route = useRoute()
const canEdit = computed(() => authStore.isGerente)

// Highlight de producto llegado desde alerta
const highlightedSku = ref<string | null>(null)
const fadingSku = ref<string | null>(null)

async function highlightSku(sku: string) {
  await nextTick()
  fadingSku.value = null      // cancelar fade anterior si lo hay
  highlightedSku.value = sku  // aparece instantáneo (sin transition-all)
  const el = document.getElementById(`row-${sku}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  // A los 5.3s: activar fade de salida (700ms), total ~6s
  setTimeout(() => {
    fadingSku.value = sku       // activa transition-all duration-700 en esa fila
    highlightedSku.value = null // quita las clases → CSS las desvanece
    setTimeout(() => { fadingSku.value = null }, 700)
  }, 5300)
}

onMounted(() => {
  const sku = route.query.sku as string | undefined
  if (sku) highlightSku(sku)
})

// Si ya estamos en inventario y llega una nueva navegación con ?sku=, hacer highlight igual.
// Escucha el query completo (deep) para detectar cambios de _t aunque sku sea el mismo.
watch(() => route.query, (query) => {
  const sku = query.sku as string | undefined
  if (sku) highlightSku(sku)
}, { deep: true })

// Alias reactivo para no cambiar el resto del template
const products = computed(() => inventoryStore.products)

// ─── Filtros ──────────────────────────────────────────────────────────────────
const searchQuery = ref('')
const filterCategory = ref('')
const filterStatus = ref('')

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const matchSearch = !searchQuery.value ||
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchCat = !filterCategory.value || p.category === filterCategory.value
    const matchStatus = !filterStatus.value || p.stockStatus === filterStatus.value
    return matchSearch && matchCat && matchStatus
  })
})

function countByStatus(status: string) {
  return products.value.filter(p => p.stockStatus === status).length
}

// ─── Edición ──────────────────────────────────────────────────────────────────
const editingProduct = ref<Product | null>(null)
const editForm = reactive({
  name: '',
  category: '' as ProductCategory,
  unit: '' as 'kg' | 'unidad' | 'litro',
  currentStock: 0,
  minStock: 0,
  pricePerUnit: 0,
})

function openEdit(product: Product) {
  editingProduct.value = product
  editForm.name = product.name
  editForm.category = product.category
  editForm.unit = product.unit
  editForm.currentStock = product.currentStock
  editForm.minStock = product.minStock
  editForm.pricePerUnit = product.pricePerUnit
}

function closeEdit() {
  editingProduct.value = null
}


function saveEdit() {
  if (!editingProduct.value) return
  inventoryStore.saveProduct({
    id: editingProduct.value.id,
    name: editForm.name,
    category: editForm.category,
    unit: editForm.unit,
    currentStock: editForm.currentStock,
    minStock: editForm.minStock,
    pricePerUnit: editForm.pricePerUnit,
  })
  closeEdit()
}

// ─── Catálogo de categorías ───────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'carnes',     label: 'Carnes' },
  { value: 'lacteos',    label: 'Lácteos' },
  { value: 'verduras',   label: 'Verduras' },
  { value: 'frutas',     label: 'Frutas' },
  { value: 'embutidos',  label: 'Embutidos' },
  { value: 'panaderia',  label: 'Panadería' },
  { value: 'otros',      label: 'Otros' },
]

function categoryLabel(cat: ProductCategory) {
  return CATEGORIES.find(c => c.value === cat)?.label ?? cat
}

function categoryStyle(cat: ProductCategory) {
  const map: Record<string, string> = {
    carnes:    'bg-violet-500/10 border-violet-500/20 text-violet-400',
    lacteos:   'bg-sky-500/10 border-sky-500/20 text-sky-400',
    verduras:  'bg-teal-500/10 border-teal-500/20 text-teal-400',
    frutas:    'bg-pink-500/10 border-pink-500/20 text-pink-400',
    embutidos: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    panaderia: 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400',
    otros:     'bg-[#2E3348] border-[#475569] text-secondary',
  }
  return map[cat] ?? map.otros
}

function stockColor(s: StockStatus) {
  return {
    ok:           'text-green-400',
    low:          'text-yellow-400',
    critical:     'text-orange-400',
    out_of_stock: 'text-red-400',
  }[s]
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
