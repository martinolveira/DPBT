import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-warm-50">
      <header className="border-b border-warm-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-warm-800 text-lg">pasteleriApp</span>
          <div className="flex gap-3">
            <Link href="/login" className="px-4 py-2 text-sm text-warm-500 hover:text-warm-800 font-medium">
              Iniciar sesión
            </Link>
            <Link href="/registro" className="px-4 py-2 text-sm bg-warm-400 text-white rounded-lg hover:bg-warm-500 font-semibold">
              Registrarse gratis
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-bold text-warm-800 mb-6 leading-tight">
          Gestioná tu pastelería<br />sin el caos
        </h1>
        <p className="text-xl text-warm-500 mb-10 max-w-2xl mx-auto">
          Pedidos, stock, clientes y entregas en un solo lugar.
          Tus clientes hacen pedidos online y vos los confirmás desde el panel.
        </p>
        <Link href="/registro" className="inline-block px-8 py-4 bg-warm-400 text-white rounded-lg text-lg font-semibold hover:bg-warm-500">
          Empezar ahora
        </Link>

        <div className="mt-24 grid grid-cols-3 gap-8 text-left">
          {[
            { title: 'Pedidos en tiempo real', desc: 'Tus clientes siguen el estado de su pedido sin tener que preguntarte.' },
            { title: 'Stock bajo, alerta automática', desc: 'El panel te avisa cuando un ingrediente está por agotarse.' },
            { title: 'Panel completo', desc: 'Kanban de pedidos, catálogo, clientes e insumos en un solo lugar.' },
          ].map(f => (
            <div key={f.title} className="bg-white border border-warm-200 rounded-xl p-6">
              <h3 className="font-semibold text-warm-800 mb-2">{f.title}</h3>
              <p className="text-warm-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
