import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product, StockStatus } from '../types'
import { useAlertsStore } from './alerts.store'

const INITIAL_PRODUCTS: Product[] = [
  { id: '1',  sku: 'CAR-001', barcode: null, name: 'Pollo entero',           category: 'carnes',    category_id: null, unit: 'kg',     current_stock: 42, min_stock: 100, critical_stock: 5,  stock_status: 'ok',           price_per_unit: 3490, cost_price: null, supplier_id: null, is_active: true, last_restocked_at: '2026-04-10T08:00:00Z', last_sold_at: '2026-04-12T14:30:00Z', total_sold_today: 18, created_at: '2026-01-01T00:00:00Z' },
  { id: '2',  sku: 'CAR-002', barcode: null, name: 'Carne de vacuno (posta)', category: 'carnes',    category_id: null, unit: 'kg',     current_stock: 12, min_stock: 80,  critical_stock: 4,  stock_status: 'low',          price_per_unit: 7990, cost_price: null, supplier_id: null, is_active: true, last_restocked_at: '2026-04-09T07:00:00Z', last_sold_at: '2026-04-12T13:00:00Z', total_sold_today: 12, created_at: '2026-01-01T00:00:00Z' },
  { id: '3',  sku: 'CAR-003', barcode: null, name: 'Costillar de cerdo',      category: 'carnes',    category_id: null, unit: 'kg',     current_stock: 2,  min_stock: 60,  critical_stock: 3,  stock_status: 'critical',     price_per_unit: 4990, cost_price: null, supplier_id: null, is_active: true, last_restocked_at: '2026-04-08T08:00:00Z', last_sold_at: '2026-04-12T11:45:00Z', total_sold_today: 5,  created_at: '2026-01-01T00:00:00Z' },
  { id: '4',  sku: 'VER-001', barcode: null, name: 'Lechuga hidropónica',     category: 'verduras',  category_id: null, unit: 'unidad', current_stock: 0,  min_stock: 50,  critical_stock: 3,  stock_status: 'out_of_stock', price_per_unit: 890,  cost_price: null, supplier_id: null, is_active: true, last_restocked_at: '2026-04-07T09:00:00Z', last_sold_at: '2026-04-11T17:00:00Z', total_sold_today: 0,  created_at: '2026-01-01T00:00:00Z' },
  { id: '5',  sku: 'VER-002', barcode: null, name: 'Tomate cherry',           category: 'verduras',  category_id: null, unit: 'kg',     current_stock: 28, min_stock: 40,  critical_stock: 2,  stock_status: 'ok',           price_per_unit: 2490, cost_price: null, supplier_id: null, is_active: true, last_restocked_at: '2026-04-11T08:00:00Z', last_sold_at: '2026-04-12T14:00:00Z', total_sold_today: 9,  created_at: '2026-01-01T00:00:00Z' },
  { id: '6',  sku: 'FRU-001', barcode: null, name: 'Plátano seda',            category: 'frutas',    category_id: null, unit: 'kg',     current_stock: 8,  min_stock: 60,  critical_stock: 3,  stock_status: 'low',          price_per_unit: 1290, cost_price: null, supplier_id: null, is_active: true, last_restocked_at: '2026-04-12T07:00:00Z', last_sold_at: '2026-04-12T14:20:00Z', total_sold_today: 24, created_at: '2026-01-01T00:00:00Z' },
  { id: '7',  sku: 'FRU-002', barcode: null, name: 'Manzana Fuji',            category: 'frutas',    category_id: null, unit: 'kg',     current_stock: 1,  min_stock: 50,  critical_stock: 3,  stock_status: 'critical',     price_per_unit: 1990, cost_price: null, supplier_id: null, is_active: true, last_restocked_at: '2026-04-10T08:00:00Z', last_sold_at: '2026-04-12T13:30:00Z', total_sold_today: 7,  created_at: '2026-01-01T00:00:00Z' },
  { id: '8',  sku: 'LAC-001', barcode: null, name: 'Queso gouda laminado',    category: 'lacteos',   category_id: null, unit: 'kg',     current_stock: 22, min_stock: 30,  critical_stock: 2,  stock_status: 'ok',           price_per_unit: 8490, cost_price: null, supplier_id: null, is_active: true, last_restocked_at: '2026-04-11T07:30:00Z', last_sold_at: '2026-04-12T12:00:00Z', total_sold_today: 4,  created_at: '2026-01-01T00:00:00Z' },
  { id: '9',  sku: 'EMB-001', barcode: null, name: 'Jamón de pierna',         category: 'embutidos', category_id: null, unit: 'kg',     current_stock: 7,  min_stock: 40,  critical_stock: 2,  stock_status: 'low',          price_per_unit: 5990, cost_price: null, supplier_id: null, is_active: true, last_restocked_at: '2026-04-10T08:00:00Z', last_sold_at: '2026-04-12T14:10:00Z', total_sold_today: 6,  created_at: '2026-01-01T00:00:00Z' },
  { id: '10', sku: 'PAN-001', barcode: null, name: 'Queque marmolado',        category: 'panaderia', category_id: null, unit: 'unidad', current_stock: 5,  min_stock: 30,  critical_stock: 2,  stock_status: 'low',          price_per_unit: 3290, cost_price: null, supplier_id: null, is_active: true, last_restocked_at: '2026-04-12T06:00:00Z', last_sold_at: '2026-04-12T14:00:00Z', total_sold_today: 8,  created_at: '2026-01-01T00:00:00Z' },
]

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
    const products = ref<Product[]>(INITIAL_PRODUCTS)

    const lowStockProducts = computed(() =>
      products.value.filter(p => p.stock_status === 'critical' || p.stock_status === 'low' || p.stock_status === 'out_of_stock')
    )

    function saveProduct(updated: Partial<Product> & { id: string }) {
      const idx = products.value.findIndex(p => p.id === updated.id)
      if (idx === -1) return
      const prev = products.value[idx]
      const prevStatus = prev.stock_status
      const current = updated.current_stock ?? prev.current_stock
      const min = updated.min_stock ?? prev.min_stock
      const critical = updated.critical_stock ?? prev.critical_stock
      const newStatus = computeStockStatus(current, min, critical)
      products.value[idx] = {
        ...prev,
        ...updated,
        critical_stock: Math.max(1, Math.ceil(min * 0.05)),
        stock_status: newStatus,
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
