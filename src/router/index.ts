import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore, ROLES_VISOR, ROLES_DASHBOARD, ROLES_CAJA } from '../stores/auth.store'
import ManagerLayout from '../layouts/ManagerLayout.vue'
import DashboardView from '../views/DashboardView.vue'

const routes = [
  {
    path: '/login',
    component: () => import('../views/LoginView.vue'),
    meta: { public: true, title: 'Iniciar sesión' }
  },
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/caja',
    component: () => import('../views/CajaView.vue'),
    meta: { title: 'Vista Caja', roles: ROLES_CAJA }
  },
  {
    path: '/gerente',
    component: ManagerLayout,
    meta: { roles: ROLES_DASHBOARD },
    children: [
      {
        path: '',
        component: DashboardView,
        meta: { title: 'Panel General', icon: 'chart-bar', roles: ROLES_DASHBOARD }
      },
      {
        path: 'transacciones',
        component: () => import('../views/TransactionsView.vue'),
        meta: { title: 'Transacciones', icon: 'bolt', roles: ROLES_VISOR }
      },
      {
        path: 'inventario',
        component: () => import('../views/InventoryView.vue'),
        meta: { title: 'Inventario', icon: 'cube', roles: ROLES_VISOR }
      },
      {
        path: 'balanzas',
        component: () => import('../views/StationsView.vue'),
        meta: { title: 'Balanzas', icon: 'server-stack', roles: ROLES_VISOR }
      },
      {
        path: 'reportes',
        component: () => import('../views/ReportsView.vue'),
        meta: { title: 'Reportes', icon: 'document-chart-bar', roles: ROLES_VISOR }
      },
      {
        path: 'usuarios',
        component: () => import('../views/UsersView.vue'),
        meta: { title: 'Usuarios', icon: 'users', roles: ROLES_VISOR }
      },
      {
        path: 'cierre',
        component: () => import('../views/CierreView.vue'),
        meta: { title: 'Cierre del Día', icon: 'lock-closed', roles: ROLES_VISOR }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  // Si la ruta es pública (login), redirigir al área correcta si ya está autenticado
  if (to.meta.public) {
    if (auth.isAuthenticated) {
      return auth.redirectPathForRole
    }
    return true
  }

  // Ruta protegida: si no está autenticado → login
  if (!auth.isAuthenticated) {
    return '/login'
  }

  // Verificar rol
  const allowedRoles = to.meta.roles as string[] | undefined
  if (allowedRoles && auth.user && !allowedRoles.includes(auth.user.role)) {
    // Tiene sesión pero no el rol correcto → redirigir a su área
    return auth.redirectPathForRole
  }

  return true
})

export default router
