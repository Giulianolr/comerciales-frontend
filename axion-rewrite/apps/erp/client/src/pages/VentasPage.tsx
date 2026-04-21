import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

interface ResumenVentas {
  totalVentas: number
  cantidadDocs: number
  totalBoletas: number
  totalFacturas: number
}

interface Venta {
  nroCargo: number
  tipoCargo: number
  rutClte: string
  cajero: string
  monto: number
  fechaEm: string
  nroItems: number
}

const TIPO_LABELS: Record<number, string> = {
  33: 'Factura',
  39: 'Boleta',
  41: 'Boleta NC',
}

function formatPesos(n: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n)
}

export function VentasPage() {
  const hoy = new Date().toISOString().split('T')[0]
  const [desde, setDesde] = useState(hoy)
  const [hasta, setHasta] = useState(hoy)
  const [filtro, setFiltro] = useState({ desde: hoy, hasta: hoy })

  const { data, isLoading } = useQuery({
    queryKey: ['ventas', filtro],
    queryFn: () =>
      api
        .get('/ventas', { params: { desde: filtro.desde, hasta: filtro.hasta + 'T23:59:59' } })
        .then((r) => r.data.data as { resumen: ResumenVentas; ventas: Venta[] }),
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ventas</h1>

      {/* Filtro fechas */}
      <div className="flex items-end gap-3 bg-white p-4 rounded-lg shadow">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Desde</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setFiltro({ desde, hasta })}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Consultar
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : data ? (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total vendido', value: formatPesos(data.resumen.totalVentas), color: 'blue' },
              { label: 'Documentos', value: data.resumen.cantidadDocs, color: 'gray' },
              { label: 'Boletas', value: data.resumen.totalBoletas, color: 'green' },
              { label: 'Facturas', value: data.resumen.totalFacturas, color: 'purple' },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{card.label}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 border-b">Fecha</th>
                  <th className="text-left px-4 py-2 border-b">Tipo</th>
                  <th className="text-right px-4 py-2 border-b">N°</th>
                  <th className="text-left px-4 py-2 border-b">RUT Cliente</th>
                  <th className="text-left px-4 py-2 border-b">Cajero</th>
                  <th className="text-right px-4 py-2 border-b">Items</th>
                  <th className="text-right px-4 py-2 border-b">Monto</th>
                </tr>
              </thead>
              <tbody>
                {data.ventas.map((v) => (
                  <tr key={`${v.tipoCargo}-${v.nroCargo}`} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b text-gray-500 text-xs">
                      {new Date(v.fechaEm).toLocaleString('es-CL')}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        {TIPO_LABELS[v.tipoCargo] ?? `Tipo ${v.tipoCargo}`}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-b text-right font-mono">{v.nroCargo}</td>
                    <td className="px-4 py-2 border-b">{v.rutClte}</td>
                    <td className="px-4 py-2 border-b">{v.cajero}</td>
                    <td className="px-4 py-2 border-b text-right">{v.nroItems}</td>
                    <td className="px-4 py-2 border-b text-right font-semibold">{formatPesos(v.monto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  )
}
