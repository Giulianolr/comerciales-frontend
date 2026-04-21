import { FastifyInstance } from 'fastify'
import { prisma } from '@optimind/database'
import { construirXmlDTE, firmarXml, CabezalXml, DetalleXml } from '../lib/xml'

const COD_EMPRESA = parseInt(process.env.COD_EMPRESA ?? '1')
const COD_SUCURSAL = parseInt(process.env.COD_SUCURSAL ?? '1')

/**
 * Emisión de DTE (Documento Tributario Electrónico) para boletas y facturas.
 *
 * Flujo de emisión:
 *   1. El POS confirma una venta → llama POST /api/dte/emitir con los datos
 *   2. Se obtiene folio desde el CAF (GET /api/caf/siguiente/:tipoDTE)
 *   3. Se construye el XML según formato SII
 *   4. Se firma con el certificado digital (stub en esta versión)
 *   5. Se almacena en XmlDte y XmlBoleta
 *   6. Se retorna el XML firmado y el folio asignado
 */

interface ItemDTE {
  codArt: number
  descripcion: string
  cantidad: number
  precioUnitario: number
  descuento: number
  porcIva: number
}

export async function dteRoutes(app: FastifyInstance) {
  // POST /api/dte/emitir
  app.post<{
    Body: {
      tipoDTE: number          // 33=Factura, 39=Boleta afecta, 41=Boleta no afecta
      rutReceptor: string      // '66666666-6' para consumidor final en boleta
      razonSocialReceptor?: string
      nroVenta?: number        // Número de venta POS asociado
      items: ItemDTE[]
    }
  }>('/emitir', async (req, reply) => {
    const { tipoDTE, rutReceptor, razonSocialReceptor, nroVenta, items } = req.body

    // 1. Obtener empresa/sucursal para datos del emisor
    const empresa = await prisma.empresa.findFirst({ where: { codEmpresa: COD_EMPRESA } })
    const sucursal = await prisma.sucursal.findFirst({
      where: { codEmpresa: COD_EMPRESA, codSucursal: COD_SUCURSAL },
    })
    if (!empresa || !sucursal) return reply.internalServerError('Empresa/sucursal no configurada')

    // 2. Obtener folio del CAF (llamada interna al servicio)
    const caf = await prisma.caf.findFirst({
      where: { codEmpresa: COD_EMPRESA, tipoDte: tipoDTE, activo: true },
      orderBy: { folioDesde: 'desc' },
    })
    if (!caf || Number(caf.folioActual) > Number(caf.folioHasta)) {
      return reply.conflict(`Sin folios disponibles para tipo DTE ${tipoDTE}`)
    }
    const folio = Number(caf.folioActual)
    await prisma.caf.update({ where: { id: caf.id }, data: { folioActual: { increment: 1 } } })

    // 3. Calcular totales
    const detallesXml: DetalleXml[] = items.map((it, idx) => {
      const precioConDesc = it.precioUnitario * (1 - it.descuento / 100)
      const montoItem = precioConDesc * it.cantidad
      return {
        nroLinDet: idx + 1,
        nomItem: it.descripcion,
        qtyItem: it.cantidad,
        unmdItem: 'UN',
        prcItem: precioConDesc,
        montoItem,
      }
    })

    const mntoTotal = detallesXml.reduce((s, d) => s + d.montoItem, 0)
    const tasaIVA = 19
    // Para boletas el monto ya incluye IVA; para facturas se separa neto e IVA
    const esFactura = tipoDTE === 33
    const mntoNeto = esFactura ? Math.round(mntoTotal / (1 + tasaIVA / 100)) : undefined
    const iva = esFactura ? mntoTotal - (mntoNeto ?? 0) : Math.round(mntoTotal - mntoTotal / (1 + tasaIVA / 100))

    const fchEmis = new Date().toISOString().split('T')[0]

    const cabezal: CabezalXml = {
      tipoDTE,
      folio,
      fchEmis,
      rutEmisor: empresa.rut ?? '',
      razonSocial: empresa.nombre,
      giroEmis: empresa.giro ?? 'COMERCIO AL POR MENOR',
      dirOrigen: sucursal.direccion ?? '',
      ciudadOrigen: sucursal.ciudad ?? '',
      rutReceptor,
      razonSocialReceptor,
      mntoNeto,
      tasaIVA,
      iva,
      mntoTotal: Math.round(mntoTotal),
    }

    // 4. Construir y firmar XML
    const xmlSinFirma = construirXmlDTE(cabezal, detallesXml)
    const certPem = process.env.SII_CERT_PEM ?? ''
    const keyPem = process.env.SII_KEY_PEM ?? ''
    const xmlFirmado = firmarXml(xmlSinFirma, certPem, keyPem)

    // 5. Persistir en BD
    const xmlDte = await prisma.xmlDte.create({
      data: {
        codEmpresa: COD_EMPRESA,
        tipoDte: tipoDTE,
        folio: BigInt(folio),
        rutReceptor,
        monto: Math.round(mntoTotal),
        xml: xmlFirmado,
        fechaEmision: new Date(),
        enviado: false,
        estado: 'PENDIENTE',
      },
    })

    // XmlBoleta (copia para boletas)
    if (tipoDTE === 39 || tipoDTE === 41) {
      await prisma.xmlBoleta.create({
        data: {
          codEmpresa: COD_EMPRESA,
          codSucursal: COD_SUCURSAL,
          tipoDte: tipoDTE,
          folio: BigInt(folio),
          rutReceptor,
          monto: Math.round(mntoTotal),
          xml: xmlFirmado,
          fechaEmision: new Date(),
          nroVenta: nroVenta ? BigInt(nroVenta) : null,
        },
      })
    }

    return {
      ok: true,
      data: {
        id: xmlDte.id,
        tipoDTE,
        folio,
        monto: Math.round(mntoTotal),
        fechaEmision: fchEmis,
        xml: xmlFirmado,
      },
    }
  })

  // GET /api/dte — lista de DTEs emitidos
  app.get<{ Querystring: { tipoDTE?: string; desde?: string; hasta?: string } }>('/', async (req) => {
    const tipoDTE = req.query.tipoDTE ? parseInt(req.query.tipoDTE) : undefined
    const desde = req.query.desde ? new Date(req.query.desde) : undefined
    const hasta = req.query.hasta ? new Date(req.query.hasta) : undefined

    const dtes = await prisma.xmlDte.findMany({
      where: {
        codEmpresa: COD_EMPRESA,
        tipoDte: tipoDTE,
        fechaEmision: { gte: desde, lte: hasta },
      },
      orderBy: { fechaEmision: 'desc' },
      take: 200,
      select: {
        id: true,
        tipoDte: true,
        folio: true,
        rutReceptor: true,
        monto: true,
        fechaEmision: true,
        enviado: true,
        estado: true,
      },
    })

    return {
      ok: true,
      data: dtes.map((d) => ({ ...d, folio: Number(d.folio) })),
    }
  })

  // GET /api/dte/:id/xml — descargar XML de un DTE
  app.get<{ Params: { id: string } }>('/:id/xml', async (req, reply) => {
    const id = parseInt(req.params.id)
    const dte = await prisma.xmlDte.findUnique({ where: { id } })
    if (!dte) return reply.notFound('DTE no encontrado')
    reply.header('Content-Type', 'application/xml')
    reply.header('Content-Disposition', `attachment; filename="DTE-${dte.tipoDte}-${dte.folio}.xml"`)
    return dte.xml
  })
}
