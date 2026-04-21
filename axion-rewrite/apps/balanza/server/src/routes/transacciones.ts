import { FastifyInstance } from 'fastify'
import { prisma } from '@optimind/database'
import QRCode from 'qrcode'
import {
  generarIdTransaccion,
  serializarQr,
  ESTADO_TRANS_PENDIENTE,
  ESTADO_TRANS_PROCESADO,
} from '@optimind/shared'

const COD_EMPRESA = parseInt(process.env.COD_EMPRESA ?? '1')
const COD_SUCURSAL = parseInt(process.env.COD_SUCURSAL ?? '1')
const NRO_BALANZA = parseInt(process.env.NRO_BALANZA ?? '1')

export async function transaccionRoutes(app: FastifyInstance) {
  /**
   * POST /api/transacciones/nueva
   * Crea una nueva transacción vacía en la balanza.
   * Se llama al iniciar una nueva compra.
   */
  app.post<{ Body: { codVendedor: number } }>('/nueva', async (req, reply) => {
    const { codVendedor } = req.body

    const idTransaccion = generarIdTransaccion(NRO_BALANZA)
    const nroTransaccion = await getNextNroTransaccion()

    await prisma.cabezalTransBalanza.create({
      data: {
        codEmpresa: COD_EMPRESA,
        codSucursal: COD_SUCURSAL,
        idTransaccion,
        nroBalanza: NRO_BALANZA,
        nroTransaccion,
        codVendedor,
        fechaTrans: new Date(),
        nroItems: 0,
        monto: 0,
        estado: ESTADO_TRANS_PENDIENTE,
      },
    })

    return {
      ok: true,
      data: { idTransaccion: idTransaccion.toString(), nroTransaccion },
    }
  })

  /**
   * POST /api/transacciones/:idTransaccion/agregar-item
   * Agrega un producto escaneado a la transacción activa.
   */
  app.post<{
    Params: { idTransaccion: string }
    Body: { codArt: number; cantidad: number; precioUnitario: number }
  }>('/:idTransaccion/agregar-item', async (req, reply) => {
    const idTransaccion = BigInt(req.params.idTransaccion)
    const { codArt, cantidad, precioUnitario } = req.body

    // Verificar que la transacción existe y está pendiente
    const cabezal = await prisma.cabezalTransBalanza.findFirst({
      where: {
        codEmpresa: COD_EMPRESA,
        codSucursal: COD_SUCURSAL,
        idTransaccion,
        nroBalanza: NRO_BALANZA,
        estado: ESTADO_TRANS_PENDIENTE,
      },
      include: { detalles: true },
    })

    if (!cabezal) {
      return reply.notFound('Transacción no encontrada o ya procesada')
    }

    // Verificar si el artículo ya está en la transacción → acumular
    const itemExistente = cabezal.detalles.find((d) => d.codArt === codArt)
    const nroItem = itemExistente
      ? itemExistente.nroItem
      : cabezal.detalles.length + 1

    const totalPlu = cantidad * precioUnitario

    if (itemExistente) {
      // Actualizar cantidad
      await prisma.detalleTransBalanza.update({
        where: {
          codEmpresa_codSucursal_idTransaccion_nroBalanza_nroTransaccion_nroItem: {
            codEmpresa: COD_EMPRESA,
            codSucursal: COD_SUCURSAL,
            idTransaccion,
            nroBalanza: NRO_BALANZA,
            nroTransaccion: cabezal.nroTransaccion,
            nroItem,
          },
        },
        data: {
          cantidad: { increment: cantidad },
          totalPlu: { increment: totalPlu },
        },
      })
    } else {
      // Insertar nuevo item
      await prisma.detalleTransBalanza.create({
        data: {
          codEmpresa: COD_EMPRESA,
          codSucursal: COD_SUCURSAL,
          idTransaccion,
          nroBalanza: NRO_BALANZA,
          nroTransaccion: cabezal.nroTransaccion,
          nroItem,
          codArt,
          cantidad,
          precioUnitario,
          totalPlu,
        },
      })
    }

    // Actualizar totales en cabezal
    const nuevoMonto = Number(cabezal.monto) + totalPlu
    const nuevoNroItems = itemExistente ? cabezal.nroItems : cabezal.nroItems + 1

    await prisma.cabezalTransBalanza.update({
      where: {
        codEmpresa_codSucursal_idTransaccion_nroBalanza_nroTransaccion: {
          codEmpresa: COD_EMPRESA,
          codSucursal: COD_SUCURSAL,
          idTransaccion,
          nroBalanza: NRO_BALANZA,
          nroTransaccion: cabezal.nroTransaccion,
        },
      },
      data: { monto: nuevoMonto, nroItems: nuevoNroItems },
    })

    return {
      ok: true,
      data: {
        nroItem,
        totalTransaccion: nuevoMonto,
        nroItems: nuevoNroItems,
      },
    }
  })

  /**
   * DELETE /api/transacciones/:idTransaccion/item/:nroItem
   * Elimina un item de la transacción activa.
   */
  app.delete<{
    Params: { idTransaccion: string; nroItem: string }
  }>('/:idTransaccion/item/:nroItem', async (req, reply) => {
    const idTransaccion = BigInt(req.params.idTransaccion)
    const nroItem = parseInt(req.params.nroItem)

    const cabezal = await prisma.cabezalTransBalanza.findFirst({
      where: { codEmpresa: COD_EMPRESA, codSucursal: COD_SUCURSAL, idTransaccion, nroBalanza: NRO_BALANZA, estado: ESTADO_TRANS_PENDIENTE },
      include: { detalles: true },
    })

    if (!cabezal) return reply.notFound('Transacción no encontrada')

    const item = cabezal.detalles.find((d) => d.nroItem === nroItem)
    if (!item) return reply.notFound('Item no encontrado')

    await prisma.detalleTransBalanza.delete({
      where: {
        codEmpresa_codSucursal_idTransaccion_nroBalanza_nroTransaccion_nroItem: {
          codEmpresa: COD_EMPRESA,
          codSucursal: COD_SUCURSAL,
          idTransaccion,
          nroBalanza: NRO_BALANZA,
          nroTransaccion: cabezal.nroTransaccion,
          nroItem,
        },
      },
    })

    const nuevoMonto = Number(cabezal.monto) - Number(item.totalPlu)
    await prisma.cabezalTransBalanza.update({
      where: {
        codEmpresa_codSucursal_idTransaccion_nroBalanza_nroTransaccion: {
          codEmpresa: COD_EMPRESA,
          codSucursal: COD_SUCURSAL,
          idTransaccion,
          nroBalanza: NRO_BALANZA,
          nroTransaccion: cabezal.nroTransaccion,
        },
      },
      data: { monto: nuevoMonto, nroItems: { decrement: 1 } },
    })

    return { ok: true, data: { totalTransaccion: nuevoMonto } }
  })

  /**
   * POST /api/transacciones/:idTransaccion/generar-qr
   * Genera el QR con el resumen de la transacción.
   * Este es el paso final de la balanza — retorna imagen QR base64.
   */
  app.post<{ Params: { idTransaccion: string } }>('/:idTransaccion/generar-qr', async (req, reply) => {
    const idTransaccion = BigInt(req.params.idTransaccion)

    const cabezal = await prisma.cabezalTransBalanza.findFirst({
      where: {
        codEmpresa: COD_EMPRESA,
        codSucursal: COD_SUCURSAL,
        idTransaccion,
        nroBalanza: NRO_BALANZA,
        estado: ESTADO_TRANS_PENDIENTE,
      },
      include: {
        detalles: {
          include: { producto: { select: { descripcionCorta: true, simboloUnLista: true } } },
        },
      },
    })

    if (!cabezal) return reply.notFound('Transacción no encontrada o ya procesada')
    if (cabezal.nroItems === 0) return reply.badRequest('La transacción no tiene items')

    // Serializar payload del QR
    const qrPayload = serializarQr({
      e: COD_EMPRESA,
      s: COD_SUCURSAL,
      t: idTransaccion.toString(),
      m: Number(cabezal.monto),
      ts: Date.now(),
    })

    // Generar imagen QR como base64
    const qrBase64 = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'M',
      width: 300,
      margin: 2,
    })

    return {
      ok: true,
      data: {
        qrBase64,
        qrPayload,
        idTransaccion: idTransaccion.toString(),
        monto: Number(cabezal.monto),
        nroItems: cabezal.nroItems,
        items: cabezal.detalles.map((d) => ({
          nroItem: d.nroItem,
          codArt: d.codArt,
          descripcion: d.producto.descripcionCorta,
          cantidad: Number(d.cantidad),
          precioUnitario: Number(d.precioUnitario),
          totalPlu: Number(d.totalPlu),
          simbolo: d.producto.simboloUnLista ?? 'UN',
        })),
      },
    }
  })

  /**
   * DELETE /api/transacciones/:idTransaccion
   * Cancela una transacción completa.
   */
  app.delete<{ Params: { idTransaccion: string } }>('/:idTransaccion', async (req, reply) => {
    const idTransaccion = BigInt(req.params.idTransaccion)

    await prisma.detalleTransBalanza.deleteMany({
      where: { codEmpresa: COD_EMPRESA, codSucursal: COD_SUCURSAL, idTransaccion },
    })

    await prisma.cabezalTransBalanza.deleteMany({
      where: { codEmpresa: COD_EMPRESA, codSucursal: COD_SUCURSAL, idTransaccion },
    })

    return { ok: true }
  })
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

async function getNextNroTransaccion(): Promise<number> {
  const ultima = await prisma.cabezalTransBalanza.findFirst({
    where: { codEmpresa: COD_EMPRESA, codSucursal: COD_SUCURSAL, nroBalanza: NRO_BALANZA },
    orderBy: { nroTransaccion: 'desc' },
    select: { nroTransaccion: true },
  })
  return (ultima?.nroTransaccion ?? 0) + 1
}
