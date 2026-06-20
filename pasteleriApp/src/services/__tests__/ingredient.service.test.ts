import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { createIngredient, getLowStock, updateIngredient } from '../ingredient.service'

let shopId: string

beforeEach(async () => {
  const shop = await prisma.shop.create({ data: { nombre: 'T', slug: `i-${Date.now()}` } })
  shopId = shop.id
})

describe('ingredient.service', () => {
  it('creates ingredient', async () => {
    const i = await createIngredient(shopId, { nombre: 'Harina', unidad: 'kg', stock_actual: 10, stock_minimo: 2 })
    expect(i.shop_id).toBe(shopId)
  })

  it('getLowStock returns only below-minimum', async () => {
    await createIngredient(shopId, { nombre: 'Harina', unidad: 'kg', stock_actual: 1, stock_minimo: 2 })
    await createIngredient(shopId, { nombre: 'Azúcar', unidad: 'kg', stock_actual: 5, stock_minimo: 2 })
    const low = await getLowStock(shopId)
    expect(low).toHaveLength(1)
    expect(low[0].nombre).toBe('Harina')
  })
})
