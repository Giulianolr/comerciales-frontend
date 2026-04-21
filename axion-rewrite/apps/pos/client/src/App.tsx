import { Routes, Route, Navigate } from 'react-router-dom'
import { CajaPage } from './pages/CajaPage'
import { LoginPage } from './pages/LoginPage'
import { useAuthStore } from './store/authStore'

export default function App() {
  const { token } = useAuthStore()
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={token ? <CajaPage /> : <Navigate to="/login" replace />} />
    </Routes>
  )
}
