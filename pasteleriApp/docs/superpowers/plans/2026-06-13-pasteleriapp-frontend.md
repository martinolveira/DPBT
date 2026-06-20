# pasteleriApp — Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build all frontend screens for pasteleriApp — owner dashboard, client portal, auth pages, and real-time order tracking.

**Architecture:** Next.js 16 App Router, TypeScript, Tailwind CSS v4. No tests required for frontend. No emojis in UI. Warm artisan color palette (CSS custom properties in globals.css via `@theme`). Server Components by default; use `'use client'` only where interactivity is needed.

**Important constraints:**
- Do NOT make git commits
- No emojis anywhere in the UI (buttons, labels, titles, badges — none)
- No tests
- Node v20 required: prefix all commands with `source ~/.nvm/nvm.sh && nvm use 20 &&`
- Working directory: `/Users/lumpierrez/pasteleriApp/pasteleriapp`
- `middleware.ts` must be renamed to `proxy.ts` (Next.js 16 breaking change)

**Color palette (Tailwind v4 — use `warm-*` classes):**
- `warm-50` `#fdf6ec` — page background
- `warm-200` `#e8d5b7` — borders
- `warm-400` `#c2855a` — accent/buttons
- `warm-700` `#5c3a1e` — sidebar background
- `warm-800` `#3d2010` — sidebar dark / main text
- `warm-500` `#a0522d` — secondary text

**Auth cookies:** The `token` httpOnly cookie is set by `/api/auth/login`. Read auth state client-side via `GET /api/auth/me`.

---

## File Structure

```
src/
├── proxy.ts                          # renamed from middleware.ts
├── app/
│   ├── globals.css                   # already has @theme warm colors
│   ├── layout.tsx                    # root layout, Inter font
│   ├── page.tsx                      # marketing landing
│   ├── login/
│   │   └── page.tsx
│   ├── registro/
│   │   └── page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx                # sidebar + auth guard
│   │   ├── page.tsx                  # KPIs
│   │   ├── pedidos/
│   │   │   ├── page.tsx              # Kanban + Lista tabs
│   │   │   └── [id]/page.tsx         # order detail
│   │   ├── catalogo/page.tsx
│   │   ├── insumos/page.tsx
│   │   ├── clientes/page.tsx
│   │   └── configuracion/page.tsx
│   ├── p/
│   │   └── [slug]/
│   │       ├── page.tsx              # public portal
│   │       └── pedido/
│   │           ├── page.tsx          # order form
│   │           └── confirmacion/page.tsx
│   └── seguimiento/
│       └── [token]/page.tsx          # real-time tracking
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   └── StatCard.tsx
│   └── layout/
│       └── Sidebar.tsx
└── hooks/
    ├── useAuth.ts
    └── useSocket.ts
```

---

### Task 1: Foundation — proxy.ts, root layout, landing page, auth pages

**Files:**
- Rename: `src/middleware.ts` → `src/proxy.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/app/login/page.tsx`
- Create: `src/app/registro/page.tsx`
- Create: `src/components/ui/Button.tsx`

- [ ] **Step 1: Rename middleware.ts to proxy.ts**

```bash
mv src/middleware.ts src/proxy.ts
```

Update the file content — same logic, same export, just different filename. The `config` export with `matcher` stays identical.

- [ ] **Step 2: Update `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'pasteleriApp',
  description: 'Gestión de pedidos para pastelerías artesanales',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-warm-50 text-warm-800`}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Create `src/components/ui/Button.tsx`**

```tsx
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm' }
  const variants = {
    primary: 'bg-warm-400 text-white hover:bg-warm-500',
    secondary: 'bg-warm-100 text-warm-800 hover:bg-warm-200 border border-warm-200',
    ghost: 'text-warm-500 hover:text-warm-800 hover:bg-warm-100',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
```

- [ ] **Step 4: Create `src/app/page.tsx`** (marketing landing)

```tsx
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
            { title: 'Pedidos por WhatsApp', desc: 'Un bot toma el pedido y lo registra directamente en tu panel.' },
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
```

- [ ] **Step 5: Create `src/app/login/page.tsx`**

