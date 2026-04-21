import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

export function LoginPage() {
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data } = await axios.post('/api/auth/login', { nombreSeguridad: usuario, clave })
      setAuth(data.token, data.empleado)
      navigate('/')
    } catch {
      setError('Usuario o contraseña incorrectos')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-green-400 mb-2">OptiMind</h1>
        <p className="text-gray-400 text-center text-sm mb-6">Punto de Venta</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="text" value={usuario} onChange={(e) => setUsuario(e.target.value)}
            className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white" placeholder="Usuario" autoFocus />
          <input type="password" value={clave} onChange={(e) => setClave(e.target.value)}
            className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white" placeholder="Clave" />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  )
}
