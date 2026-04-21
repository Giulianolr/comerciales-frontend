import { FastifyInstance } from 'fastify'
import { prisma } from '@optimind/database'

const COD_EMPRESA = parseInt(process.env.COD_EMPRESA ?? '1')
const COD_SUCURSAL = parseInt(process.env.COD_SUCURSAL ?? '1')

export async function ventasRoutes(app: FastifyInstance) {
  // GET /api/ventas — resumen de ventas por período
  app.get<{ Querystring: { desde?: string; hasta?: string } }>('/', async (req) => {
    const desde = req.query.desde ? new Date(req.query.desde) : new Date(new Date().setHours(0, 0, 0, 0))
    const hasta = req.query.hasta ? new Date(req.query.hasta) : new Date()

    const ventas = await prisma.cabezalVenta.findMany({
      where: {
        codEmpresa: COD_EMPRESA,
        codSucursal: COD_SUCURSAL,
        anulada: false,
        fechaEm: { gte: desde, lte: hasta },
      },
      include: {
        detalles: { select: { codArt: true, cantidad: true, precioVentaPublico: true, descuento: true } },
        cajero: { select: { nombre: true } },
      },
      orderBy: { fechaEm: 'desc' },
    })

    const totalVentas = ventas.reduce((sum, v) => sum + Number(v.monto), 0)
    const totalBoletas = ventas.filter((v) => v.tipoCargo === 39 || v.tipoCargo === 41).length
    const totalFacturas = ventas.filter((v) => v.tipoCargo === 33).length

    return {
      ok: true,
      data: {
        resumen: { totalVentas, cantidadDocs: ventas.length, totalBoletas, totalFacturas },
        ventas: ventas.map((v) => ({
          nroCargo: Number(v.nroCargo),
          tipoCargo: v.tipoCargo,
          rutClte: v.rutClte,
          cajero: v.cajero.nombre,
          monto: Number(v.monto),
          fechaEm: v.fechaEm,
          nroItems: v.detalles.length,
        })),
      },
    }
  })
}
