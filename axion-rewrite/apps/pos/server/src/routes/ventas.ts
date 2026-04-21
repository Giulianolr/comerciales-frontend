import { FastifyInstance } from 'fastify'
import { prisma } from '@optimind/database'
import { ESTADO_TRANS_PROCESADO, TipoDocumento } from '@optimind/shared'

const COD_EMPRESA = parseInt(process.env.COD_EMPRESA ?? '1')
const COD_SUCURSAL = parseInt(process.env.COD_SUCURSAL ?? '1')
const COD_BODEGA = parseInt(process.env.COD_BODEGA ?? '1')
const COD_CAJA = parseInt(process.env.COD_CAJA ?? '1')

export async function ventasRoutes(app: FastifyInstance) {
  /**
   * POST /api/ventas/confirmar
   * Confirma la venta: graba cabezal + detalle, descuenta stock, marca QR procesado.
   * Este es el endpoint más crítico del sistema.
   */
  app.post<{
    Body: {
      idTransaccion: string
      codCajero: number
      tipoDocumento: number
      rutCliente?: string
      descuentoGlobal?: number
    }
  }>('/confirmar', async (req, reply) => {
    const { idTransaccion, codCajero, tipoDocumento, rutCliente, descuentoGlobal = 0 } = req.body

    const idTrans = BigInt(idTransaccion)

    // Leer la transacción de balanza con items
    const cabezalBal = await prisma.cabezalTransBalanza.findFirst({
      where: { codEmpresa: COD_EMPRESA, codSucursal: COD_SUCURSAL, idTransaccion: idTrans, estado: 'N' },
      include: {
        detalles: {
          include: {
            producto: { select: { descripcion: true, impuestoIva: { select: { porcImp: true } }, sinControlStock: true } },
          },
        },
      },
    })

    if (!cabezalBal) return reply.notFound('Transacción no encontrada o ya procesada')

    // Obtener siguiente folio
    const nroCargo = await getNextFolio(tipoDocumento)

    // ─────────────────────────────────────
    // Ejecutar todo en una transacción DB
    // ─────────────────────────────────────
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Crear cabezal de venta
      const montoFinal = Number(cabezalBal.monto) * (1 - descuentoGlobal / 100)

      await tx.cabezalVenta.create({
        data: {
          codEmpresa: COD_EMPRESA,
          codSucursal: COD_SUCURSAL,
          tipoCargo: tipoDocumento,
          nroCargo: BigInt(nroCargo),
          nroFiscal: BigInt(0),  // Se asigna al timbrar con SII
          rutClte: rutCliente ?? '0-0',
          codSucursalClte: 0,
          codCajero,
          codEmpleado: cabezalBal.codVendedor,
          caja: COD_CAJA,
          fechaEm: new Date(),
          monto: montoFinal,
          montoDescuento: Number(cabezalBal.monto) - montoFinal,
          montoImpuesto: calcularIva(montoFinal),
          netoAfecto: calcularNeto(montoFinal),
          tipoDeFactura: tipoDocumento,
          anulada: false,
          impresa: false,
          pendiente: false,
          macHost: req.hostname,
          fechaIngreso: new Date(),
        },
      })

      // 2. Crear líneas de venta y descontar stock
      for (const [idx, det] of cabezalBal.detalles.entries()) {
        const porcIva = Number(det.producto.impuestoIva?.porcImp ?? 19)
        const cantFinal = Number(det.cantidad)
        const precioPublico = Number(det.precioUnitario)
        const precioNeto = precioPublico / (1 + porcIva / 100)

        await tx.detalleVenta.create({
          data: {
            codEmpresa: COD_EMPRESA,
            codSucursal: COD_SUCURSAL,
            codSucursalMov: COD_SUCURSAL,
            codBodega: COD_BODEGA,
            tipo: tipoDocumento,
            tipoDeFactura: tipoDocumento,
            numero: BigInt(nroCargo),
            rutClte: rutCliente ?? '0-0',
            codEmpleado: cabezalBal.codVendedor,
            caja: COD_CAJA,
            nroItem: idx + 1,
            codArt: det.codArt,
            descripcion: det.producto.descripcion,
            costo: 0,
            precioUnitario: precioNeto,
            precioVentaPublico: precioPublico,
            cantidad: cantFinal,
            descuento: descuentoGlobal,
            iva: porcIva,
            actualizaStock: !det.producto.sinControlStock,
            fecha: new Date(),
          },
        })

        // 3. Descontar stock (si el producto tiene control de stock)
        if (!det.producto.sinControlStock) {
          await tx.bodegaStock.updateMany({
            where: { codEmpresa: COD_EMPRESA, codSucursal: COD_SUCURSAL, codBodega: COD_BODEGA, codArt: det.codArt },
            data: { stock: { decrement: cantFinal } },
          })

          // Registrar movimiento de stock
          const stockActual = await tx.bodegaStock.findFirst({
            where: { codEmpresa: COD_EMPRESA, codSucursal: COD_SUCURSAL, codBodega: COD_BODEGA, codArt: det.codArt },
            select: { stock: true },
          })

          await tx.modificacionStock.create({
            data: {
              codEmpresa: COD_EMPRESA,
              codSucursal: COD_SUCURSAL,
              numId: BigInt(Date.now() + idx),
              operacion: 'VENTA',
              codEmpleado: codCajero,
              macHost: req.hostname,
              codArt: det.codArt,
              fecha: new Date(),
              accion: 2,  // Salida
              descripcion: det.producto.descripcion,
              precio: precioPublico,
              codBodega: COD_BODEGA,
              cantidad: cantFinal,
              stockAnterior: Number(stockActual?.stock ?? 0) + cantFinal,
              stockNuevo: Number(stockActual?.stock ?? 0),
            },
          })
        }
      }

      // 4. Marcar transacción balanza como procesada
      await tx.cabezalTransBalanza.updateMany({
        where: { codEmpresa: COD_EMPRESA, codSucursal: COD_SUCURSAL, idTransaccion: idTrans },
        data: { estado: ESTADO_TRANS_PROCESADO },
      })

      return { nroCargo, monto: montoFinal }
    })

    return {
      ok: true,
      data: {
        nroCargo: resultado.nroCargo,
        monto: resultado.monto,
        mensaje: `Venta #${resultado.nroCargo} registrada`,
      },
    }
  })

  /**
   * GET /api/ventas/ultima
   * Retorna la última venta de esta caja (para reimpresión).
   */
  app.get('/ultima', async () => {
    const venta = await prisma.cabezalVenta.findFirst({
      where: { codEmpresa: COD_EMPRESA, codSucursal: COD_SUCURSAL, caja: COD_CAJA, anulada: false },
      orderBy: { nroCargo: 'desc' },
      include: { detalles: true },
    })
    return { ok: true, data: venta }
  })
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

async function getNextFolio(tipoCargo: number): Promise<number> {
  const ultima = await prisma.cabezalVenta.findFirst({
    where: { codEmpresa: COD_EMPRESA, codSucursal: COD_SUCURSAL, tipoCargo },
    orderBy: { nroCargo: 'desc' },
    select: { nroCargo: true },
  })
  return Number(ultima?.nroCargo ?? 0) + 1
}

function calcularIva(montoConIva: number, porcIva = 19): number {
  return montoConIva - montoConIva / (1 + porcIva / 100)
}

function calcularNeto(montoConIva: number, porcIva = 19): number {
  return montoConIva / (1 + porcIva / 100)
}
