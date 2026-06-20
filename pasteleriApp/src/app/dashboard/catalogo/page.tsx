import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import { listProducts } from '@/services/product.service'
import { Badge } from '@/components/ui/Badge'
import { CatalogoActions } from './CatalogoActions'

export default async function CatalogoPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value!
  const payload = verifyToken(token)
  const products = await listProducts(payload.shopId)

  const byCategoria = products.reduce<Record<string, typeof products>>((acc, p) => {
    if (!acc[p.categoria]) acc[p.categoria] = []
    acc[p.categoria].push(p)
    return acc
  }, {})

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-warm-800">Catalogo</h1>
        <CatalogoActions />
      </div>

      {Object.entries(byCategoria).map(([cat, prods]) => (
        <div key={cat} className="mb-8">
          <h2 className="text-sm font-semibold text-warm-500 uppercase tracking-wide mb-3 capitalize">{cat}</h2>
          <div className="bg-white border border-warm-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warm-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-warm-500 uppercase tracking-wide">Producto</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-warm-500 uppercase tracking-wide">Descripcion</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-warm-500 uppercase tracking-wide">Precio base</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-warm-500 uppercase tracking-wide">Estado</th>
                </tr>
              </thead>
              <tbody>
                {prods.map(p => (
                  <tr key={p.id} className="border-b border-warm-100 last:border-0 hover:bg-warm-50">
                    <td className="py-3 px-4 font-medium text-warm-800">{p.nombre}</td>
                    <td className="py-3 px-4 text-warm-500 text-xs">{p.descripcion ?? '—'}</td>
                    <td className="py-3 px-4 text-right font-semibold text-warm-800">${p.precio_base.toLocaleString('es-AR')}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={p.activo ? 'success' : 'default'}>{p.activo ? 'Activo' : 'Inactivo'}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
