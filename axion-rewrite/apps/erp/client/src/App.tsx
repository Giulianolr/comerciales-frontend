import { Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ProductosPage } from './pages/ProductosPage'
import { VentasPage } from './pages/VentasPage'
import { ComprasPage } from './pages/ComprasPage'
import { InventarioPage } from './pages/InventarioPage'
import { useAuthStore } from './store/authStore'
import { api } from './lib/api'

function useLocalConfig() {
  const { token } = useAuthStore()
  return useQuery({
    queryKey: ['erp-config'],
    queryFn: () => api.get('/dashboard/config').then((r) => r.data.data),
    enabled: !!token,
    staleTime: Infinity,
  })
}

function Layout({ children }: { children: React.ReactNode }) {
  const { empleado, logout } = useAuthStore()
  const { data: config } = useLocalConfig()
  const nombreLocal = config?.sucursal?.nombre ?? config?.empresa?.nombre ?? ''

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded text-sm font-medium transition-colors ${isActive ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700'}`

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-blue-800 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-1">
            <div className="flex flex-col leading-tight mr-4">
              <span className="font-black text-base tracking-tight">OptiMind</span>
              {nombreLocal && (
                <span className="text-blue-300 text-xs leading-none">{nombreLocal}</span>
              )}
            </div>
            <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
            <NavLink to="/productos" className={linkClass}>Productos</NavLink>
            <NavLink to="/ventas" className={linkClass}>Ventas</NavLink>
            <NavLink to="/compras" className={linkClass}>Compras</NavLink>
            <NavLink to="/inventario" className={linkClass}>Inventario</NavLink>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-blue-200">{empleado?.nombre}</span>
            <button onClick={logout} className="text-blue-300 hover:text-white">Salir</button>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/productos" element={<ProtectedRoute><ProductosPage /></ProtectedRoute>} />
      <Route path="/ventas" element={<ProtectedRoute><VentasPage /></ProtectedRoute>} />
      <Route path="/compras" element={<ProtectedRoute><ComprasPage /></ProtectedRoute>} />
      <Route path="/inventario" element={<ProtectedRoute><InventarioPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
