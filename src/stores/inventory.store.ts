import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product, StockStatus } from '../types'
import { useAlertsStore } from './alerts.store'

const INITIAL_PRODUCTS: Product[] = [
  { id: '1',  sku: 'CAR-001', name: 'Pollo entero',           category: 'carnes',    unit: 'kg',     currentStock: 42, minStock: 100, criticalStock: 5,  stockStatus: 'ok',           pricePerUnit: 3490, lastRestockedAt: '2026-04-10T08:00:00Z', lastSoldAt: '2026-04-12T14:30:00Z', totalSoldToday: 18 },
  { id: '2',  sku: 'CAR-002', name: 'Carne de vacuno (posta)', category: 'carnes',    unit: 'kg',     currentStock: 12, minStock: 80,  criticalStock: 4,  stockStatus: 'low',          pricePerUnit: 7990, lastRestockedAt: '2026-04-09T07:00:00Z', lastSoldAt: '2026-04-12T13:00:00Z', totalSoldToday: 12 },
  { id: '3',  sku: 'CAR-003', name: 'Costillar de cerdo',      category: 'carnes',    unit: 'kg',     currentStock: 2,  minStock: 60,  criticalStock: 3,  stockStatus: 'critical',     pricePerUnit: 4990, lastRestockedAt: '2026-04-08T08:00:00Z', lastSoldAt: '2026-04-12T11:45:00Z', totalSoldToday: 5  },
  { id: '4',  sku: 'VER-001', name: 'Lechuga hidropónica',     category: 'verduras',  unit: 'unidad', currentStock: 0,  minStock: 50,  criticalStock: 3,  stockStatus: 'out_of_stock', pricePerUnit: 890,  lastRestockedAt: '2026-04-07T09:00:00Z', lastSoldAt: '2026-04-11T17:00:00Z', totalSoldToday: 0  },
  { id: '5',  sku: 'VER-002', name: 'Tomate cherry',           category: 'verduras',  unit: 'kg',     currentStock: 28, minStock: 40,  criticalStock: 2,  stockStatus: 'ok',           pricePerUnit: 2490, lastRestockedAt: '2026-04-11T08:00:00Z', lastSoldAt: '2026-04-12T14:00:00Z', totalSoldToday: 9  },
  { id: '6',  sku: 'FRU-001', name: 'Plátano seda',            category: 'frutas',    unit: 'kg',     currentStock: 8,  minStock: 60,  criticalStock: 3,  stockStatus: 'low',          pricePerUnit: 1290, lastRestockedAt: '2026-04-12T07:00:00Z', lastSoldAt: '2026-04-12T14:20:00Z', totalSoldToday: 24 },
  { id: '7',  sku: 'FRU-002', name: 'Manzana Fuji',            category: 'frutas',    unit: 'kg',     currentStock: 1,  minStock: 50,  criticalStock: 3,  stockStatus: 'critical',     pricePerUnit: 1990, lastRestockedAt: '2026-04-10T08:00:00Z', lastSoldAt: '2026-04-12T13:30:00Z', totalSoldToday: 7  },
  { id: '8',  sku: 'LAC-001', name: 'Queso gouda laminado',    category: 'lacteos',   unit: 'kg',     currentStock: 22, minStock: 30,  criticalStock: 2,  stockStatus: 'ok',           pricePerUnit: 8490, lastRestockedAt: '2026-04-11T07:30:00Z', lastSoldAt: '2026-04-12T12:00:00Z', totalSoldToday: 4  },
  { id: '9',  sku: 'EMB-001', name: 'Jamón de pierna',         category: 'embutidos', unit: 'kg',     currentStock: 7,  minStock: 40,  criticalStock: 2,  stockStatus: 'low',          pricePerUnit: 5990, lastRestockedAt: '2026-04-10T08:00:00Z', lastSoldAt: '2026-04-12T14:10:00Z', totalSoldToday: 6  },
  { id: '10', sku: 'PAN-001', name: 'Queque marmolado',        category: 'panaderia', unit: 'unidad', currentStock: 5,  minStock: 30,  criticalStock: 2,  stockStatus: 'low',          pricePerUnit: 3290, lastRestockedAt: '2026-04-12T06:00:00Z', lastSoldAt: '2026-04-12T14:00:00Z', totalSoldToday: 8  },
]

function computeStockStatus(current: number, min: number): StockStatus {
  if (current <= 0) return 'out_of_stock'
  if (min <= 0) return 'ok'
  const pct = current / min
  if (pct <= 0.05) return 'critical'
  if (pct <= 0.20) return 'low'
  return 'ok'
}

export const useInventoryStore = defineStore(
  'inventory',
  () => {
    const products = ref<Product[]>(INITIAL_PRODUCTS)

    const lowStockProducts = computed(() =>
      products.value.filter(p => p.stockStatus === 'critical' || p.stockStatus === 'low' || p.stockStatus === 'out_of_stock')
    )

    function saveProduct(updated: Partial<Product> & { id: string }) {
      const idx = products.value.findIndex(p => p.id === updated.id)
      if (idx === -1) return
      const prev = products.value[idx]
      const prevStatus = prev.stockStatus
      const current = updated.currentStock ?? prev.currentStock
      const min = updated.minStock ?? prev.minStock
      const newStatus = computeStockStatus(current, min)
      products.value[idx] = {
        ...prev,
        ...updated,
        criticalStock: Math.max(1, Math.ceil(min * 0.05)),
        stockStatus: newStatus,
      }
      // Sincronizar alerta si cambió el estado de stock
      if (newStatus !== prevStatus || newStatus !== 'ok') {
        const alertsStore = useAlertsStore()
        alertsStore.syncProductAlert(products.value[idx], prevStatus)
      }
    }

    return { products, lowStockProducts, saveProduct, computeStockStatus }
  },
  {
    persist: {
      key: 'comerciales-inventory',
      paths: ['products']
    }
  }
)
