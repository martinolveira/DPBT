import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { OrderForm } from './OrderForm'

export default async function PedidoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: { products: { where: { activo: true }, orderBy: { nombre: 'asc' } } },
  })
  if (!shop) notFound()

  return (
    <div className="min-h-screen bg-warm-50">
      <header className="bg-warm-800 text-white">
        <div className="max-w-2xl mx-auto px-6 py-6 flex items-center gap-3">
          <a href={`/p/${slug}`} className="text-warm-300 hover:text-white text-sm">
            {shop.nombre}
          </a>
          <span className="text-warm-500">/</span>
          <span className="text-sm">Nuevo pedido</span>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <OrderForm slug={slug} products={shop.products.map(p => ({
          id: p.id,
          nombre: p.nombre,
          precio_base: p.precio_base,
          categoria: p.categoria,
        }))} />
      </div>
    </div>
  )
}
