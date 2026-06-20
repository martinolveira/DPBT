import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthPayload, unauthorized } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  nombre: z.string().min(2).optional(),
  logo_url: z.string().url().optional(),
  capacidad_diaria: z.number().int().positive().optional(),
})

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  return NextResponse.json(await prisma.shop.findUnique({ where: { id: auth.shopId } }))
}

export async function PATCH(req: NextRequest) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  return NextResponse.json(await prisma.shop.update({ where: { id: auth.shopId }, data: parsed.data }))
}
