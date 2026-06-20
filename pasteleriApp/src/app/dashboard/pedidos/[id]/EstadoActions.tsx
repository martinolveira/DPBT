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
