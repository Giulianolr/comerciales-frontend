import { FastifyInstance } from 'fastify'
import { prisma } from '@optimind/database'
import { parseStringPromise } from 'xml2js'

const COD_EMPRESA = parseInt(process.env.COD_EMPRESA ?? '1')

/**
 * CAF (Código de Autorización de Folios) — gestión de rangos de folios
 * autorizados por el SII para cada tipo de DTE.
 *
 * Flujo:
 *   1. Empresa descarga archivo CAF desde sii.cl (XML firmado por SII)
 *   2. POST /api/caf/cargar — sube el XML y se almacena en BD
 *   3. Al emitir cada DTE, se consulta GET /api/caf/siguiente/:tipoDTE
 *      para obtener el próximo folio disponible y se incrementa el contador
 */

export async function cafRoutes(app: FastifyInstance) {
  // GET /api/caf — lista de CAFs vigentes por tipo DTE
  app.get('/', async () => {
    const cafs = await prisma.caf.findMany({
      where: { codEmpresa: COD_EMPRESA },
      orderBy: [{ tipoDte: 'asc' }, { folioDesde: 'asc' }],
    })
    return {
      ok: true,
      data: cafs.map((c) => ({
        id: c.id,
        tipoDte: c.tipoDte,
        folioDesde: Number(c.folioDesde),
        folioHasta: Number(c.folioHasta),
        folioActual: Number(c.folioActual),
        disponibles: Number(c.folioHasta) - Number(c.folioActual),
        fechaVencimiento: c.fechaVencimiento,
        activo: c.activo,
      })),
    }
  })

  // POST /api/caf/cargar — recibe el XML del CAF y lo almacena
  app.post<{ Body: { xmlCaf: string } }>('/cargar', async (req, reply) => {
    const { xmlCaf } = req.body
    let parsed: any
    try {
      parsed = await parseStringPromise(xmlCaf)
    } catch {
      return reply.badRequest('XML de CAF inválido')
    }

    try {
      const cafData = parsed.AUTORIZACION.CAF[0]
      const datosCaf = cafData.DA[0]
      const tipoDte = parseInt(datosCaf.TD[0])
      const folioDesde = BigInt(datosCaf.RNG[0].D[0])
      const folioHasta = BigInt(datosCaf.RNG[0].H[0])
      const fchVencimiento = new Date(cafData.RSAPK ? datosCaf.FA[0] : datosCaf.FA[0])

      // Desactivar CAFs anteriores del mismo tipo
      await prisma.caf.updateMany({
        where: { codEmpresa: COD_EMPRESA, tipoDte, activo: true },
        data: { activo: false },
      })

      await prisma.caf.create({
        data: {
          codEmpresa: COD_EMPRESA,
          tipoDte,
          folioDesde,
          folioHasta,
          folioActual: folioDesde,
          fechaVencimiento: fchVencimiento,
          xmlCaf,
          activo: true,
        },
      })

      return { ok: true, message: `CAF tipo ${tipoDte} cargado: folios ${folioDesde}–${folioHasta}` }
    } catch {
      return reply.badRequest('No se pudo procesar el XML del CAF')
    }
  })

  // GET /api/caf/siguiente/:tipoDte — obtiene y reserva el siguiente folio
  app.get<{ Params: { tipoDte: string } }>('/siguiente/:tipoDte', async (req, reply) => {
    const tipoDte = parseInt(req.params.tipoDte)

    const caf = await prisma.caf.findFirst({
      where: { codEmpresa: COD_EMPRESA, tipoDte, activo: true },
      orderBy: { folioDesde: 'desc' },
    })

    if (!caf) return reply.notFound(`Sin CAF activo para tipo DTE ${tipoDte}`)
    if (Number(caf.folioActual) > Number(caf.folioHasta)) {
      return reply.conflict(`CAF tipo ${tipoDte} agotado. Solicite nuevos folios al SII.`)
    }

    const folioAsignado = caf.folioActual

    await prisma.caf.update({
      where: { id: caf.id },
      data: { folioActual: { increment: 1 } },
    })

    return {
      ok: true,
      data: {
        folio: Number(folioAsignado),
        tipoDte,
        restantes: Number(caf.folioHasta) - Number(folioAsignado),
      },
    }
  })
}
