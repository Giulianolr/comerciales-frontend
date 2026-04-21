import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import sensible from '@fastify/sensible'
import { authRoutes } from './routes/auth'
import { productosRoutes } from './routes/productos'
import { inventarioRoutes } from './routes/inventario'
import { ventasRoutes } from './routes/ventas'
import { comprasRoutes } from './routes/compras'
import { dashboardRoutes } from './routes/dashboard'

const PORT = parseInt(process.env.PORT ?? '3003')

const app = Fastify({ logger: { transport: { target: 'pino-pretty', options: { colorize: true } } } })

async function main() {
  await app.register(cors, { origin: true })
  await app.register(jwt, { secret: process.env.JWT_SECRET ?? 'dev_secret_erp' })
  await app.register(sensible)

  app.get('/health', async () => ({ ok: true, module: 'erp', ts: new Date() }))

  await app.register(authRoutes,      { prefix: '/api/auth' })
  await app.register(productosRoutes, { prefix: '/api/productos' })
  await app.register(inventarioRoutes,{ prefix: '/api/inventario' })
  await app.register(ventasRoutes,    { prefix: '/api/ventas' })
  await app.register(comprasRoutes,   { prefix: '/api/compras' })
  await app.register(dashboardRoutes, { prefix: '/api/dashboard' })

  await app.listen({ port: PORT, host: '0.0.0.0' })
  app.log.info(`🟡 ERP server corriendo en http://localhost:${PORT}`)
}

main().catch((err) => { console.error(err); process.exit(1) })
