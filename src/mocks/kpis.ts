import { DailyKPIs } from '../types'

export const mockKPIs: DailyKPIs = {
  totalVentas: 1234500,
  totalTransacciones: 42,
  ticketPromedio: 29393,
  balanzasActivas: 3,
  balanzasTotal: 4,
  lastUpdatedAt: new Date().toISOString(),
  ventasTrend: {
    percentage: 12,
    direction: 'up',
    vsLabel: 'vs. ayer a esta hora'
  },
  transaccionesTrend: {
    percentage: 8,
    direction: 'up',
    vsLabel: 'vs. ayer a esta hora'
  },
  ticketTrend: {
    percentage: -3,
    direction: 'down',
    vsLabel: 'vs. ayer a esta hora'
  }
}

export const mockHourlySales = [
  { hour: 8, label: '08:00', ventas: 120000, transacciones: 5 },
  { hour: 9, label: '09:00', ventas: 185000, transacciones: 8 },
  { hour: 10, label: '10:00', ventas: 245000, transacciones: 11 },
  { hour: 11, label: '11:00', ventas: 198000, transacciones: 9 },
  { hour: 12, label: '12:00', ventas: 155000, transacciones: 6 },
  { hour: 13, label: '13:00', ventas: 132000, transacciones: 3 }
]

export const mockTopProducts = [
  {
    productId: 'POL-001',
    productName: 'Pollo (filete)',
    category: 'carnes',
    totalSold: 182,
    totalRevenue: 125000,
    transactionCount: 28
  },
  {
    productId: 'CAR-002',
    productName: 'Carne (costilla)',
    category: 'carnes',
    totalSold: 142,
    totalRevenue: 89500,
    transactionCount: 24
  },
  {
    productId: 'PAT-001',
    productName: 'Pastel (queque)',
    category: 'panaderia',
    totalSold: 155,
    totalRevenue: 65200,
    transactionCount: 15
  },
  {
    productId: 'VER-001',
    productName: 'Lechuga',
    category: 'verduras',
    totalSold: 58,
    totalRevenue: 34800,
    transactionCount: 12
  },
  {
    productId: 'FRU-001',
    productName: 'Plátano',
    category: 'frutas',
    totalSold: 48,
    totalRevenue: 28500,
    transactionCount: 10
  }
]

export const mockStationSales = [
  {
    stationId: 1,
    stationName: 'Balanza 1',
    ventas: 48000,
    transacciones: 12,
    ticketPromedio: 4000
  },
  {
    stationId: 2,
    stationName: 'Balanza 2',
    ventas: 42000,
    transacciones: 10,
    ticketPromedio: 4200
  },
  {
    stationId: 3,
    stationName: 'Balanza 3',
    ventas: 0,
    transacciones: 0,
    ticketPromedio: 0
  },
  {
    stationId: 4,
    stationName: 'Balanza 4',
    ventas: 52000,
    transacciones: 14,
    ticketPromedio: 3714
  },
  {
    stationId: 5,
    stationName: 'Caja',
    ventas: 125000,
    transacciones: 30,
    ticketPromedio: 4167
  }
]

export const mockAlerts = [
  {
    productId: 'POL-001',
    productName: 'Pollo (filete)',
    currentStock: 2.5,
    minStock: 10,
    stockStatus: 'critical' as const,
    triggeredAt: new Date().toISOString(),
    acknowledged: false
  },
  {
    productId: 'CAR-002',
    productName: 'Carne (costilla)',
    currentStock: 4,
    minStock: 8,
    stockStatus: 'low' as const,
    triggeredAt: new Date().toISOString(),
    acknowledged: false
  },
  {
    productId: 'PAT-001',
    productName: 'Pastel (queque)',
    currentStock: 3,
    minStock: 5,
    stockStatus: 'low' as const,
    triggeredAt: new Date().toISOString(),
    acknowledged: false
  },
  {
    productId: 'LAC-001',
    productName: 'Queso fresco',
    currentStock: 4.5,
    minStock: 6,
    stockStatus: 'low' as const,
    triggeredAt: new Date().toISOString(),
    acknowledged: false
  }
]
