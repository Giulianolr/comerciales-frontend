import { Routes, Route, Navigate } from 'react-router-dom'
import { BalanzaPage } from './pages/BalanzaPage'
import { LoginPage } from './pages/LoginPage'
import { useAuthStore } from './store/authStore'

export default function App() {
  const { token } = useAuthStore()

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={token ? <BalanzaPage /> : <Navigate to="/login" replace />}
      />
    </Routes>
  )
}
