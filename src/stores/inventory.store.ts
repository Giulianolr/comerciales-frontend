import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product, StockStatus } from '../types'
import { useAlertsStore } from './alerts.store'
import api from '../api/index'

function computeStockStatus(current: number, min: number, critical: number = 0): StockStatus {
  if (current <= 0) return 'out_of_stock'
  if (critical > 0 && current <= critical) return 'critical'
  if (min <= 0) return 'ok'
  const pct = current / min
  if (pct <= 0.05) return 'critical'
  if (pct <= 0.20) return 'low'
  return 'ok'
}

export const useInventoryStore = defineStore(
  'inventory',
  () => {
    const products = ref<Product[]>([])

    const lowStockProducts = computed(() =>
      products.value.filter(p => p.stock_status === 'critical' || p.stock_status === 'low' || p.stock_status === 'out_of_stock')
    )

    async function fetchProducts() {
      const { data } = await api.get<Product[]>('/products')
      products.value = data
    }

    async function saveProduct(updated: Partial<Product> & { id: string }) {
      const idx = products.value.findIndex(p => p.id === updated.id)
      const prevStatus = idx !== -1 ? products.value[idx].stock_status : undefined

      if (idx === -1) {
        await api.post('/products', updated)
      } else {
        await api.put(`/products/${updated.id}`, updated)
      }

      await fetchProducts()

      if (prevStatus !== undefined) {
        const saved = products.value.find(p => p.id === updated.id)
        if (saved && (saved.stock_status !== prevStatus || saved.stock_status !== 'ok')) {
          const alertsStore = useAlertsStore()
          alertsStore.syncProductAlert(saved, prevStatus)
        }
      }
    }

    fetchProducts()

    return { products, lowStockProducts, saveProduct, fetchProducts, computeStockStatus }
  },
  {
    persist: {
      key: 'comerciales-inventory',
      paths: ['products']
    }
  }
)
