import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server } from 'socket.io'
import { registerSocketEvents } from './src/lib/socket-server'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000')

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(httpServer, {
    cors: { origin: process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${port}` },
  })

  ;(global as any)._io = io

  registerSocketEvents(io)

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
}).catch((err) => {
  console.error('Next.js failed to prepare:', err)
  process.exit(1)
})
