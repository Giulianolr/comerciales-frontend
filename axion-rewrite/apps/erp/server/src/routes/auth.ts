import { FastifyInstance } from 'fastify'
import { prisma } from '@optimind/database'

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: { nombreSeguridad: string; clave: string } }>('/login', async (req, reply) => {
    const { nombreSeguridad, clave } = req.body
    const empleado = await prisma.personal.findFirst({
      where: {
        codEmpresa: parseInt(process.env.COD_EMPRESA ?? '1'),
        nombreSeguridad, clave,
        // ERP requiere SECURITY = true (nivel 1 o 2)
        OR: [{ nivel: 1 }, { nivel: 2 }, { security: true }],
      },
    })
    if (!empleado) return reply.unauthorized('Sin acceso al ERP')
    const token = app.jwt.sign(
      { codEmpleado: empleado.codEmpleado, nombre: empleado.nombre, nivel: empleado.nivel },
      { expiresIn: '8h' }
    )
    return { ok: true, token, empleado: { codEmpleado: empleado.codEmpleado, nombre: empleado.nombre, nivel: empleado.nivel } }
  })
}
