import { prisma } from '@/lib/prisma'

interface CreateProductInput {
  nombre: string
  descripcion?: string
  precio_base: number
  categoria: string
}

export async function createProduct(shopId: string, input: CreateProductInput) {
  return prisma.product.create({ data: { ...input, shop_id: shopId } })
}

export async function listProducts(shopId: string) {
  return prisma.product.findMany({ where: { shop_id: shopId, activo: true }, orderBy: { nombre: 'asc' } })
}

export async function updateProduct(shopId: string, id: string, data: Partial<CreateProductInput>) {
  return prisma.product.update({ where: { id, shop_id: shopId }, data })
}

export async function deleteProduct(shopId: string, id: string) {
  return prisma.product.update({ where: { id, shop_id: shopId }, data: { activo: false } })
}
