import { NextResponse } from 'next/server'
import { z } from 'zod'
import { registerShop } from '@/services/auth.service'

const schema = z.object({
  shopNombre: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  email: z.string().email(),
  password: z.string().min(6),
  nombre: z.string().min(2),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  try {
    const result = await registerShop(parsed.data)
    const response = NextResponse.json({ shop: result.shop, user: result.user }, { status: 201 })
    response.cookies.set('token', result.token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 })
    return response
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
