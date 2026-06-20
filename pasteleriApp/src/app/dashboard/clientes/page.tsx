import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export default async function ClientesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value!
  const payload = verifyToken(token)

  const customers = await prisma.customer.findMany({
    where: { orders: { some: { shop_id: payload.shopId } } },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-warm-800 mb-6">Clientes</h1>
      <div className="bg-white border border-warm-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-warm-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-warm-500 uppercase tracking-wide">Nombre</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-warm-500 uppercase tracking-wide">Contacto</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-warm-500 uppercase tracking-wide">Pedidos</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-warm-500">Sin clientes todavia.</td>
              </tr>
            )}
            {customers.map(c => (
              <tr key={c.id} className="border-b border-warm-100 last:border-0 hover:bg-warm-50">
                <td className="py-3 px-4 font-medium text-warm-800">{c.nombre}</td>
                <td className="py-3 px-4 text-warm-500">{c.email ?? c.telefono ?? c.whatsapp ?? '—'}</td>
                <td className="py-3 px-4 text-center font-semibold text-warm-700">{c._count.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
