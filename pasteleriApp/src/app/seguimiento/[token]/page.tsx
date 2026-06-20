import { getOrderByToken } from '@/services/order.service'
import { notFound } from 'next/navigation'
import { TrackingClient } from './TrackingClient'

const ESTADOS = ['NUEVO', 'CONFIRMADO', 'EN_PRODUCCION', 'LISTO', 'ENTREGADO']

const ESTADO_LABELS: Record<string, string> = {
  NUEVO:         'Pedido recibido',
  CONFIRMADO:    'Pedido confirmado',
  EN_PRODUCCION: 'En produccion',
  LISTO:         'Listo para retirar',
  ENTREGADO:     'Entregado',
  CANCELADO:     'Cancelado',
}

export default async function SeguimientoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const order = await getOrderByToken(token)
  if (!order || order.estado === 'CANCELADO') notFound()

  const currentIndex = ESTADOS.indexOf(order.estado)

  return (
    <div className="min-h-screen bg-warm-50">
      <header className="bg-warm-800 text-white">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <p className="text-warm-300 text-sm">Tu pedido</p>
          <h1 className="text-xl font-bold mt-0.5">{order.customer.nombre}</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white border border-warm-200 rounded-xl p-6 mb-6">
          <p className="text-xs font-semibold text-warm-500 uppercase tracking-wide mb-1">Estado actual</p>
          <p className="text-2xl font-bold text-warm-800">{ESTADO_LABELS[order.estado] ?? order.estado}</p>
          <p className="text-warm-500 text-sm mt-1">
            Entrega:{' '}
            {new Date(order.fecha_entrega).toLocaleDateString('es-AR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
        </div>

        <div className="bg-white border border-warm-200 rounded-xl p-6 mb-6">
          <div className="flex flex-col gap-3">
            {ESTADOS.map((e, i) => {
              const done = i < currentIndex
              const active = i === currentIndex
              return (
                <div key={e} className={`flex items-center gap-3 ${done || active ? 'opacity-100' : 'opacity-30'}`}>
                  <div
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      active ? 'bg-warm-400 ring-4 ring-warm-200' : done ? 'bg-warm-400' : 'bg-warm-200'
                    }`}
                  />
                  <span className={`text-sm ${active ? 'font-semibold text-warm-800' : 'text-warm-600'}`}>
                    {ESTADO_LABELS[e]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white border border-warm-200 rounded-xl p-5">
          <h2 className="font-semibold text-warm-800 mb-3 text-sm">Resumen del pedido</h2>
          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm py-1.5 border-b border-warm-100 last:border-0">
              <span className="text-warm-700">
                {item.product.nombre} <span className="text-warm-400">x{item.cantidad}</span>
              </span>
              <span className="font-medium text-warm-800">
                ${(item.precio_unitario * item.cantidad).toLocaleString('es-AR')}
              </span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-warm-800 mt-3 pt-2 border-t border-warm-200">
            <span>Total</span>
            <span>${order.total.toLocaleString('es-AR')}</span>
          </div>
        </div>

        <TrackingClient token={token} initialEstado={order.estado} estadoLabels={ESTADO_LABELS} />
      </div>
    </div>
  )
}
