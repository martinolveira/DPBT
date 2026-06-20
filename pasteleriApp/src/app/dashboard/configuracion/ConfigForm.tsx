'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface Shop {
  nombre: string
  slug: string
  capacidad_diaria: number
}

export function ConfigForm({ shop }: { shop: Shop }) {
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
          <input
            type="text"
            value={form.nombre}
            onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
            className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">URL publica</label>
          <div className="flex items-center gap-2 bg-warm-50 border border-warm-200 rounded-lg px-3 py-2 text-sm text-warm-500">
            /p/{shop.slug}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1">Capacidad diaria (pedidos)</label>
          <input
            type="number"
            min={1}
            value={form.capacidad_diaria}
            onChange={e => setForm(p => ({ ...p, capacidad_diaria: Number(e.target.value) }))}
            className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400"
          />
        </div>
        <div className="flex items-center gap-3 mt-2">
          <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar cambios'}</Button>
          {saved && <span className="text-sm text-green-600">Guardado</span>}
        </div>
      </form>
    </div>
  )
}
