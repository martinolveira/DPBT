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
                className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400 bg-white text-warm-800 placeholder:text-warm-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">Contraseña</label>
              <input name="password" type="password" required
                className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400 bg-white text-warm-800 placeholder:text-warm-300" />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>
        </div>
        <p className="text-center text-sm text-warm-500 mt-4">
          No tenés cuenta?{' '}
          <Link href="/registro" className="text-warm-400 font-medium hover:underline">Registrate</Link>
        </p>
      </div>
    </div>
  )
}
