import { prisma } from '@/lib/prisma'

interface CreateIngredientInput {
  nombre: string
  unidad: string
  stock_actual: number
  stock_minimo: number
}

export async function createIngredient(shopId: string, input: CreateIngredientInput) {
  return prisma.ingredient.create({ data: { ...input, shop_id: shopId } })
}

export async function listIngredients(shopId: string) {
  return prisma.ingredient.findMany({ where: { shop_id: shopId }, orderBy: { nombre: 'asc' } })
}

export async function getLowStock(shopId: string) {
  const all = await prisma.ingredient.findMany({ where: { shop_id: shopId } })
  return all.filter(i => i.stock_actual <= i.stock_minimo)
}

export async function updateIngredient(shopId: string, id: string, data: Partial<CreateIngredientInput>) {
  return prisma.ingredient.update({ where: { id, shop_id: shopId }, data })
}
