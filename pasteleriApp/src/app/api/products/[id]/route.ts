import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthPayload, unauthorized } from '@/lib/api-helpers'
import { updateProduct, deleteProduct } from '@/services/product.service'

const schema = z.object({
  nombre: z.string().min(1).optional(),
  descripcion: z.string().optional(),
  precio_base: z.number().positive().optional(),
  categoria: z.string().min(1).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const { id } = await params
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  try {
    return NextResponse.json(await updateProduct(auth.shopId, id, parsed.data))
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const { id } = await params
  await deleteProduct(auth.shopId, id)
  return new NextResponse(null, { status: 204 })
}
