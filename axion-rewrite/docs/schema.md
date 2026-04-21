# Esquema Completo de Base de Datos — OptiMind / ADM Sistemas

> **Fuente**: Ingeniería inversa del backup `donaesperanza_20260305_1717.sql`
> **Motor original**: MySQL 5.0.45 Community
> **Motor destino**: PostgreSQL (via Prisma ORM)
> **Negocio**: Emporio Doña Esperanza — Minimarket / Pastelería / Panadería

---

## Índice de Tablas

| # | Tabla | Módulo | Descripción |
|---|-------|--------|-------------|
| 1 | [empresas](#empresas) | Core | Datos de la empresa |
| 2 | [sucursales](#sucursales) | Core | Sucursales de la empresa |
| 3 | [bodegas](#bodegas) | Core | Bodegas/almacenes por sucursal |
| 4 | [personal](#personal) | Core | Empleados y usuarios del sistema |
| 5 | [sys1](#sys1) | Core | Usuarios del sistema (legacy) |
| 6 | [sys2](#sys2) | Core | Permisos por sección |
| 7 | [sys3](#sys3) | Core | Permisos por usuario |
| 8 | [conexiones](#conexiones) | Core | Configuración de conexiones |
| 9 | [productos](#productos) | Inventario | Catálogo maestro de productos |
| 10 | [codigosdebarra](#codigosdebarra) | Inventario | Códigos de barra por producto |
| 11 | [familias](#familias) | Inventario | Familias de productos |
| 12 | [subfamilias](#subfamilias) | Inventario | Subfamilias de productos |
| 13 | [rubros](#rubros) | Inventario | Rubros (categorías principales) |
| 14 | [marcas](#marcas) | Inventario | Marcas de productos |
| 15 | [listasprecios](#listasprecios) | Inventario | Listas de precios |
| 16 | [precios](#precios) | Inventario | Precios por lista y producto |
| 17 | [impuestos](#impuestos) | Inventario | Tasas de impuestos (IVA, ILA, etc.) |
| 18 | [bodegastock](#bodegastock) | Inventario | Stock por bodega y producto |
| 19 | [modificaciondestock](#modificaciondestock) | Inventario | Auditoría de movimientos de stock |
| 20 | [cabezaltransbalanza](#cabezaltransbalanza) | Balanza | Cabecera de transacción de pesa (→ QR) |
| 21 | [detalletransbalanza](#detalletransbalanza) | Balanza | Detalle de items de transacción de pesa |
| 22 | [confipos](#confipos) | POS | Configuración de terminal POS |
| 23 | [confiposventas](#confiposventas) | POS | Configuración de ventas por terminal |
| 24 | [cabezalventas](#cabezalventas) | POS | Cabecera de documento de venta |
| 25 | [detalleventas](#detalleventas) | POS | Líneas de venta |
| 26 | [cierres](#cierres) | POS | Cierres de caja |
| 27 | [cierreresumencierres](#cierreresumencierres) | POS | Resumen de cierres |
| 28 | [cierrelogusuarios](#cierrelogusuarios) | POS | Log de usuarios en cierre |
| 29 | [cierregrabadoimpresion](#cierregrabadoimpresion) | POS | Estado impresión de cierre |
| 30 | [clientes](#clientes) | ERP | Maestro de clientes y proveedores |
| 31 | [clientes_sucursales](#clientes_sucursales) | ERP | Sucursales de clientes |
| 32 | [clientespv](#clientespv) | ERP | Clientes frecuentes POS |
| 33 | [cabezalcompras](#cabezalcompras) | ERP | Cabecera de compras/recepciones |
| 34 | [detallecompras](#detallecompras) | ERP | Líneas de compras |
| 35 | [cabezalcotizaciones](#cabezalcotizaciones) | ERP | Cabecera de cotizaciones |
| 36 | [detallecotizaciones](#detallecotizaciones) | ERP | Líneas de cotizaciones |
| 37 | [cobranzas](#cobranzas) | ERP | Tipos de cobranza |
| 38 | [condicionesdepago](#condicionesdepago) | ERP | Condiciones de pago |
| 39 | [bancos](#bancos) | ERP | Catálogo de bancos |
| 40 | [monedas](#monedas) | ERP | Monedas disponibles |
| 41 | [inventarios](#inventarios) | ERP | Cabecera de toma de inventario |
| 42 | [detalleinventarios](#detalleinventarios) | ERP | Detalle de toma de inventario |
| 43 | [caf](#caf) | DTE | CAF (Folios SII) |
| 44 | [caf_vencidos](#caf_vencidos) | DTE | CAF vencidos |
| 45 | [xmldte](#xmldte) | DTE | XML de documentos tributarios |
| 46 | [xmlboletas](#xmlboletas) | DTE | XML de boletas electrónicas |
| 47 | [promociones](#promociones) | Promo | Cabecera de promociones |
| 48 | [promocionesgrupos](#promocionesgrupos) | Promo | Grupos de promociones |
| 49 | [promocionesproductos](#promocionesproductos) | Promo | Productos en promociones |
| 50 | [formulasdearmado](#formulasdearmado) | Producción | Fórmulas de armado (recetas) |
| 51 | [ingredientes](#ingredientes) | Producción | Ingredientes de productos |

---

## Detalle por Tabla

---

### empresas

Datos maestros de la empresa. Una sola empresa en instalación básica.

```sql
CREATE TABLE empresas (
  COD_EMPRESA       TINYINT UNSIGNED NOT NULL  -- PK, código empresa (1)
  N_FANTASIA        VARCHAR(40)                -- Nombre fantasía: "Emporio Doña Esperanza"
  R_SOCIAL          VARCHAR(40)                -- Razón social
  RUT               VARCHAR(10) NOT NULL       -- RUT empresa: "782310461"
  GIRO              VARCHAR(80)                -- Giro comercial
  DIRECCION         VARCHAR(40)                -- Dirección
  TELEFONO1         VARCHAR(20)
  TELEFONO2         VARCHAR(20)
  FAX               VARCHAR(20)
  ENCARGADO         VARCHAR(30)
  COD_POS           VARCHAR(6)                 -- Código POS interno
  empresas_codacteco VARCHAR(15)               -- Código actividad económica SII
  COD_PAIS          SMALLINT
  COD_CIUDAD        SMALLINT
  COD_COMUNA        SMALLINT UNSIGNED NOT NULL
  RETENEDOR_ILA     ENUM('S','N')              -- Retención ILA (impuesto lic. alcohólicas)
  RETENEDOR_CARNE   ENUM('S','N')
  RETENEDOR_HARINA  ENUM('S','N')
  ACTIVAR_SEGURIDAD ENUM('S','N')
  -- Campos DTE (SII)
  empresas_clave_conector      VARCHAR(60)     -- Clave conector SII
  empresas_fecha_resolucion    DATETIME        -- Fecha resolución SII: 2014-12-12
  empresas_numero_resolucion   VARCHAR(3)      -- Número resolución
  empresas_sucursal_sii        VARCHAR(60)     -- Código sucursal SII
  empresas_produccion_sii      ENUM('S','N')   -- ¿Modo producción SII? (N=certificación)
  empresas_licencias           SMALLINT        -- Número de licencias contratadas
  -- Transbank
  empresas_Tbk_TerminalId      VARCHAR(40)
  empresas_Tbk_CodigoComercio  VARCHAR(40)
  -- Correos
  empresas_correo              VARCHAR(60)
  empresas_correodte           VARCHAR(60)
  PRIMARY KEY (COD_EMPRESA)
)
```

**Relaciones**: Todas las tablas transaccionales tienen `COD_EMPRESA` como FK implícita.

---

### sucursales

```sql
CREATE TABLE sucursales (
  COD_EMPRESA              TINYINT UNSIGNED NOT NULL  -- PK compuesta
  COD_SUCURSAL             SMALLINT UNSIGNED NOT NULL -- PK compuesta (1 = "SUCURSAL 1")
  NOMBRE                   CHAR(40)
  DIRECCION                CHAR(80)
  SUCURSALES_TELEFONO      VARCHAR(12)
  SUCURSALES_ENCARGADO     VARCHAR(40)
  SUCURSALES_META          DOUBLE(15,4)               -- Meta de ventas mensual
  PRIMARY KEY (COD_EMPRESA, COD_SUCURSAL)
)
```

---

### bodegas

```sql
CREATE TABLE bodegas (
  COD_EMPRESA   TINYINT UNSIGNED NOT NULL
  COD_SUCURSAL  SMALLINT UNSIGNED NOT NULL
  COD_BODEGA    SMALLINT UNSIGNED NOT NULL   -- (1 = "BODEGA 1")
  NOMBRE        VARCHAR(40)
  direccion     VARCHAR(80)
  TIPO_PERIODO  VARCHAR(10)
  PRIMARY KEY (COD_EMPRESA, COD_SUCURSAL, COD_BODEGA)
)
```

---

### personal

Empleados del sistema. Usada para autenticación en POS/ERP.

```sql
CREATE TABLE personal (
  COD_EMPRESA       TINYINT UNSIGNED NOT NULL
  COD_EMPLEADO      MEDIUMINT UNSIGNED NOT NULL  -- PK compuesta
  RUT               CHAR(10) NOT NULL
  NOMBRE            VARCHAR(40)
  NOMBRE_SEGURIDAD  CHAR(30)                    -- Username de login (ej: "2", "3", "4")
  CLAVE             CHAR(20)                    -- Password (encriptado con char mapping)
  Personal_ClaveLarga CHAR(13)                  -- Password largo alternativo
  CARGO             VARCHAR(20)                 -- 'CAJERO', 'SUPERVISOR'
  NIVEL             TINYINT UNSIGNED            -- 1=Admin, 2=Supervisor, 3=Cajero
  SECURITY          ENUM('S','N')               -- ¿Tiene acceso ERP?
  EMAIL             VARCHAR(40)
  -- Configuración email SMTP personal
  PER_Servidor      VARCHAR(40)
  PER_Puerto        TINYINT UNSIGNED
  PER_Authe         ENUM('S','N')
  PER_Ssl           ENUM('S','N')
  PER_Usuario       VARCHAR(40)
  PER_Pass          VARCHAR(40)
  PRIMARY KEY (COD_EMPRESA, COD_EMPLEADO)
)
```

**Niveles de acceso**:
- `1` = Administrador (acceso total)
- `2` = Supervisor (puede anular, aplicar descuentos)
- `3` = Cajero (solo ventas)

---

### sys1 / sys2 / sys3

Sistema de permisos legacy del ERP.

```sql
-- sys1: Usuarios del sistema ERP
CREATE TABLE sys1 (
  CODIGO    SMALLINT UNSIGNED NOT NULL  -- PK
  NOMBRE    VARCHAR(40)
  PASSWORD  VARCHAR(10)
  NIVEL     TINYINT UNSIGNED
  OTROS     ENUM('S','N')
  SECURITY  ENUM('S','N')
  PRIMARY KEY (CODIGO)
)

-- sys2: Definición de secciones y sus permisos base
CREATE TABLE sys2 (
  COD_EMPRESA  TINYINT UNSIGNED NOT NULL
  COD_PROG     SMALLINT          -- Programa (1=CC, 2=Maestros, 3=Inventario, etc.)
  COD_SECCION  SMALLINT NOT NULL -- PK compuesta
  DESCRIPCION  VARCHAR(60)
  INGRESO      ENUM('S','N')
  CONSULTA     ENUM('S','N')
  MODIFICAR    ENUM('S','N')
  CREAR        ENUM('S','N')
  ANULAR       ENUM('S','N')
  BORRAR       ENUM('S','N')
  PRIMARY KEY (COD_EMPRESA, COD_SECCION)
)

-- sys3: Permisos por usuario sobre cada sección
CREATE TABLE sys3 (
  COD_EMPRESA  TINYINT UNSIGNED NOT NULL
  COD_PROG     SMALLINT
  CODIGO       SMALLINT         -- FK → sys1.CODIGO
  COD_SECCION  SMALLINT
  INGRESO      ENUM('S','N')
  CONSULTA     ENUM('S','N')
  MODIFICAR    ENUM('S','N')
  CREAR        ENUM('S','N')
  ANULAR       ENUM('S','N')
  BORRAR       ENUM('S','N')
  PRIMARY KEY (COD_EMPRESA, CODIGO, COD_SECCION)
)
```

---

### productos

Catálogo maestro de productos. Tabla central del sistema.

```sql
CREATE TABLE productos (
  COD_EMPRESA           TINYINT UNSIGNED NOT NULL
  COD_ART               INT(7) UNSIGNED NOT NULL     -- PK del producto
  -- Categorización
  RUBRO                 INT(5) UNSIGNED NOT NULL      -- FK → rubros
  FAMILIA               INT(5) UNSIGNED NOT NULL      -- FK → familias
  SUBFAMILIA            INT(5) UNSIGNED NOT NULL      -- FK → subfamilias
  COD_MARCA             SMALLINT UNSIGNED NOT NULL    -- FK → marcas
  ORIGEN                TINYINT NOT NULL
  -- Descripción
  descripcion           VARCHAR(60) NOT NULL          -- Nombre principal
  DESCRIPCION_CORTA     VARCHAR(25)                   -- Para tickets (25 chars)
  DESCRIPCION_LARGA     VARCHAR(80)                   -- Para pantallas
  ESTADO                TINYINT(2)                    -- 1=Activo, 0=Inactivo
  -- Stock
  STOCK                 DOUBLE(12,4)
  STOCK_CRITICO         DOUBLE(12,4)                  -- Stock mínimo de alerta
  STOCK_PEDIDO          DOUBLE(12,4)
  STOCK_COMPROMETIDO    DOUBLE(12,4)
  -- Unidades
  UNIDAD_LISTA          DOUBLE(10,4)                  -- Factor de conversión lista
  SIMBOLO_UN_LISTA      VARCHAR(10)                   -- 'KG', 'UN', 'LT', etc.
  SIMBOLO_STOCK         VARCHAR(10)
  UNIDAD_COMPRA         DOUBLE(10,4)
  SIMBOLO_UN_COMPRA     VARCHAR(10)
  -- Costos
  ULTIMO_COSTO          DOUBLE(15,4)
  COSTO_COMPRA          DOUBLE(15,4)
  COSTO_PROM            DOUBLE(15,4)                  -- Costo promedio ponderado
  COSTO_REPOSICION      DOUBLE(15,4)
  PRECIOBRUTO           DOUBLE(15,4)
  COSTOCONILA           DOUBLE(15,4)
  COSTOCONIVA           DOUBLE(15,4)
  -- Impuestos
  COD_IVA               TINYINT UNSIGNED NOT NULL     -- FK → impuestos
  COD_IMPTO_ADIC1       TINYINT UNSIGNED              -- FK → impuestos (ILA, etc.)
  COD_IMPTO_ADIC2       TINYINT UNSIGNED
  -- Balanza
  TIPO_PESABLE          TINYINT(1)                    -- ¿Es producto pesable?
  COD_BALANZA           INT(7) UNSIGNED               -- Código PLU en balanza
  TARA                  DOUBLE(15,4)                  -- Tara (peso envase)
  CANTIDAD_X_PIEZA      DOUBLE(12,4)
  -- Características físicas
  PESO_BRUTO            DOUBLE(12,4)
  PESO_NETO             DOUBLE(12,4)
  CUBICAJE              DOUBLE(12,4)
  PIEZAS_CAJA           DOUBLE(10,4)
  -- Configuración
  TIPO                  TINYINT(2)                    -- Tipo producto (normal, armado, etc.)
  TIPO_PROMOCION        TINYINT(1)                    -- Tipo de promoción
  enpromocion           ENUM('S','N')                 -- ¿Está en promoción activa?
  DIAS_DURACION         TINYINT(4)                    -- Días de duración (perecederos)
  foto                  VARCHAR(40)                   -- Ruta imagen
  productos_sincontrolstock ENUM('S','N')             -- ¿Sin control de stock?
  productos_produccion  ENUM('S','N')                 -- ¿Es producto de producción?
  ARCHIVO_ETIQUETA      VARCHAR(40)                   -- Template etiqueta
  FECHA_ULTMOV          DATETIME
  FECHA_INGRESO         DATETIME
  FECHA_ULT_COMPRA      DATE
  PRIMARY KEY (COD_EMPRESA, COD_ART)
)
```

---

### codigosdebarra

Permite múltiples códigos de barra por producto (EAN-13, código interno, etc.).

```sql
CREATE TABLE codigosdebarra (
  COD_EMPRESA    TINYINT UNSIGNED NOT NULL
  COD_ART        INT(7) UNSIGNED NOT NULL     -- FK → productos
  COD_BARRA      VARCHAR(20) NOT NULL         -- Código de barra (EAN-13, etc.)
  COD_BARRAREG   VARCHAR(20)                  -- Código barra registro
  COD_CONSULTOR  VARCHAR(20)                  -- Código consultor de precios
  KEY (COD_EMPRESA, COD_ART)
  KEY (COD_EMPRESA, COD_BARRA)               -- Índice para búsqueda rápida en balanza
)
```

> **Flujo Balanza**: La pesa escanea `COD_BARRA` → busca en esta tabla → obtiene `COD_ART`.

---

### familias / subfamilias / rubros / marcas

Jerarquía de categorías: **Rubro → Familia → Subfamilia**.

```sql
CREATE TABLE rubros (
  COD_EMPRESA  TINYINT UNSIGNED NOT NULL
  COD_RUBRO    INT(5) UNSIGNED NOT NULL
  NOMBRE       VARCHAR(40)
  PRIMARY KEY (COD_EMPRESA, COD_RUBRO)
)

CREATE TABLE familias (
  COD_EMPRESA  TINYINT UNSIGNED NOT NULL
  COD_FAMILIA  INT(5) UNSIGNED NOT NULL
  NOMBRE       VARCHAR(40)
  PRIMARY KEY (COD_EMPRESA, COD_FAMILIA)
)

CREATE TABLE subfamilias (
  COD_EMPRESA    TINYINT UNSIGNED NOT NULL
  COD_SUBFAMILIA INT(5) UNSIGNED NOT NULL
  NOMBRE         VARCHAR(40)
  PRIMARY KEY (COD_EMPRESA, COD_SUBFAMILIA)
)

CREATE TABLE marcas (
  COD_MARCA  SMALLINT NOT NULL
  NOMBRE     CHAR(40)
  PRIMARY KEY (COD_MARCA)
)
```

---

### listasprecios

```sql
CREATE TABLE listasprecios (
  COD_EMPRESA      TINYINT UNSIGNED NOT NULL
  COD_LISTA        SMALLINT UNSIGNED NOT NULL   -- (1 = "BASICA")
  NOMBRE           VARCHAR(30)
  RUT_CLTE         CHAR(10)                     -- Cliente asociado a lista especial
  FECHA_IMPRESION  DATETIME
  PRIMARY KEY (COD_EMPRESA, COD_LISTA)
)
```

---

### precios

Precios por lista y producto. Cada producto puede tener hasta 3 precios escalonados.

```sql
CREATE TABLE precios (
  COD_EMPRESA   TINYINT UNSIGNED NOT NULL
  COD_LISTA     SMALLINT UNSIGNED NOT NULL      -- FK → listasprecios
  COD_ART       INT(7) UNSIGNED NOT NULL        -- FK → productos
  -- Cantidades por tramo de precio
  UNIDAD1       DOUBLE(12,4)                    -- Desde 1 unidad
  UNIDAD2       DOUBLE(12,4)                    -- Desde X unidades (precio mayorista)
  UNIDAD3       DOUBLE(12,4)
  -- Precio sin impuesto
  PRECIO1       DOUBLE(15,4)                    -- Precio neto tramo 1
  PRECIO2       DOUBLE(15,4)                    -- Precio neto tramo 2
  PRECIO3       DOUBLE(15,4)
  -- Precio con impuesto (precio venta público)
  IMPPRECIO1    DOUBLE(15,4)                    -- *** Precio final al público ***
  IMPPRECIO2    DOUBLE(15,4)
  IMPPRECIO3    DOUBLE(15,4)
  -- Márgenes
  MARGEN1       DOUBLE(10,4)
  MARGEN2       DOUBLE(10,4)
  MARGEN3       DOUBLE(10,4)
  -- Histórico
  PRECIO_ANT1   DOUBLE(15,4)                    -- Precio anterior (para historial)
  IMPPRECIO_ANT1 DOUBLE(15,4)
  FECHA_ACT     DATETIME                        -- Fecha última actualización
  FECHA_ACT_ANT DATETIME                        -- Fecha actualización anterior
  COD_MON       TINYINT UNSIGNED                -- Moneda (FK → monedas)
  FLAGPRECIO    ENUM('S','N')
  KEY (COD_EMPRESA, COD_LISTA, COD_ART)
)
```

> **Nota**: `IMPPRECIO1` es el precio que se muestra al cliente en la balanza y POS.

---

### impuestos

```sql
CREATE TABLE impuestos (
  COD_IMP         TINYINT UNSIGNED NOT NULL  -- PK
  DESCRIPCION     VARCHAR(55)
  PORC_IMP        DOUBLE(8,4)               -- Porcentaje: 19.0 = 19%
  RETENCION       ENUM('S','N')
  ILA             ENUM('S','N')             -- ¿Es impuesto a licores/alcoholes?
  APLICA_AL_COSTO ENUM('S','N')
  IMPUESTOS_CODSII INT(6)                   -- Código SII del impuesto
)
```

**Datos reales**:
| COD | Descripción | % | Código SII |
|-----|-------------|---|------------|
| 1 | IVA | 19% | 14 |
| 2 | Vinos, cervezas, champagne | 20.5% | 26 |
| 3 | Licores, pisco, whisky | 31.5% | 24 |
| 4 | Jugos y bebidas | 18% | 271 |
| 5 | Retención carnes | 5% | 18 |
| 6 | Retención harinas | 12% | 19 |
| 7 | Bebidas analcohólicas | 10% | 27 |

---

### bodegastock

Stock actual por combinación empresa/sucursal/bodega/producto.

```sql
CREATE TABLE bodegastock (
  COD_EMPRESA          TINYINT UNSIGNED NOT NULL
  COD_SUCURSAL         SMALLINT UNSIGNED NOT NULL
  COD_BODEGA           SMALLINT UNSIGNED NOT NULL
  COD_ART              INT(7) NOT NULL              -- FK → productos
  STOCK                DOUBLE(15,4)                 -- *** Stock actual ***
  CRITICO              DOUBLE(15,4)                 -- Stock mínimo
  STOCK_PEDIDO         DOUBLE(15,4)                 -- Cantidad en pedido
  STOCK_COMPROMETIDO   DOUBLE(15,4)                 -- Cantidad comprometida
  STOCKENTRANSITO      DOUBLE(15,4)                 -- Stock en tránsito
  UBICACION            VARCHAR(50)                  -- Ubicación física en bodega
  PERIODO              VARCHAR(10)
  bodegastock_estado   INT(1)                       -- 1=activo, 2=inactivo
  PRIMARY KEY (COD_EMPRESA, COD_SUCURSAL, COD_BODEGA, COD_ART)
)
```

> **Flujo POS**: Al confirmar venta, se ejecuta `UPDATE bodegastock SET STOCK = STOCK - cantidad WHERE COD_ART = X`.

---

### modificaciondestock

Auditoría completa de todos los movimientos de stock (ventas, compras, ajustes).

```sql
CREATE TABLE modificaciondestock (
  COD_EMPRESA        TINYINT UNSIGNED NOT NULL
  COD_SUCURSAL       SMALLINT UNSIGNED NOT NULL
  NUMID              BIGINT UNSIGNED NOT NULL        -- ID único del movimiento
  operacion          VARCHAR(30)                     -- 'VENTA', 'COMPRA', 'AJUSTE', etc.
  cod_empleado       INT(8)
  mac_host           VARCHAR(100)                    -- Hostname del terminal
  COD_ART            INT(7) UNSIGNED NOT NULL
  COD_BARRA          VARCHAR(20)
  FECHA              DATETIME
  ACCION             TINYINT(1)                      -- 1=Entrada, 2=Salida
  DESCRIPCION        VARCHAR(80)
  COSTO              DOUBLE(15,4)
  PRECIO             DOUBLE(15,4)
  COD_BODEGA         SMALLINT UNSIGNED
  CANTIDAD           DOUBLE(15,4)
  STOCK_ANTERIOR     DOUBLE(15,4)                    -- Stock antes del movimiento
  STOCK_NUEVO        DOUBLE(15,4)                    -- Stock después del movimiento
  num_operacion      DATETIME
)
```

---

## Flujo Principal: Balanza → QR → Caja

### cabezaltransbalanza

**Cabecera de transacción en pesa**. Se crea cuando el operador inicia una nueva compra.

```sql
CREATE TABLE cabezaltransbalanza (
  COD_EMPRESA      TINYINT UNSIGNED NOT NULL
  COD_SUCURSAL     SMALLINT UNSIGNED NOT NULL
  ID_TRANSACCION   BIGINT UNSIGNED NOT NULL     -- *** ID que va en el QR ***
  NRO_BALANZA      SMALLINT UNSIGNED NOT NULL   -- Número de balanza (1, 2, ...)
  NRO_TRANSACCION  MEDIUMINT UNSIGNED NOT NULL  -- Contador de transacciones por balanza
  COD_VENDEDOR     MEDIUMINT UNSIGNED NOT NULL  -- FK → personal
  FECHA_TRANS      DATETIME NOT NULL
  NRO_ITEMS        SMALLINT UNSIGNED            -- Cantidad de productos escaneados
  MONTO            DOUBLE(15,4)                 -- Total de la transacción
  ESTADO           ENUM('N','S') NOT NULL       -- 'N'=Pendiente, 'S'=Procesado en caja
  KEY (COD_EMPRESA, COD_SUCURSAL, ID_TRANSACCION)
)
```

### detalletransbalanza

**Líneas de la transacción de pesa**. Un registro por cada producto escaneado.

```sql
CREATE TABLE detalletransbalanza (
  COD_EMPRESA      TINYINT UNSIGNED NOT NULL
  COD_SUCURSAL     SMALLINT UNSIGNED NOT NULL
  ID_TRANSACCION   BIGINT UNSIGNED NOT NULL     -- FK → cabezaltransbalanza
  NRO_BALANZA      SMALLINT UNSIGNED NOT NULL
  NRO_TRANSACCION  MEDIUMINT UNSIGNED NOT NULL
  NRO_ITEM         TINYINT UNSIGNED NOT NULL    -- Número de línea (1, 2, 3...)
  COD_ART          INT(7) UNSIGNED NOT NULL     -- FK → productos
  CANTIDAD         DOUBLE(12,4)                 -- Cantidad pesada/escaneada
  PRECIO_UNITARIO  DOUBLE(15,4)                 -- Precio unitario al momento del escaneo
  TOTAL_PLU        DOUBLE(15,4)                 -- CANTIDAD × PRECIO_UNITARIO
  KEY (COD_EMPRESA, COD_SUCURSAL, ID_TRANSACCION, NRO_BALANZA, NRO_TRANSACCION)
)
```

**Contenido del QR generado**:
```json
{
  "e": 1,
  "s": 1,
  "t": "ID_TRANSACCION",
  "m": 5400.00
}
```
*(empresa, sucursal, id_transaccion, monto total)*

---

## Módulo POS (Caja)

### confipos

Configuración de conexión por terminal POS.

```sql
CREATE TABLE confipos (
  ConfiPos_id          INT NOT NULL AUTO_INCREMENT  -- PK
  ConfiPos_Cod_empresa TINYINT UNSIGNED NOT NULL
  ConfiPos_RutEmpresa  CHAR(20) NOT NULL
  ConfiPos_Sucursal    TINYINT UNSIGNED NOT NULL
  ConfiPos_Caja        TINYINT UNSIGNED NOT NULL    -- Número de caja
  ConfiPos_Modulo      TINYINT UNSIGNED NOT NULL
  ConfiPos_HostName    VARCHAR(40)                  -- Nombre del equipo (ej: "DESKTOP-MVCDNKS")
  ConfiPos_Ip          VARCHAR(20)                  -- IP del servidor MySQL
  ConfiPos_Contrasena  VARCHAR(40)                  -- Password MySQL
  ConfiPos_TipoDeBase  VARCHAR(40)                  -- Nombre BD (ej: "donaesperanza")
  ConfiPos_RutaLocal   VARCHAR(40)
  ConfiPos_TipoBdd     TINYINT UNSIGNED NOT NULL    -- Tipo BD (0=local, 1=remota)
  ConfiPos_UserBdd     VARCHAR(20)                  -- Usuario MySQL
  PRIMARY KEY (ConfiPos_id)
)
```

### confiposventas

Configuración de comportamiento de ventas por terminal.

```sql
CREATE TABLE confiposventas (
  ConfiPosVentas_id                     INT NOT NULL AUTO_INCREMENT
  ConfiPosVentas_Cod_empresa            TINYINT UNSIGNED NOT NULL
  ConfiPosVentas_Sucursal               TINYINT UNSIGNED NOT NULL
  ConfiPosVentas_Bodega                 TINYINT UNSIGNED NOT NULL
  ConfiPosVentas_Caja                   TINYINT UNSIGNED NOT NULL
  ConfiPosVentas_HostName               VARCHAR(20)               -- Nombre del equipo
  ConfiPosVentas_ListaPrecios           TINYINT UNSIGNED NOT NULL -- FK → listasprecios
  ConfiPosVentas_Tipoventa              TINYINT UNSIGNED NOT NULL -- Tipo de venta
  ConfiPosVentas_FlagTickets            TINYINT UNSIGNED NOT NULL
  ConfiPosVentas_DocPorDefecto          TINYINT UNSIGNED NOT NULL -- Tipo doc por defecto (boleta=39)
  ConfiPosVentas_DctoMaximo             TINYINT UNSIGNED NOT NULL -- % descuento máximo
  ConfiPosVentas_AplicarRedondeo        ENUM('S','N') NOT NULL
  ConfiPosVentas_ValorRedondeo          TINYINT UNSIGNED NOT NULL -- A qué múltiplo redondear
  ConfiPosVentas_Acumularprodxcodigo    ENUM('S','N') NOT NULL    -- Acumular mismo producto
  ConfiPosVentas_FondoCaja              DOUBLE(15,4)              -- Fondo de caja inicial
  ConfiPosVentas_MaximoEnCaja           DOUBLE(15,4)              -- Máximo permitido en caja
  ConfiPosVentas_VerificarMonto         ENUM('S','N') NOT NULL
  ConfiPosVentas_VerificaVendedor       ENUM('S','N') NOT NULL
  ConfiPosVentas_ActivarPromos          ENUM('S','N') NOT NULL
  ConfiPosVentas_TipoPantalla           TINYINT UNSIGNED NOT NULL -- 0=800x600, 1=1024x768, etc.
  ConfiPosVentas_Activo                 ENUM('S','N') NOT NULL
  PRIMARY KEY (ConfiPosVentas_id)
)
```

### cabezalventas

Cabecera de documento de venta (boleta, factura, etc.).

```sql
CREATE TABLE cabezalventas (
  COD_EMPRESA             TINYINT UNSIGNED NOT NULL
  COD_SUCURSAL            SMALLINT UNSIGNED NOT NULL
  tipo_cargo              INT(3)                       -- Tipo doc: 33=Factura, 39=Boleta electrónica
  NRO_CARGO               BIGINT UNSIGNED NOT NULL     -- Folio del documento
  NRO_FISCAL              BIGINT UNSIGNED NOT NULL     -- Folio fiscal SII
  RUT_CLTE                CHAR(10) NOT NULL            -- RUT cliente (default: consumidor final)
  COD_SUCURSAL_CLTE       INT(9) UNSIGNED NOT NULL
  COD_CAJERO              MEDIUMINT UNSIGNED NOT NULL  -- FK → personal (cajero)
  COD_EMPLEADO            MEDIUMINT UNSIGNED NOT NULL  -- FK → personal (vendedor)
  CAJA                    TINYINT UNSIGNED             -- Número de caja
  FECHA_EM                DATETIME                     -- Fecha emisión
  MONTO                   DOUBLE(15,4)                 -- Total documento
  MONTO_DESCUENTO         DOUBLE(15,4)
  MONTO_IMPUESTO          DOUBLE(15,4)                 -- IVA total
  MONTO_PENDIENTE         DOUBLE(15,4)                 -- Saldo pendiente
  NETO_AFECTO             DOUBLE(15,4)                 -- Monto neto afecto IVA
  NETO_EXENTO             DOUBLE(15,4)                 -- Monto neto exento IVA
  ANULADA                 ENUM('S','N')
  IMPRESA                 ENUM('S','N')
  TIPODEFACTURA           TINYINT UNSIGNED             -- Tipo doc SII
  PENDIENTE               ENUM('S','N')
  -- Para clientes sin RUT registrado
  CLIENTEALPASO           VARCHAR(40)
  RUTALPASO               VARCHAR(15)
  -- Estado DTE
  Estado_DTE_Emision      (campo añadido en versión actual)
  informacion_sii_emision (campo añadido en versión actual)
  mac_host                VARCHAR(100)                 -- Terminal que generó la venta
  KEY (COD_EMPRESA, COD_SUCURSAL, CAJA, tipo_cargo, NRO_CARGO)
)
```

### detalleventas

Líneas del documento de venta. Aquí se registra el descuento de stock.

```sql
CREATE TABLE detalleventas (
  COD_EMPRESA            TINYINT UNSIGNED NOT NULL
  COD_SUCURSAL           SMALLINT UNSIGNED NOT NULL
  COD_SUCURSAL_MOV       SMALLINT UNSIGNED NOT NULL  -- Sucursal del movimiento stock
  COD_BODEGA             SMALLINT UNSIGNED NOT NULL  -- FK → bodegas
  tipo                   INT(3)                      -- Tipo documento
  TipoDeFactura          INT(3)
  NUMERO                 BIGINT UNSIGNED NOT NULL    -- Folio del doc (FK → cabezalventas)
  RUT_CLTE               CHAR(10) NOT NULL
  COD_EMPLEADO           MEDIUMINT UNSIGNED NOT NULL
  CAJA                   TINYINT UNSIGNED
  NRO_ITEM               SMALLINT UNSIGNED NOT NULL  -- Número de línea
  COD_ART                INT(7) UNSIGNED NOT NULL    -- FK → productos
  COD_BARRA              VARCHAR(20)
  DESCRIPCION            VARCHAR(80)                 -- Descripción al momento de venta
  COSTO                  DOUBLE(15,4)                -- Costo al momento
  PRECIO_UNITARIO        DOUBLE(15,4)                -- Precio neto
  PRECIO_VENTA_PUBLICO   DOUBLE(15,4)                -- Precio con IVA (lo que paga el cliente)
  CANTIDAD               DOUBLE(15,4)                -- Cantidad vendida
  DESCUENTO              DOUBLE(10,4)                -- % descuento aplicado
  IVA                    DOUBLE(8,4)                 -- % IVA aplicado
  ACTUALIZA_STOCK        ENUM('S','N')               -- ¿Esta línea descuenta stock?
  MARGEN                 DOUBLE(12,4)                -- Margen de la línea
  FECHA                  DATETIME NOT NULL
  KEY (COD_EMPRESA, COD_SUCURSAL, NUMERO, NRO_ITEM, COD_ART)
)
```

---

## Módulo ERP

### clientes

Maestro de clientes Y proveedores (diferenciados por tipo interno).

```sql
CREATE TABLE clientes (
  COD_EMPRESA       TINYINT UNSIGNED NOT NULL
  RUT               VARCHAR(10) NOT NULL             -- PK compuesta
  COD_SUCURSAL_CLTE INT(9) UNSIGNED NOT NULL         -- PK compuesta
  NOMBRE            VARCHAR(40)
  NOMBRE2           VARCHAR(40)
  DIRECCION         VARCHAR(80)
  TELEFONO          CHAR(30)
  EMAIL             VARCHAR(40)
  COD_PAIS          SMALLINT UNSIGNED NOT NULL
  COD_CIUDAD        SMALLINT UNSIGNED NOT NULL
  COD_COMUNA        SMALLINT UNSIGNED NOT NULL
  ESPERSONA         ENUM('S','N')                    -- ¿Es persona natural?
  GIRO              VARCHAR(80)
  COND_PAGO         SMALLINT UNSIGNED NOT NULL       -- FK → condicionesdepago
  CREDITO_MAXIMO    DOUBLE(15,4)
  MONTO_UTILIZADO   DOUBLE(15,4)
  BLOQUEO           TINYINT UNSIGNED                 -- ¿Bloqueado por morosidad?
  COD_LISTA         SMALLINT UNSIGNED                -- Lista de precios asignada
  ESTADO            TINYINT UNSIGNED                 -- 1=activo, 0=inactivo
  PRIMARY KEY (COD_EMPRESA, RUT)
)
```

### cabezalcompras / detallecompras

Recepción de mercadería (compras). Similar estructura a ventas pero en sentido inverso.

```sql
CREATE TABLE cabezalcompras (
  -- Mismos campos que cabezalventas pero para compras
  -- Clave: RUT_CLTE aquí es el RUT del PROVEEDOR
  COD_EMPRESA, COD_SUCURSAL, TIPO_CARGO, NRO_CARGO (PK compuesta)
  RUT_CLTE (FK → clientes/proveedores)
  MONTO, MONTO_DESCUENTO, MONTO_IMPUESTO
  NETO_AFECTO, NETO_EXENTO
  FECHA_EM, FECHA_VEN (vencimiento)
  ORDEN_COMPRA (número OC que generó la compra)
  ANULADA, IMPRESA, PENDIENTE
)

CREATE TABLE detallecompras (
  COD_ART, DESCRIPCION, CANTIDAD
  PRECIO_UNITARIO, PRECIO_VENTA_PUBLICO
  COSTO, IVA, DESCUENTO
  ACTUALIZA_STOCK  -- ¿Esta línea aumenta stock?
)
```

---

## Módulo DTE (Facturación Electrónica SII Chile)

### caf

Certificados de Autorización de Folios del SII. Define el rango de folios válidos por tipo de documento.

```sql
CREATE TABLE caf (
  caf_id               INT NOT NULL AUTO_INCREMENT  -- PK
  caf_cod_empresa      TINYINT UNSIGNED NOT NULL
  caf_tipo_doc         TINYINT(3)                   -- 39=Boleta, 33=Factura, 41=Boleta exenta
  caf_caja             INT UNSIGNED NOT NULL         -- Caja asignada
  caf_desde            INT(10)                       -- Folio inicial del rango
  caf_hasta            INT(10)                       -- Folio final del rango
  caf_proximo_numero   INT(10)                       -- Próximo folio a usar
  caf_CantidadLimite   INT UNSIGNED NOT NULL         -- Alerta cuando quedan X folios
  caf_CantidadABajar   INT UNSIGNED NOT NULL         -- Folios a solicitar al renovar
  caf_activo           ENUM('S','N')                 -- ¿CAF activo?
  caf_AnuladosDesde    INT(10)                       -- Rango de folios anulados
  caf_AnuladosHasta    INT(10)
  caf_fecha_carga      DATETIME
  caf_fecha_vencimiento DATETIME
  caf_fecha_caf        DATETIME
  caf_archivo_caf      TEXT                          -- XML del CAF firmado por SII
  PRIMARY KEY (caf_id)
)
```

### xmldte / xmlboletas

Almacenamiento de XML firmados antes y después de envío al SII.

```sql
CREATE TABLE xmldte (
  xmldte_id              INT NOT NULL AUTO_INCREMENT
  xmldte_cod_empresa     TINYINT UNSIGNED NOT NULL
  xmldte_cod_sucursal    SMALLINT UNSIGNED NOT NULL
  xmldte_tipo_doc        TINYINT                     -- Tipo DTE (33=Factura, etc.)
  xmldte_folio           BIGINT                      -- Folio del documento
  xmldte_rut_clte        VARCHAR(15)
  xmldte_xml             TEXT                        -- XML sin firmar
  xmldte_xml_firmado     TEXT                        -- XML firmado (listo para SII)
  xmldte_timbre          TEXT                        -- TED (timbre electrónico)
  xmldte_enservidor      TINYINT UNSIGNED            -- 0=pendiente envío, 1=enviado
  xmldte_fecha_timbrado  DATETIME
  xmldte_nombre_maquina  VARCHAR(100)                -- Terminal que lo generó
  xmldte_verpdf          TINYINT UNSIGNED            -- ¿PDF para imprimir?
  PRIMARY KEY (xmldte_id)
)

CREATE TABLE xmlboletas (
  -- Misma estructura que xmldte pero para boletas (tipo 39/41)
  xmlboletas_id, xmlboletas_cod_empresa, xmlboletas_xml_firmado
  xmlboletas_enservidor, xmlboletas_fecha_timbrado
  xmlboletas_nombre_maquina
)
```

**Stored Procedures DTE**:
| SP | Función |
|----|---------|
| `ConectorEnviarDTESel(maquina)` | Obtiene DTEs pendientes de envío |
| `ConectorEnviarBoletaSel(maquina)` | Obtiene boletas pendientes de envío |
| `ConectorActualizarEstado(id, estado, obs)` | Actualiza estado tras respuesta SII |
| `ConectorCAFSel(empresa, caja)` | Consulta CAF disponibles |
| `ConectorCargarCAF(empresa, tipo, desde, hasta, xml)` | Carga nuevo CAF |
| `ConectorPDFVer(maquina)` | Obtiene docs pendientes de impresión PDF |
| `ConectorPDFActualizar(id, tipo)` | Marca doc como impreso |

---

## Módulo Promociones

```sql
CREATE TABLE promociones (
  COD_EMPRESA      TINYINT UNSIGNED NOT NULL
  COD_SUCURSAL     SMALLINT UNSIGNED NOT NULL
  NUMID            INT UNSIGNED NOT NULL AUTO_INCREMENT
  DESCRIPCION      VARCHAR(40)
  TIPO             TINYINT UNSIGNED   -- 1=Descuento %, 2=Precio especial, 3=N×M, etc.
  FECHA_INICIO     DATETIME
  FECHA_FIN        DATETIME
  ESTADO           TINYINT UNSIGNED   -- 1=activa, 0=inactiva
  PRIMARY KEY (NUMID)
)

CREATE TABLE promocionesproductos (
  COD_ART         INT(7) UNSIGNED NOT NULL
  ID_PROMO        INT UNSIGNED NOT NULL    -- FK → promociones
  TIPO_DESCUENTO  TINYINT
  VALOR_DESCUENTO DOUBLE(15,4)
)
```

---

## Tablas de Cierres de Caja

```sql
CREATE TABLE cierres (
  -- Registro de cada cierre de caja
  COD_EMPRESA, COD_SUCURSAL, CAJA
  FECHA_CIERRE, FECHA_APERTURA
  COD_CAJERO
  MONTO_EFECTIVO_INICIAL  -- Fondo de caja
  TOTAL_VENTAS, TOTAL_BOLETAS, TOTAL_FACTURAS
  TOTAL_EFECTIVO, TOTAL_TARJETA, TOTAL_CHEQUE
  DIFERENCIA              -- Diferencia caja real vs sistema
)

CREATE TABLE cierreresumencierres (
  -- Resumen consolidado por período
  VENTAS_NETO, VENTAS_IVA, VENTAS_TOTAL
  COMPRAS_NETO, COMPRAS_IVA
  POR_FORMA_PAGO_1..10    -- Totales por forma de pago
)
```

---

## Diagrama de Relaciones Clave

```
empresas (1) ──────────────────────── (N) sucursales
                                              │
                              (N) bodegas ───┘
                                    │
                              (N) bodegastock
                                    │
productos ──── codigosdebarra       │
   │                │               │
   │         (escaneo balanza)       │
   │                ↓               │
   │       cabezaltransbalanza ←→ detalletransbalanza
   │              ↓ (QR escaneado en caja)
   │       cabezalventas ←→ detalleventas ──→ bodegastock (UPDATE)
   │                                                │
   └──── precios ←── listasprecios                  │
   │                                                │
   └──── impuestos                          modificaciondestock
   
personal ──→ cabezalventas (cajero/vendedor)
          └→ cabezaltransbalanza (vendedor balanza)

caf ──→ cabezalventas (folio DTE) ──→ xmldte/xmlboletas ──→ SII
```
