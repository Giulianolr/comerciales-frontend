import { defineStore } from 'pinia'
import { ref } from 'vue'
import { acceptHMRUpdate } from 'pinia'
import type { Transaction } from '../types'

function dt(h: number, m: number, s = 0): string {
  const d = new Date()
  d.setHours(h, m, s, 0)
  return d.toISOString()
}

function dtDone(h: number, m: number): string {
  return dt(h, m, 45)
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-001', folio: 'B-0001', station_id: 1,
    cajero_id: 'u4', cajero_name: 'María González',
    items: [
      { product_id: 'POL-001', name: 'Pollo (filete)', sku: 'POL-001', qty: 1.32, unit: 'kg', price_unit: 6900, total_price: 9108, is_weighed: true },
      { product_id: 'VER-001', name: 'Lechuga', sku: 'VER-001', qty: 2, unit: 'unidad', price_unit: 890, total_price: 1780, is_weighed: false },
    ],
    total_amount: 10888, subtotal: 9150, iva: 1738, payment_method: 'efectivo', status: 'completada',
    sii_document_number: null, sii_document_type: null,
    created_at: dt(8, 12), completed_at: dtDone(8, 13),
  },
  {
    id: 'txn-002', folio: 'B-0002', station_id: 2,
    cajero_id: 'u5', cajero_name: 'Pedro Rojas',
    items: [
      { product_id: 'CAR-002', name: 'Carne (costilla)', sku: 'CAR-002', qty: 0.85, unit: 'kg', price_unit: 5200, total_price: 4420, is_weighed: true },
    ],
    total_amount: 4420, subtotal: 3714, iva: 706, payment_method: 'debito', status: 'completada',
    sii_document_number: null, sii_document_type: null,
    created_at: dt(8, 25), completed_at: dtDone(8, 26),
  },
  {
    id: 'txn-003', folio: 'B-0003', station_id: 5,
    cajero_id: 'u3', cajero_name: 'Operario',
    items: [
      { product_id: 'POL-001', name: 'Pollo (filete)', sku: 'POL-001', qty: 2.10, unit: 'kg', price_unit: 6900, total_price: 14490, is_weighed: true },
      { product_id: 'LAC-001', name: 'Queso fresco', sku: 'LAC-001', qty: 0.35, unit: 'kg', price_unit: 4500, total_price: 1575, is_weighed: true },
      { product_id: 'VER-001', name: 'Lechuga', sku: 'VER-001', qty: 1, unit: 'unidad', price_unit: 890, total_price: 890, is_weighed: false },
    ],
    total_amount: 16955, subtotal: 14248, iva: 2707, payment_method: 'efectivo', status: 'completada',
    sii_document_number: '004521', sii_document_type: 'boleta',
    created_at: dt(8, 41), completed_at: dtDone(8, 43),
  },
  {
    id: 'txn-004', folio: 'B-0004', station_id: 1,
    cajero_id: 'u4', cajero_name: 'María González',
    items: [
      { product_id: 'FRU-001', name: 'Plátano', sku: 'FRU-001', qty: 1.45, unit: 'kg', price_unit: 1200, total_price: 1740, is_weighed: true },
      { product_id: 'PAT-001', name: 'Pastel (queque)', sku: 'PAT-001', qty: 1, unit: 'unidad', price_unit: 3200, total_price: 3200, is_weighed: false },
    ],
    total_amount: 4940, subtotal: 4151, iva: 789, payment_method: 'credito', status: 'completada',
    sii_document_number: null, sii_document_type: null,
    created_at: dt(9, 5), completed_at: dtDone(9, 6),
  },
  {
    id: 'txn-005', folio: 'B-0005', station_id: 3,
    cajero_id: 'u6', cajero_name: 'Laura Silva',
    items: [
      { product_id: 'EMB-001', name: 'Longaniza', sku: 'EMB-001', qty: 0.60, unit: 'kg', price_unit: 3800, total_price: 2280, is_weighed: true },
      { product_id: 'CAR-002', name: 'Carne (costilla)', sku: 'CAR-002', qty: 1.20, unit: 'kg', price_unit: 5200, total_price: 6240, is_weighed: true },
    ],
    total_amount: 8520, subtotal: 7160, iva: 1360, payment_method: 'efectivo', status: 'completada',
    sii_document_number: null, sii_document_type: null,
    created_at: dt(9, 18), completed_at: dtDone(9, 19),
  },
  {
    id: 'txn-006', folio: 'B-0006', station_id: 2,
    cajero_id: 'u5', cajero_name: 'Pedro Rojas',
    items: [
      { product_id: 'POL-001', name: 'Pollo (filete)', sku: 'POL-001', qty: 0.95, unit: 'kg', price_unit: 6900, total_price: 6555, is_weighed: true },
    ],
    total_amount: 6555, subtotal: 5508, iva: 1047, payment_method: 'debito', status: 'completada',
    sii_document_number: null, sii_document_type: null,
    created_at: dt(9, 33), completed_at: dtDone(9, 34),
  },
  {
    id: 'txn-007', folio: 'B-0007', station_id: 1,
    cajero_id: 'u4', cajero_name: 'María González',
    items: [
      { product_id: 'CAR-002', name: 'Carne (costilla)', sku: 'CAR-002', qty: 1.50, unit: 'kg', price_unit: 5200, total_price: 7800, is_weighed: true },
    ],
    total_amount: 7800, subtotal: 6555, iva: 1245, payment_method: 'efectivo', status: 'anulada',
    sii_document_number: null, sii_document_type: null,
    created_at: dt(9, 47), completed_at: null,
  },
  {
    id: 'txn-008', folio: 'B-0008', station_id: 5,
    cajero_id: 'u3', cajero_name: 'Operario',
    items: [
      { product_id: 'PAT-001', name: 'Pastel (queque)', sku: 'PAT-001', qty: 2, unit: 'unidad', price_unit: 3200, total_price: 6400, is_weighed: false },
      { product_id: 'FRU-001', name: 'Plátano', sku: 'FRU-001', qty: 2.30, unit: 'kg', price_unit: 1200, total_price: 2760, is_weighed: true },
      { product_id: 'VER-002', name: 'Tomate', sku: 'VER-002', qty: 0.80, unit: 'kg', price_unit: 1100, total_price: 880, is_weighed: true },
    ],
    total_amount: 10040, subtotal: 8437, iva: 1603, payment_method: 'transferencia', status: 'completada',
    sii_document_number: '004522', sii_document_type: 'boleta',
    created_at: dt(10, 2), completed_at: dtDone(10, 4),
  },
  {
    id: 'txn-009', folio: 'B-0009', station_id: 4,
    cajero_id: 'u4b', cajero_name: 'Roberto Fuentes',
    items: [
      { product_id: 'LAC-001', name: 'Queso fresco', sku: 'LAC-001', qty: 0.50, unit: 'kg', price_unit: 4500, total_price: 2250, is_weighed: true },
      { product_id: 'LAC-002', name: 'Mantequilla', sku: 'LAC-002', qty: 1, unit: 'unidad', price_unit: 2800, total_price: 2800, is_weighed: false },
    ],
    total_amount: 5050, subtotal: 4244, iva: 806, payment_method: 'debito', status: 'completada',
    sii_document_number: null, sii_document_type: null,
    created_at: dt(10, 15), completed_at: dtDone(10, 16),
  },
  {
    id: 'txn-010', folio: 'B-0010', station_id: 2,
    cajero_id: 'u5', cajero_name: 'Pedro Rojas',
    items: [
      { product_id: 'POL-001', name: 'Pollo (filete)', sku: 'POL-001', qty: 1.75, unit: 'kg', price_unit: 6900, total_price: 12075, is_weighed: true },
      { product_id: 'EMB-001', name: 'Longaniza', sku: 'EMB-001', qty: 0.40, unit: 'kg', price_unit: 3800, total_price: 1520, is_weighed: true },
    ],
    total_amount: 13595, subtotal: 11424, iva: 2171, payment_method: 'efectivo', status: 'completada',
    sii_document_number: null, sii_document_type: null,
    created_at: dt(10, 28), completed_at: dtDone(10, 29),
  },
  {
    id: 'txn-011', folio: 'B-0011', station_id: 1,
    cajero_id: 'u4', cajero_name: 'María González',
    items: [
      { product_id: 'CAR-002', name: 'Carne (costilla)', sku: 'CAR-002', qty: 2.00, unit: 'kg', price_unit: 5200, total_price: 10400, is_weighed: true },
    ],
    total_amount: 10400, subtotal: 8739, iva: 1661, payment_method: 'credito', status: 'completada',
    sii_document_number: '004523', sii_document_type: 'boleta',
    created_at: dt(10, 44), completed_at: dtDone(10, 45),
  },
  {
    id: 'txn-012', folio: 'B-0012', station_id: 3,
    cajero_id: 'u6', cajero_name: 'Laura Silva',
    items: [
      { product_id: 'FRU-001', name: 'Plátano', sku: 'FRU-001', qty: 0.90, unit: 'kg', price_unit: 1200, total_price: 1080, is_weighed: true },
    ],
    total_amount: 1080, subtotal: 908, iva: 172, payment_method: 'debito', status: 'error',
    sii_document_number: null, sii_document_type: null,
    created_at: dt(10, 59), completed_at: null,
  },
  {
    id: 'txn-013', folio: 'B-0013', station_id: 5,
    cajero_id: 'u3', cajero_name: 'Operario',
    items: [
      { product_id: 'POL-001', name: 'Pollo (filete)', sku: 'POL-001', qty: 3.20, unit: 'kg', price_unit: 6900, total_price: 22080, is_weighed: true },
      { product_id: 'CAR-002', name: 'Carne (costilla)', sku: 'CAR-002', qty: 1.10, unit: 'kg', price_unit: 5200, total_price: 5720, is_weighed: true },
      { product_id: 'VER-001', name: 'Lechuga', sku: 'VER-001', qty: 3, unit: 'unidad', price_unit: 890, total_price: 2670, is_weighed: false },
      { product_id: 'FRU-001', name: 'Plátano', sku: 'FRU-001', qty: 1.50, unit: 'kg', price_unit: 1200, total_price: 1800, is_weighed: true },
    ],
    total_amount: 32270, subtotal: 27118, iva: 5152, payment_method: 'efectivo', status: 'completada',
    sii_document_number: '004524', sii_document_type: 'factura',
    created_at: dt(11, 12), completed_at: dtDone(11, 15),
  },
  {
    id: 'txn-014', folio: 'B-0014', station_id: 4,
    cajero_id: 'u4b', cajero_name: 'Roberto Fuentes',
    items: [
      { product_id: 'LAC-001', name: 'Queso fresco', sku: 'LAC-001', qty: 0.25, unit: 'kg', price_unit: 4500, total_price: 1125, is_weighed: true },
      { product_id: 'EMB-002', name: 'Jamón de pavo', sku: 'EMB-002', qty: 0.30, unit: 'kg', price_unit: 4200, total_price: 1260, is_weighed: true },
    ],
    total_amount: 2385, subtotal: 2004, iva: 381, payment_method: 'transferencia', status: 'completada',
    sii_document_number: null, sii_document_type: null,
    created_at: dt(11, 25), completed_at: dtDone(11, 26),
  },
  {
    id: 'txn-015', folio: 'B-0015', station_id: 1,
    cajero_id: 'u4', cajero_name: 'María González',
    items: [
      { product_id: 'POL-001', name: 'Pollo (filete)', sku: 'POL-001', qty: 1.05, unit: 'kg', price_unit: 6900, total_price: 7245, is_weighed: true },
      { product_id: 'PAT-001', name: 'Pastel (queque)', sku: 'PAT-001', qty: 1, unit: 'unidad', price_unit: 3200, total_price: 3200, is_weighed: false },
    ],
    total_amount: 10445, subtotal: 8777, iva: 1668, payment_method: 'efectivo', status: 'completada',
    sii_document_number: null, sii_document_type: null,
    created_at: dt(11, 38), completed_at: dtDone(11, 39),
  },
  {
    id: 'txn-016', folio: 'B-0016', station_id: 2,
    cajero_id: 'u5', cajero_name: 'Pedro Rojas',
    items: [
      { product_id: 'CAR-002', name: 'Carne (costilla)', sku: 'CAR-002', qty: 0.70, unit: 'kg', price_unit: 5200, total_price: 3640, is_weighed: true },
    ],
    total_amount: 3640, subtotal: 3059, iva: 581, payment_method: 'credito', status: 'anulada',
    sii_document_number: null, sii_document_type: null,
    created_at: dt(11, 52), completed_at: null,
  },
  {
    id: 'txn-017', folio: 'B-0017', station_id: 3,
    cajero_id: 'u6', cajero_name: 'Laura Silva',
    items: [
      { product_id: 'EMB-001', name: 'Longaniza', sku: 'EMB-001', qty: 1.10, unit: 'kg', price_unit: 3800, total_price: 4180, is_weighed: true },
      { product_id: 'VER-002', name: 'Tomate', sku: 'VER-002', qty: 1.20, unit: 'kg', price_unit: 1100, total_price: 1320, is_weighed: true },
    ],
    total_amount: 5500, subtotal: 4622, iva: 878, payment_method: 'debito', status: 'completada',
    sii_document_number: null, sii_document_type: null,
    created_at: dt(12, 5), completed_at: dtDone(12, 6),
  },
  {
    id: 'txn-018', folio: 'B-0018', station_id: 4,
    cajero_id: 'u4b', cajero_name: 'Roberto Fuentes',
    items: [
      { product_id: 'LAC-001', name: 'Queso fresco', sku: 'LAC-001', qty: 0.45, unit: 'kg', price_unit: 4500, total_price: 2025, is_weighed: true },
      { product_id: 'FRU-001', name: 'Plátano', sku: 'FRU-001', qty: 2.00, unit: 'kg', price_unit: 1200, total_price: 2400, is_weighed: true },
    ],
    total_amount: 4425, subtotal: 3718, iva: 707, payment_method: 'transferencia', status: 'completada',
    sii_document_number: null, sii_document_type: null,
    created_at: dt(12, 18), completed_at: dtDone(12, 19),
  },
  {
    id: 'txn-019', folio: 'B-0019', station_id: 5,
    cajero_id: 'u3', cajero_name: 'Operario',
    items: [
      { product_id: 'POL-001', name: 'Pollo (filete)', sku: 'POL-001', qty: 1.60, unit: 'kg', price_unit: 6900, total_price: 11040, is_weighed: true },
      { product_id: 'CAR-002', name: 'Carne (costilla)', sku: 'CAR-002', qty: 0.90, unit: 'kg', price_unit: 5200, total_price: 4680, is_weighed: true },
      { product_id: 'LAC-002', name: 'Mantequilla', sku: 'LAC-002', qty: 2, unit: 'unidad', price_unit: 2800, total_price: 5600, is_weighed: false },
    ],
    total_amount: 21320, subtotal: 17916, iva: 3404, payment_method: 'efectivo', status: 'completada',
    sii_document_number: '004525', sii_document_type: 'boleta',
    created_at: dt(12, 32), completed_at: dtDone(12, 35),
  },
  {
    id: 'txn-020', folio: 'B-0020', station_id: 1,
    cajero_id: 'u4', cajero_name: 'María González',
    items: [
      { product_id: 'CAR-002', name: 'Carne (costilla)', sku: 'CAR-002', qty: 1.30, unit: 'kg', price_unit: 5200, total_price: 6760, is_weighed: true },
    ],
    total_amount: 6760, subtotal: 5681, iva: 1079, payment_method: 'credito', status: 'completada',
    sii_document_number: null, sii_document_type: null,
    created_at: dt(12, 45), completed_at: dtDone(12, 46),
  },
  {
    id: 'txn-021', folio: 'B-0021', station_id: 2,
    cajero_id: 'u5', cajero_name: 'Pedro Rojas',
    items: [
      { product_id: 'POL-001', name: 'Pollo (filete)', sku: 'POL-001', qty: 0.80, unit: 'kg', price_unit: 6900, total_price: 5520, is_weighed: true },
      { product_id: 'VER-001', name: 'Lechuga', sku: 'VER-001', qty: 1, unit: 'unidad', price_unit: 890, total_price: 890, is_weighed: false },
    ],
    total_amount: 6410, subtotal: 5387, iva: 1023, payment_method: 'efectivo', status: 'completada',
    sii_document_number: null, sii_document_type: null,
    created_at: dt(13, 2), completed_at: dtDone(13, 3),
  },
  {
    id: 'txn-022', folio: 'B-0022', station_id: 3,
    cajero_id: 'u6', cajero_name: 'Laura Silva',
    items: [
      { product_id: 'EMB-001', name: 'Longaniza', sku: 'EMB-001', qty: 0.75, unit: 'kg', price_unit: 3800, total_price: 2850, is_weighed: true },
      { product_id: 'PAT-001', name: 'Pastel (queque)', sku: 'PAT-001', qty: 1, unit: 'unidad', price_unit: 3200, total_price: 3200, is_weighed: false },
    ],
    total_amount: 6050, subtotal: 5084, iva: 966, payment_method: 'debito', status: 'completada',
    sii_document_number: null, sii_document_type: null,
    created_at: dt(13, 15), completed_at: dtDone(13, 16),
  },
  {
    id: 'txn-023', folio: 'B-0023', station_id: 5,
    cajero_id: 'u3', cajero_name: 'Operario',
    items: [
      { product_id: 'POL-001', name: 'Pollo (filete)', sku: 'POL-001', qty: 2.40, unit: 'kg', price_unit: 6900, total_price: 16560, is_weighed: true },
      { product_id: 'FRU-001', name: 'Plátano', sku: 'FRU-001', qty: 1.80, unit: 'kg', price_unit: 1200, total_price: 2160, is_weighed: true },
      { product_id: 'VER-002', name: 'Tomate', sku: 'VER-002', qty: 0.60, unit: 'kg', price_unit: 1100, total_price: 660, is_weighed: true },
    ],
    total_amount: 19380, subtotal: 16286, iva: 3094, payment_method: 'credito', status: 'completada',
    sii_document_number: '004526', sii_document_type: 'boleta',
    created_at: dt(13, 28), completed_at: dtDone(13, 30),
  },
]

export const useTransactionsStore = defineStore('transactions', () => {
  const transactions = ref<Transaction[]>(MOCK_TRANSACTIONS)

  const stationName = (id: number): string => {
    const map: Record<number, string> = { 1: 'Balanza 1', 2: 'Balanza 2', 3: 'Balanza 3', 4: 'Balanza 4', 5: 'Caja' }
    return map[id] ?? `Estación ${id}`
  }

  return { transactions, stationName }
})

if (import.meta.hot) acceptHMRUpdate(useTransactionsStore, import.meta.hot)
