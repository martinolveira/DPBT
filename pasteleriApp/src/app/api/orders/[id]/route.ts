import { NextRequest, NextResponse } from 'next/server'
import { getAuthPayload, unauthorized } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id, shop_id: auth.shopId },
    include: { customer: true, items: { include: { product: true } }, payment: true },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const { id } = await params
  const { notas_internas } = await req.json()
  const order = await prisma.order.update({
    where: { id, shop_id: auth.shopId },
    data: { notas_internas },
  })
  return NextResponse.json(order)
}
