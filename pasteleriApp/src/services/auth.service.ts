import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/jwt'

interface RegisterInput {
  shopNombre: string
  slug: string
  email: string
  password: string
  nombre: string
}

export async function registerShop(input: RegisterInput) {
  const existing = await prisma.shop.findUnique({ where: { slug: input.slug } })
  if (existing) throw new Error('slug already taken')

  const password_hash = await bcrypt.hash(input.password, 10)
  const shop = await prisma.shop.create({
    data: {
      nombre: input.shopNombre,
      slug: input.slug,
      users: { create: { email: input.email, password_hash, nombre: input.nombre } },
    },
    include: { users: true },
  })

  const user = shop.users[0]
  const token = signToken({ userId: user.id, shopId: shop.id })
  return { token, shop, user }
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email }, include: { shop: true } })
  if (!user) throw new Error('Invalid credentials')

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) throw new Error('Invalid credentials')

  const token = signToken({ userId: user.id, shopId: user.shop_id })
  return { token, user, shop: user.shop }
}
