import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthPayload, unauthorized } from '@/lib/api-helpers'
import { createOrder, listOrders } from '@/services/order.service'
import { OrderEstado } from '@prisma/client'

const createSchema = z.object({
  fechaEntrega: z.string().datetime(),
  notasCliente: z.string().optional(),
  customer: z.object({
    nombre: z.string().min(1),
    email: z.string().email().optional(),
    telefono: z.string().optional(),
  }),
  items: z.array(z.object({
    productId: z.string(),
    cantidad: z.number().int().positive(),
    personalizacion: z.string().optional(),
    restricciones: z.string().optional(),
  })).min(1),
})

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const estado = new URL(req.url).searchParams.get('estado') as OrderEstado | null
  return NextResponse.json(await listOrders(auth.shopId, estado ?? undefined))
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const parsed = createSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  try {
    const order = await createOrder({
      shopId: auth.shopId,
      ...parsed.data,
      fechaEntrega: new Date(parsed.data.fechaEntrega),
    })
    return NextResponse.json(order, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
