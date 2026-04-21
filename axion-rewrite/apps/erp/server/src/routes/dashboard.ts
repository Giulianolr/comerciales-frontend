import { FastifyInstance } from 'fastify'
import { prisma } from '@optimind/database'

const COD_EMPRESA = parseInt(process.env.COD_EMPRESA ?? '1')
const COD_SUCURSAL = parseInt(process.env.COD_SUCURSAL ?? '1')

export async function dashboardRoutes(app: FastifyInstance) {
  // GET /api/dashboard — métricas generales para la vista principal
  app.get('/', async () => {
    const ahora = new Date()
    const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
    const inicioSemana = new Date(inicioHoy)
    inicioSemana.setDate(inicioHoy.getDate() - inicioHoy.getDay())
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1)
    const finMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0, 23, 59, 59)

    const whereBase = { codEmpresa: COD_EMPRESA, codSucursal: COD_SUCURSAL, anulada: false }

    const [ventasHoy, ventasSemana, ventasMes, ventasMesAnterior, stockCriticoCount, ultimasVentas] =
      await Promise.all([
        // Ventas hoy
        prisma.cabezalVenta.aggregate({
          where: { ...whereBase, fechaEm: { gte: inicioHoy } },
          _sum: { monto: true },
          _count: { _all: true },
        }),
        // Ventas semana
        prisma.cabezalVenta.aggregate({
          where: { ...whereBase, fechaEm: { gte: inicioSemana } },
          _sum: { monto: true },
          _count: { _all: true },
        }),
        // Ventas mes actual
        prisma.cabezalVenta.aggregate({
          where: { ...whereBase, fechaEm: { gte: inicioMes } },
          _sum: { monto: true },
          _count: { _all: true },
        }),
        // Ventas mes anterior (para comparación)
        prisma.cabezalVenta.aggregate({
          where: { ...whereBase, fechaEm: { gte: inicioMesAnterior, lte: finMesAnterior } },
          _sum: { monto: true },
        }),
        // Cantidad de productos en stock crítico
        prisma.bodegaStock.count({
          where: {
            codEmpresa: COD_EMPRESA,
            codSucursal: COD_SUCURSAL,
            producto: { estado: 1, stockCritico: { gt: 0 } },
          },
        }),
        // Últimas 5 ventas
        prisma.cabezalVenta.findMany({
          where: { ...whereBase },
          orderBy: { fechaEm: 'desc' },
          take: 5,
          include: { cajero: { select: { nombre: true } } },
        }),
      ])

    const montoHoy = Number(ventasHoy._sum.monto ?? 0)
    const montoMes = Number(ventasMes._sum.monto ?? 0)
    const montoMesAnterior = Number(ventasMesAnterior._sum.monto ?? 0)
    const variacionMes = montoMesAnterior > 0
      ? ((montoMes - montoMesAnterior) / montoMesAnterior) * 100
      : null

    const ticketPromedio = ventasMes._count._all > 0
      ? montoMes / ventasMes._count._all
      : 0

    return {
      ok: true,
      data: {
        kpis: {
          ventasHoy: { monto: montoHoy, cantidad: ventasHoy._count._all },
          ventasSemana: { monto: Number(ventasSemana._sum.monto ?? 0), cantidad: ventasSemana._count._all },
          ventasMes: { monto: montoMes, cantidad: ventasMes._count._all, variacion: variacionMes },
          ticketPromedio: Math.round(ticketPromedio),
          stockCritico: stockCriticoCount,
        },
        ultimasVentas: ultimasVentas.map((v) => ({
          nroCargo: Number(v.nroCargo),
          tipoCargo: v.tipoCargo,
          monto: Number(v.monto),
          cajero: v.cajero.nombre,
          fechaEm: v.fechaEm,
        })),
      },
    }
  })

  // GET /api/dashboard/ventas-por-hora — distribución horaria del día actual
  app.get('/ventas-por-hora', async () => {
    const inicioHoy = new Date()
    inicioHoy.setHours(0, 0, 0, 0)

    const ventas = await prisma.cabezalVenta.findMany({
      where: {
        codEmpresa: COD_EMPRESA,
        codSucursal: COD_SUCURSAL,
        anulada: false,
        fechaEm: { gte: inicioHoy },
      },
      select: { fechaEm: true, monto: true },
    })

    const porHora: Record<number, { monto: number; cantidad: number }> = {}
    for (let h = 8; h <= 21; h++) porHora[h] = { monto: 0, cantidad: 0 }

    for (const v of ventas) {
      const hora = v.fechaEm.getHours()
      if (porHora[hora]) {
        porHora[hora].monto += Number(v.monto)
        porHora[hora].cantidad += 1
      }
    }

    return {
      ok: true,
      data: Object.entries(porHora).map(([hora, d]) => ({
        hora: parseInt(hora),
        label: `${hora}:00`,
        monto: d.monto,
        cantidad: d.cantidad,
      })),
    }
  })

  // GET /api/dashboard/top-productos — top 10 productos más vendidos del mes
  app.get('/top-productos', async () => {
    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)

    const detalles = await prisma.detalleVenta.groupBy({
      by: ['codArt'],
      where: {
        codEmpresa: COD_EMPRESA,
        cabezalVenta: { anulada: false, fechaEm: { gte: inicioMes } },
      },
      _sum: { cantidad: true },
      _count: { _all: true },
      orderBy: { _sum: { cantidad: 'desc' } },
      take: 10,
    })

    const codArts = detalles.map((d) => d.codArt)
    const productos = await prisma.producto.findMany({
      where: { codEmpresa: COD_EMPRESA, codArt: { in: codArts } },
      select: { codArt: true, descripcion: true },
    })
    const prodMap = new Map(productos.map((p) => [p.codArt, p.descripcion]))

    return {
      ok: true,
      data: detalles.map((d) => ({
        codArt: d.codArt,
        descripcion: prodMap.get(d.codArt) ?? `Art. ${d.codArt}`,
        cantidadVendida: Number(d._sum.cantidad ?? 0),
        vecesVendido: d._count._all,
      })),
    }
  })

  // GET /api/dashboard/ventas-ultimos-dias — ventas de los últimos 14 días
  app.get('/ventas-ultimos-dias', async () => {
    const dias: { fecha: string; monto: number; cantidad: number }[] = []

    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      const fin = new Date(d)
      fin.setHours(23, 59, 59, 999)

      const agg = await prisma.cabezalVenta.aggregate({
        where: {
          codEmpresa: COD_EMPRESA,
          codSucursal: COD_SUCURSAL,
          anulada: false,
          fechaEm: { gte: d, lte: fin },
        },
        _sum: { monto: true },
        _count: { _all: true },
      })

      dias.push({
        fecha: d.toISOString().split('T')[0],
        monto: Number(agg._sum.monto ?? 0),
        cantidad: agg._count._all,
      })
    }

    return { ok: true, data: dias }
  })

  // GET /api/config — nombre del local para el navbar
  app.get('/config', async () => {
    const empresa = await prisma.empresa.findFirst({
      where: { codEmpresa: COD_EMPRESA },
      select: { nombre: true, rut: true, giro: true },
    })
    const sucursal = await prisma.sucursal.findFirst({
      where: { codEmpresa: COD_EMPRESA, codSucursal: COD_SUCURSAL },
      select: { nombre: true, direccion: true },
    })
    return { ok: true, data: { empresa, sucursal } }
  })
}
