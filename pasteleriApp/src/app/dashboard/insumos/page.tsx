import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import { listIngredients } from '@/services/ingredient.service'
import { Badge } from '@/components/ui/Badge'
import { InsumoActions } from './InsumoActions'

export default async function InsumosPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value!
  const payload = verifyToken(token)
  const ingredients = await listIngredients(payload.shopId)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-warm-800">Insumos</h1>
        <InsumoActions />
      </div>

      <div className="bg-white border border-warm-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-warm-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-warm-500 uppercase tracking-wide">Insumo</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-warm-500 uppercase tracking-wide">Stock actual</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-warm-500 uppercase tracking-wide">Stock minimo</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-warm-500 uppercase tracking-wide">Estado</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map(i => {
              const low = i.stock_actual <= i.stock_minimo
              return (
                <tr key={i.id} className={`border-b border-warm-100 last:border-0 ${low ? 'bg-amber-50' : 'hover:bg-warm-50'}`}>
                  <td className="py-3 px-4 font-medium text-warm-800">{i.nombre}</td>
                  <td className="py-3 px-4 text-center text-warm-700">{i.stock_actual} {i.unidad}</td>
                  <td className="py-3 px-4 text-center text-warm-500">{i.stock_minimo} {i.unidad}</td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant={low ? 'warning' : 'success'}>{low ? 'Stock bajo' : 'OK'}</Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
