import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { ConfigForm } from './ConfigForm'

export default async function ConfiguracionPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value!
  const payload = verifyToken(token)
  const shop = await prisma.shop.findUnique({ where: { id: payload.shopId } })
  if (!shop) return null

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold text-warm-800 mb-6">Configuracion</h1>
      <ConfigForm shop={{ nombre: shop.nombre, slug: shop.slug, capacidad_diaria: shop.capacidad_diaria }} />
    </div>
  )
}
