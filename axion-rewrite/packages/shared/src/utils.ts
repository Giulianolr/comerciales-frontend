// ============================================================
// Utilidades compartidas
// ============================================================

import type { QrTransaccionPayload } from './types'

/**
 * Formatea un número como moneda chilena (pesos)
 * Ej: 1990 → "$1.990"
 */
export function formatPesos(amount: number | string): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

/**
 * Redondea al múltiplo más cercano (para redondeo de boletas)
 * Ej: redondear(1994, 10) → 1990
 */
export function redondear(valor: number, multiplo: number): number {
  if (multiplo <= 0) return Math.round(valor)
  return Math.round(valor / multiplo) * multiplo
}

/**
 * Calcula el precio con IVA
 */
export function calcularPrecioConIva(precioNeto: number, porcIva: number): number {
  return Math.round(precioNeto * (1 + porcIva / 100))
}

/**
 * Calcula el precio neto desde el precio con IVA
 */
export function calcularPrecioNeto(precioConIva: number, porcIva: number): number {
  return precioConIva / (1 + porcIva / 100)
}

/**
 * Serializa el payload del QR a string compacto
 * Formato: e|s|t|m|ts
 */
export function serializarQr(payload: QrTransaccionPayload): string {
  return `${payload.e}|${payload.s}|${payload.t}|${payload.m}|${payload.ts}`
}

/**
 * Deserializa el string del QR al payload
 */
export function deserializarQr(qrString: string): QrTransaccionPayload | null {
  try {
    const partes = qrString.split('|')
    if (partes.length !== 5) return null
    return {
      e: parseInt(partes[0]),
      s: parseInt(partes[1]),
      t: partes[2],
      m: parseFloat(partes[3]),
      ts: parseInt(partes[4]),
    }
  } catch {
    return null
  }
}

/**
 * Valida un RUT chileno
 * Ej: "12345678-9" o "123456789"
 */
export function validarRut(rut: string): boolean {
  const rutLimpio = rut.replace(/[.\-]/g, '').toUpperCase()
  if (!/^\d{7,8}[0-9K]$/.test(rutLimpio)) return false
  const cuerpo = rutLimpio.slice(0, -1)
  const dv = rutLimpio.slice(-1)
  let suma = 0
  let multiplo = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplo
    multiplo = multiplo === 7 ? 2 : multiplo + 1
  }
  const dvEsperado = 11 - (suma % 11)
  const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : String(dvEsperado)
  return dv === dvCalculado
}

/**
 * Formatea un RUT con puntos y guión
 * Ej: "12345678" → "12.345.678-9"
 */
export function formatearRut(rut: string): string {
  const rutLimpio = rut.replace(/[.\-]/g, '')
  const cuerpo = rutLimpio.slice(0, -1)
  const dv = rutLimpio.slice(-1)
  return cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv
}

/**
 * Genera un ID único para transacciones de balanza
 * Basado en timestamp + número balanza
 */
export function generarIdTransaccion(nroBalanza: number): bigint {
  const ts = BigInt(Date.now())
  const bal = BigInt(nroBalanza * 1000)
  return ts * 10000n + bal
}
