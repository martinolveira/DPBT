import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'pasteleriApp',
  description: 'Gestión de pedidos para pastelerías artesanales',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-warm-50 text-warm-800`}>
        {children}
      </body>
    </html>
  )
}
