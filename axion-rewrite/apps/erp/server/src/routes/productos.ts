import { FastifyInstance } from 'fastify'
import { prisma } from '@optimind/database'

const COD_EMPRESA = parseInt(process.env.COD_EMPRESA ?? '1')

export async function productosRoutes(app: FastifyInstance) {
  // GET /api/productos — listado con stock y precio
  app.get<{ Querystring: { buscar?: string; pagina?: string; limite?: string } }>('/', async (req) => {
    const buscar = req.query.buscar ?? ''
    const pagina = parseInt(req.query.pagina ?? '1')
    const limite = parseInt(req.query.limite ?? '50')

    const [total, productos] = await prisma.$transaction([
      prisma.producto.count({
        where: {
          codEmpresa: COD_EMPRESA,
          OR: buscar ? [
            { descripcion: { contains: buscar, mode: 'insensitive' } },
            { codigosBarra: { some: { codBarra: { contains: buscar } } } },
          ] : undefined,
        },
      }),
      prisma.producto.findMany({
        where: {
          codEmpresa: COD_EMPRESA,
          OR: buscar ? [
            { descripcion: { contains: buscar, mode: 'insensitive' } },
            { codigosBarra: { some: { codBarra: { contains: buscar } } } },
          ] : undefined,
        },
        include: {
          codigosBarra: true,
          precios: { where: { codLista: 1 }, take: 1 },
          bodegaStock: true,
          impuestoIva: { select: { porcImp: true, descripcion: true } },
        },
        skip: (pagina - 1) * limite,
        take: limite,
        orderBy: { descripcion: 'asc' },
      }),
    ])

    return {
      ok: true,
      data: {
        total,
        pagina,
        totalPaginas: Math.ceil(total / limite),
        productos: productos.map((p) => ({
          codArt: p.codArt,
          descripcion: p.descripcion,
          estado: p.estado,
          stock: Number(p.bodegaStock[0]?.stock ?? 0),
          stockCritico: Number(p.stockCritico),
          precioPublico: Number(p.precios[0]?.impPrecio1 ?? 0),
          precioNeto: Number(p.precios[0]?.precio1 ?? 0),
          porcIva: Number(p.impuestoIva?.porcImp ?? 19),
          simboloUnidad: p.simboloUnLista ?? 'UN',
          codigosBarra: p.codigosBarra.map((c) => c.codBarra),
          tipoPesable: p.tipoPesable === 1,
          enPromocion: p.enPromocion,
        })),
      },
    }
  })

  // GET /api/productos/:codArt
  app.get<{ Params: { codArt: string } }>('/:codArt', async (req, reply) => {
    const codArt = parseInt(req.params.codArt)
    const prod = await prisma.producto.findFirst({
      where: { codEmpresa: COD_EMPRESA, codArt },
      include: {
        codigosBarra: true,
        precios: true,
        bodegaStock: true,
        impuestoIva: true,
        impuestoIla: true,
        familia: true,
        rubro: true,
        marca: true,
      },
    })
    if (!prod) return reply.notFound('Producto no encontrado')
    return { ok: true, data: prod }
  })

  // PUT /api/productos/:codArt/precio
  app.put<{ Params: { codArt: string }; Body: { codLista: number; impPrecio1: number; precio1: number } }>(
    '/:codArt/precio', async (req, reply) => {
      const codArt = parseInt(req.params.codArt)
      const { codLista, impPrecio1, precio1 } = req.body
      const porcIva = 19
      const margen = precio1 > 0 ? ((impPrecio1 / (1 + porcIva / 100) - precio1) / precio1) * 100 : 0

      await prisma.precio.upsert({
        where: { codEmpresa_codLista_codArt: { codEmpresa: COD_EMPRESA, codLista, codArt } },
        update: { impPrecio1, precio1, margen1: margen, fechaAct: new Date() },
        create: { codEmpresa: COD_EMPRESA, codLista, codArt, impPrecio1, precio1, margen1: margen, fechaAct: new Date() },
      })
      return { ok: true, message: 'Precio actualizado' }
    }
  )

  // PUT /api/productos/:codArt/stock (ajuste manual de stock)
  app.put<{ Params: { codArt: string }; Body: { nuevoStock: number; motivo: string; codEmpleado: number } }>(
    '/:codArt/stock', async (req, reply) => {
      const codArt = parseInt(req.params.codArt)
      const { nuevoStock, motivo, codEmpleado } = req.body

      const stockActual = await prisma.bodegaStock.findFirst({
        where: { codEmpresa: COD_EMPRESA, codArt },
        select: { stock: true },
      })

      await prisma.bodegaStock.updateMany({
        where: { codEmpresa: COD_EMPRESA, codArt },
        data: { stock: nuevoStock },
      })

      await prisma.modificacionStock.create({
        data: {
          codEmpresa: COD_EMPRESA,
          codSucursal: parseInt(process.env.COD_SUCURSAL ?? '1'),
          numId: BigInt(Date.now()),
          operacion: 'AJUSTE MANUAL',
          codEmpleado,
          codArt,
          fecha: new Date(),
          accion: nuevoStock > Number(stockActual?.stock ?? 0) ? 1 : 2,
          descripcion: motivo,
          codBodega: 1,
          cantidad: Math.abs(nuevoStock - Number(stockActual?.stock ?? 0)),
          stockAnterior: Number(stockActual?.stock ?? 0),
          stockNuevo: nuevoStock,
        },
      })

      return { ok: true, message: 'Stock ajustado' }
    }
  )
}
