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
    const shopNombre = form.get('shopNombre') as string
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shopNombre,
        slug: shopNombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
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
                className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400 bg-white text-warm-800 placeholder:text-warm-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">Tu nombre</label>
              <input name="nombre" type="text" required
                className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400 bg-white text-warm-800 placeholder:text-warm-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">Email</label>
              <input name="email" type="email" required
                className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400 bg-white text-warm-800 placeholder:text-warm-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">Contraseña</label>
              <input name="password" type="password" required minLength={6}
                className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400 bg-white text-warm-800 placeholder:text-warm-300" />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          </form>
        </div>
        <p className="text-center text-sm text-warm-500 mt-4">
          Ya tenés cuenta?{' '}
          <Link href="/login" className="text-warm-400 font-medium hover:underline">Ingresar</Link>
        </p>
      </div>
    </div>
  )
}
