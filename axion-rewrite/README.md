# OptiMind Rewrite

Reescritura moderna del sistema comercial OptiMind (ADM Sistemas) para Emporio Doña Esperanza.  
Stack: **TypeScript · Node.js 20 · Fastify 4 · PostgreSQL · Prisma · React 18 · Vite · TailwindCSS**

---

## Arquitectura de módulos

El proyecto es un **monorepo pnpm + Turborepo** con módulos completamente independientes.  
Cada módulo tiene su propio servidor, puerto, `.env` y puede desplegarse y desarrollarse por separado.

```
axion-rewrite/
├── apps/
│   ├── balanza/     ← Estación de pesaje y escaneo (puerto 3001 / 5173)
│   ├── pos/         ← Caja POS — escanea QR y cobra (puerto 3002 / 5174)
│   ├── erp/         ← Back-office: productos, compras, inventario (puerto 3003 / 5175)
│   └── dte/         ← Facturación electrónica SII (puerto 3004, sin cliente)
└── packages/
    ├── database/    ← Prisma schema + cliente + seed (compartido por todos)
    └── shared/      ← Tipos, utilidades y constantes comunes
```

### Flujo principal del negocio

```
[BALANZA]                    [POS]                    [ERP]
   │                           │                        │
   ├─ Escanea barras            │                        ├─ Gestiona productos
   ├─ Acumula items             │                        ├─ Registra compras
   ├─ Genera QR ──────────────►│                        ├─ Reportes de ventas
                               ├─ Lee QR                └─ Alertas stock crítico
                               ├─ Muestra venta
                               ├─ Confirma pago
                               │   ├─ Crea CabezalVenta      [DTE]
                               │   ├─ Descuenta stock          │
                               │   └─ Marca QR procesado ───►├─ Emite boleta/factura
                                                             └─ Gestiona folios CAF
```

### Por qué módulos separados

- **Sin interferencia de contexto**: cada módulo es una base de código acotada. Al trabajar en `balanza` no hay riesgo de modificar accidentalmente lógica de `pos` o `erp`.
- **Despliegue independiente**: se puede actualizar la balanza sin tocar la caja POS.
- **Equipos paralelos**: un desarrollador puede trabajar en `erp` mientras otro trabaja en `dte`.
- **Paquetes compartidos únicamente para código verdaderamente común**: `@axion/database` (acceso a BD) y `@axion/shared` (tipos y utilidades), sin lógica de negocio de ningún módulo específico.

---

## Requisitos

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+

## Instalación

```bash
# Instalar dependencias de todo el monorepo
pnpm install

# Copiar variables de entorno (editar cada .env con tus credenciales)
cp packages/database/.env.example packages/database/.env
cp apps/balanza/.env.example apps/balanza/.env
cp apps/pos/.env.example apps/pos/.env
cp apps/erp/.env.example apps/erp/.env
cp apps/dte/.env.example apps/dte/.env

# Crear la base de datos y aplicar migraciones
cd packages/database
pnpm prisma migrate dev --name init

# Cargar datos iniciales (empresa, sucursal, impuestos, etc.)
pnpm prisma db seed
```

## Desarrollo

### Todos los módulos a la vez

```bash
pnpm dev   # Turborepo ejecuta todos los módulos en paralelo
```

### Un módulo individualmente

```bash
cd apps/balanza && pnpm dev    # Balanza — http://localhost:5173
cd apps/pos     && pnpm dev    # POS     — http://localhost:5174
cd apps/erp     && pnpm dev    # ERP     — http://localhost:5175
cd apps/dte     && pnpm dev    # DTE     — http://localhost:3004 (solo API)
```

### Prisma Studio (explorador visual de BD)

```bash
cd packages/database && pnpm prisma studio
```

---

## Módulos

### Balanza (`apps/balanza`)

Reemplaza la estación de pesaje/escaneo del sistema original.

**Responsabilidades:**
- Buscar productos por código de barras (`GET /api/productos/buscar?barra=X`)
- Crear una transacción de balanza y acumular ítems
- Generar un QR con el payload compacto: `codEmpresa|codSucursal|idTrans|monto|timestamp`
- El QR expira en 30 minutos

**Rutas API:**
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET`  | `/api/productos/buscar` | Busca producto por barras |
| `POST` | `/api/transacciones/nueva` | Inicia transacción |
| `POST` | `/api/transacciones/:id/agregar-item` | Agrega ítem |
| `DELETE` | `/api/transacciones/:id/item/:nroItem` | Elimina ítem |
| `POST` | `/api/transacciones/:id/generar-qr` | Genera QR (base64 PNG) |
| `DELETE` | `/api/transacciones/:id` | Anula transacción |

---

### POS (`apps/pos`)

Reemplaza la caja registradora. El cajero escanea el QR generado en la balanza.

**Responsabilidades:**
- Leer y validar el QR (verificar expiración, estado pendiente)
- Mostrar resumen de la venta al cajero
- Al confirmar: crear `CabezalVenta` + `DetalleVenta`, decrementar `BodegaStock`, registrar `ModificacionStock`, marcar la transacción de balanza como procesada — **todo en una sola transacción atómica**

**Rutas API:**
| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/qr/leer` | Decodifica QR y retorna detalle de la venta |
| `POST` | `/api/ventas/confirmar` | Confirma y registra la venta |

