import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

interface Producto {
  codArt: number
  descripcion: string
  estado: number
  stock: number
  stockCritico: number
  precioPublico: number
  precioNeto: number
  porcIva: number
  simboloUnidad: string
  codigosBarra: string[]
  tipoPesable: boolean
  enPromocion: boolean
}

function formatPesos(n: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n)
}

export function ProductosPage() {
  const qc = useQueryClient()
  const [buscar, setBuscar] = useState('')
  const [pagina, setPagina] = useState(1)
  const [editingPrecio, setEditingPrecio] = useState<{ codArt: number; impPrecio1: string; precio1: string } | null>(null)
  const [editingStock, setEditingStock] = useState<{ codArt: number; nuevoStock: string; motivo: string } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['productos', buscar, pagina],
    queryFn: () =>
      api.get('/productos', { params: { buscar, pagina, limite: 50 } })
        .then((r) => r.data.data as { total: number; pagina: number; totalPaginas: number; productos: Producto[] }),
  })

  const precioMutation = useMutation({
    mutationFn: ({ codArt, impPrecio1, precio1 }: { codArt: number; impPrecio1: number; precio1: number }) =>
      api.put(`/productos/${codArt}/precio`, { codLista: 1, impPrecio1, precio1 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos'] })
      setEditingPrecio(null)
    },
  })

  const stockMutation = useMutation({
    mutationFn: ({ codArt, nuevoStock, motivo }: { codArt: number; nuevoStock: number; motivo: string }) =>
      api.put(`/productos/${codArt}/stock`, { nuevoStock, motivo, codEmpleado: 1 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos'] })
      setEditingStock(null)
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        {data && (
          <span className="text-sm text-gray-500">{data.total} productos</span>
        )}
      </div>

      {/* Buscador */}
      <input
        type="text"
        value={buscar}
        onChange={(e) => { setBuscar(e.target.value); setPagina(1) }}
        placeholder="Buscar por descripción o código de barras..."
        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2 border-b">Código</th>
              <th className="text-left px-4 py-2 border-b">Descripción</th>
              <th className="text-right px-4 py-2 border-b">Stock</th>
              <th className="text-right px-4 py-2 border-b">Stock crít.</th>
              <th className="text-right px-4 py-2 border-b">Precio público</th>
              <th className="text-right px-4 py-2 border-b">Precio neto</th>
              <th className="text-center px-4 py-2 border-b">IVA</th>
              <th className="text-center px-4 py-2 border-b">Estado</th>
              <th className="text-center px-4 py-2 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={9} className="px-4 py-4 text-center text-gray-500">Cargando...</td></tr>
            ) : data?.productos.map((p) => (
              <tr key={p.codArt} className={`hover:bg-gray-50 ${p.stock <= p.stockCritico && p.stockCritico > 0 ? 'bg-red-50' : ''}`}>
                <td className="px-4 py-2 border-b font-mono text-xs">{p.codArt}</td>
                <td className="px-4 py-2 border-b">
                  <div>{p.descripcion}</div>
                  {p.codigosBarra.length > 0 && (
                    <div className="text-xs text-gray-400">{p.codigosBarra[0]}</div>
                  )}
                </td>
                <td className={`px-4 py-2 border-b text-right font-medium ${p.stock <= p.stockCritico && p.stockCritico > 0 ? 'text-red-600' : ''}`}>
                  {p.stock} {p.simboloUnidad}
                </td>
                <td className="px-4 py-2 border-b text-right text-gray-500">{p.stockCritico}</td>
                <td className="px-4 py-2 border-b text-right">{formatPesos(p.precioPublico)}</td>
                <td className="px-4 py-2 border-b text-right text-gray-600">{formatPesos(p.precioNeto)}</td>
                <td className="px-4 py-2 border-b text-center">{p.porcIva}%</td>
                <td className="px-4 py-2 border-b text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.estado === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.estado === 1 ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-2 border-b text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setEditingPrecio({ codArt: p.codArt, impPrecio1: String(p.precioPublico), precio1: String(p.precioNeto) })}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Precio
                    </button>
                    <button
                      onClick={() => setEditingStock({ codArt: p.codArt, nuevoStock: String(p.stock), motivo: '' })}
                      className="text-orange-600 hover:underline text-xs"
                    >
                      Stock
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {data && data.totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
            disabled={pagina === 1}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
          >
            ‹
          </button>
          <span className="text-sm">Pág. {pagina} / {data.totalPaginas}</span>
          <button
            onClick={() => setPagina((p) => Math.min(data.totalPaginas, p + 1))}
            disabled={pagina === data.totalPaginas}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
          >
            ›
          </button>
        </div>
      )}

      {/* Modal editar precio */}
      {editingPrecio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-semibold">Actualizar precio — art. {editingPrecio.codArt}</h3>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Precio público (con IVA)</label>
              <input
                type="number"
                value={editingPrecio.impPrecio1}
                onChange={(e) => setEditingPrecio((p) => p && { ...p, impPrecio1: e.target.value })}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Precio neto (sin IVA)</label>
              <input
                type="number"
                value={editingPrecio.precio1}
                onChange={(e) => setEditingPrecio((p) => p && { ...p, precio1: e.target.value })}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  precioMutation.mutate({
                    codArt: editingPrecio.codArt,
                    impPrecio1: parseFloat(editingPrecio.impPrecio1),
                    precio1: parseFloat(editingPrecio.precio1),
                  })
                }
                disabled={precioMutation.isPending}
                className="flex-1 bg-blue-600 text-white rounded py-2 hover:bg-blue-700 disabled:opacity-50"
              >
                Guardar
              </button>
              <button
                onClick={() => setEditingPrecio(null)}
                className="flex-1 border rounded py-2 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ajuste stock */}
      {editingStock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-lg font-semibold">Ajustar stock — art. {editingStock.codArt}</h3>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nuevo stock</label>
              <input
                type="number"
                value={editingStock.nuevoStock}
                onChange={(e) => setEditingStock((p) => p && { ...p, nuevoStock: e.target.value })}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Motivo del ajuste</label>
              <input
                value={editingStock.motivo}
                onChange={(e) => setEditingStock((p) => p && { ...p, motivo: e.target.value })}
                placeholder="Ej: Inventario físico, merma, etc."
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  stockMutation.mutate({
                    codArt: editingStock.codArt,
                    nuevoStock: parseFloat(editingStock.nuevoStock),
                    motivo: editingStock.motivo,
                  })
                }
                disabled={stockMutation.isPending || !editingStock.motivo}
                className="flex-1 bg-orange-600 text-white rounded py-2 hover:bg-orange-700 disabled:opacity-50"
              >
                Ajustar
              </button>
              <button
                onClick={() => setEditingStock(null)}
                className="flex-1 border rounded py-2 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
