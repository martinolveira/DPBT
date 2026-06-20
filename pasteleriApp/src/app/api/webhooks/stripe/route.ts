import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/services/stripe.service'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent
    await prisma.payment.updateMany({
      where: { stripe_payment_intent_id: intent.id },
      data: { estado: 'COMPLETADO' },
    })
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object as Stripe.PaymentIntent
    await prisma.payment.updateMany({
      where: { stripe_payment_intent_id: intent.id },
      data: { estado: 'FALLIDO' },
    })
  }

  return NextResponse.json({ received: true })
}
