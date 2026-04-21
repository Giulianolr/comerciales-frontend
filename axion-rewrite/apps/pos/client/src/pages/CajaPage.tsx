import { useState, useRef } from 'react'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { formatPesos, TipoDocumento } from '@optimind/shared'

interface ItemVenta {
  nroItem: number; codArt: number; descripcion: string
  cantidad: number; precioUnitario: number; totalPlu: number; porcIva: number; simboloUnidad: string
}

interface TransaccionQr {
  idTransaccion: string; monto: number; nroItems: number; items: ItemVenta[]
}

type EstadoCaja = 'esperando_qr' | 'mostrando_venta' | 'venta_confirmada'

export function CajaPage() {
  const { empleado, token, logout } = useAuthStore()
  const [estado, setEstado] = useState<EstadoCaja>('esperando_qr')
  const [qrInput, setQrInput] = useState('')
  const [transaccion, setTransaccion] = useState<TransaccionQr | null>(null)
  const [nroCargo, setNroCargo] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [tipoDoc, setTipoDoc] = useState<number>(TipoDocumento.BOLETA_AFECTA)
  const qrRef = useRef<HTMLInputElement>(null)

  const api = axios.create({ headers: { Authorization: `Bearer ${token}` } })

  const leerQr = async (valor: string) => {
    if (!valor.trim()) return
    setError('')
    try {
      const { data } = await api.post('/api/qr/leer', { qrString: valor })
      setTransaccion(data.data)
      setEstado('mostrando_venta')
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'QR inválido')
    } finally {
      setQrInput('')
    }
  }

  const confirmarVenta = async () => {
    if (!transaccion) return
    try {
      const { data } = await api.post('/api/ventas/confirmar', {
        idTransaccion: transaccion.idTransaccion,
        codCajero: empleado?.codEmpleado,
        tipoDocumento: tipoDoc,
      })
      setNroCargo(data.data.nroCargo)
      setEstado('venta_confirmada')
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Error al confirmar venta')
    }
  }

  const nuevaVenta = () => {
    setTransaccion(null)
    setNroCargo(null)
    setEstado('esperando_qr')
    setError('')
    setTimeout(() => qrRef.current?.focus(), 100)
  }

  // ─── PANTALLA: Esperando QR ───
  if (estado === 'esperando_qr') {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
        <div className="flex justify-between w-full max-w-lg mb-8">
          <h1 className="text-xl font-bold text-green-400">OptiMind POS — {empleado?.nombre}</h1>
          <button onClick={logout} className="text-gray-500 hover:text-white text-sm">Salir</button>
        </div>
        <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-lg text-center space-y-6">
          <div className="text-6xl">📷</div>
          <h2 className="text-2xl font-bold text-white">Esperando QR de balanza</h2>
          <p className="text-gray-400">Escanee el código QR del cliente</p>
          <input
            ref={qrRef}
            type="text"
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && leerQr(qrInput)}
            className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white text-lg text-center focus:outline-none focus:border-green-500 border border-gray-600"
            placeholder="Escaneando QR..."
            autoFocus
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      </div>
    )
  }

  // ─── PANTALLA: Mostrando venta ───
  if (estado === 'mostrando_venta' && transaccion) {
    return (
      <div className="min-h-screen bg-gray-950 p-6 flex gap-6">
        {/* Items */}
        <div className="flex-1 bg-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">Productos ({transaccion.nroItems})</h2>
          <div className="space-y-2 overflow-y-auto max-h-[60vh]">
            {transaccion.items.map((item) => (
              <div key={item.nroItem} className="bg-gray-700 rounded-lg p-3 flex justify-between">
                <div>
                  <p className="text-white font-medium">{item.descripcion}</p>
                  <p className="text-gray-400 text-sm">{item.cantidad} {item.simboloUnidad} × {formatPesos(item.precioUnitario)}</p>
                </div>
                <p className="text-green-400 font-bold text-lg">{formatPesos(item.totalPlu)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Panel cobro */}
        <div className="w-72 flex flex-col gap-4">
          <div className="bg-gray-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-gray-400 text-sm">Tipo documento</h3>
            <select
              value={tipoDoc}
              onChange={(e) => setTipoDoc(parseInt(e.target.value))}
              className="w-full bg-gray-700 rounded-lg px-3 py-2 text-white"
            >
              <option value={TipoDocumento.BOLETA_AFECTA}>Boleta Electrónica</option>
              <option value={TipoDocumento.FACTURA_AFECTA}>Factura Afecta</option>
              <option value={TipoDocumento.BOLETA_NO_AFECTA}>Boleta No Afecta</option>
            </select>
            <div className="border-t border-gray-700 pt-4">
              <p className="text-gray-400 text-sm">TOTAL</p>
              <p className="text-white text-4xl font-bold mt-1">{formatPesos(transaccion.monto)}</p>
            </div>
          </div>
          {error && <p className="text-red-400 text-sm bg-red-900/30 p-3 rounded-lg">{error}</p>}
          <button onClick={confirmarVenta}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-xl">
            ✓ Cobrar
          </button>
          <button onClick={nuevaVenta}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl">
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  // ─── PANTALLA: Venta confirmada ───
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-6">
      <div className="text-6xl">✅</div>
      <h2 className="text-3xl font-bold text-green-400">Venta Registrada</h2>
      <p className="text-gray-400">Boleta #{nroCargo}</p>
      <p className="text-white text-4xl font-bold">{formatPesos(transaccion?.monto ?? 0)}</p>
      <button onClick={nuevaVenta}
        className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold px-10 py-4 rounded-xl text-xl">
        Nueva Venta
      </button>
    </div>
  )
}
