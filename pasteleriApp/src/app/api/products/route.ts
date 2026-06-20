import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthPayload, unauthorized } from '@/lib/api-helpers'
import { createProduct, listProducts } from '@/services/product.service'

const schema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  precio_base: z.number().positive(),
  categoria: z.string().min(1),
})

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  return NextResponse.json(await listProducts(auth.shopId))
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  return NextResponse.json(await createProduct(auth.shopId, parsed.data), { status: 201 })
}
