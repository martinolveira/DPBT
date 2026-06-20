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
      body: JSON.stringify({
        ...form,
        stock_actual: Number(form.stock_actual),
        stock_minimo: Number(form.stock_minimo),
      }),
    })
    setLoading(false)
    setOpen(false)
    setForm({ nombre: '', unidad: '', stock_actual: '', stock_minimo: '' })
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
                { name: 'nombre',       label: 'Nombre',            type: 'text' },
                { name: 'unidad',       label: 'Unidad (kg, u, lt)', type: 'text' },
                { name: 'stock_actual', label: 'Stock actual',       type: 'number' },
                { name: 'stock_minimo', label: 'Stock minimo',       type: 'number' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs font-medium text-warm-700 mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    required
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
