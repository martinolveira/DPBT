import { NextRequest, NextResponse } from 'next/server'
import { handleIncomingMessage } from '@/services/whatsapp.service'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const from = formData.get('From') as string
  const body = formData.get('Body') as string
  if (!from || !body) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  try {
    await handleIncomingMessage(from, body)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('WhatsApp webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
