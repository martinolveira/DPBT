import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { EstadoActions } from './EstadoActions'

const ESTADO_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'purple' | 'blue' | 'default' }> = {
  NUEVO:         { label: 'Nuevo',          variant: 'warning' },
  CONFIRMADO:    { label: 'Confirmado',      variant: 'blue' },
  EN_PRODUCCION: { label: 'En produccion',   variant: 'purple' },
  LISTO:         { label: 'Listo',           variant: 'success' },
  ENTREGADO:     { label: 'Entregado',       variant: 'default' },
  CANCELADO:     { label: 'Cancelado',       variant: 'danger' },
}

const NEXT_STATES: Record<string, string[]> = {
  NUEVO:         ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO:    ['EN_PRODUCCION', 'CANCELADO'],
  EN_PRODUCCION: ['LISTO', 'CANCELADO'],
  LISTO:         ['ENTREGADO'],
  ENTREGADO:     [],
  CANCELADO:     [],
}

const ESTADO_LABELS: Record<string, string> = {
  CONFIRMADO:    'Confirmar',
  EN_PRODUCCION: 'Iniciar produccion',
  LISTO:         'Marcar listo',
  ENTREGADO:     'Marcar entregado',
  CANCELADO:     'Cancelar',
}

export default async function PedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value!
  const payload = verifyToken(token)

  const order = await prisma.order.findUnique({
    where: { id, shop_id: payload.shopId },
    include: {
      customer: true,
      items: { include: { product: true } },
      payment: true,
    },
  })
  if (!order) notFound()

  const cfg = ESTADO_CONFIG[order.estado] ?? { label: order.estado, variant: 'default' as const }
  const nextStates = NEXT_STATES[order.estado] ?? []

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <a href="/dashboard/pedidos" className="text-warm-500 hover:text-warm-800 text-sm">Pedidos</a>
        <span className="text-warm-300">/</span>
        <span className="text-sm text-warm-700">{order.customer.nombre}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-warm-800">{order.customer.nombre}</h1>
          <p className="text-warm-500 text-sm mt-1">
            Entrega: {new Date(order.fecha_entrega).toLocaleDateString('es-AR')}
          </p>
        </div>
        <Badge variant={cfg.variant}>{cfg.label}</Badge>
      </div>

      <div className="bg-white border border-warm-200 rounded-xl p-5 mb-4">
        <h2 className="font-semibold text-warm-800 mb-3 text-sm">Productos</h2>
        <table className="w-full text-sm">
          <tbody>
            {order.items.map(item => (
              <tr key={item.id} className="border-b border-warm-100 last:border-0">
                <td className="py-2 text-warm-700">{item.product.nombre}</td>
                <td className="py-2 text-center text-warm-500">x{item.cantidad}</td>
                <td className="py-2 text-right font-medium text-warm-800">
                  ${(item.precio_unitario * item.cantidad).toLocaleString('es-AR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center pt-3 mt-1 border-t border-warm-200">
          <span className="font-semibold text-warm-800">Total</span>
          <span className="font-bold text-warm-800 text-lg">${order.total.toLocaleString('es-AR')}</span>
        </div>
      </div>

      {order.notas_cliente && (
        <div className="bg-warm-50 border border-warm-200 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-warm-500 uppercase mb-1">Notas del cliente</p>
          <p className="text-sm text-warm-700">{order.notas_cliente}</p>
        </div>
      )}

      {nextStates.length > 0 && (
        <EstadoActions orderId={order.id} nextStates={nextStates} estadoLabels={ESTADO_LABELS} />
      )}
    </div>
  )
}
