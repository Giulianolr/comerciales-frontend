import { FastifyInstance } from 'fastify'
import { prisma } from '@optimind/database'
import type { PrecioProducto } from '@optimind/shared'

const COD_EMPRESA = parseInt(process.env.COD_EMPRESA ?? '1')
const COD_SUCURSAL = parseInt(process.env.COD_SUCURSAL ?? '1')
const COD_LISTA = parseInt(process.env.COD_LISTA ?? '1')
const COD_BODEGA = 1

export async function productosRoutes(app: FastifyInstance) {
  /**
   * GET /api/productos/buscar?barra=7802900000000
   * Busca un producto por código de barras y retorna precio.
   * Este es el endpoint principal que llama la balanza al escanear.
   */
  app.get<{ Querystring: { barra: string } }>('/buscar', async (req, reply) => {
    const { barra } = req.query

    if (!barra) return reply.badRequest('Parámetro barra requerido')

    // 1. Buscar el artículo por código de barra
    const codigoBarra = await prisma.codigoBarra.findFirst({
      where: { codEmpresa: COD_EMPRESA, codBarra: barra },
      include: {
        producto: {
          include: {
            impuestoIva: true,
            impuestoIla: true,
          },
        },
      },
    })

    if (!codigoBarra) {
      return reply.notFound(`Producto con código ${barra} no encontrado`)
    }

    const prod = codigoBarra.producto

    // 2. Buscar precio en la lista configurada
    const precio = await prisma.precio.findFirst({
      where: {
        codEmpresa: COD_EMPRESA,
        codLista: COD_LISTA,
        codArt: prod.codArt,
      },
    })

    if (!precio) {
      return reply.notFound(`Sin precio para el producto ${prod.codArt} en lista ${COD_LISTA}`)
    }

    // 3. Buscar stock actual
    const stock = await prisma.bodegaStock.findFirst({
      where: {
        codEmpresa: COD_EMPRESA,
        codSucursal: COD_SUCURSAL,
        codBodega: COD_BODEGA,
        codArt: prod.codArt,
      },
    })

    const resultado: PrecioProducto = {
      codArt: prod.codArt,
      descripcion: prod.descripcion,
      descripcionCorta: prod.descripcionCorta ?? prod.descripcion.slice(0, 25),
      precioPublico: Number(precio.impPrecio1),   // Precio con IVA
      precioNeto: Number(precio.precio1),          // Precio sin IVA
      iva: Number(prod.impuestoIva?.porcImp ?? 19),
      ilaPorc: Number(prod.impuestoIla?.porcImp ?? 0),
      simboloUnidad: prod.simboloUnLista ?? 'UN',
      tipoPesable: prod.tipoPesable === 1,
      stock: Number(stock?.stock ?? 0),
      enPromocion: prod.enPromocion,
    }

    return { ok: true, data: resultado }
  })

  /**
   * GET /api/productos/buscar-por-art?codArt=123
   * Busca por código interno (para modo manual)
   */
  app.get<{ Querystring: { codArt: string } }>('/buscar-por-art', async (req, reply) => {
    const codArt = parseInt(req.query.codArt)
    if (isNaN(codArt)) return reply.badRequest('codArt inválido')

    const prod = await prisma.producto.findFirst({
      where: { codEmpresa: COD_EMPRESA, codArt },
      include: { impuestoIva: true },
    })

    if (!prod) return reply.notFound('Producto no encontrado')

    const precio = await prisma.precio.findFirst({
      where: { codEmpresa: COD_EMPRESA, codLista: COD_LISTA, codArt },
    })

    return {
      ok: true,
      data: {
        codArt: prod.codArt,
        descripcion: prod.descripcion,
        precioPublico: Number(precio?.impPrecio1 ?? 0),
        simboloUnidad: prod.simboloUnLista ?? 'UN',
        tipoPesable: prod.tipoPesable === 1,
      },
    }
  })
}
