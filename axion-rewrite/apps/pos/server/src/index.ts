import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import sensible from '@fastify/sensible'
import { authRoutes } from './routes/auth'
import { ventasRoutes } from './routes/ventas'
import { qrRoutes } from './routes/qr'

const PORT = parseInt(process.env.PORT ?? '3002')
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev_secret_pos'

const app = Fastify({ logger: { transport: { target: 'pino-pretty', options: { colorize: true } } } })

async function main() {
  await app.register(cors, { origin: true })
  await app.register(jwt, { secret: JWT_SECRET })
  await app.register(sensible)

  app.get('/health', async () => ({ ok: true, module: 'pos', ts: new Date() }))

  await app.register(authRoutes,  { prefix: '/api/auth' })
  await app.register(qrRoutes,    { prefix: '/api/qr' })
  await app.register(ventasRoutes, { prefix: '/api/ventas' })

  await app.listen({ port: PORT, host: '0.0.0.0' })
  app.log.info(`🟢 POS server corriendo en http://localhost:${PORT}`)
}

main().catch((err) => { console.error(err); process.exit(1) })
