# Changelog — Comerciales Frontend

---

## v0.1 — Parche 13–16 Abril 2026

### Front
- Nuevo sistema de alertas de stock: el panel muestra en tiempo real los productos con stock bajo, crítico o sin stock
- Toast emergentes: aparecen en pantalla cuando se detecta un problema de stock, con sonido de aviso
- Campana de notificaciones (topbar) con badge de alertas no leídas, separadas por categoría (Stock / Equipos)
- Al hacer clic en una alerta, navega directo al inventario y resalta el producto afectado con animación
- Control de notificaciones por usuario: cada cuenta puede silenciar el sonido y/o desactivar los emergentes de forma independiente
- Tema claro/oscuro: cada usuario recuerda su preferencia de manera individual
- Zoom de pantalla: 4 niveles (Normal · Cómodo · Grande · Muy grande), guardado por cuenta
- Los toasts de alerta usan contraste invertido al tema activo para ser siempre visibles
- Reloj en vivo en el topbar (hora Santiago)
- Sincronización automática entre pestañas del navegador vía localStorage events

### Cambios técnicos (para el equipo)

**alerts.store.ts**
- Separación de estados `read` (baja del badge) vs `acknowledged` (oculta del panel)
- `seedFromInventory`: carga alertas existentes al montar el layout sin generar duplicados
- `syncProductAlert`: lógica de creación/actualización/resolución de alertas al editar stock
- Preferencias `soundEnabled` / `toastsEnabled` por `userId` con persistencia en localStorage
- Migración automática en `afterRestore` para alertas sin campo `read` y mocks de equipos

**inventory.store.ts**
- `saveProduct` calcula `criticalStock` automáticamente (5% del mínimo) y `stockStatus` (20% = low, 5% = critical, 0 = out_of_stock)
- Llama a `alertsStore.syncProductAlert` solo si cambió el estado de stock

**ManagerLayout.vue**
- Dropdown de Zoom con `v-click-outside` directiva local
- Dropdown de Notificaciones (speaker ON/OFF con toggle individual de sonido y emergentes)
- Panel de alertas (campana) con `AlertsPanel` integrado
- `onStorageChange` para rehidratar stores cuando otra pestaña actualiza

**InventoryView.vue**
- `highlightSku(sku)`: scroll suave + ring animado (5.3s activo, 700ms fade out) al navegar desde alerta
- Watcher sobre `route.query` (deep) para detectar mismo `?sku=` con diferente `_t`
- Filtros por búsqueda, categoría y estado de stock

**Componentes de alerta**
- `AlertsPanel`: lista separada Stock / Equipos, opción "Descartar todas", badge de no leídas
- `AlertRow`: tiempo relativo (`timeAgo`), ícono de severidad (critical / error / low), botón descartar hover
- `AlertToast`: `containerClass` con contraste invertido según tema (dark→toast claro, light→toast oscuro)
- `AlertsToastContainer`: `Teleport to="body"`, `z-[9999]`, stacking de múltiples toasts

**theme.store.ts / zoom.store.ts**
- Preferencias guardadas como `Record<userId, valor>` → cada cuenta recuerda su configuración
- `reset()` en logout para limpiar el DOM

### Bugs corregidos

- Badge de alertas sumaba 1 al recargar la página por las alertas de equipo mock → corregido: se marcan como `read: true` en `afterRestore`
- Al navegar desde una alerta al mismo producto dos veces, la segunda vez no hacía highlight → corregido: navegación forzada con `?_t=Date.now()`
- Al cerrar sesión y entrar con otro usuario, el tema y zoom del usuario anterior persistían en el DOM → corregido con `themeStore.reset()` y `zoomStore.reset()` en `handleLogout`
- Alertas sin campo `read` (persistidas antes de la migración) causaban inconsistencia en el badge → corregido con `afterRestore` que añade `read: false` si el campo no existe

### Pendiente / Conocido

- Alertas de equipos son estáticas (mock) hasta que el backend entregue el endpoint de estado de balanzas
- KPIs del Dashboard y gráfico de ventas usan datos mock (sin conexión real al backend aún)
- No hay paginación en inventario (actualmente ~10 productos de prueba)
