// ============================================================
// Constantes del sistema
// ============================================================

/** Código empresa por defecto */
export const DEFAULT_COD_EMPRESA = 1

/** Código sucursal por defecto */
export const DEFAULT_COD_SUCURSAL = 1

/** Código bodega por defecto */
export const DEFAULT_COD_BODEGA = 1

/** Lista de precios por defecto */
export const DEFAULT_COD_LISTA = 1

/** Duración del token JWT en segundos (8 horas) */
export const JWT_EXPIRES_IN = 60 * 60 * 8

/** Estado de transacción balanza: pendiente */
export const ESTADO_TRANS_PENDIENTE = 'N'

/** Estado de transacción balanza: procesado en caja */
export const ESTADO_TRANS_PROCESADO = 'S'

/** Puertos por módulo (para desarrollo local) */
export const PORTS = {
  BALANZA: 3001,
  POS: 3002,
  ERP: 3003,
  DTE: 3004,
} as const

/** Tipo documento por defecto en POS */
export const DOC_BOLETA_ELECTRONICA = 39
export const DOC_FACTURA_AFECTA = 33

/** Separador en el QR — versión compacta */
export const QR_VERSION = 1
