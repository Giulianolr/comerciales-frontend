import { createRouter, createWebHistory } from 'vue-router'
import ManagerLayout from '../layouts/ManagerLayout.vue'
import DashboardView from '../views/DashboardView.vue'

const routes = [
  {
    path: '/',
    redirect: '/gerente'
  },
  {
    path: '/gerente',
    component: ManagerLayout,
    children: [
      {
        path: '',
        component: DashboardView,
        meta: { title: 'Panel General', icon: 'chart-bar' }
      },
      {
        path: 'transacciones',
        component: () => import('../views/TransactionsView.vue'),
        meta: { title: 'Transacciones', icon: 'bolt' }
      },
      {
        path: 'inventario',
        component: () => import('../views/InventoryView.vue'),
        meta: { title: 'Inventario', icon: 'cube' }
      },
      {
        path: 'balanzas',
        component: () => import('../views/StationsView.vue'),
        meta: { title: 'Balanzas', icon: 'server-stack' }
      },
      {
        path: 'reportes',
        component: () => import('../views/ReportsView.vue'),
        meta: { title: 'Reportes', icon: 'document-chart-bar' }
      },
      {
        path: 'usuarios',
        component: () => import('../views/UsersView.vue'),
        meta: { title: 'Usuarios', icon: 'users' }
      },
      {
        path: 'cierre',
        component: () => import('../views/CierreView.vue'),
        meta: { title: 'Cierre del Día', icon: 'lock-closed' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
