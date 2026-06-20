import { OrderCard } from './OrderCard'

const COLUMNS = [
  { key: 'NUEVO',         label: 'Nuevo' },
  { key: 'CONFIRMADO',    label: 'Confirmado' },
  { key: 'EN_PRODUCCION', label: 'En produccion' },
  { key: 'LISTO',         label: 'Listo' },
]

export function KanbanBoard({ orders }: { orders: any[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map(col => {
        const colOrders = orders.filter(o => o.estado === col.key)
        return (
          <div key={col.key} className="shrink-0 w-64">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-warm-700">{col.label}</h3>
              <span className="text-xs bg-warm-100 text-warm-600 rounded-full px-2 py-0.5 font-medium">
                {colOrders.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {colOrders.map(o => <OrderCard key={o.id} order={o} />)}
              {colOrders.length === 0 && (
                <div className="border-2 border-dashed border-warm-200 rounded-lg p-4 text-center text-xs text-warm-400">
                  Sin pedidos
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
