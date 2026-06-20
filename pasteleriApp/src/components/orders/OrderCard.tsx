import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

const ESTADO_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'purple' | 'blue' | 'default' }> = {
  NUEVO:         { label: 'Nuevo',          variant: 'warning' },
  CONFIRMADO:    { label: 'Confirmado',      variant: 'blue' },
  EN_PRODUCCION: { label: 'En produccion',   variant: 'purple' },
  LISTO:         { label: 'Listo',           variant: 'success' },
  ENTREGADO:     { label: 'Entregado',       variant: 'default' },
  CANCELADO:     { label: 'Cancelado',       variant: 'danger' },
}

interface OrderItem {
  cantidad: number
  product: { nombre: string }
}

interface Order {
  id: string
  token: string
  estado: string
  canal: string
  fecha_entrega: string
  total: number
  customer: { nombre: string }
  items: OrderItem[]
}

export function OrderCard({ order }: { order: Order }) {
  const cfg = ESTADO_CONFIG[order.estado] ?? { label: order.estado, variant: 'default' as const }
  return (
    <Link href={`/dashboard/pedidos/${order.id}`}>
      <div className="bg-white border border-warm-200 rounded-lg p-3 hover:border-warm-400 transition-colors cursor-pointer">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant={cfg.variant}>{cfg.label}</Badge>
          {order.canal === 'WHATSAPP' && <Badge variant="default">WA</Badge>}
        </div>
        <p className="text-sm font-medium text-warm-800 truncate">{order.customer.nombre}</p>
        <p className="text-xs text-warm-500 mt-0.5">
          {new Date(order.fecha_entrega).toLocaleDateString('es-AR')}
        </p>
        <p className="text-xs text-warm-500 mt-1 truncate">
          {order.items.map(i => `${i.cantidad}x ${i.product.nombre}`).join(', ')}
        </p>
        <p className="text-sm font-semibold text-warm-800 mt-2">${order.total.toLocaleString('es-AR')}</p>
      </div>
    </Link>
  )
}
