import { Server } from 'socket.io'

export function registerSocketEvents(io: Server) {
  io.on('connection', (socket) => {
    socket.on('join:order', (token: string) => socket.join(`order:${token}`))
    socket.on('leave:order', (token: string) => socket.leave(`order:${token}`))
  })
}

export function emitOrderUpdated(token: string, estado: string) {
  const io: Server | undefined = (global as any)._io
  if (!io) {
    console.warn('[socket] emitOrderUpdated called but Socket.io not initialized')
    return
  }
  io.to(`order:${token}`).emit('order:updated', { token, estado })
}
