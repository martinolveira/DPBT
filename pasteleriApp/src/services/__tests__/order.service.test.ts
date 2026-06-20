import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { createOrder, getOrderByToken, transitionState } from '../order.service'

let shopId: string
let productId: string

beforeEach(async () => {
  const shop = await prisma.shop.create({ data: { nombre: 'T', slug: `o-${Date.now()}` } })
  shopId = shop.id
  const product = await prisma.product.create({
    data: { nombre: 'Torta', precio_base: 3000, categoria: 'tortas', shop_id: shopId },
  })
  productId = product.id
})

describe('createOrder', () => {
  it('creates order with calculated total', async () => {
    const order = await createOrder({
      shopId,
      canal: 'WEB',
      fechaEntrega: new Date('2026-06-20'),
      customer: { nombre: 'Ana', email: 'ana@test.com' },
      items: [{ productId, cantidad: 2 }],
    })
    expect(order.total).toBe(6000)
    expect(order.estado).toBe('NUEVO')
    expect(order.token).toBeDefined()
  })
})

describe('getOrderByToken', () => {
  it('returns null for unknown token', async () => {
    expect(await getOrderByToken('nope')).toBeNull()
  })

  it('returns order with relations', async () => {
    const created = await createOrder({
      shopId, canal: 'WEB', fechaEntrega: new Date('2026-06-20'),
      customer: { nombre: 'Luis' }, items: [{ productId, cantidad: 1 }],
    })
    const found = await getOrderByToken(created.token)
    expect(found?.customer.nombre).toBe('Luis')
    expect(found?.items).toHaveLength(1)
  })
})

describe('transitionState', () => {
  it('NUEVO → CONFIRMADO succeeds', async () => {
    const order = await createOrder({
      shopId, canal: 'WEB', fechaEntrega: new Date('2026-06-20'),
      customer: { nombre: 'X' }, items: [{ productId, cantidad: 1 }],
    })
    const updated = await transitionState(shopId, order.id, 'CONFIRMADO')
    expect(updated.estado).toBe('CONFIRMADO')
  })

  it('NUEVO → ENTREGADO throws', async () => {
    const order = await createOrder({
      shopId, canal: 'WEB', fechaEntrega: new Date('2026-06-20'),
      customer: { nombre: 'Y' }, items: [{ productId, cantidad: 1 }],
    })
    await expect(transitionState(shopId, order.id, 'ENTREGADO')).rejects.toThrow('Invalid transition')
  })

  it('can cancel from any non-terminal state', async () => {
    const order = await createOrder({
      shopId, canal: 'WEB', fechaEntrega: new Date('2026-06-20'),
      customer: { nombre: 'Z' }, items: [{ productId, cantidad: 1 }],
    })
    const cancelled = await transitionState(shopId, order.id, 'CANCELADO')
    expect(cancelled.estado).toBe('CANCELADO')
  })
})
