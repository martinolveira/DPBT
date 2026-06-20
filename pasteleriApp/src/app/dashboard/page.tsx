import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { getDashboardStats } from '@/services/order.service'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

const ESTADO_BADGE: Record<string, { label: string; variant: 'success' | 'warning' | 'purple' | 'blue' | 'danger' | 'default' }> = {
  NUEVO:         { label: 'Nuevo',          variant: 'warning' },
  CONFIRMADO:    { label: 'Confirmado',      variant: 'blue' },
  EN_PRODUCCION: { label: 'En produccion',   variant: 'purple' },
  LISTO:         { label: 'Listo',           variant: 'success' },
  ENTREGADO:     { label: 'Entregado',       variant: 'default' },
  CANCELADO:     { label: 'Cancelado',       variant: 'danger' },
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value!
  const payload = verifyToken(token)

  const [user, stats] = await Promise.all([
    prisma.user.findUnique({ where: { id: payload.userId }, select: { nombre: true } }),
    getDashboardStats(payload.shopId),
  ])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-warm-800">
            Buen dia, {user?.nombre?.split(' ')[0]}
          </h1>
          <p className="text-warm-500 text-sm mt-0.5">
            {stats.todayDeliveries.length > 0
              ? `${stats.todayDeliveries.length} entrega${stats.todayDeliveries.length > 1 ? 's' : ''} para hoy`
              : 'Sin entregas para hoy'}
          </p>
        </div>
        <Link href="/dashboard/pedidos">
          <Button>Nuevo pedido</Button>
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Pedidos activos" value={stats.activeOrders} />
        <StatCard label="Ingresos del mes" value={`$${stats.monthRevenue.toLocaleString('es-AR')}`} />
        <StatCard label="Entregas hoy" value={stats.todayDeliveries.length} />
        <StatCard
          label="Stock bajo"
          value={stats.lowStock.length}
          sub={stats.lowStock.slice(0, 2).map((i: { nombre: string }) => i.nombre).join(', ')}
          alert={stats.lowStock.length > 0}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-warm-200 rounded-xl p-5">
          <h2 className="font-semibold text-warm-800 mb-4 text-sm">Entregas de hoy</h2>
          {stats.todayDeliveries.length === 0 ? (
            <p className="text-warm-500 text-sm">Sin entregas para hoy.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.todayDeliveries.map((o: any) => {
                const cfg = ESTADO_BADGE[o.estado] ?? { label: o.estado, variant: 'default' as const }
                return (
                  <div key={o.id} className="flex items-center gap-3 p-3 bg-warm-50 rounded-lg">
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-warm-800 font-medium truncate">{o.customer.nombre}</p>
                    </div>
                    <span className="text-sm text-warm-500 shrink-0">${o.total.toLocaleString('es-AR')}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white border border-warm-200 rounded-xl p-5">
          <h2 className="font-semibold text-warm-800 mb-4 text-sm">Sin confirmar</h2>
          {stats.unconfirmed.length === 0 ? (
            <p className="text-warm-500 text-sm">No hay pedidos nuevos pendientes.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.unconfirmed.map((o: any) => (
                <div key={o.id} className="p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-warm-800">{o.customer.nombre}</p>
                      <p className="text-xs text-warm-500 mt-0.5">
                        {new Date(o.fecha_entrega).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-warm-800">${o.total.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="mt-2">
                    <Link href={`/dashboard/pedidos/${o.id}`}>
                      <Button size="sm" variant="secondary">Ver pedido</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
