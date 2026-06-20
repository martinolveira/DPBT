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
