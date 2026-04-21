/**
 * Seed inicial — datos base del sistema
 * Basado en el backup donaesperanza_20260305_1717.sql
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Empresa base
  await prisma.empresa.upsert({
    where: { codEmpresa: 1 },
    update: {},
    create: {
      codEmpresa: 1,
      nFantasia: 'EMPORIO DOÑA ESPERANZA',
      rSocial: 'SOCIEDAD RIVERA SANCHEZ',
      rut: '782310461',
      giro: 'MINIMARKET PASTELERIA PANADERIA',
      direccion: 'LOS COPIHUES 1104',
      telefono1: '56956426212',
      codPais: 1,
      codCiudad: 14,
      codComuna: 50,
      activarSeguridad: true,
      produccionSii: false,
      licencias: 1,
    },
  })

  // Sucursal
  await prisma.sucursal.upsert({
    where: { codEmpresa_codSucursal: { codEmpresa: 1, codSucursal: 1 } },
    update: {},
    create: {
      codEmpresa: 1,
      codSucursal: 1,
      nombre: 'SUCURSAL 1',
      direccion: 'LOS COPIHUES 1104',
    },
  })

  // Bodega
  await prisma.bodega.upsert({
    where: { codEmpresa_codSucursal_codBodega: { codEmpresa: 1, codSucursal: 1, codBodega: 1 } },
    update: {},
    create: {
      codEmpresa: 1,
      codSucursal: 1,
      codBodega: 1,
      nombre: 'BODEGA 1',
      direccion: 'LOS COPIHUES 1104',
    },
  })

  // Impuestos chilenos
  const impuestos = [
    { codImp: 1, descripcion: 'IVA', porcImp: 19.0, ila: false, codigoSii: 14 },
    { codImp: 2, descripcion: 'VINOS, CERVEZAS, CHAMPAGNE', porcImp: 20.5, ila: true, codigoSii: 26 },
    { codImp: 3, descripcion: 'LICOR, PISCO, WHISKY, AGUARDIENTE', porcImp: 31.5, ila: true, codigoSii: 24 },
    { codImp: 4, descripcion: 'JUGOS, AGUAS CON SABOR Y BEBIDAS', porcImp: 18.0, ila: true, codigoSii: 271 },
    { codImp: 5, descripcion: 'RETENCIÓN CARNES', porcImp: 5.0, retencion: true, codigoSii: 18 },
    { codImp: 6, descripcion: 'RETENCIÓN HARINAS', porcImp: 12.0, retencion: true, codigoSii: 19 },
    { codImp: 7, descripcion: 'BEBIDAS ANALCOHÓLICAS, AGUAS SIN SABOR', porcImp: 10.0, ila: true, codigoSii: 27 },
  ]

  for (const imp of impuestos) {
    await prisma.impuesto.upsert({
      where: { codImp: imp.codImp },
      update: {},
      create: {
        codImp: imp.codImp,
        descripcion: imp.descripcion,
        porcImp: imp.porcImp,
        retencion: imp.retencion ?? false,
        ila: imp.ila ?? false,
        codigoSii: imp.codigoSii,
      },
    })
  }

  // Lista de precios base
  await prisma.listaPrecios.upsert({
    where: { codEmpresa_codLista: { codEmpresa: 1, codLista: 1 } },
    update: {},
    create: {
      codEmpresa: 1,
      codLista: 1,
      nombre: 'BASICA',
    },
  })

  // Personal base
  const personal = [
    { codEmpleado: 2, rut: '124575508', nombre: 'ELIZABETH RIVERA', nombreSeguridad: '2', cargo: 'CAJERO', nivel: 3 },
    { codEmpleado: 4, rut: '124575508', nombre: 'ELIZABETH ADMIN', nombreSeguridad: '4', cargo: 'SUPERVISOR', nivel: 2, security: true },
  ]

  for (const p of personal) {
    await prisma.personal.upsert({
      where: { codEmpresa_codEmpleado: { codEmpresa: 1, codEmpleado: p.codEmpleado } },
      update: {},
      create: {
        codEmpresa: 1,
        codEmpleado: p.codEmpleado,
        rut: p.rut,
        nombre: p.nombre,
        nombreSeguridad: p.nombreSeguridad,
        clave: 'cambiar_password',  // ⚠ Cambiar en producción
        cargo: p.cargo,
        nivel: p.nivel,
        security: p.security ?? false,
      },
    })
  }

  // Condiciones de pago
  await prisma.condicionPago.upsert({
    where: { codigo: 1 },
    update: {},
    create: { codigo: 1, descripcion: 'CRÉDITO', dias: 30, tipo: 1 },
  })
  await prisma.condicionPago.upsert({
    where: { codigo: 2 },
    update: {},
    create: { codigo: 2, descripcion: 'CONTADO', dias: 0, tipo: 2 },
  })

  console.log('✅ Seed completado.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
