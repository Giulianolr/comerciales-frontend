import { FastifyInstance } from 'fastify'
import { prisma } from '@optimind/database'
import { deserializarQr, ESTADO_TRANS_PENDIENTE } from '@optimind/shared'

const COD_EMPRESA = parseInt(process.env.COD_EMPRESA ?? '1')
const COD_SUCURSAL = parseInt(process.env.COD_SUCURSAL ?? '1')

export async function qrRoutes(app: FastifyInstance) {
  /**
   * POST /api/qr/leer
   * El cajero escanea el QR de la balanza.
   * Retorna los items con detalle completo para mostrar en pantalla.
   */
  app.post<{ Body: { qrString: string } }>('/leer', async (req, reply) => {
    const { qrString } = req.body

    const payload = deserializarQr(qrString)
    if (!payload) return reply.badRequest('QR inválido o ilegible')

    if (payload.e !== COD_EMPRESA || payload.s !== COD_SUCURSAL) {
      return reply.badRequest('QR de otra empresa/sucursal')
    }

    // Verificar que el QR no sea demasiado viejo (30 minutos máx)
    const ahoraMs = Date.now()
    const diferencia = ahoraMs - payload.ts
    if (diferencia > 30 * 60 * 1000) {
      return reply.gone('QR expirado — generar uno nuevo en balanza')
    }

    const idTransaccion = BigInt(payload.t)

    // Buscar transacción
    const cabezal = await prisma.cabezalTransBalanza.findFirst({
      where: {
        codEmpresa: COD_EMPRESA,
        codSucursal: COD_SUCURSAL,
        idTransaccion,
        estado: ESTADO_TRANS_PENDIENTE,
      },
      include: {
        detalles: {
          include: {
            producto: {
              select: {
                descripcion: true,
                descripcionCorta: true,
                simboloUnLista: true,
                codIva: true,
                impuestoIva: { select: { porcImp: true } },
              },
            },
          },
          orderBy: { nroItem: 'asc' },
        },
      },
    })

    if (!cabezal) {
      return reply.notFound('Transacción no encontrada o ya procesada')
    }

    const items = cabezal.detalles.map((d) => ({
      nroItem: d.nroItem,
      codArt: d.codArt,
      descripcion: d.producto.descripcion,
      cantidad: Number(d.cantidad),
      precioUnitario: Number(d.precioUnitario),
      totalPlu: Number(d.totalPlu),
      porcIva: Number(d.producto.impuestoIva?.porcImp ?? 19),
      simboloUnidad: d.producto.simboloUnLista ?? 'UN',
    }))

    return {
      ok: true,
      data: {
        idTransaccion: payload.t,
        nroBalanza: cabezal.nroBalanza,
        monto: Number(cabezal.monto),
        nroItems: cabezal.nroItems,
        items,
      },
    }
  })
}
