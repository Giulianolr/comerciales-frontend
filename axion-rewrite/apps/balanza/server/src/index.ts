import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import sensible from '@fastify/sensible'
import { productosRoutes } from './routes/productos'
import { transaccionRoutes } from './routes/transacciones'
import { authRoutes } from './routes/auth'

const PORT = parseInt(process.env.PORT ?? '3001')
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev_secret_balanza'

const app = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true },
    },
  },
})

async function main() {
  // Plugins globales
  await app.register(cors, { origin: true })
  await app.register(jwt, { secret: JWT_SECRET })
  await app.register(sensible)

  // Health check
  app.get('/health', async () => ({ ok: true, module: 'balanza', ts: new Date() }))

  // Rutas
  await app.register(authRoutes,        { prefix: '/api/auth' })
  await app.register(productosRoutes,   { prefix: '/api/productos' })
  await app.register(transaccionRoutes, { prefix: '/api/transacciones' })

  await app.listen({ port: PORT, host: '0.0.0.0' })
  app.log.info(`🔷 Balanza server corriendo en http://localhost:${PORT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
