import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { OrderEstado } from '@prisma/client'
import { getAuthPayload, unauthorized } from '@/lib/api-helpers'
import { transitionState } from '@/services/order.service'
import { emitOrderUpdated } from '@/lib/socket-server'

const schema = z.object({ estado: z.nativeEnum(OrderEstado) })

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const { id } = await params
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid estado' }, { status: 400 })
  try {
    const order = await transitionState(auth.shopId, id, parsed.data.estado)
    emitOrderUpdated(order.token, order.estado)
    return NextResponse.json(order)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
