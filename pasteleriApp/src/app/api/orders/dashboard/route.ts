import { NextRequest, NextResponse } from 'next/server'
import { getAuthPayload, unauthorized } from '@/lib/api-helpers'
import { getDashboardStats } from '@/services/order.service'

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  return NextResponse.json(await getDashboardStats(auth.shopId))
}
