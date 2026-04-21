import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import sensible from '@fastify/sensible'
import { cafRoutes } from './routes/caf'
import { dteRoutes } from './routes/dte'

const PORT = parseInt(process.env.PORT ?? '3004')

async function main() {
  const app = Fastify({ logger: true })

  await app.register(cors, { origin: true })
  await app.register(sensible)
  await app.register(jwt, { secret: process.env.JWT_SECRET ?? 'dev-secret' })

  // Auth hook — todas las rutas requieren JWT excepto /health
  app.addHook('onRequest', async (req, reply) => {
    if (req.url === '/health') return
    try {
      await req.jwtVerify()
    } catch {
      reply.unauthorized('Token requerido')
    }
  })

  app.get('/health', async () => ({ ok: true, service: 'dte', ts: new Date().toISOString() }))

  await app.register(cafRoutes, { prefix: '/api/caf' })
  await app.register(dteRoutes, { prefix: '/api/dte' })

  await app.listen({ port: PORT, host: '0.0.0.0' })
  console.log(`DTE service listening on port ${PORT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
