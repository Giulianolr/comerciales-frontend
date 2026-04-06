# 🎨 Frontend — Panel Gerente

**Para:** Jonathan (Frontend Dev)  
**Stack:** Vue 3 + TypeScript + Tailwind CSS + Pinia + TanStack Query + ApexCharts  
**Fecha:** 6 de abril de 2026

---

## 🚀 INICIO RÁPIDO (5 minutos)

### Requisitos
- Node.js 18+ 
- npm 9+

### Instalación

```bash
# Clonar repo
git clone https://github.com/Giulianolr/comerciales-frontend.git
cd comerciales-frontend

# Instalar dependencias
npm install

# Copiar env
cp .env.example .env

# Iniciar dev server
npm run dev
```

Luego abre **http://localhost:5173** en tu navegador.

---

## 📁 ESTRUCTURA DEL PROYECTO

```
src/
├── main.ts                    # Entry point
├── App.vue                    # Root component
├── style.css                  # Global styles
├── router/
│   └── index.ts              # Vue Router config (7 rutas)
├── stores/
│   └── dashboard.store.ts    # Pinia store (KPIs, alertas)
├── types/
│   └── index.ts              # TypeScript interfaces
├── mocks/
│   ├── index.ts
│   └── kpis.ts              # Datos mock (sin backend)
├── layouts/
│   └── ManagerLayout.vue    # Shell: sidebar + topbar
├── views/                    # 7 vistas principales
│   ├── DashboardView.vue    # KPIs + estaciones + alertas
│   ├── TransactionsView.vue
│   ├── InventoryView.vue
│   ├── StationsView.vue
│   ├── ReportsView.vue
│   ├── UsersView.vue
│   └── CierreView.vue
└── components/
    ├── KpiCard.vue          # Card con métrica + trend
    └── StationCard.vue      # Card de balanza/caja
```

---

## 🎯 WORKFLOW DE DESARROLLO

### 1. **Feature Branch**
```bash
git checkout -b feature/mi-feature
```

### 2. **Desarrollo con mock data**
Todo el dashboard funciona CON datos mock (sin necesitar backend).  
Los mocks están en `src/mocks/` y se importan automáticamente.

### 3. **Cambios en tiempo real**
Vite hot-reloads automáticamente cambios en `.vue`, `.ts`, `.css`.

### 4. **Commit y Push**
```bash
git add .
git commit -m "feat: descripción de cambios"
git push origin feature/mi-feature
```

### 5. **Pull Request**
Crear PR en GitHub con descripción de qué implementaste.

---

## 🛠️ TAREAS PRIORITARIAS

### P0 (Hoy)
- ✅ DashboardView.vue — KPI cards + charts + alertas
- [ ] Reemplazar placeholders de otras vistas

### P1 (Esta semana)
- [ ] TransactionsView.vue — tabla + filtros + modal
- [ ] InventoryView.vue — tabla stock + alertas
- [ ] Conectar a API real (reemplazar mocks)

### P2 (Próxima semana)
- [ ] StationsView.vue — grid estado balanzas
- [ ] ReportsView.vue — charts + exportar PDF

### P3 (Sprint 0)
- [ ] UsersView.vue — CRUD usuarios
- [ ] CierreView.vue — wizard cierre

---

## 📊 DASHBOARD PRINCIPAL (DashboardView)

### Componentes presentes:
1. **KpiCardGrid** — 4 cards grandes (Ventas, Transacciones, Ticket, Balanzas Activas)
2. **StationStatusRow** — 5 pills con estado en tiempo real (4 balanzas + caja)
3. **SalesHourlyChart** — Gráfico de ventas por hora (ApexCharts)
4. **TopProductsChart** — Top 5 productos
5. **LowStockAlertList** — Alertas de bajo stock

### Data flow:
```
mockKPIs (en mocks/)
    ↓
DashboardStore (Pinia)
    ↓
DashboardView.vue (importa del store)
    ↓
Componentes reutilizables (KpiCard, StationCard)
```

---

## 🔄 MIGRACIÓN A API REAL

Cuando el backend esté listo (Allan):

1. **Reemplazar mocks con axios calls**:
```typescript
// En src/services/api.client.ts
const getKPIs = async () => {
  const { data } = await apiClient.get('/kpis/daily')
  return data
}
```

2. **Usar TanStack Query** para cacheo y polling:
```typescript
const { data: kpis } = useQuery({
  queryKey: ['kpis'],
  queryFn: getKPIs,
  refetchInterval: 15000 // Cada 15 segundos
})
```

3. **WebSocket para tiempo real**:
```typescript
// En src/services/websocket.service.ts
ws.on('kpis_updated', (newKPIs) => {
  dashboardStore.updateKPIs(newKPIs)
})
```

---

## 🎨 PALETA DE COLORES

```
Canvas (fondo):       #0F1117
Surface (cards):      #1A1D27
Surface-2 (modales):  #22263A
Border (líneas):      #2E3348

Brand (primario):     #3B82F6
Success (verde):      #22C55E
Warning (amarillo):   #F59E0B
Danger (rojo):        #EF4444
Info (cyan):          #06B6D4
```

Ver `tailwind.config.js` para todos los colores.

---

## 📝 VARIABLES DE ENTORNO

Ver `.env.example` y copiar a `.env` local. Default:

```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
VITE_ENABLE_MOCK_DATA=true
```

---

## 🧪 TESTING

```bash
# Correr tests
npm run test

# Watch mode
npm run test:ui
```

---

## 📚 DOCUMENTACIÓN RELACIONADA

- **docs/UI_GERENTE.md** — Mockups ASCII de todas las 7 vistas
- **ARQUITECTURA.md** — Stack y decisiones técnicas
- **QUICKSTART.md** — Setup para ambos devs (Allan y Jonathan)

---

## 💬 CONTACTO

Jonathan — Frontend Dev  
Dudas o blockers? Abrir issue en GitHub o contactar directamente.

---

**¡Bienvenido al equipo! 🚀**

Versión: 0.1-MVP | Última actualización: 6 de abril, 2026
