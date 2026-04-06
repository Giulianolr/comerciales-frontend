// KPI Types
export type TrendDirection = 'up' | 'down' | 'flat'

export interface TrendValue {
  percentage: number
  direction: TrendDirection
  vsLabel: string
}

export interface DailyKPIs {
  totalVentas: number
  totalTransacciones: number
  ticketPromedio: number
  balanzasActivas: number
  balanzasTotal: number
  lastUpdatedAt: string
  ventasTrend: TrendValue
  transaccionesTrend: TrendValue
  ticketTrend: TrendValue
}

// Transaction Types
export type TransactionStatus = 'completada' | 'anulada' | 'pendiente' | 'error'
export type PaymentMethod = 'efectivo' | 'debito' | 'credito' | 'transferencia'

export interface TransactionItem {
  productId: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  totalPrice: number
  isWeighed: boolean
}

export interface Transaction {
  id: string
  folio: string
  balanzaId: number
  cajeroId: string
  cajeroNombre: string
  items: TransactionItem[]
  totalAmount: number
  paymentMethod: PaymentMethod
  status: TransactionStatus
  siiDocumentNumber: string | null
  siiDocumentType: 'boleta' | 'factura' | null
  createdAt: string
  completedAt: string | null
}

// Inventory Types
export type StockStatus = 'ok' | 'low' | 'critical' | 'out_of_stock'
export type ProductCategory = 'carnes' | 'lacteos' | 'verduras' | 'frutas' | 'embutidos' | 'panaderia' | 'otros'

export interface Product {
  id: string
  sku: string
  name: string
  category: ProductCategory
  unit: 'kg' | 'unidad' | 'litro'
  currentStock: number
  minStock: number
  criticalStock: number
  stockStatus: StockStatus
  pricePerUnit: number
  lastRestockedAt: string | null
  lastSoldAt: string | null
  totalSoldToday: number
}

export interface LowStockAlert {
  productId: string
  productName: string
  currentStock: number
  minStock: number
  stockStatus: 'low' | 'critical' | 'out_of_stock'
  triggeredAt: string
  acknowledged: boolean
}

// Station Types
export type StationStatus = 'activa' | 'inactiva' | 'error' | 'mantenimiento'
export type StationType = 'balanza' | 'caja'

export interface Station {
  id: number
  name: string
  type: StationType
  status: StationStatus
  operatorId: string | null
  operatorName: string | null
  transactionsToday: number
  ventasToday: number
  lastActivityAt: string | null
  ipAddress: string
  firmwareVersion: string
}

// User Types
export type UserRole = 'gerente' | 'operador' | 'cajero' | 'supervisor'

export interface User {
  id: string
  rut: string
  nombre: string
  apellido: string
  email: string
  role: UserRole
  isActive: boolean
  assignedStationId: number | null
  lastLoginAt: string | null
  createdAt: string
}

// Report Types
export interface HourlySalesPoint {
  hour: number
  label: string
  ventas: number
  transacciones: number
}

export interface TopProduct {
  productId: string
  productName: string
  category: ProductCategory
  totalSold: number
  totalRevenue: number
  transactionCount: number
}

export interface StationSalesSummary {
  stationId: number
  stationName: string
  ventas: number
  transacciones: number
  ticketPromedio: number
}

export interface DailyReport {
  date: string
  kpis: DailyKPIs
  hourlySales: HourlySalesPoint[]
  topProducts: TopProduct[]
  stationSummaries: StationSalesSummary[]
  paymentMethodBreakdown: Record<PaymentMethod, number>
}

// Auth
export interface AuthToken {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthUser {
  id: string
  email: string
  nombre: string
  role: UserRole
}
