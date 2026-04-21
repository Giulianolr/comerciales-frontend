import { FastifyInstance } from 'fastify'
import { prisma } from '@optimind/database'
import { NivelAcceso } from '@optimind/shared'

export async function authRoutes(app: FastifyInstance) {
  /**
   * POST /api/auth/login
   * Body: { nombreSeguridad: string, clave: string }
   * Autenticación del operador de balanza
   */
  app.post<{ Body: { nombreSeguridad: string; clave: string } }>('/login', async (req, reply) => {
    const { nombreSeguridad, clave } = req.body

    const empleado = await prisma.personal.findFirst({
      where: {
        codEmpresa: parseInt(process.env.COD_EMPRESA ?? '1'),
        nombreSeguridad,
        clave,
      },
    })

    if (!empleado) {
      return reply.unauthorized('Usuario o contraseña incorrectos')
    }

    const token = app.jwt.sign(
      {
        codEmpleado: empleado.codEmpleado,
        nombre: empleado.nombre,
        nivel: empleado.nivel,
        cargo: empleado.cargo,
      },
      { expiresIn: '8h' }
    )

    return {
      ok: true,
      token,
      empleado: {
        codEmpleado: empleado.codEmpleado,
        nombre: empleado.nombre,
        cargo: empleado.cargo,
        nivel: empleado.nivel,
      },
    }
  })
}
