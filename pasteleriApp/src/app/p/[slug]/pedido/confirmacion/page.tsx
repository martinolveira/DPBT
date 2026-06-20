import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function ConfirmacionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const token = sp.token

  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white border border-warm-200 rounded-xl p-8">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-warm-800 mb-2">Pedido recibido</h1>
          <p className="text-warm-500 text-sm mb-6">
            Tu pedido fue registrado. Recibirás una confirmación cuando lo revisemos.
          </p>
          {token && (
            <div className="mb-6">
              <Link href={`/seguimiento/${token}`}>
                <Button className="w-full">Seguir mi pedido</Button>
              </Link>
            </div>
          )}
          <Link href={`/p/${slug}`} className="text-sm text-warm-400 hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
