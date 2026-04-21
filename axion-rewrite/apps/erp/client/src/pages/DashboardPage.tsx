import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

interface KPIs {
  ventasHoy: { monto: number; cantidad: number }
  ventasSemana: { monto: number; cantidad: number }
  ventasMes: { monto: number; cantidad: number; variacion: number | null }
  ticketPromedio: number
  stockCritico: number
}

interface TopProducto {
  codArt: number
  descripcion: string
  cantidadVendida: number
  vecesVendido: number
}

interface DiaVenta {
  fecha: string
  monto: number
  cantidad: number
}

interface HoraVenta {
  hora: number
  label: string
  monto: number
  cantidad: number
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

function KpiCard({ label, value, sub, color, badge }: {
  label: string; value: string; sub?: string; color: string; badge?: string
}) {
  return (
    <div className={`bg-white rounded-xl shadow p-5 border-l-4 ${color}`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {sub && <p className="text-sm text-gray-500 mt-1">{sub}</p>}
      {badge && (
        <span className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block font-medium
          ${badge.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {badge} vs mes anterior
        </span>
      )}
    </div>
  )
}

function BarChart({ data, maxVal, labelKey, valueKey, colorClass }: {
  data: any[]; maxVal: number; labelKey: string; valueKey: string; colorClass: string
}) {
  if (maxVal === 0) return <p className="text-gray-400 text-sm text-center py-4">Sin datos</p>
  return (
    <div className="space-y-2">
      {data.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-20 truncate shrink-0">{item[labelKey]}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
            <div
              className={`h-5 rounded-full ${colorClass} flex items-center justify-end pr-2`}
              style={{ width: `${Math.max(3, (item[valueKey] / maxVal) * 100)}%` }}
            >
              <span className="text-xs text-white font-medium">{item[valueKey]}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function LineChart({ data }: { data: DiaVenta[] }) {
  const max = Math.max(...data.map((d) => d.monto), 1)
  const W = 100
  const H = 60
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - (d.monto / max) * (H - 4)
    return `${x},${y}`
  })
  const polyline = pts.join(' ')
  const area = `0,${H} ${polyline} ${W},${H}`

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24" preserveAspectRatio="none">
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#grad)" />
        <polyline points={polyline} fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          d.monto > 0 && (
            <circle
              key={i}
              cx={(i / (data.length - 1)) * W}
              cy={H - (d.monto / max) * (H - 4)}
              r="1.5" fill="#3b82f6"
            />
          )
        ))}
      </svg>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">{data[0]?.fecha.slice(5)}</span>
        <span className="text-xs text-gray-400">{data[data.length - 1]?.fecha.slice(5)}</span>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { data: dash, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then((r) => r.data.data as { kpis: KPIs; ultimasVentas: any[] }),
    refetchInterval: 60_000,
  })

  const { data: top } = useQuery({
    queryKey: ['dashboard-top'],
    queryFn: () => api.get('/dashboard/top-productos').then((r) => r.data.data as TopProducto[]),
    refetchInterval: 120_000,
  })

  const { data: dias } = useQuery({
    queryKey: ['dashboard-dias'],
    queryFn: () => api.get('/dashboard/ventas-ultimos-dias').then((r) => r.data.data as DiaVenta[]),
    refetchInterval: 120_000,
  })

  const { data: horas } = useQuery({
    queryKey: ['dashboard-horas'],
    queryFn: () => api.get('/dashboard/ventas-por-hora').then((r) => r.data.data as HoraVenta[]),
    refetchInterval: 60_000,
  })

  if (isLoading) return <div className="flex items-center justify-center h-64 text-gray-400">Cargando...</div>
  if (!dash) return null

  const { kpis, ultimasVentas } = dash
  const variacionLabel = kpis.ventasMes.variacion !== null
    ? `${kpis.ventasMes.variacion >= 0 ? '+' : ''}${kpis.ventasMes.variacion.toFixed(1)}%`
    : undefined

  const maxTop = top ? Math.max(...top.map((t) => t.cantidadVendida), 1) : 1
  const horasConVentas = horas?.filter((h) => h.monto > 0) ?? []
  const maxHora = Math.max(...(horasConVentas.map((h) => h.monto)), 1)

  const TIPO_LABELS: Record<number, string> = { 33: 'Factura', 39: 'Boleta', 41: 'Bol. NC' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <span className="text-xs text-gray-400">Actualiza automáticamente · {new Date().toLocaleTimeString('es-CL')}</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Ventas hoy"
          value={fmt(kpis.ventasHoy.monto)}
          sub={`${kpis.ventasHoy.cantidad} doc.`}
          color="border-blue-500"
        />
        <KpiCard
          label="Esta semana"
          value={fmt(kpis.ventasSemana.monto)}
          sub={`${kpis.ventasSemana.cantidad} doc.`}
          color="border-indigo-500"
        />
        <KpiCard
          label="Este mes"
          value={fmt(kpis.ventasMes.monto)}
          sub={`${kpis.ventasMes.cantidad} doc.`}
          color="border-purple-500"
          badge={variacionLabel}
        />
        <KpiCard
          label="Ticket promedio"
          value={fmt(kpis.ticketPromedio)}
          sub="mes actual"
          color="border-green-500"
        />
        <KpiCard
          label="Stock crítico"
          value={String(kpis.stockCritico)}
          sub="productos bajo mínimo"
          color={kpis.stockCritico > 0 ? "border-red-500" : "border-gray-300"}
        />
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Ventas últimos 14 días */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Ventas — últimos 14 días</h2>
          {dias && dias.length > 0 ? (
            <LineChart data={dias} />
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">Sin datos</p>
          )}
        </div>

        {/* Distribución horaria */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Ventas por hora — hoy</h2>
          {horasConVentas.length > 0 ? (
            <BarChart
              data={horasConVentas}
              maxVal={maxHora}
              labelKey="label"
              valueKey="monto"
              colorClass="bg-blue-500"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <span className="text-3xl mb-2">🕐</span>
              <p className="text-sm">Sin ventas registradas hoy</p>
            </div>
          )}
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top productos */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Top 10 productos — este mes</h2>
          {top && top.length > 0 ? (
            <BarChart
              data={top.map((t) => ({ ...t, label: t.descripcion.slice(0, 18) }))}
              maxVal={maxTop}
              labelKey="label"
              valueKey="cantidadVendida"
              colorClass="bg-indigo-500"
            />
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">Sin ventas este mes</p>
          )}
        </div>

        {/* Últimas ventas */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Últimas ventas</h2>
          <div className="space-y-2">
            {ultimasVentas.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Sin ventas registradas</p>
            ) : ultimasVentas.map((v, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 shrink-0">
                    {TIPO_LABELS[v.tipoCargo] ?? `T${v.tipoCargo}`}
                  </span>
                  <div>
                    <p className="text-sm font-medium">#{v.nroCargo}</p>
                    <p className="text-xs text-gray-400">{v.cajero} · {new Date(v.fechaEm).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <span className="font-semibold text-sm">{fmt(v.monto)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
