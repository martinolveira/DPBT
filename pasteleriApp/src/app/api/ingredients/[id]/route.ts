import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthPayload, unauthorized } from '@/lib/api-helpers'
import { updateIngredient } from '@/services/ingredient.service'

const schema = z.object({
  nombre: z.string().optional(),
  unidad: z.string().optional(),
  stock_actual: z.number().min(0).optional(),
  stock_minimo: z.number().min(0).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const { id } = await params
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  return NextResponse.json(await updateIngredient(auth.shopId, id, parsed.data))
}
