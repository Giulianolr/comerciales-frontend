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
    id: 'txn-001', folio: 'B-0001', balanzaId: 1,
    cajeroId: 'u4', cajeroNombre: 'María González',
    items: [
      { productId: 'POL-001', productName: 'Pollo (filete)', sku: 'POL-001', quantity: 1.32, unitPrice: 6900, totalPrice: 9108, isWeighed: true },
      { productId: 'VER-001', productName: 'Lechuga', sku: 'VER-001', quantity: 2, unitPrice: 890, totalPrice: 1780, isWeighed: false },
    ],
    totalAmount: 10888, paymentMethod: 'efectivo', status: 'completada',
    siiDocumentNumber: null, siiDocumentType: null,
    createdAt: dt(8, 12), completedAt: dtDone(8, 13),
  },
  {
    id: 'txn-002', folio: 'B-0002', balanzaId: 2,
    cajeroId: 'u5', cajeroNombre: 'Pedro Rojas',
    items: [
      { productId: 'CAR-002', productName: 'Carne (costilla)', sku: 'CAR-002', quantity: 0.85, unitPrice: 5200, totalPrice: 4420, isWeighed: true },
    ],
    totalAmount: 4420, paymentMethod: 'debito', status: 'completada',
    siiDocumentNumber: null, siiDocumentType: null,
    createdAt: dt(8, 25), completedAt: dtDone(8, 26),
  },
  {
    id: 'txn-003', folio: 'B-0003', balanzaId: 5,
    cajeroId: 'u3', cajeroNombre: 'Operario',
    items: [
      { productId: 'POL-001', productName: 'Pollo (filete)', sku: 'POL-001', quantity: 2.10, unitPrice: 6900, totalPrice: 14490, isWeighed: true },
      { productId: 'LAC-001', productName: 'Queso fresco', sku: 'LAC-001', quantity: 0.35, unitPrice: 4500, totalPrice: 1575, isWeighed: true },
      { productId: 'VER-001', productName: 'Lechuga', sku: 'VER-001', quantity: 1, unitPrice: 890, totalPrice: 890, isWeighed: false },
    ],
    totalAmount: 16955, paymentMethod: 'efectivo', status: 'completada',
    siiDocumentNumber: '004521', siiDocumentType: 'boleta',
    createdAt: dt(8, 41), completedAt: dtDone(8, 43),
  },
  {
    id: 'txn-004', folio: 'B-0004', balanzaId: 1,
    cajeroId: 'u4', cajeroNombre: 'María González',
    items: [
      { productId: 'FRU-001', productName: 'Plátano', sku: 'FRU-001', quantity: 1.45, unitPrice: 1200, totalPrice: 1740, isWeighed: true },
      { productId: 'PAT-001', productName: 'Pastel (queque)', sku: 'PAT-001', quantity: 1, unitPrice: 3200, totalPrice: 3200, isWeighed: false },
    ],
    totalAmount: 4940, paymentMethod: 'credito', status: 'completada',
    siiDocumentNumber: null, siiDocumentType: null,
    createdAt: dt(9, 5), completedAt: dtDone(9, 6),
  },
  {
    id: 'txn-005', folio: 'B-0005', balanzaId: 3,
    cajeroId: 'u6', cajeroNombre: 'Laura Silva',
    items: [
      { productId: 'EMB-001', productName: 'Longaniza', sku: 'EMB-001', quantity: 0.60, unitPrice: 3800, totalPrice: 2280, isWeighed: true },
      { productId: 'CAR-002', productName: 'Carne (costilla)', sku: 'CAR-002', quantity: 1.20, unitPrice: 5200, totalPrice: 6240, isWeighed: true },
    ],
    totalAmount: 8520, paymentMethod: 'efectivo', status: 'completada',
    siiDocumentNumber: null, siiDocumentType: null,
    createdAt: dt(9, 18), completedAt: dtDone(9, 19),
  },
  {
    id: 'txn-006', folio: 'B-0006', balanzaId: 2,
    cajeroId: 'u5', cajeroNombre: 'Pedro Rojas',
    items: [
      { productId: 'POL-001', productName: 'Pollo (filete)', sku: 'POL-001', quantity: 0.95, unitPrice: 6900, totalPrice: 6555, isWeighed: true },
    ],
    totalAmount: 6555, paymentMethod: 'debito', status: 'completada',
    siiDocumentNumber: null, siiDocumentType: null,
    createdAt: dt(9, 33), completedAt: dtDone(9, 34),
  },
  {
    id: 'txn-007', folio: 'B-0007', balanzaId: 1,
    cajeroId: 'u4', cajeroNombre: 'María González',
    items: [
      { productId: 'CAR-002', productName: 'Carne (costilla)', sku: 'CAR-002', quantity: 1.50, unitPrice: 5200, totalPrice: 7800, isWeighed: true },
    ],
    totalAmount: 7800, paymentMethod: 'efectivo', status: 'anulada',
    siiDocumentNumber: null, siiDocumentType: null,
    createdAt: dt(9, 47), completedAt: null,
  },
  {
    id: 'txn-008', folio: 'B-0008', balanzaId: 5,
    cajeroId: 'u3', cajeroNombre: 'Operario',
    items: [
      { productId: 'PAT-001', productName: 'Pastel (queque)', sku: 'PAT-001', quantity: 2, unitPrice: 3200, totalPrice: 6400, isWeighed: false },
      { productId: 'FRU-001', productName: 'Plátano', sku: 'FRU-001', quantity: 2.30, unitPrice: 1200, totalPrice: 2760, isWeighed: true },
      { productId: 'VER-002', productName: 'Tomate', sku: 'VER-002', quantity: 0.80, unitPrice: 1100, totalPrice: 880, isWeighed: true },
    ],
    totalAmount: 10040, paymentMethod: 'transferencia', status: 'completada',
    siiDocumentNumber: '004522', siiDocumentType: 'boleta',
    createdAt: dt(10, 2), completedAt: dtDone(10, 4),
  },
  {
    id: 'txn-009', folio: 'B-0009', balanzaId: 4,
    cajeroId: 'u4b', cajeroNombre: 'Roberto Fuentes',
    items: [
      { productId: 'LAC-001', productName: 'Queso fresco', sku: 'LAC-001', quantity: 0.50, unitPrice: 4500, totalPrice: 2250, isWeighed: true },
      { productId: 'LAC-002', productName: 'Mantequilla', sku: 'LAC-002', quantity: 1, unitPrice: 2800, totalPrice: 2800, isWeighed: false },
    ],
    totalAmount: 5050, paymentMethod: 'debito', status: 'completada',
    siiDocumentNumber: null, siiDocumentType: null,
    createdAt: dt(10, 15), completedAt: dtDone(10, 16),
  },
  {
    id: 'txn-010', folio: 'B-0010', balanzaId: 2,
    cajeroId: 'u5', cajeroNombre: 'Pedro Rojas',
    items: [
      { productId: 'POL-001', productName: 'Pollo (filete)', sku: 'POL-001', quantity: 1.75, unitPrice: 6900, totalPrice: 12075, isWeighed: true },
      { productId: 'EMB-001', productName: 'Longaniza', sku: 'EMB-001', quantity: 0.40, unitPrice: 3800, totalPrice: 1520, isWeighed: true },
    ],
    totalAmount: 13595, paymentMethod: 'efectivo', status: 'completada',
    siiDocumentNumber: null, siiDocumentType: null,
    createdAt: dt(10, 28), completedAt: dtDone(10, 29),
  },
  {
    id: 'txn-011', folio: 'B-0011', balanzaId: 1,
    cajeroId: 'u4', cajeroNombre: 'María González',
    items: [
      { productId: 'CAR-002', productName: 'Carne (costilla)', sku: 'CAR-002', quantity: 2.00, unitPrice: 5200, totalPrice: 10400, isWeighed: true },
    ],
    totalAmount: 10400, paymentMethod: 'credito', status: 'completada',
    siiDocumentNumber: '004523', siiDocumentType: 'boleta',
    createdAt: dt(10, 44), completedAt: dtDone(10, 45),
  },
  {
    id: 'txn-012', folio: 'B-0012', balanzaId: 3,
    cajeroId: 'u6', cajeroNombre: 'Laura Silva',
    items: [
      { productId: 'FRU-001', productName: 'Plátano', sku: 'FRU-001', quantity: 0.90, unitPrice: 1200, totalPrice: 1080, isWeighed: true },
    ],
    totalAmount: 1080, paymentMethod: 'debito', status: 'error',
    siiDocumentNumber: null, siiDocumentType: null,
    createdAt: dt(10, 59), completedAt: null,
  },
  {
    id: 'txn-013', folio: 'B-0013', balanzaId: 5,
    cajeroId: 'u3', cajeroNombre: 'Operario',
    items: [
      { productId: 'POL-001', productName: 'Pollo (filete)', sku: 'POL-001', quantity: 3.20, unitPrice: 6900, totalPrice: 22080, isWeighed: true },
      { productId: 'CAR-002', productName: 'Carne (costilla)', sku: 'CAR-002', quantity: 1.10, unitPrice: 5200, totalPrice: 5720, isWeighed: true },
      { productId: 'VER-001', productName: 'Lechuga', sku: 'VER-001', quantity: 3, unitPrice: 890, totalPrice: 2670, isWeighed: false },
      { productId: 'FRU-001', productName: 'Plátano', sku: 'FRU-001', quantity: 1.50, unitPrice: 1200, totalPrice: 1800, isWeighed: true },
    ],
    totalAmount: 32270, paymentMethod: 'efectivo', status: 'completada',
    siiDocumentNumber: '004524', siiDocumentType: 'factura',
    createdAt: dt(11, 12), completedAt: dtDone(11, 15),
  },
  {
    id: 'txn-014', folio: 'B-0014', balanzaId: 4,
    cajeroId: 'u4b', cajeroNombre: 'Roberto Fuentes',
    items: [
      { productId: 'LAC-001', productName: 'Queso fresco', sku: 'LAC-001', quantity: 0.25, unitPrice: 4500, totalPrice: 1125, isWeighed: true },
      { productId: 'EMB-002', productName: 'Jamón de pavo', sku: 'EMB-002', quantity: 0.30, unitPrice: 4200, totalPrice: 1260, isWeighed: true },
    ],
    totalAmount: 2385, paymentMethod: 'transferencia', status: 'completada',
    siiDocumentNumber: null, siiDocumentType: null,
    createdAt: dt(11, 25), completedAt: dtDone(11, 26),
  },
  {
    id: 'txn-015', folio: 'B-0015', balanzaId: 1,
    cajeroId: 'u4', cajeroNombre: 'María González',
    items: [
      { productId: 'POL-001', productName: 'Pollo (filete)', sku: 'POL-001', quantity: 1.05, unitPrice: 6900, totalPrice: 7245, isWeighed: true },
      { productId: 'PAT-001', productName: 'Pastel (queque)', sku: 'PAT-001', quantity: 1, unitPrice: 3200, totalPrice: 3200, isWeighed: false },
    ],
    totalAmount: 10445, paymentMethod: 'efectivo', status: 'completada',
    siiDocumentNumber: null, siiDocumentType: null,
    createdAt: dt(11, 38), completedAt: dtDone(11, 39),
  },
  {
    id: 'txn-016', folio: 'B-0016', balanzaId: 2,
    cajeroId: 'u5', cajeroNombre: 'Pedro Rojas',
    items: [
      { productId: 'CAR-002', productName: 'Carne (costilla)', sku: 'CAR-002', quantity: 0.70, unitPrice: 5200, totalPrice: 3640, isWeighed: true },
    ],
    totalAmount: 3640, paymentMethod: 'credito', status: 'anulada',
    siiDocumentNumber: null, siiDocumentType: null,
    createdAt: dt(11, 52), completedAt: null,
  },
  {
    id: 'txn-017', folio: 'B-0017', balanzaId: 3,
    cajeroId: 'u6', cajeroNombre: 'Laura Silva',
    items: [
      { productId: 'EMB-001', productName: 'Longaniza', sku: 'EMB-001', quantity: 1.10, unitPrice: 3800, totalPrice: 4180, isWeighed: true },
      { productId: 'VER-002', productName: 'Tomate', sku: 'VER-002', quantity: 1.20, unitPrice: 1100, totalPrice: 1320, isWeighed: true },
    ],
    totalAmount: 5500, paymentMethod: 'debito', status: 'completada',
    siiDocumentNumber: null, siiDocumentType: null,
    createdAt: dt(12, 5), completedAt: dtDone(12, 6),
  },
  {
    id: 'txn-018', folio: 'B-0018', balanzaId: 4,
    cajeroId: 'u4b', cajeroNombre: 'Roberto Fuentes',
    items: [
      { productId: 'LAC-001', productName: 'Queso fresco', sku: 'LAC-001', quantity: 0.45, unitPrice: 4500, totalPrice: 2025, isWeighed: true },
      { productId: 'FRU-001', productName: 'Plátano', sku: 'FRU-001', quantity: 2.00, unitPrice: 1200, totalPrice: 2400, isWeighed: true },
    ],
    totalAmount: 4425, paymentMethod: 'transferencia', status: 'completada',
    siiDocumentNumber: null, siiDocumentType: null,
    createdAt: dt(12, 18), completedAt: dtDone(12, 19),
  },
  {
    id: 'txn-019', folio: 'B-0019', balanzaId: 5,
    cajeroId: 'u3', cajeroNombre: 'Operario',
    items: [
      { productId: 'POL-001', productName: 'Pollo (filete)', sku: 'POL-001', quantity: 1.60, unitPrice: 6900, totalPrice: 11040, isWeighed: true },
      { productId: 'CAR-002', productName: 'Carne (costilla)', sku: 'CAR-002', quantity: 0.90, unitPrice: 5200, totalPrice: 4680, isWeighed: true },
      { productId: 'LAC-002', productName: 'Mantequilla', sku: 'LAC-002', quantity: 2, unitPrice: 2800, totalPrice: 5600, isWeighed: false },
    ],
    totalAmount: 21320, paymentMethod: 'efectivo', status: 'completada',
    siiDocumentNumber: '004525', siiDocumentType: 'boleta',
    createdAt: dt(12, 32), completedAt: dtDone(12, 35),
  },
  {
    id: 'txn-020', folio: 'B-0020', balanzaId: 1,
    cajeroId: 'u4', cajeroNombre: 'María González',
    items: [
      { productId: 'CAR-002', productName: 'Carne (costilla)', sku: 'CAR-002', quantity: 1.30, unitPrice: 5200, totalPrice: 6760, isWeighed: true },
    ],
    totalAmount: 6760, paymentMethod: 'credito', status: 'completada',
    siiDocumentNumber: null, siiDocumentType: null,
    createdAt: dt(12, 45), completedAt: dtDone(12, 46),
  },
  {
    id: 'txn-021', folio: 'B-0021', balanzaId: 2,
    cajeroId: 'u5', cajeroNombre: 'Pedro Rojas',
    items: [
      { productId: 'POL-001', productName: 'Pollo (filete)', sku: 'POL-001', quantity: 0.80, unitPrice: 6900, totalPrice: 5520, isWeighed: true },
      { productId: 'VER-001', productName: 'Lechuga', sku: 'VER-001', quantity: 1, unitPrice: 890, totalPrice: 890, isWeighed: false },
    ],
    totalAmount: 6410, paymentMethod: 'efectivo', status: 'completada',
    siiDocumentNumber: null, siiDocumentType: null,
    createdAt: dt(13, 2), completedAt: dtDone(13, 3),
  },
  {
    id: 'txn-022', folio: 'B-0022', balanzaId: 3,
    cajeroId: 'u6', cajeroNombre: 'Laura Silva',
    items: [
      { productId: 'EMB-001', productName: 'Longaniza', sku: 'EMB-001', quantity: 0.75, unitPrice: 3800, totalPrice: 2850, isWeighed: true },
      { productId: 'PAT-001', productName: 'Pastel (queque)', sku: 'PAT-001', quantity: 1, unitPrice: 3200, totalPrice: 3200, isWeighed: false },
    ],
    totalAmount: 6050, paymentMethod: 'debito', status: 'completada',
    siiDocumentNumber: null, siiDocumentType: null,
    createdAt: dt(13, 15), completedAt: dtDone(13, 16),
  },
  {
    id: 'txn-023', folio: 'B-0023', balanzaId: 5,
    cajeroId: 'u3', cajeroNombre: 'Operario',
    items: [
      { productId: 'POL-001', productName: 'Pollo (filete)', sku: 'POL-001', quantity: 2.40, unitPrice: 6900, totalPrice: 16560, isWeighed: true },
      { productId: 'FRU-001', productName: 'Plátano', sku: 'FRU-001', quantity: 1.80, unitPrice: 1200, totalPrice: 2160, isWeighed: true },
      { productId: 'VER-002', productName: 'Tomate', sku: 'VER-002', quantity: 0.60, unitPrice: 1100, totalPrice: 660, isWeighed: true },
    ],
    totalAmount: 19380, paymentMethod: 'credito', status: 'completada',
    siiDocumentNumber: '004526', siiDocumentType: 'boleta',
    createdAt: dt(13, 28), completedAt: dtDone(13, 30),
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
