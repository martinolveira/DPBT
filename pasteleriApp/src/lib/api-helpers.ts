import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, JwtPayload } from './jwt'

export function getAuthPayload(req: NextRequest): JwtPayload | null {
  const token = req.cookies.get('token')?.value
  if (!token) return null
  try {
    return verifyToken(token)
  } catch {
    return null
  }
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