---

### ERP (`apps/erp`)

Back-office para administración del negocio. Requiere nivel de acceso 1 o 2.

**Responsabilidades:**
- Gestión de productos: búsqueda paginada, actualización de precios, ajuste manual de stock
- Reportes de ventas por rango de fechas con resumen (total, boletas, facturas)
- Registro de compras/recepciones de mercadería con incremento automático de stock
- Alertas de stock crítico e historial de movimientos por artículo

**Rutas API:**
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET`  | `/api/productos` | Lista productos (búsqueda + paginación) |
| `GET`  | `/api/productos/:codArt` | Detalle de un producto |
| `PUT`  | `/api/productos/:codArt/precio` | Actualiza precio |
| `PUT`  | `/api/productos/:codArt/stock` | Ajuste manual de stock |
| `GET`  | `/api/ventas` | Resumen de ventas por período |
| `GET`  | `/api/compras` | Lista de compras |
| `POST` | `/api/compras` | Registrar recepción de mercadería |
| `GET`  | `/api/inventario/stock-critico` | Productos bajo stock crítico |
| `GET`  | `/api/inventario/movimientos/:codArt` | Historial de movimientos |

---

### DTE (`apps/dte`)

Servicio de facturación electrónica según normativa SII Chile. Sin frontend propio — es consumido por el POS al confirmar ventas que requieren documento tributario.

**Responsabilidades:**
- Gestionar rangos de folios CAF (Código de Autorización de Folios)
- Emitir DTEs: boleta electrónica afecta (39), boleta no afecta (41), factura (33)
- Construir XML según formato SII y firmarlo con certificado digital
- Almacenar XMLs emitidos en BD para consulta y reenvío

**Rutas API:**
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET`  | `/api/caf` | Lista CAFs vigentes |
| `POST` | `/api/caf/cargar` | Carga un archivo CAF (XML del SII) |
| `GET`  | `/api/caf/siguiente/:tipoDte` | Obtiene y reserva el siguiente folio |
| `POST` | `/api/dte/emitir` | Emite un DTE |
| `GET`  | `/api/dte` | Lista de DTEs emitidos |
| `GET`  | `/api/dte/:id/xml` | Descarga el XML de un DTE |

> **Nota sobre la firma digital:** La función `firmarXml` en `apps/dte/server/src/lib/xml.ts` es un stub. Para producción debe implementarse con el certificado PEM del contribuyente usando `node-forge` o similar. El SII exige firma `XMLDSig` con `SHA1withRSA`.

---

## Paquetes compartidos

### `@axion/database`

Única fuente de verdad del esquema de base de datos. Exporta el cliente Prisma singleton.

```ts
import { prisma } from '@axion/database'
```

Todos los modelos están documentados en `docs/schema.md`.

### `@axion/shared`

Tipos TypeScript, constantes y utilidades que usa más de un módulo.

```ts
import { serializarQr, deserializarQr, validarRut, formatPesos } from '@axion/shared'
import { TipoDocumento, NivelAcceso, PORTS } from '@axion/shared'
```

**No incluye** lógica de negocio de ningún módulo específico.

---

## Variables de entorno

Cada módulo tiene su propio `.env` (ver `.env.example` en cada `apps/*`).  
La variable `DATABASE_URL` es la misma para todos los módulos y apunta a la misma BD PostgreSQL.

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secreto para firmar tokens JWT (8h de expiración) |
| `PORT` | Puerto del servidor Fastify |
| `COD_EMPRESA` | Código de empresa (default: 1) |
| `COD_SUCURSAL` | Código de sucursal (default: 1) |
| `SII_CERT_PEM` | Certificado digital (solo DTE) |
| `SII_KEY_PEM` | Clave privada (solo DTE) |
| `SII_AMBIENTE` | `certificacion` o `produccion` (solo DTE) |

---

## Decisiones de diseño

| Decisión | Razón |
|----------|-------|
| PostgreSQL en vez de MySQL 5.0 | MySQL 5.0.45 ya no recibe soporte. PostgreSQL tiene mejor soporte de tipos (Decimal, BigInt, enums nativos) y Prisma lo maneja mejor. |
| Prisma ORM | Tipado fuerte, migraciones controladas, reemplaza los procedimientos almacenados del sistema original. |
| Fastify en vez de Express | 2× más throughput, esquema de validación nativo con JSON Schema, mejor soporte TypeScript. |
| QR payload compacto `e\|s\|t\|m\|ts` | Los QR con payload largo son más difíciles de leer con cámaras baratas. El payload mínimo (5 campos) mantiene el QR en versión 3-4. |
| Transacción atómica en confirmación de venta | La desincronización entre venta registrada y stock descontado fue el principal bug del sistema original. `prisma.$transaction` garantiza que ambas operaciones son atómicas. |
| Módulos separados en vez de un monolito | Permite trabajar en cada módulo en forma aislada sin riesgo de romper otros. El ERP puede desplegarse sin afectar la caja POS. |
| DTE como servicio separado | La lógica SII (folios, firma XML, formato específico) es compleja y cambia independientemente del POS. Aislarlo evita que sus dependencias contaminen el resto. |
