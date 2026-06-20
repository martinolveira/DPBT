import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-05-27.dahlia' as any })

export async function createPaymentIntent(orderId: string, shopId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId, shop_id: shopId } })
  if (!order) throw new Error('Order not found')

  const sena = Math.max(Math.round(order.total * 0.3), 500)
  const intent = await stripe.paymentIntents.create({
    amount: sena * 100,
    currency: 'ars',
    metadata: { orderId, shopId },
  })

  await prisma.payment.create({
    data: { order_id: orderId, monto: sena, stripe_payment_intent_id: intent.id },
  })

  return { clientSecret: intent.client_secret, amount: sena }
}
