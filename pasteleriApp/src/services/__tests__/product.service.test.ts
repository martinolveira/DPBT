import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { createProduct, listProducts, updateProduct, deleteProduct } from '../product.service'

let shopId: string

beforeEach(async () => {
  const shop = await prisma.shop.create({ data: { nombre: 'T', slug: `p-${Date.now()}` } })
  shopId = shop.id
})

describe('product.service', () => {
  it('creates product scoped to shop', async () => {
    const p = await createProduct(shopId, { nombre: 'Torta', precio_base: 3200, categoria: 'tortas' })
    expect(p.shop_id).toBe(shopId)
  })

  it('lists only active products from the shop', async () => {
    await createProduct(shopId, { nombre: 'A', precio_base: 100, categoria: 'x' })
    await createProduct(shopId, { nombre: 'B', precio_base: 200, categoria: 'x' })
    const list = await listProducts(shopId)
    expect(list).toHaveLength(2)
  })

  it('soft-deletes by setting activo=false', async () => {
    const p = await createProduct(shopId, { nombre: 'Del', precio_base: 100, categoria: 'x' })
    await deleteProduct(shopId, p.id)
    const list = await listProducts(shopId)
    expect(list).toHaveLength(0)
  })
})
