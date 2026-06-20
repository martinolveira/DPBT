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

  function addItem() {
    setItems(prev => [...prev, { productId: '', cantidad: 1 }])
  }

  function removeItem(i: number) {
    setItems(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateItem(i: number, field: string, value: string | number) {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const validItems = items.filter(i => i.productId)
    if (validItems.length === 0) {
      setError('Seleccioná al menos un producto')
      return
    }

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
    if (!res.ok) {
      setError(data.error || 'Error al crear el pedido')
      return
    }
    router.push(`/p/${slug}/pedido/confirmacion?token=${data.token}`)
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <div className="bg-white border border-warm-200 rounded-xl p-6">
        <h2 className="font-semibold text-warm-800 mb-4">Tus datos</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-warm-700 mb-1">Nombre</label>
            <input
              required
              value={form.nombre}
              onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
              className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-warm-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-warm-700 mb-1">Fecha de entrega</label>
            <input
              required
              type="date"
              value={form.fecha}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))}
              className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-warm-200 rounded-xl p-6">
        <h2 className="font-semibold text-warm-800 mb-4">Productos</h2>
        <div className="flex flex-col gap-3">
          {items.map((item, i) => (
            <div key={i} className="flex gap-2 items-center">
              <select
                value={item.productId}
                onChange={e => updateItem(i, 'productId', e.target.value)}
                className="flex-1 border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400"
              >
                <option value="">Seleccionar producto...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — ${p.precio_base.toLocaleString('es-AR')}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={item.cantidad}
                onChange={e => updateItem(i, 'cantidad', Number(e.target.value))}
                className="w-20 border border-warm-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-warm-400"
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="text-warm-400 hover:text-red-500 px-2 py-1 text-sm"
                >
                  x
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="text-sm text-warm-400 hover:text-warm-600 text-left mt-1"
          >
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
            <input
              type="text"
              placeholder="Inscripcion, colores, tema..."
              value={form.personalizacion}
              onChange={e => setForm(p => ({ ...p, personalizacion: e.target.value }))}
              className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1">Restricciones alimentarias</label>
            <input
              type="text"
              placeholder="Sin gluten, sin lactosa..."
              value={form.restricciones}
              onChange={e => setForm(p => ({ ...p, restricciones: e.target.value }))}
              className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1">Notas</label>
            <textarea
              rows={3}
              value={form.notas}
              onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
              className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400 resize-none"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full py-3">
        {loading ? 'Enviando pedido...' : 'Confirmar pedido'}
      </Button>
    </form>
  )
}
