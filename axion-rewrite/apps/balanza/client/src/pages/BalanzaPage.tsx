import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { useTransaccionStore } from '../store/transaccionStore'
import { formatPesos } from '@optimind/shared'

export function BalanzaPage() {
  const { empleado, token, logout } = useAuthStore()
  const { idTransaccion, items, monto, qrBase64, setTransaccion, agregarItem, actualizarMonto, setQr, reset } =
    useTransaccionStore()

  const [codigoBarra, setCodigoBarra] = useState('')
  const [cantidad, setCantidad] = useState<number>(1)
  const [productoActual, setProductoActual] = useState<null | {
    codArt: number; descripcion: string; precioPublico: number; simboloUnidad: string; tipoPesable: boolean
  }>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const api = axios.create({
    headers: { Authorization: `Bearer ${token}` },
  })

  // Iniciar nueva transacción al montar si no hay una activa
  useEffect(() => {
    if (!idTransaccion) iniciarTransaccion()
    inputRef.current?.focus()
  }, [])

  const iniciarTransaccion = async () => {
    const { data } = await api.post('/api/transacciones/nueva', {
      codVendedor: empleado?.codEmpleado,
    })
    setTransaccion(data.data.idTransaccion)
  }

  const buscarProducto = async () => {
    if (!codigoBarra.trim()) return
    setError('')
    setLoading(true)
    try {
      const { data } = await api.get(`/api/productos/buscar?barra=${codigoBarra}`)
      setProductoActual(data.data)
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Producto no encontrado')
      setProductoActual(null)
    } finally {
      setLoading(false)
    }
  }

  const agregarAlCarrito = async () => {
    if (!productoActual || !idTransaccion) return
    setLoading(true)
    try {
      const { data } = await api.post(`/api/transacciones/${idTransaccion}/agregar-item`, {
        codArt: productoActual.codArt,
        cantidad,
        precioUnitario: productoActual.precioPublico,
      })
      agregarItem({
        nroItem: data.data.nroItem,
        codArt: productoActual.codArt,
        descripcion: productoActual.descripcion,
        cantidad,
        precioUnitario: productoActual.precioPublico,
        totalPlu: cantidad * productoActual.precioPublico,
        simbolo: productoActual.simboloUnidad,
      })
      actualizarMonto(data.data.totalTransaccion)
      setCodigoBarra('')
      setCantidad(1)
      setProductoActual(null)
      inputRef.current?.focus()
    } catch (e: any) {
      setError('Error al agregar producto')
    } finally {
      setLoading(false)
    }
  }

  const generarQr = async () => {
    if (!idTransaccion || items.length === 0) return
    setLoading(true)
    try {
      const { data } = await api.post(`/api/transacciones/${idTransaccion}/generar-qr`)
      setQr(data.data.qrBase64, data.data.items, data.data.monto)
    } catch {
      setError('Error al generar QR')
    } finally {
      setLoading(false)
    }
  }

  const cancelarTransaccion = async () => {
    if (idTransaccion) {
      await api.delete(`/api/transacciones/${idTransaccion}`)
    }
    reset()
    iniciarTransaccion()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (productoActual) agregarAlCarrito()
      else buscarProducto()
    }
  }

  // Si hay QR generado, mostrar pantalla QR
  if (qrBase64) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-green-400 mb-2">QR Generado</h2>
        <p className="text-gray-400 mb-6">El cliente puede ir a la caja</p>
        <img src={qrBase64} alt="QR Transacción" className="w-64 h-64 bg-white p-2 rounded-xl" />
        <p className="text-3xl font-bold text-white mt-4">{formatPesos(monto)}</p>
        <p className="text-gray-400 text-sm mt-1">{items.length} producto(s)</p>
        <button
          onClick={() => { reset(); iniciarTransaccion() }}
          className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Nueva Venta
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 flex gap-4">
      {/* Panel izquierdo — Escaneo */}
      <div className="w-1/2 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-400">Balanza — {empleado?.nombre}</h1>
          <button onClick={logout} className="text-gray-500 hover:text-white text-sm">Salir</button>
        </div>

        {/* Input código de barra */}
        <div className="bg-gray-800 rounded-xl p-4 space-y-3">
          <label className="text-sm text-gray-400">Código de barra</label>
          <input
            ref={inputRef}
            type="text"
            value={codigoBarra}
            onChange={(e) => setCodigoBarra(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:border-blue-500"
            placeholder="Escanear o escribir código..."
          />
          <button
            onClick={buscarProducto}
            disabled={loading || !codigoBarra}
            className="w-full bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg"
          >
            Buscar
          </button>
        </div>

        {/* Producto encontrado */}
        {productoActual && (
          <div className="bg-gray-800 border border-blue-600 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-lg text-white">{productoActual.descripcion}</h3>
            <p className="text-2xl font-bold text-green-400">{formatPesos(productoActual.precioPublico)}</p>
            <p className="text-gray-400 text-sm">por {productoActual.simboloUnidad}</p>
            {productoActual.tipoPesable && (
              <label className="block text-sm text-gray-300">
                Cantidad ({productoActual.simboloUnidad}):
              </label>
            )}
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(parseFloat(e.target.value))}
              onKeyDown={handleKeyDown}
              min="0.001"
              step={productoActual.tipoPesable ? '0.001' : '1'}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white text-lg"
            />
            <p className="text-xl text-yellow-400 font-semibold">
              Total: {formatPesos(cantidad * productoActual.precioPublico)}
            </p>
            <button
              onClick={agregarAlCarrito}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg text-lg"
            >
              + Agregar
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-600 rounded-lg p-3 text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Panel derecho — Carrito */}
      <div className="w-1/2 flex flex-col">
        <div className="bg-gray-800 rounded-xl p-4 flex-1 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-300 mb-3">
            Productos ({items.length})
          </h2>

          <div className="flex-1 overflow-y-auto space-y-2">
            {items.length === 0 ? (
              <p className="text-gray-500 text-center mt-8">Sin productos aún</p>
            ) : (
              items.map((item) => (
                <div key={item.nroItem} className="bg-gray-700 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="text-white text-sm font-medium">{item.descripcion}</p>
                    <p className="text-gray-400 text-xs">
                      {item.cantidad} {item.simbolo} × {formatPesos(item.precioUnitario)}
                    </p>
                  </div>
                  <p className="text-green-400 font-bold">{formatPesos(item.totalPlu)}</p>
                </div>
              ))
            )}
          </div>

          {/* Total y botones */}
          <div className="border-t border-gray-700 pt-4 mt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-300 text-lg">TOTAL</span>
              <span className="text-white text-3xl font-bold">{formatPesos(monto)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={cancelarTransaccion}
                className="bg-red-700 hover:bg-red-600 text-white font-semibold py-3 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={generarQr}
                disabled={items.length === 0 || loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white font-bold py-3 rounded-lg text-lg"
              >
                Generar QR
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
