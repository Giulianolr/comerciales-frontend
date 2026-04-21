import { FastifyInstance } from 'fastify'
import { prisma } from '@optimind/database'

const COD_EMPRESA = parseInt(process.env.COD_EMPRESA ?? '1')
const COD_SUCURSAL = parseInt(process.env.COD_SUCURSAL ?? '1')
const COD_BODEGA = 1

export async function comprasRoutes(app: FastifyInstance) {
  // GET /api/compras — listado de compras
  app.get<{ Querystring: { desde?: string; hasta?: string } }>('/', async (req) => {
    const desde = req.query.desde ? new Date(req.query.desde) : undefined
    const compras = await prisma.cabezalCompra.findMany({
      where: { codEmpresa: COD_EMPRESA, codSucursal: COD_SUCURSAL, fechaEm: { gte: desde } },
      include: { detalles: true },
      orderBy: { fechaEm: 'desc' },
      take: 100,
    })
    return { ok: true, data: compras }
  })

  // POST /api/compras — registrar recepción de mercadería
  app.post<{
    Body: {
      rutProveedor: string
      tipoCargo: number
      nroCargo: number
      items: Array<{ codArt: number; descripcion: string; cantidad: number; costo: number; iva: number }>
    }
  }>('/', async (req, reply) => {
    const { rutProveedor, tipoCargo, nroCargo, items } = req.body

    const monto = items.reduce((s, i) => s + i.cantidad * i.costo * (1 + i.iva / 100), 0)

    await prisma.$transaction(async (tx) => {
      await tx.cabezalCompra.create({
        data: {
          codEmpresa: COD_EMPRESA,
          codSucursal: COD_SUCURSAL,
          tipoCargo,
          nroCargo: BigInt(nroCargo),
          rutClte: rutProveedor,
          fechaEm: new Date(),
          monto,
          estado: 0,
          anulada: false,
          impresa: false,
          pendiente: false,
        },
      })

      for (const [idx, item] of items.entries()) {
        await tx.detalleCompra.create({
          data: {
            codEmpresa: COD_EMPRESA,
            codSucursal: COD_SUCURSAL,
            tipo: tipoCargo,
            numero: BigInt(nroCargo),
            rutClte: rutProveedor,
            nroItem: idx + 1,
            codArt: item.codArt,
            descripcion: item.descripcion,
            cantidad: item.cantidad,
            precioUnitario: item.costo,
            costo: item.costo,
            iva: item.iva,
            actualizaStock: true,
            fecha: new Date(),
          },
        })

        // Aumentar stock
        await tx.bodegaStock.updateMany({
          where: { codEmpresa: COD_EMPRESA, codSucursal: COD_SUCURSAL, codBodega: COD_BODEGA, codArt: item.codArt },
          data: { stock: { increment: item.cantidad } },
        })
      }
    })

    return { ok: true, message: 'Compra registrada' }
  })
}
