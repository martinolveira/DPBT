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
                { name: 'nombre',      label: 'Nombre',                   type: 'text',   required: true },
                { name: 'descripcion', label: 'Descripcion (opcional)',    type: 'text',   required: false },
                { name: 'precio_base', label: 'Precio base ($)',           type: 'number', required: true },
                { name: 'categoria',   label: 'Categoria',                 type: 'text',   required: true },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs font-medium text-warm-700 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    required={f.required}
                    value={(form as any)[f.name]}
                    onChange={e => setForm(prev => ({ ...prev, [f.name]: e.target.value }))}
                    className="w-full border border-warm-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-warm-400"
                  />
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
