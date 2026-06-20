import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import { listOrders } from '@/services/order.service'
import { KanbanBoard } from '@/components/orders/KanbanBoard'
import { OrdersTable } from '@/components/orders/OrdersTable'

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const sp = await searchParams
  const view = sp.view ?? 'kanban'

  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value!
  const payload = verifyToken(token)
  const orders = await listOrders(payload.shopId)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-warm-800">Pedidos</h1>
        <div className="flex gap-1 bg-warm-100 rounded-lg p-1">
          {[
            { key: 'kanban', label: 'Kanban' },
            { key: 'lista',  label: 'Lista' },
          ].map(v => (
            <a key={v.key} href={`?view=${v.key}`}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === v.key ? 'bg-white text-warm-800 shadow-sm' : 'text-warm-500 hover:text-warm-800'
              }`}>
              {v.label}
            </a>
          ))}
        </div>
      </div>

      {view === 'kanban' ? (
        <KanbanBoard orders={orders} />
      ) : (
        <div className="bg-white border border-warm-200 rounded-xl">
          <OrdersTable orders={orders} />
        </div>
      )}
    </div>
  )
}
