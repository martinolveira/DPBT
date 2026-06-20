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

export function OrdersTable({ orders }: { orders: any[] }) {
  if (orders.length === 0) {
    return <p className="text-warm-500 text-sm py-8 text-center">No hay pedidos.</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-warm-200">
            <th className="text-left py-3 px-4 text-xs font-semibold text-warm-500 uppercase tracking-wide">Cliente</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-warm-500 uppercase tracking-wide">Estado</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-warm-500 uppercase tracking-wide">Entrega</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-warm-500 uppercase tracking-wide">Canal</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-warm-500 uppercase tracking-wide">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => {
            const cfg = ESTADO_CONFIG[o.estado] ?? { label: o.estado, variant: 'default' as const }
            return (
              <tr key={o.id} className="border-b border-warm-100 hover:bg-warm-50 transition-colors">
                <td className="py-3 px-4">
                  <Link href={`/dashboard/pedidos/${o.id}`} className="font-medium text-warm-800 hover:text-warm-400">
                    {o.customer.nombre}
                  </Link>
                </td>
                <td className="py-3 px-4"><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                <td className="py-3 px-4 text-warm-600">
                  {new Date(o.fecha_entrega).toLocaleDateString('es-AR')}
                </td>
                <td className="py-3 px-4 text-warm-500">{o.canal === 'WHATSAPP' ? 'WhatsApp' : 'Web'}</td>
                <td className="py-3 px-4 text-right font-semibold text-warm-800">
                  ${o.total.toLocaleString('es-AR')}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
