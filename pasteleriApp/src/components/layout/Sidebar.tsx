'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard',               label: 'Dashboard' },
  { href: '/dashboard/pedidos',       label: 'Pedidos' },
  { href: '/dashboard/catalogo',      label: 'Catalogo' },
  { href: '/dashboard/insumos',       label: 'Insumos' },
  { href: '/dashboard/clientes',      label: 'Clientes' },
  { href: '/dashboard/configuracion', label: 'Configuracion' },
]

interface SidebarProps {
  shopNombre: string
}

export function Sidebar({ shopNombre }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-52 min-h-screen bg-warm-800 flex flex-col shrink-0">
      <div className="px-4 py-5 border-b border-warm-700">
        <p className="text-warm-50 font-bold text-sm">pasteleriApp</p>
        <p className="text-warm-400 text-xs mt-0.5 truncate">{shopNombre}</p>
      </div>
      <nav className="flex-1 p-2 flex flex-col gap-0.5">
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-warm-700 text-warm-50'
                  : 'text-warm-400 hover:text-warm-100 hover:bg-warm-700'
              }`}>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-2 border-t border-warm-700">
        <button
          type="button"
          className="w-full px-3 py-2 text-left text-sm text-warm-400 hover:text-warm-100 hover:bg-warm-700 rounded-lg transition-colors"
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' })
            window.location.href = '/login'
          }}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
