import { create } from 'zustand'

export interface ItemTransaccion {
  nroItem: number
  codArt: number
  descripcion: string
  cantidad: number
  precioUnitario: number
  totalPlu: number
  simbolo: string
}

interface TransaccionState {
  idTransaccion: string | null
  items: ItemTransaccion[]
  monto: number
  qrBase64: string | null
  setTransaccion: (id: string) => void
  agregarItem: (item: ItemTransaccion) => void
  actualizarMonto: (monto: number) => void
  setQr: (qr: string, items: ItemTransaccion[], monto: number) => void
  reset: () => void
}

export const useTransaccionStore = create<TransaccionState>((set) => ({
  idTransaccion: null,
  items: [],
  monto: 0,
  qrBase64: null,
  setTransaccion: (id) => set({ idTransaccion: id, items: [], monto: 0, qrBase64: null }),
  agregarItem: (item) =>
    set((s) => ({
      items: s.items.some((i) => i.codArt === item.codArt)
        ? s.items.map((i) => i.codArt === item.codArt ? { ...i, cantidad: i.cantidad + item.cantidad, totalPlu: i.totalPlu + item.totalPlu } : i)
        : [...s.items, item],
    })),
  actualizarMonto: (monto) => set({ monto }),
  setQr: (qrBase64, items, monto) => set({ qrBase64, items, monto }),
  reset: () => set({ idTransaccion: null, items: [], monto: 0, qrBase64: null }),
}))