```tsx
'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Error al iniciar sesión'); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-warm-800">pasteleriApp</h1>
          <p className="text-warm-500 mt-1 text-sm">Ingresá a tu panel</p>
        </div>
        <div className="bg-white border border-warm-200 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">Email</label>
              <input name="email" type="email" required
                className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400 bg-warm-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">Contraseña</label>
              <input name="password" type="password" required
                className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400 bg-warm-50" />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </div>
        <p className="text-center text-sm text-warm-500 mt-4">
          ¿No tenés cuenta?{' '}
          <Link href="/registro" className="text-warm-400 font-medium hover:underline">Registrate</Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create `src/app/registro/page.tsx`**

```tsx
'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function RegistroPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shopNombre: form.get('shopNombre'),
        slug: (form.get('shopNombre') as string).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        email: form.get('email'),
        password: form.get('password'),
        nombre: form.get('nombre'),
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Error al registrarse'); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-warm-800">pasteleriApp</h1>
          <p className="text-warm-500 mt-1 text-sm">Creá tu pastelería</p>
        </div>
        <div className="bg-white border border-warm-200 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">Nombre de la pastelería</label>
              <input name="shopNombre" type="text" required
                className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400 bg-warm-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">Tu nombre</label>
              <input name="nombre" type="text" required
                className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400 bg-warm-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">Email</label>
              <input name="email" type="email" required
                className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400 bg-warm-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">Contraseña</label>
              <input name="password" type="password" required minLength={6}
                className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400 bg-warm-50" />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </form>
        </div>
        <p className="text-center text-sm text-warm-500 mt-4">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-warm-400 font-medium hover:underline">Ingresar</Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Verify pages compile and are accessible**

Restart the dev server (if needed) and confirm:
- `http://localhost:3000` — landing page loads
- `http://localhost:3000/login` — login form loads
- `http://localhost:3000/registro` — registro form loads
- Login with `maria@ladulce.com` / `password123` redirects to `/dashboard` (which will 404 until Task 2)

---

### Task 2: Dashboard layout + Sidebar + KPI page

**Files:**
- Create: `src/components/ui/Badge.tsx`
- Create: `src/components/ui/StatCard.tsx`
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/app/dashboard/layout.tsx`
- Create: `src/app/dashboard/page.tsx`

- [ ] **Step 1: Create `src/components/ui/Badge.tsx`**

```tsx
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'purple' | 'blue'
  children: React.ReactNode
}

const variants = {
  default:  'bg-warm-100 text-warm-700',
  success:  'bg-green-100 text-green-800',
  warning:  'bg-amber-100 text-amber-800',
  danger:   'bg-red-100 text-red-700',
  purple:   'bg-purple-100 text-purple-800',
  blue:     'bg-blue-100 text-blue-800',
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  )
}
```

- [ ] **Step 2: Create `src/components/ui/StatCard.tsx`**

```tsx
interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  alert?: boolean
}

export function StatCard({ label, value, sub, alert = false }: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl p-5 border ${alert ? 'border-amber-200 bg-amber-50' : 'border-warm-200'}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-warm-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-warm-800">{value}</p>
      {sub && <p className="text-xs text-warm-500 mt-1">{sub}</p>}
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/layout/Sidebar.tsx`**

```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard',            label: 'Dashboard' },
  { href: '/dashboard/pedidos',    label: 'Pedidos' },
  { href: '/dashboard/catalogo',   label: 'Catalogo' },
  { href: '/dashboard/insumos',    label: 'Insumos' },
  { href: '/dashboard/clientes',   label: 'Clientes' },
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
        <form action="/api/auth/logout" method="POST">
          <button type="submit"
            className="w-full px-3 py-2 text-left text-sm text-warm-400 hover:text-warm-100 hover:bg-warm-700 rounded-lg transition-colors"
            onClick={async (e) => {
              e.preventDefault()
              await fetch('/api/auth/logout', { method: 'POST' })
              window.location.href = '/login'
            }}>
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  )
}
```

- [ ] **Step 4: Create `src/app/dashboard/layout.tsx`**

```tsx
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
```

- [ ] **Step 5: Create `src/app/dashboard/page.tsx`**

```tsx
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { getDashboardStats } from '@/services/order.service'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

