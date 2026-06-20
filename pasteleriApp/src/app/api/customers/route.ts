import { NextRequest, NextResponse } from 'next/server'
import { getAuthPayload, unauthorized } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const customers = await prisma.customer.findMany({
    where: { orders: { some: { shop_id: auth.shopId } } },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(customers)
}
