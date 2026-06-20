import { NextRequest, NextResponse } from 'next/server'
import { getAuthPayload, unauthorized } from '@/lib/api-helpers'
import { createPaymentIntent } from '@/services/stripe.service'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const { id } = await params
  try {
    return NextResponse.json(await createPaymentIntent(id, auth.shopId))
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
