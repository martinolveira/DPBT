import { NextRequest, NextResponse } from 'next/server'
import { getAuthPayload, unauthorized } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const { id } = await params
  const orders = await prisma.order.findMany({
    where: { customer_id: id, shop_id: auth.shopId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(orders)
}
