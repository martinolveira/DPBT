import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function PortalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: { products: { where: { activo: true }, orderBy: { categoria: 'asc' } } },
  })
  if (!shop) notFound()

  const byCategoria = shop.products.reduce<Record<string, typeof shop.products>>((acc, p) => {
    if (!acc[p.categoria]) acc[p.categoria] = []
    acc[p.categoria].push(p)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-warm-50">
      <header className="bg-warm-800 text-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold">{shop.nombre}</h1>
          <p className="text-warm-300 mt-1 text-sm">Pedidos artesanales</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-warm-800">Nuestros productos</h2>
          <Link
            href={`/p/${slug}/pedido`}
            className="px-5 py-2.5 bg-warm-400 text-white rounded-lg font-semibold hover:bg-warm-500 text-sm"
          >
            Hacer un pedido
          </Link>
        </div>

        {Object.entries(byCategoria).map(([cat, prods]) => (
          <div key={cat} className="mb-8">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-warm-500 mb-3 capitalize">{cat}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {prods.map(p => (
                <div key={p.id} className="bg-white border border-warm-200 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-warm-800">{p.nombre}</p>
                      {p.descripcion && <p className="text-sm text-warm-500 mt-1">{p.descripcion}</p>}
                    </div>
                    <p className="text-warm-800 font-bold ml-4 shrink-0">${p.precio_base.toLocaleString('es-AR')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-10 text-center">
          <Link
            href={`/p/${slug}/pedido`}
            className="inline-block px-8 py-3 bg-warm-400 text-white rounded-lg font-semibold hover:bg-warm-500"
          >
            Hacer un pedido
          </Link>
        </div>
      </div>
    </div>
  )
}
