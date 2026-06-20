import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) redirect('/login')

  let shopNombre = 'Mi pastelería'
  try {
    const payload = verifyToken(token)
    const shop = await prisma.shop.findUnique({ where: { id: payload.shopId }, select: { nombre: true } })
    if (shop) shopNombre = shop.nombre
  } catch {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-warm-50">
      <Sidebar shopNombre={shopNombre} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
