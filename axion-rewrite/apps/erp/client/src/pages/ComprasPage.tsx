import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

interface ItemCompra {
  codArt: number
  descripcion: string
  cantidad: number
  costo: number
  iva: number
}

interface Compra {
  id: number
  tipoCargo: number
  nroCargo: string
  rutClte: string
  monto: number
  fechaEm: string
}

function formatPesos(n: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n)
}

const emptyItem = (): ItemCompra => ({ codArt: 0, descripcion: '', cantidad: 1, costo: 0, iva: 19 })

export function ComprasPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [rutProveedor, setRutProveedor] = useState('')
  const [tipoCargo, setTipoCargo] = useState(46)
  const [nroCargo, setNroCargo] = useState('')
  const [items, setItems] = useState<ItemCompra[]>([emptyItem()])
  const [formError, setFormError] = useState('')

  const { data: compras, isLoading } = useQuery({
    queryKey: ['compras'],
    queryFn: () => api.get('/compras').then((r) => r.data.data as Compra[]),
  })

  const mutation = useMutation({
    mutationFn: () => api.post('/compras', { rutProveedor, tipoCargo, nroCargo: parseInt(nroCargo), items }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['compras'] })
      setShowForm(false)
      setRutProveedor('')
      setNroCargo('')
      setItems([emptyItem()])
    },
    onError: () => setFormError('Error al registrar la compra'),
  })

  const updateItem = (idx: number, field: keyof ItemCompra, value: string | number) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)))
  }

  const total = items.reduce((s, i) => s + i.cantidad * i.costo * (1 + i.iva / 100), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Compras</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? 'Cancelar' : '+ Nueva compra'}
        </button>
      </div>

      {/* Formulario nueva compra */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Registrar recepción de mercadería</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">RUT Proveedor</label>
              <input
                value={rutProveedor}
                onChange={(e) => setRutProveedor(e.target.value)}
                placeholder="12.345.678-9"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tipo documento</label>
              <select
                value={tipoCargo}
                onChange={(e) => setTipoCargo(parseInt(e.target.value))}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={46}>Factura compra (46)</option>
                <option value={56}>Nota débito (56)</option>
                <option value={61}>Nota crédito (61)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">N° documento</label>
              <input
                type="number"
                value={nroCargo}
                onChange={(e) => setNroCargo(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Artículos</p>
              <button
                onClick={() => setItems((prev) => [...prev, emptyItem()])}
                className="text-blue-600 text-sm hover:underline"
              >
                + Agregar línea
              </button>
            </div>
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 border-b">Cód. art.</th>
                  <th className="text-left px-3 py-2 border-b">Descripción</th>
                  <th className="text-right px-3 py-2 border-b">Cantidad</th>
                  <th className="text-right px-3 py-2 border-b">Costo neto</th>
                  <th className="text-right px-3 py-2 border-b">IVA %</th>
                  <th className="text-right px-3 py-2 border-b">Total</th>
                  <th className="px-2 py-2 border-b"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-2 py-1 border-b">
                      <input
                        type="number"
                        value={item.codArt || ''}
                        onChange={(e) => updateItem(idx, 'codArt', parseInt(e.target.value) || 0)}
                        className="w-20 border rounded px-2 py-1 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-2 py-1 border-b">
                      <input
                        value={item.descripcion}
                        onChange={(e) => updateItem(idx, 'descripcion', e.target.value)}
                        className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-2 py-1 border-b">
                      <input
                        type="number"
                        value={item.cantidad}
                        onChange={(e) => updateItem(idx, 'cantidad', parseFloat(e.target.value) || 0)}
                        className="w-20 border rounded px-2 py-1 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-2 py-1 border-b">
                      <input
                        type="number"
                        value={item.costo}
                        onChange={(e) => updateItem(idx, 'costo', parseFloat(e.target.value) || 0)}
                        className="w-28 border rounded px-2 py-1 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-2 py-1 border-b">
                      <input
                        type="number"
                        value={item.iva}
                        onChange={(e) => updateItem(idx, 'iva', parseFloat(e.target.value) || 0)}
                        className="w-16 border rounded px-2 py-1 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-2 py-1 border-b text-right font-medium">
                      {formatPesos(item.cantidad * item.costo * (1 + item.iva / 100))}
                    </td>
                    <td className="px-2 py-1 border-b">
                      {items.length > 1 && (
                        <button
                          onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5} className="px-3 py-2 text-right font-semibold">Total:</td>
                  <td className="px-2 py-2 text-right font-bold text-lg">{formatPesos(total)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {formError && <p className="text-red-600 text-sm">{formError}</p>}

          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !rutProveedor || !nroCargo}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Registrando...' : 'Registrar compra'}
          </button>
        </div>
      )}

      {/* Listado compras */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2 border-b">Fecha</th>
              <th className="text-left px-4 py-2 border-b">Tipo doc.</th>
              <th className="text-right px-4 py-2 border-b">N°</th>
              <th className="text-left px-4 py-2 border-b">Proveedor (RUT)</th>
              <th className="text-right px-4 py-2 border-b">Monto</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-4 text-center text-gray-500">Cargando...</td></tr>
            ) : compras?.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-4 text-center text-gray-500">Sin compras registradas</td></tr>
            ) : (
              compras?.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b text-gray-500 text-xs">
                    {new Date(c.fechaEm).toLocaleString('es-CL')}
                  </td>
                  <td className="px-4 py-2 border-b">{c.tipoCargo}</td>
                  <td className="px-4 py-2 border-b text-right font-mono">{c.nroCargo}</td>
                  <td className="px-4 py-2 border-b">{c.rutClte}</td>
                  <td className="px-4 py-2 border-b text-right font-semibold">{formatPesos(Number(c.monto))}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