function estadoBadge(estado: string) {
  const map: Record<string, 'success' | 'warning' | 'purple' | 'blue' | 'danger' | 'default'> = {
    NUEVO: 'warning', CONFIRMADO: 'blue', EN_PRODUCCION: 'purple',
    LISTO: 'success', ENTREGADO: 'default', CANCELADO: 'danger',
  }
  const labels: Record<string, string> = {
    NUEVO: 'Nuevo', CONFIRMADO: 'Confirmado', EN_PRODUCCION: 'En produccion',
    LISTO: 'Listo', ENTREGADO: 'Entregado', CANCELADO: 'Cancelado',
  }
  return <Badge variant={map[estado] ?? 'default'}>{labels[estado] ?? estado}</Badge>
}

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value!
  const payload = verifyToken(token)

  const [user, stats] = await Promise.all([
    prisma.user.findUnique({ where: { id: payload.userId }, select: { nombre: true } }),
    getDashboardStats(payload.shopId),
  ])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-warm-800">Buen dia, {user?.nombre?.split(' ')[0]}</h1>
          <p className="text-warm-500 text-sm mt-0.5">
            {stats.todayDeliveries.length > 0
              ? `${stats.todayDeliveries.length} entrega${stats.todayDeliveries.length > 1 ? 's' : ''} para hoy`
              : 'Sin entregas para hoy'}
          </p>
        </div>
        <Link href="/dashboard/pedidos">
          <Button>Nuevo pedido</Button>
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Pedidos activos" value={stats.activeOrders} />
        <StatCard label="Ingresos del mes" value={`$${stats.monthRevenue.toLocaleString('es-AR')}`} />
        <StatCard label="Entregas hoy" value={stats.todayDeliveries.length} />
        <StatCard
          label="Stock bajo"
          value={stats.lowStock.length}
          sub={stats.lowStock.slice(0, 2).map(i => i.nombre).join(', ')}
          alert={stats.lowStock.length > 0}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border border-warm-200 rounded-xl p-5">
          <h2 className="font-semibold text-warm-800 mb-4 text-sm">Entregas de hoy</h2>
          {stats.todayDeliveries.length === 0 ? (
            <p className="text-warm-500 text-sm">Sin entregas para hoy.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.todayDeliveries.map((o: any) => (
                <div key={o.id} className="flex items-center gap-3 p-3 bg-warm-50 rounded-lg">
                  {estadoBadge(o.estado)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-warm-800 font-medium truncate">{o.customer.nombre}</p>
                  </div>
                  <span className="text-sm text-warm-500 shrink-0">${o.total.toLocaleString('es-AR')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-warm-200 rounded-xl p-5">
          <h2 className="font-semibold text-warm-800 mb-4 text-sm">Sin confirmar</h2>
          {stats.unconfirmed.length === 0 ? (
            <p className="text-warm-500 text-sm">No hay pedidos nuevos pendientes.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.unconfirmed.map((o: any) => (
                <div key={o.id} className="p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-warm-800">{o.customer.nombre}</p>
                      <p className="text-xs text-warm-500 mt-0.5">
                        {new Date(o.fecha_entrega).toLocaleDateString('es-AR')} · {o.canal === 'WHATSAPP' ? 'WhatsApp' : 'Web'}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-warm-800">${o.total.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <ConfirmButton orderId={o.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ConfirmButton({ orderId }: { orderId: string }) {
  return (
    <Link href={`/dashboard/pedidos/${orderId}`}>
      <Button size="sm" variant="secondary">Ver pedido</Button>
    </Link>
  )
}
```

- [ ] **Step 6: Verify dashboard loads**

With the dev server running, log in at `http://localhost:3000/login` with `maria@ladulce.com` / `password123` and confirm the dashboard renders with the KPI cards.

---

### Task 3: Pedidos page (Kanban + Lista tabs)

**Files:**
- Create: `src/app/dashboard/pedidos/page.tsx`
- Create: `src/app/dashboard/pedidos/[id]/page.tsx`
- Create: `src/components/orders/OrderCard.tsx`
- Create: `src/components/orders/KanbanBoard.tsx`
- Create: `src/components/orders/OrdersTable.tsx`

- [ ] **Step 1: Create `src/components/orders/OrderCard.tsx`**

```tsx
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

const ESTADO_CONFIG: Record<string, { label: string; variant: any }> = {
  NUEVO:         { label: 'Nuevo',          variant: 'warning' },
  CONFIRMADO:    { label: 'Confirmado',      variant: 'blue' },
  EN_PRODUCCION: { label: 'En produccion',   variant: 'purple' },
  LISTO:         { label: 'Listo',           variant: 'success' },
  ENTREGADO:     { label: 'Entregado',       variant: 'default' },
  CANCELADO:     { label: 'Cancelado',       variant: 'danger' },
}

interface Order {
  id: string
  token: string
  estado: string
  canal: string
  fecha_entrega: string
  total: number
  customer: { nombre: string }
  items: { cantidad: number; product: { nombre: string } }[]
}

export function OrderCard({ order }: { order: Order }) {
  const cfg = ESTADO_CONFIG[order.estado] ?? { label: order.estado, variant: 'default' }
  return (
    <Link href={`/dashboard/pedidos/${order.id}`}>
      <div className="bg-white border border-warm-200 rounded-lg p-3 hover:border-warm-400 transition-colors cursor-pointer">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant={cfg.variant}>{cfg.label}</Badge>
          {order.canal === 'WHATSAPP' && <Badge variant="default">WA</Badge>}
        </div>
        <p className="text-sm font-medium text-warm-800 truncate">{order.customer.nombre}</p>
        <p className="text-xs text-warm-500 mt-0.5">
          {new Date(order.fecha_entrega).toLocaleDateString('es-AR')}
        </p>
        <p className="text-xs text-warm-500 mt-1 truncate">
          {order.items.map(i => `${i.cantidad}x ${i.product.nombre}`).join(', ')}
        </p>
        <p className="text-sm font-semibold text-warm-800 mt-2">${order.total.toLocaleString('es-AR')}</p>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Create `src/components/orders/KanbanBoard.tsx`**

```tsx
import { OrderCard } from './OrderCard'

const COLUMNS = [
  { key: 'NUEVO',         label: 'Nuevo' },
  { key: 'CONFIRMADO',    label: 'Confirmado' },
  { key: 'EN_PRODUCCION', label: 'En produccion' },
  { key: 'LISTO',         label: 'Listo' },
]

export function KanbanBoard({ orders }: { orders: any[] }) {
  const byEstado = (estado: string) => orders.filter(o => o.estado === estado)

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map(col => (
        <div key={col.key} className="shrink-0 w-64">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-warm-700">{col.label}</h3>
            <span className="text-xs bg-warm-100 text-warm-600 rounded-full px-2 py-0.5 font-medium">
              {byEstado(col.key).length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {byEstado(col.key).map(o => <OrderCard key={o.id} order={o} />)}
            {byEstado(col.key).length === 0 && (
              <div className="border-2 border-dashed border-warm-200 rounded-lg p-4 text-center text-xs text-warm-400">
                Sin pedidos
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/orders/OrdersTable.tsx`**

```tsx
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

const ESTADO_CONFIG: Record<string, { label: string; variant: any }> = {
  NUEVO:         { label: 'Nuevo',          variant: 'warning' },
  CONFIRMADO:    { label: 'Confirmado',      variant: 'blue' },
  EN_PRODUCCION: { label: 'En produccion',   variant: 'purple' },
  LISTO:         { label: 'Listo',           variant: 'success' },
  ENTREGADO:     { label: 'Entregado',       variant: 'default' },
  CANCELADO:     { label: 'Cancelado',       variant: 'danger' },
}

export function OrdersTable({ orders }: { orders: any[] }) {
  if (orders.length === 0) {
    return <p className="text-warm-500 text-sm py-8 text-center">No hay pedidos.</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-warm-200">
            <th className="text-left py-3 px-4 text-xs font-semibold text-warm-500 uppercase tracking-wide">Cliente</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-warm-500 uppercase tracking-wide">Estado</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-warm-500 uppercase tracking-wide">Entrega</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-warm-500 uppercase tracking-wide">Canal</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-warm-500 uppercase tracking-wide">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => {
            const cfg = ESTADO_CONFIG[o.estado] ?? { label: o.estado, variant: 'default' }
            return (
              <tr key={o.id} className="border-b border-warm-100 hover:bg-warm-50 transition-colors">
                <td className="py-3 px-4">
                  <Link href={`/dashboard/pedidos/${o.id}`} className="font-medium text-warm-800 hover:text-warm-400">
                    {o.customer.nombre}
                  </Link>
                </td>
                <td className="py-3 px-4"><Badge variant={cfg.variant}>{cfg.label}</Badge></td>
                <td className="py-3 px-4 text-warm-600">
                  {new Date(o.fecha_entrega).toLocaleDateString('es-AR')}
                </td>
                <td className="py-3 px-4 text-warm-500">{o.canal === 'WHATSAPP' ? 'WhatsApp' : 'Web'}</td>
                <td className="py-3 px-4 text-right font-semibold text-warm-800">
                  ${o.total.toLocaleString('es-AR')}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/app/dashboard/pedidos/page.tsx`**

```tsx
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import { listOrders } from '@/services/order.service'
import { KanbanBoard } from '@/components/orders/KanbanBoard'
import { OrdersTable } from '@/components/orders/OrdersTable'

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const sp = await searchParams
  const view = sp.view ?? 'kanban'

  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value!
  const payload = verifyToken(token)
  const orders = await listOrders(payload.shopId)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-warm-800">Pedidos</h1>
        <div className="flex gap-1 bg-warm-100 rounded-lg p-1">
          {[
            { key: 'kanban', label: 'Kanban' },
            { key: 'lista',  label: 'Lista' },
          ].map(v => (
            <a key={v.key} href={`?view=${v.key}`}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === v.key ? 'bg-white text-warm-800 shadow-sm' : 'text-warm-500 hover:text-warm-800'
              }`}>
              {v.label}
            </a>
          ))}
        </div>
      </div>

      {view === 'kanban' ? (
        <KanbanBoard orders={orders} />
      ) : (
        <div className="bg-white border border-warm-200 rounded-xl">
          <OrdersTable orders={orders} />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Create `src/app/dashboard/pedidos/[id]/page.tsx`**

```tsx
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { EstadoActions } from './EstadoActions'

const ESTADO_CONFIG: Record<string, { label: string; variant: any }> = {
  NUEVO:         { label: 'Nuevo',          variant: 'warning' },
  CONFIRMADO:    { label: 'Confirmado',      variant: 'blue' },
  EN_PRODUCCION: { label: 'En produccion',   variant: 'purple' },
  LISTO:         { label: 'Listo',           variant: 'success' },
  ENTREGADO:     { label: 'Entregado',       variant: 'default' },
  CANCELADO:     { label: 'Cancelado',       variant: 'danger' },
}

const NEXT_STATES: Record<string, string[]> = {
  NUEVO:         ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO:    ['EN_PRODUCCION', 'CANCELADO'],
  EN_PRODUCCION: ['LISTO', 'CANCELADO'],
  LISTO:         ['ENTREGADO'],
  ENTREGADO:     [],
  CANCELADO:     [],
}

const ESTADO_LABELS: Record<string, string> = {
  CONFIRMADO: 'Confirmar', EN_PRODUCCION: 'Iniciar produccion',
  LISTO: 'Marcar listo', ENTREGADO: 'Marcar entregado', CANCELADO: 'Cancelar',
}

export default async function PedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value!
  const payload = verifyToken(token)

  const order = await prisma.order.findUnique({
    where: { id, shop_id: payload.shopId },
    include: { customer: true, items: { include: { product: true } }, payment: true },
  })
  if (!order) notFound()

  const cfg = ESTADO_CONFIG[order.estado] ?? { label: order.estado, variant: 'default' }
  const nextStates = NEXT_STATES[order.estado] ?? []

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <a href="/dashboard/pedidos" className="text-warm-500 hover:text-warm-800 text-sm">Pedidos</a>
        <span className="text-warm-300">/</span>
        <span className="text-sm text-warm-700">{order.customer.nombre}</span>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-warm-800">{order.customer.nombre}</h1>
          <p className="text-warm-500 text-sm mt-1">
            Entrega: {new Date(order.fecha_entrega).toLocaleDateString('es-AR')} ·
            Canal: {order.canal === 'WHATSAPP' ? 'WhatsApp' : 'Web'}
          </p>
        </div>
        <Badge variant={cfg.variant}>{cfg.label}</Badge>
      </div>

      <div className="bg-white border border-warm-200 rounded-xl p-5 mb-4">
        <h2 className="font-semibold text-warm-800 mb-3 text-sm">Productos</h2>
        <table className="w-full text-sm">
          <tbody>
            {order.items.map(item => (
              <tr key={item.id} className="border-b border-warm-100 last:border-0">
                <td className="py-2 text-warm-700">{item.product.nombre}</td>
                <td className="py-2 text-center text-warm-500">x{item.cantidad}</td>
                <td className="py-2 text-right font-medium text-warm-800">${(item.precio_unitario * item.cantidad).toLocaleString('es-AR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center pt-3 mt-1 border-t border-warm-200">
          <span className="font-semibold text-warm-800">Total</span>
          <span className="font-bold text-warm-800 text-lg">${order.total.toLocaleString('es-AR')}</span>
        </div>
      </div>

      {order.notas_cliente && (
        <div className="bg-warm-50 border border-warm-200 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-warm-500 uppercase mb-1">Notas del cliente</p>
          <p className="text-sm text-warm-700">{order.notas_cliente}</p>
        </div>
      )}

      {nextStates.length > 0 && (
        <EstadoActions orderId={order.id} nextStates={nextStates} estadoLabels={ESTADO_LABELS} />
      )}
    </div>
  )
}
```

- [ ] **Step 6: Create `src/app/dashboard/pedidos/[id]/EstadoActions.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface Props {
  orderId: string
  nextStates: string[]
  estadoLabels: Record<string, string>
}

export function EstadoActions({ orderId, nextStates, estadoLabels }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function transition(estado: string) {
    setLoading(estado)
    await fetch(`/api/orders/${orderId}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    })
    setLoading(null)
    router.refresh()
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {nextStates.map(s => (
        <Button
          key={s}
          variant={s === 'CANCELADO' ? 'danger' : 'primary'}
          onClick={() => transition(s)}
          disabled={loading !== null}
        >
          {loading === s ? 'Guardando...' : estadoLabels[s] ?? s}
        </Button>
      ))}
    </div>
  )
}
```

---

### Task 4: Catalogo, Insumos, Clientes, Configuracion pages

**Files:**
- Create: `src/app/dashboard/catalogo/page.tsx`
- Create: `src/app/dashboard/insumos/page.tsx`
- Create: `src/app/dashboard/clientes/page.tsx`
- Create: `src/app/dashboard/configuracion/page.tsx`

- [ ] **Step 1: Create `src/app/dashboard/catalogo/page.tsx`**

```tsx
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

  const byCategoria = products.reduce((acc: Record<string, typeof products>, p) => {
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
```

- [ ] **Step 2: Create `src/app/dashboard/catalogo/CatalogoActions.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export function CatalogoActions() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio_base: '', categoria: '' })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, precio_base: Number(form.precio_base) }),
    })
    setLoading(false)
    setOpen(false)
    setForm({ nombre: '', descripcion: '', precio_base: '', categoria: '' })
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Agregar producto</Button>
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-warm-200 p-6 w-full max-w-sm">
            <h2 className="font-bold text-warm-800 mb-4">Nuevo producto</h2>
            <form onSubmit={submit} className="flex flex-col gap-3">
              {[
                { name: 'nombre', label: 'Nombre', type: 'text' },
                { name: 'descripcion', label: 'Descripcion (opcional)', type: 'text' },
                { name: 'precio_base', label: 'Precio base ($)', type: 'number' },
                { name: 'categoria', label: 'Categoria', type: 'text' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs font-medium text-warm-700 mb-1">{f.label}</label>
                  <input type={f.type} required={f.name !== 'descripcion'}
                    value={(form as any)[f.name]}
                    onChange={e => setForm(prev => ({ ...prev, [f.name]: e.target.value }))}
                    className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400" />
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 3: Create `src/app/dashboard/insumos/page.tsx`**

```tsx
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
```

- [ ] **Step 4: Create `src/app/dashboard/insumos/InsumoActions.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export function InsumoActions() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ nombre: '', unidad: '', stock_actual: '', stock_minimo: '' })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/ingredients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, stock_actual: Number(form.stock_actual), stock_minimo: Number(form.stock_minimo) }),
    })
    setLoading(false)
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Agregar insumo</Button>
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-warm-200 p-6 w-full max-w-sm">
            <h2 className="font-bold text-warm-800 mb-4">Nuevo insumo</h2>
            <form onSubmit={submit} className="flex flex-col gap-3">
              {[
                { name: 'nombre', label: 'Nombre', type: 'text' },
                { name: 'unidad', label: 'Unidad (kg, unid, lt...)', type: 'text' },
                { name: 'stock_actual', label: 'Stock actual', type: 'number' },
                { name: 'stock_minimo', label: 'Stock minimo', type: 'number' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs font-medium text-warm-700 mb-1">{f.label}</label>
                  <input type={f.type} required
                    value={(form as any)[f.name]}
                    onChange={e => setForm(prev => ({ ...prev, [f.name]: e.target.value }))}
                    className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400" />
                </div>
              ))}
              <div className="flex gap-2 mt-2">
                <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</Button>
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 5: Create `src/app/dashboard/clientes/page.tsx`**

```tsx
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
              <tr><td colSpan={3} className="py-8 text-center text-warm-500">Sin clientes todavia.</td></tr>
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
```

- [ ] **Step 6: Create `src/app/dashboard/configuracion/page.tsx`**

```tsx
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
      <ConfigForm shop={shop} />
    </div>
  )
}
```

- [ ] **Step 7: Create `src/app/dashboard/configuracion/ConfigForm.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export function ConfigForm({ shop }: { shop: any }) {
  const [form, setForm] = useState({ nombre: shop.nombre, capacidad_diaria: shop.capacidad_diaria })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/shop', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="bg-white border border-warm-200 rounded-xl p-6">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">Nombre de la pasteleria</label>
          <input type="text" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
            className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">URL publica</label>
          <div className="flex items-center gap-2 bg-warm-50 border border-warm-200 rounded-lg px-3 py-2 text-sm text-warm-500">
            /p/{shop.slug}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">Capacidad diaria (pedidos)</label>
          <input type="number" min={1} value={form.capacidad_diaria}
            onChange={e => setForm(p => ({ ...p, capacidad_diaria: Number(e.target.value) }))}
            className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400" />
        </div>
        <div className="flex items-center gap-3 mt-2">
          <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar cambios'}</Button>
          {saved && <span className="text-sm text-green-600">Guardado</span>}
        </div>
      </form>
    </div>
  )
}
```

---

### Task 5: Portal del cliente + formulario de pedido + tracking

**Files:**
- Create: `src/app/p/[slug]/page.tsx`
- Create: `src/app/p/[slug]/pedido/page.tsx`
- Create: `src/app/p/[slug]/pedido/confirmacion/page.tsx`
- Create: `src/app/seguimiento/[token]/page.tsx`
- Create: `src/lib/socket-client.ts`

- [ ] **Step 1: Create `src/app/p/[slug]/page.tsx`** (public portal)

```tsx
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

  const byCategoria = shop.products.reduce((acc: Record<string, typeof shop.products>, p) => {
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
          <Link href={`/p/${slug}/pedido`}
            className="px-5 py-2.5 bg-warm-400 text-white rounded-lg font-semibold hover:bg-warm-500 text-sm">
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
          <Link href={`/p/${slug}/pedido`}
            className="inline-block px-8 py-3 bg-warm-400 text-white rounded-lg font-semibold hover:bg-warm-500">
            Hacer un pedido
          </Link>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/app/p/[slug]/pedido/page.tsx`** (order form with live quote)

```tsx
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
        <OrderForm slug={slug} products={shop.products} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/app/p/[slug]/pedido/OrderForm.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

interface Product {
  id: string
  nombre: string
  precio_base: number
  categoria: string
}

interface Props {
  slug: string
  products: Product[]
}

export function OrderForm({ slug, products }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [items, setItems] = useState<{ productId: string; cantidad: number }[]>([{ productId: '', cantidad: 1 }])
  const [form, setForm] = useState({ nombre: '', email: '', fecha: '', notas: '', personalizacion: '', restricciones: '' })

  const total = items.reduce((sum, item) => {
    const p = products.find(p => p.id === item.productId)
    return sum + (p ? p.precio_base * item.cantidad : 0)
  }, 0)

  function addItem() { setItems(prev => [...prev, { productId: '', cantidad: 1 }]) }
  function removeItem(i: number) { setItems(prev => prev.filter((_, idx) => idx !== i)) }
  function updateItem(i: number, field: string, value: string | number) {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const validItems = items.filter(i => i.productId)
    if (validItems.length === 0) { setError('Seleccioná al menos un producto'); return }

    setLoading(true)
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fechaEntrega: new Date(form.fecha).toISOString(),
        notasCliente: form.notas || undefined,
        canal: 'WEB',
        customer: { nombre: form.nombre, email: form.email || undefined },
        items: validItems.map(i => ({
          productId: i.productId,
          cantidad: i.cantidad,
          personalizacion: form.personalizacion || undefined,
          restricciones: form.restricciones || undefined,
        })),
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Error al crear el pedido'); return }
    router.push(`/p/${slug}/pedido/confirmacion?token=${data.token}`)
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <div className="bg-white border border-warm-200 rounded-xl p-6">
        <h2 className="font-semibold text-warm-800 mb-4">Tus datos</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-warm-700 mb-1">Nombre *</label>
            <input required value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-warm-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-warm-700 mb-1">Fecha de entrega *</label>
            <input required type="date" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-warm-200 rounded-xl p-6">
        <h2 className="font-semibold text-warm-800 mb-4">Productos</h2>
        <div className="flex flex-col gap-3">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <select value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)}
                className="flex-1 border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400">
                <option value="">Seleccionar producto...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} — ${p.precio_base.toLocaleString('es-AR')}</option>
                ))}
              </select>
              <input type="number" min={1} value={item.cantidad}
                onChange={e => updateItem(i, 'cantidad', Number(e.target.value))}
                className="w-20 border border-warm-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-warm-400" />
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(i)}
                  className="text-warm-400 hover:text-red-500 px-2 py-1 text-sm">x</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addItem}
            className="text-sm text-warm-400 hover:text-warm-600 text-left mt-1">
            + Agregar otro producto
          </button>
        </div>

        {total > 0 && (
          <div className="mt-4 pt-4 border-t border-warm-200 flex justify-between items-center">
            <span className="text-sm font-semibold text-warm-700">Total estimado</span>
            <span className="text-xl font-bold text-warm-800">${total.toLocaleString('es-AR')}</span>
          </div>
        )}
      </div>

      <div className="bg-white border border-warm-200 rounded-xl p-6">
        <h2 className="font-semibold text-warm-800 mb-4">Detalles adicionales</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1">Personalizacion</label>
            <input type="text" placeholder="Inscripcion, colores, tema..." value={form.personalizacion}
              onChange={e => setForm(p => ({ ...p, personalizacion: e.target.value }))}
              className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1">Restricciones alimentarias</label>
            <input type="text" placeholder="Sin gluten, sin lactosa..." value={form.restricciones}
              onChange={e => setForm(p => ({ ...p, restricciones: e.target.value }))}
              className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1">Notas</label>
            <textarea rows={3} value={form.notas}
              onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
              className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400 resize-none" />
          </div>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <Button type="submit" disabled={loading} size="md" className="w-full py-3">
        {loading ? 'Enviando pedido...' : 'Confirmar pedido'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 4: Create `src/app/p/[slug]/pedido/confirmacion/page.tsx`**

```tsx
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function ConfirmacionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const token = sp.token

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white border border-warm-200 rounded-xl p-8">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-warm-800 mb-2">Pedido recibido</h1>
          <p className="text-warm-500 text-sm mb-6">
            Tu pedido fue registrado. Recibirás una confirmación cuando lo revisemos.
          </p>
          {token && (
            <div className="mb-6">
              <Link href={`/seguimiento/${token}`}>
                <Button className="w-full">Seguir mi pedido</Button>
              </Link>
            </div>
          )}
          <Link href={`/p/${slug}`} className="text-sm text-warm-400 hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create `src/lib/socket-client.ts`**

```typescript
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io({ path: '/socket.io', transports: ['websocket'] })
  }
  return socket
}
```

- [ ] **Step 6: Create `src/app/seguimiento/[token]/page.tsx`**

```tsx
import { getOrderByToken } from '@/services/order.service'
import { notFound } from 'next/navigation'
import { TrackingClient } from './TrackingClient'

const ESTADOS = ['NUEVO', 'CONFIRMADO', 'EN_PRODUCCION', 'LISTO', 'ENTREGADO']

const ESTADO_LABELS: Record<string, string> = {
  NUEVO: 'Pedido recibido',
  CONFIRMADO: 'Pedido confirmado',
  EN_PRODUCCION: 'En produccion',
  LISTO: 'Listo para retirar',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
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
            Entrega: {new Date(order.fecha_entrega).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        <div className="bg-white border border-warm-200 rounded-xl p-6 mb-6">
          <div className="flex flex-col gap-3">
            {ESTADOS.map((e, i) => {
              const done = i < currentIndex
              const active = i === currentIndex
              return (
                <div key={e} className={`flex items-center gap-3 ${done || active ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-3 h-3 rounded-full shrink-0 ${active ? 'bg-warm-400 ring-4 ring-warm-200' : done ? 'bg-warm-400' : 'bg-warm-200'}`} />
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
              <span className="text-warm-700">{item.product.nombre} <span className="text-warm-400">x{item.cantidad}</span></span>
              <span className="font-medium text-warm-800">${(item.precio_unitario * item.cantidad).toLocaleString('es-AR')}</span>
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
```

- [ ] **Step 7: Create `src/app/seguimiento/[token]/TrackingClient.tsx`** (Socket.io real-time updates)

```tsx
'use client'
import { useEffect, useState } from 'react'
import { getSocket } from '@/lib/socket-client'

interface Props {
  token: string
  initialEstado: string
  estadoLabels: Record<string, string>
}

export function TrackingClient({ token, initialEstado, estadoLabels }: Props) {
  const [estado, setEstado] = useState(initialEstado)
  const [updated, setUpdated] = useState(false)

  useEffect(() => {
    const socket = getSocket()
    socket.emit('join:order', token)
    socket.on('order:updated', (data: { token: string; estado: string }) => {
      if (data.token === token) {
        setEstado(data.estado)
        setUpdated(true)
        setTimeout(() => setUpdated(false), 3000)
      }
    })
    return () => {
      socket.emit('leave:order', token)
      socket.off('order:updated')
    }
  }, [token])

  if (!updated) return null

  return (
    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800 font-medium">
      El estado de tu pedido se actualizó: {estadoLabels[estado] ?? estado}
    </div>
  )
}
```

- [ ] **Step 8: Verify the client portal end to end**

With the dev server running:
1. `http://localhost:3000/p/la-dulce-tentacion` — portal landing renders with products
2. `http://localhost:3000/p/la-dulce-tentacion/pedido` — order form renders
3. Submit a test order and confirm redirect to `/p/la-dulce-tentacion/pedido/confirmacion?token=...`
4. Click "Seguir mi pedido" and confirm the tracking page loads

---

## Post-frontend checklist

- [ ] Landing page `/` renders with warm colors
- [ ] Login with `maria@ladulce.com` / `password123` redirects to `/dashboard`
- [ ] Dashboard KPIs load (active orders, revenue, etc.)
- [ ] `/dashboard/pedidos` shows Kanban and Lista tabs
- [ ] `/dashboard/catalogo` shows 6 products
- [ ] `/dashboard/insumos` shows 6 ingredients (2 with stock bajo warning)
- [ ] `/p/la-dulce-tentacion` shows public portal with products
- [ ] Order form submits and creates order
- [ ] Tracking page `/seguimiento/:token` loads with timeline
