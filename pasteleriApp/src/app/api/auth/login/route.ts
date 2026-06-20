import { NextResponse } from 'next/server'
import { z } from 'zod'
import { loginUser } from '@/services/auth.service'

const schema = z.object({ email: z.string().email(), password: z.string() })

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  try {
    const result = await loginUser(parsed.data.email, parsed.data.password)
    const response = NextResponse.json({ shop: result.shop, user: result.user })
    response.cookies.set('token', result.token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 })
    return response
  } catch {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }
}
