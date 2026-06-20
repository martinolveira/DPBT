import { prisma } from '@/lib/prisma'
import { afterAll, beforeEach } from 'vitest'

beforeEach(async () => {
  await prisma.payment.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.waBotSession.deleteMany()
  await prisma.ingredient.deleteMany()
  await prisma.product.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()
  await prisma.shop.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})
