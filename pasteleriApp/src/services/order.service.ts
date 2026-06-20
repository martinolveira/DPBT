import { OrderEstado } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const TRANSITIONS: Record<OrderEstado, OrderEstado[]> = {
  NUEVO:         ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO:    ['EN_PRODUCCION', 'CANCELADO'],
  EN_PRODUCCION: ['LISTO', 'CANCELADO'],
  LISTO:         ['ENTREGADO', 'CANCELADO'],
  ENTREGADO:     [],
  CANCELADO:     [],
}

interface CreateOrderInput {
  shopId: string
  fechaEntrega: Date
  notasCliente?: string
  customer: { nombre: string; email?: string; telefono?: string }
  items: { productId: string; cantidad: number; personalizacion?: string; restricciones?: string }[]
}

export async function createOrder(input: CreateOrderInput) {
  const products = await prisma.product.findMany({
    where: { id: { in: input.items.map(i => i.productId) }, shop_id: input.shopId },
  })
  if (products.length !== input.items.length) throw new Error('Some products not found')

  const priceMap = new Map(products.map(p => [p.id, p.precio_base]))
  const total = input.items.reduce((sum, item) => sum + priceMap.get(item.productId)! * item.cantidad, 0)
  const customer = await prisma.customer.create({ data: input.customer })

  return prisma.order.create({
    data: {
      shop_id: input.shopId,
      customer_id: customer.id,
      fecha_entrega: input.fechaEntrega,
      notas_cliente: input.notasCliente,
      total,
      items: {
        create: input.items.map(item => ({
          product_id: item.productId,
          cantidad: item.cantidad,
          precio_unitario: priceMap.get(item.productId)!,
          personalizacion: item.personalizacion,
          restricciones: item.restricciones,
        })),
      },
    },
    include: { items: { include: { product: true } }, customer: true },
  })
}

export async function getOrderByToken(token: string) {
  return prisma.order.findUnique({
    where: { token },
    include: { items: { include: { product: true } }, customer: true, payment: true },
  })
}

export async function transitionState(shopId: string, orderId: string, nextState: OrderEstado) {
  const order = await prisma.order.findUnique({ where: { id: orderId, shop_id: shopId } })
  if (!order) throw new Error('Order not found')

  if (!TRANSITIONS[order.estado].includes(nextState)) {
    throw new Error(`Invalid transition: ${order.estado} → ${nextState}`)
  }

  return prisma.order.update({ where: { id: orderId }, data: { estado: nextState } })
}

export async function listOrders(shopId: string, estado?: OrderEstado) {
  return prisma.order.findMany({
    where: { shop_id: shopId, ...(estado ? { estado } : {}) },
    include: { customer: true, items: { include: { product: true } }, payment: true },
    orderBy: { fecha_entrega: 'asc' },
  })
}

export async function getDashboardStats(shopId: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const [activeOrders, todayDeliveries, unconfirmed, revenueResult, allIngredients] = await Promise.all([
    prisma.order.count({ where: { shop_id: shopId, estado: { notIn: ['ENTREGADO', 'CANCELADO'] } } }),
    prisma.order.findMany({
      where: { shop_id: shopId, fecha_entrega: { gte: today, lt: tomorrow }, estado: { notIn: ['CANCELADO'] } },
      include: { customer: true },
    }),
    prisma.order.findMany({
      where: { shop_id: shopId, estado: 'NUEVO' },
      include: { customer: true, items: { include: { product: true } } },
      take: 10,
    }),
    prisma.order.aggregate({
      where: { shop_id: shopId, createdAt: { gte: monthStart } },
      _sum: { total: true },
    }),
    prisma.ingredient.findMany({ where: { shop_id: shopId } }),
  ])

  return {
    activeOrders,
    todayDeliveries,
    unconfirmed,
    monthRevenue: revenueResult._sum.total ?? 0,
    lowStock: allIngredients.filter(i => i.stock_actual <= i.stock_minimo),
  }
}
