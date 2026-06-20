import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthPayload, unauthorized } from '@/lib/api-helpers'
import { createIngredient, listIngredients, getLowStock } from '@/services/ingredient.service'

const schema = z.object({
  nombre: z.string().min(1),
  unidad: z.string().min(1),
  stock_actual: z.number().min(0),
  stock_minimo: z.number().min(0),
})

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const { searchParams } = new URL(req.url)
  if (searchParams.get('low') === 'true') {
    return NextResponse.json(await getLowStock(auth.shopId))
  }
  return NextResponse.json(await listIngredients(auth.shopId))
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  return NextResponse.json(await createIngredient(auth.shopId, parsed.data), { status: 201 })
}
