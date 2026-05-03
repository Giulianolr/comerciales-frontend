/**
 * types/index.ts — Contrato de tipos del frontend.
 *
 * CONVENCIÓN: Los nombres de campo aquí son exactamente los que devuelven
 * los endpoints del backend (schemas Pydantic). NO hay transformación adicional.
 *
 * Roles eliminados: 'dev' y 'vendor' (solo existían en mocks, no en la DB).
 */

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole = 'gerente' | 'supervisor' | 'cajero' | 'operador'

export interface AuthUser {
  id: string
  email: string
  name: string         // ← users.nombre
  role: UserRole
}

export interface AuthToken {
  access_token: string
  token_type: string
  expires_in: number
  user: AuthUser
}

// ─── Usuarios ─────────────────────────────────────────────────────────────────

export interface User {
  id: string
  rut: string | null
  name: string              // ← users.nombre
  last_name: string | null  // ← users.apellido
  email: string
  phone?: string            // ← users.telefono
  role: UserRole
  is_active: boolean        // ← users.activo
  assigned_station_id: number | null   // station.numero (no UUID)
  last_login_at: string | null         // ← users.ultimo_login_at
  created_at: string
}

// ─── Inventario ───────────────────────────────────────────────────────────────

export type StockStatus = 'ok' | 'low' | 'critical' | 'out_of_stock'
// Categorías son strings libres (vienen del endpoint GET /categories)
export type ProductCategory = string

export interface Product {
  id: string
  sku: string | null          // ← codigo_interno
  barcode: string | null      // ← codigo_barras
  name: string                // ← nombre
  category_id: number | null
  category: string | null     // ← categories.nombre
  unit: 'kg' | 'unidad' | 'litro'   // mapeado por backend (UN→unidad, KG→kg, L→litro)
  current_stock: number       // ← stock_actual
  min_stock: number           // ← stock_minimo
  critical_stock: number      // ← stock_critico
  stock_status: StockStatus   // computed por backend
  price_per_unit: number      // ← precio_venta
  cost_price: number | null   // ← precio_costo
  supplier_id: string | null  // ← proveedor_id
  is_active: boolean          // ← activo
  last_restocked_at: string | null    // ← last_restocked_at
  last_sold_at: string | null         // computed por backend
  total_sold_today: number            // computed por backend
  created_at: string
}

export interface LowStockAlert {
  product_id: string
  product_name: string
  current_stock: number
  min_stock: number
  stock_status: 'low' | 'critical' | 'out_of_stock'
  triggered_at: string
  acknowledged: boolean
}

// ─── Estaciones ───────────────────────────────────────────────────────────────

export type StationStatus = 'activa' | 'inactiva' | 'error' | 'mantenimiento'
export type StationType = 'balanza' | 'caja'

export interface Station {
  id: number                  // ← stations.numero (entero secuencial, no UUID)
  uuid: string                // ← stations.id (UUID interno — para operaciones que lo requieran)
  name: string                // ← nombre
  type: StationType           // ← tipo
  status: StationStatus       // ← estado
  operator_id: string | null  // ← operador_actual_id
  operator_name: string | null
  transactions_today: number  // computed por backend
  sales_today: number         // computed por backend
  last_activity_at: string | null   // ← ultimo_evento_at
  ip_address: string | null   // ← ip_address
  assigned_at: string | null  // ← assigned_at
}

// ─── KPIs y Dashboard ─────────────────────────────────────────────────────────

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

// ─── Transacciones / Historial ────────────────────────────────────────────────

export type TransactionStatus = 'completada' | 'anulada' | 'pendiente' | 'error'
export type PaymentMethod = 'efectivo' | 'debito' | 'credito' | 'transferencia'

export interface TransactionItem {
  product_id: string | null
  name: string           // ← nombre_producto (snapshot)
  sku: string | null     // ← sku (snapshot)
  qty: number            // ← cantidad
  unit: string
  price_unit: number     // ← precio_unitario
  total_price: number    // ← precio_total
  is_weighed: boolean
}

export interface Transaction {
  id: string
  folio: string                         // formateado: "B-0001"
  station_id: number                    // ← station.numero
  cajero_id: string | null
  cajero_name: string | null
  items: TransactionItem[]
  total_amount: number                  // ← total_clp
  subtotal: number                      // ← subtotal_clp
  iva: number                           // ← iva_clp
  payment_method: PaymentMethod
  status: TransactionStatus
  sii_document_number: string | null
  sii_document_type: 'boleta' | 'factura' | null
  created_at: string
  completed_at: string | null
}

// ─── Reportes ─────────────────────────────────────────────────────────────────

export interface HourlySalesPoint {
  hour: number
  label: string
  ventas: number
  transacciones: number
}

export interface TopProduct {
  product_id: string
  product_name: string
  category: string
  total_sold: number
  total_revenue: number
  transaction_count: number
}

export interface StationSalesSummary {
  station_id: number
  station_name: string
  ventas: number
  transacciones: number
  ticket_promedio: number
}

export interface DailyReport {
  date: string
  kpis: DailyKPIs
  hourly_sales: HourlySalesPoint[]
  top_products: TopProduct[]
  station_summaries: StationSalesSummary[]
  payment_method_breakdown: Record<PaymentMethod, number>
}

// ─── Vista Caja ───────────────────────────────────────────────────────────────

export type CajaEstado = 'idle' | 'active' | 'cash' | 'processing' | 'success'

export interface ItemVenta {
  id: number
  name: string
  qty: number
  unit: 'kg' | 'UN'
  price_unit: number      // era: priceUnit
  supplier: string | null
}

export interface PreBoleta {
  id: string
  station_id: number      // ← station.numero (era: balanzaId)
  station_name: string    // ← station.nombre (era: balanzaNombre)
  items: ItemVenta[]
  created_ago: string     // calculado en frontend desde created_at (era: creadaHace)
}

export interface EventoCaja {
  id: string
  station_id: number
  station_name: string
  numero_boleta: number
  total: number
  item_count: number
  items: ItemVenta[]
  fecha: string
}

export interface TabVenta {
  tabId: number
  preBoleta: PreBoleta
  mergedWith: string[]    // IDs de pre-boletas absorbidas
}

export interface BalanzaEnCola {
  id: number              // station.numero
  nombre: string
  total: number
  itemCount: number
  creadaHace: string
  activa: boolean
  advertencia?: boolean
}

// ─── Turnos ───────────────────────────────────────────────────────────────────

export interface TurnoRecord {
  id: string
  station_id: number
  station_name: string
  operator_id: string
  operator_name: string
  operator_role: string
  start_time: string
  end_time: string
  transacciones: number
  total_ventas: number
  fecha: string
}

// ─── Configuración ────────────────────────────────────────────────────────────

export interface AppConfig {
  business_name: string
  business_subtitle: string
  iva_percentage: number       // ← config['iva_porcentaje'] — usar en lugar de hardcoded 1.19
  initial_cash_fund: number
  vendor_name: string
}
