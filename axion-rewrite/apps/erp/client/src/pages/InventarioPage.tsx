import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

interface ItemCritico {
  codArt: number
  descripcion: string
  stock: number
  stockCritico: number
  diferencia: number
  simbolo: string
}

interface Movimiento {
  id: number
  codArt: number
  operacion: string
  accion: number
  cantidad: number
  stockAnterior: number
  stockNuevo: number
  descripcion: string
  fecha: string
}

export function InventarioPage() {
  const [codArtMovimientos, setCodArtMovimientos] = useState<number | null>(null)
  const [inputCodArt, setInputCodArt] = useState('')

  const { data: criticos, isLoading } = useQuery({
    queryKey: ['stock-critico'],
    queryFn: () => api.get('/inventario/stock-critico').then((r) => r.data.data as ItemCritico[]),
  })

  const { data: movimientos, isLoading: loadingMov } = useQuery({
    queryKey: ['movimientos', codArtMovimientos],
    queryFn: () =>
      api.get(`/inventario/movimientos/${codArtMovimientos}`).then((r) => r.data.data as Movimiento[]),
    enabled: codArtMovimientos !== null,
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inventario</h1>

      {/* Stock crítico */}
      <section>
        <h2 className="text-lg font-semibold mb-3 text-red-700">Productos bajo stock crítico</h2>
        {isLoading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : criticos?.length === 0 ? (
          <p className="text-green-600 font-medium">Sin productos en stock crítico.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse bg-white rounded-lg shadow">
              <thead className="bg-red-50">
                <tr>
                  <th className="text-left px-4 py-2 border-b">Código</th>
                  <th className="text-left px-4 py-2 border-b">Descripción</th>
                  <th className="text-right px-4 py-2 border-b">Stock actual</th>
                  <th className="text-right px-4 py-2 border-b">Stock crítico</th>
                  <th className="text-right px-4 py-2 border-b">Diferencia</th>
                  <th className="text-center px-4 py-2 border-b">Movimientos</th>
                </tr>
              </thead>
              <tbody>
                {criticos?.map((item) => (
                  <tr key={item.codArt} className="hover:bg-red-50">
                    <td className="px-4 py-2 border-b font-mono">{item.codArt}</td>
                    <td className="px-4 py-2 border-b">{item.descripcion}</td>
                    <td className="px-4 py-2 border-b text-right font-bold text-red-600">
                      {item.stock} {item.simbolo}
                    </td>
                    <td className="px-4 py-2 border-b text-right">{item.stockCritico} {item.simbolo}</td>
                    <td className="px-4 py-2 border-b text-right text-red-600">{item.diferencia}</td>
                    <td className="px-4 py-2 border-b text-center">
                      <button
                        onClick={() => setCodArtMovimientos(item.codArt)}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Historial de movimientos */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Historial de movimientos</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="number"
            placeholder="Código artículo"
            value={inputCodArt}
            onChange={(e) => setInputCodArt(e.target.value)}
            className="border rounded px-3 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setCodArtMovimientos(parseInt(inputCodArt))}
            disabled={!inputCodArt}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Consultar
          </button>
        </div>

        {codArtMovimientos && (
          <div>
            <h3 className="font-medium text-gray-700 mb-2">
              Movimientos — artículo {codArtMovimientos}
            </h3>
            {loadingMov ? (
              <p className="text-gray-500">Cargando...</p>
            ) : movimientos?.length === 0 ? (
              <p className="text-gray-500">Sin movimientos registrados.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse bg-white rounded-lg shadow">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2 border-b">Fecha</th>
                      <th className="text-left px-4 py-2 border-b">Operación</th>
                      <th className="text-center px-4 py-2 border-b">Acción</th>
                      <th className="text-right px-4 py-2 border-b">Cantidad</th>
                      <th className="text-right px-4 py-2 border-b">Stock ant.</th>
                      <th className="text-right px-4 py-2 border-b">Stock nuevo</th>
                      <th className="text-left px-4 py-2 border-b">Descripción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimientos?.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b text-gray-500 text-xs">
                          {new Date(m.fecha).toLocaleString('es-CL')}
                        </td>
                        <td className="px-4 py-2 border-b font-mono text-xs">{m.operacion}</td>
                        <td className="px-4 py-2 border-b text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${m.accion === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {m.accion === 1 ? '+' : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-2 border-b text-right">{m.cantidad}</td>
                        <td className="px-4 py-2 border-b text-right">{m.stockAnterior}</td>
                        <td className="px-4 py-2 border-b text-right font-medium">{m.stockNuevo}</td>
                        <td className="px-4 py-2 border-b text-gray-600 text-xs">{m.descripcion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
