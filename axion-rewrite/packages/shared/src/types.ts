// ============================================================
// Tipos compartidos entre todos los módulos de Axion
// ============================================================

/** Payload del QR generado por la balanza */
export interface QrTransaccionPayload {
  /** Código empresa */
  e: number
  /** Código sucursal */
  s: number
  /** ID transacción único (PK de cabezaltransbalanza) */
  t: string
  /** Monto total de la transacción */
  m: number
  /** Timestamp de generación (evita reutilización) */
  ts: number
}

/** Item de una transacción de balanza */
export interface ItemTransBalanza {
  nroItem: number
  codArt: number
  descripcion: string
  cantidad: number
  precioUnitario: number
  totalPlu: number
  simboloUnidad: string
}

/** Transacción completa de balanza (cabezal + detalle) */
export interface TransaccionBalanza {
  idTransaccion: string
  nroBalanza: number
  codVendedor: number
  fechaTrans: Date
  nroItems: number
  monto: number
  estado: 'N' | 'S'
  items: ItemTransBalanza[]
}

/** Item de una venta en POS */
export interface ItemVenta {
  nroItem: number
  codArt: number
  codBarra?: string
  descripcion: string
  cantidad: number
  precioUnitario: number
  precioVentaPublico: number
  descuento: number
  iva: number
  total: number
}

/** Tipos de documento SII Chile */
export enum TipoDocumento {
  FACTURA_AFECTA = 33,
  FACTURA_NO_AFECTA = 34,
  LIQUIDACION_FACTURA = 40,
  BOLETA_AFECTA = 39,
  BOLETA_NO_AFECTA = 41,
  NOTA_DEBITO = 56,
  NOTA_CREDITO = 61,
}

/** Niveles de acceso del sistema */
export enum NivelAcceso {
  ADMINISTRADOR = 1,
  SUPERVISOR = 2,
  CAJERO = 3,
}

/** Resultado de autenticación */
export interface AuthResult {
  ok: boolean
  codEmpleado?: number
  nombre?: string
  nivel?: NivelAcceso
  cargo?: string
  token?: string
  error?: string
}

/** Respuesta estándar API */
export interface ApiResponse<T = unknown> {
  ok: boolean
  data?: T
  error?: string
  message?: string
}

/** Parámetros para buscar precio de un producto */
export interface BuscarPrecioParams {
  codEmpresa: number
  codSucursal: number
  codLista: number
  codBarra?: string
  codArt?: number
}

/** Resultado de búsqueda de precio */
export interface PrecioProducto {
  codArt: number
  descripcion: string
  descripcionCorta: string
  precioPublico: number    // IMPPRECIO1 — precio final con IVA
  precioNeto: number       // PRECIO1 — precio sin IVA
  iva: number              // % IVA
  ilaPorc: number          // % ILA (si aplica)
  simboloUnidad: string
  tipoPesable: boolean
  stock: number
  enPromocion: boolean
}
