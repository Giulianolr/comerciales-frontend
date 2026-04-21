import { create } from 'xmlbuilder2'

/**
 * Estructuras básicas para construir el XML de un DTE (boleta/factura) según
 * el formato SII Chile. Esta implementación cubre el caso de uso de Emporio
 * Doña Esperanza: boleta electrónica afecta (tipo 39) y factura afecta (tipo 33).
 *
 * La firma digital XMLDSig queda como stub — en producción debe integrarse con
 * el certificado digital PEM del contribuyente (ver .env.example).
 */

export interface DetalleXml {
  nroLinDet: number
  nomItem: string
  qtyItem: number
  unmdItem: string
  prcItem: number
  montoItem: number
}

export interface CabezalXml {
  tipoDTE: number
  folio: number
  fchEmis: string        // YYYY-MM-DD
  rutEmisor: string
  razonSocial: string
  giroEmis: string
  dirOrigen: string
  ciudadOrigen: string
  rutReceptor: string
  razonSocialReceptor?: string
  mntoNeto?: number
  tasaIVA: number
  iva: number
  mntoTotal: number
}

export function construirXmlDTE(cabezal: CabezalXml, detalles: DetalleXml[]): string {
  const doc = create({ version: '1.0', encoding: 'ISO-8859-1' })
    .ele('DTE', { xmlns: 'http://www.sii.cl/SiiDte', version: '1.0' })
    .ele('Documento', { ID: `DTE-${cabezal.tipoDTE}-${cabezal.folio}` })

  // Encabezado
  const enc = doc.ele('Encabezado')
  const idDoc = enc.ele('IdDoc')
  idDoc.ele('TipoDTE').txt(String(cabezal.tipoDTE))
  idDoc.ele('Folio').txt(String(cabezal.folio))
  idDoc.ele('FchEmis').txt(cabezal.fchEmis)

  const emisor = enc.ele('Emisor')
  emisor.ele('RUTEmisor').txt(cabezal.rutEmisor)
  emisor.ele('RznSoc').txt(cabezal.razonSocial)
  emisor.ele('GiroEmis').txt(cabezal.giroEmis)
  emisor.ele('DirOrigen').txt(cabezal.dirOrigen)
  emisor.ele('CiudadOrigen').txt(cabezal.ciudadOrigen)

  const receptor = enc.ele('Receptor')
  receptor.ele('RUTRecep').txt(cabezal.rutReceptor)
  if (cabezal.razonSocialReceptor) {
    receptor.ele('RznSocRecep').txt(cabezal.razonSocialReceptor)
  }

  const totales = enc.ele('Totales')
  if (cabezal.mntoNeto !== undefined) {
    totales.ele('MntNeto').txt(String(Math.round(cabezal.mntoNeto)))
  }
  totales.ele('TasaIVA').txt(String(cabezal.tasaIVA))
  totales.ele('IVA').txt(String(Math.round(cabezal.iva)))
  totales.ele('MntTotal').txt(String(Math.round(cabezal.mntoTotal)))

  // Detalles
  for (const det of detalles) {
    const d = doc.ele('Detalle')
    d.ele('NroLinDet').txt(String(det.nroLinDet))
    d.ele('NomItem').txt(det.nomItem)
    d.ele('QtyItem').txt(String(det.qtyItem))
    d.ele('UnmdItem').txt(det.unmdItem)
    d.ele('PrcItem').txt(String(Math.round(det.prcItem)))
    d.ele('MontoItem').txt(String(Math.round(det.montoItem)))
  }

  return doc.end({ prettyPrint: false })
}

/**
 * Stub: en producción esta función debe firmar el XML con el certificado PEM
 * usando xmldsig + sha1/sha256. Por ahora devuelve el XML sin firma para
 * permitir pruebas en ambiente de certificación con el validador SII.
 */
export function firmarXml(xmlStr: string, _certPem: string, _keyPem: string): string {
  // TODO: implementar firma XMLDSig con crypto.createSign / xmldom / node-forge
  return xmlStr
}
