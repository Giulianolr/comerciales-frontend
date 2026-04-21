import { FastifyInstance } from 'fastify'
import { prisma } from '@optimind/database'

const COD_EMPRESA = parseInt(process.env.COD_EMPRESA ?? '1')
const COD_SUCURSAL = parseInt(process.env.COD_SUCURSAL ?? '1')

export async function inventarioRoutes(app: FastifyInstance) {
  // GET /api/inventario/stock-critico — productos bajo stock crítico
  app.get('/stock-critico', async () => {
    const items = await prisma.bodegaStock.findMany({
      where: {
        codEmpresa: COD_EMPRESA,
        codSucursal: COD_SUCURSAL,
        producto: { estado: 1 },
      },
      include: {
        producto: { select: { descripcion: true, simboloUnLista: true, stockCritico: true } },
      },
    })

    const criticos = items.filter((i) => Number(i.stock) <= Number(i.producto.stockCritico ?? 0))

    return {
      ok: true,
      data: criticos.map((i) => ({
        codArt: i.codArt,
        descripcion: i.producto.descripcion,
        stock: Number(i.stock),
        stockCritico: Number(i.producto.stockCritico),
        diferencia: Number(i.stock) - Number(i.producto.stockCritico),
        simbolo: i.producto.simboloUnLista ?? 'UN',
      })),
    }
  })

  // GET /api/inventario/movimientos/:codArt
  app.get<{ Params: { codArt: string }; Querystring: { desde?: string; hasta?: string } }>(
    '/movimientos/:codArt', async (req) => {
      const codArt = parseInt(req.params.codArt)
      const desde = req.query.desde ? new Date(req.query.desde) : undefined
      const hasta = req.query.hasta ? new Date(req.query.hasta) : undefined

      const movimientos = await prisma.modificacionStock.findMany({
        where: {
          codEmpresa: COD_EMPRESA,
          codArt,
          fecha: { gte: desde, lte: hasta },
        },
        orderBy: { fecha: 'desc' },
        take: 100,
      })

      return { ok: true, data: movimientos }
    }
  )
}
