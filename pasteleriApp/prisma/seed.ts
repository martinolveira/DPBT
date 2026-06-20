import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const shop = await prisma.shop.upsert({
    where: { slug: 'la-dulce-tentacion' },
    update: {},
    create: {
      nombre: 'La Dulce Tentación',
      slug: 'la-dulce-tentacion',
      capacidad_diaria: 8,
      users: {
        create: {
          email: 'maria@ladulce.com',
          password_hash: await bcrypt.hash('password123', 10),
          nombre: 'María García',
        },
      },
      products: {
        create: [
          { nombre: 'Torta de fresas', descripcion: 'Torta húmeda con fresas frescas', precio_base: 3200, categoria: 'tortas' },
          { nombre: 'Torta de chocolate', descripcion: 'Tres capas de chocolate belga', precio_base: 3500, categoria: 'tortas' },
          { nombre: 'Cupcakes x12', descripcion: 'Docena personalizable', precio_base: 1800, categoria: 'cupcakes' },
          { nombre: 'Alfajores x24', descripcion: 'Maicena con dulce de leche', precio_base: 2400, categoria: 'alfajores' },
          { nombre: 'Torta 3 pisos', descripcion: 'Para bodas y eventos', precio_base: 12000, categoria: 'tortas' },
          { nombre: 'Brownies mix x10', descripcion: 'Variedad artesanal', precio_base: 1800, categoria: 'masas' },
        ],
      },
      ingredients: {
        create: [
          { nombre: 'Harina 0000', unidad: 'kg', stock_actual: 15, stock_minimo: 3 },
          { nombre: 'Azúcar', unidad: 'kg', stock_actual: 8, stock_minimo: 2 },
          { nombre: 'Chocolate cobertura', unidad: 'kg', stock_actual: 1.5, stock_minimo: 2 },
          { nombre: 'Manteca', unidad: 'kg', stock_actual: 4, stock_minimo: 1 },
          { nombre: 'Huevos', unidad: 'unid', stock_actual: 36, stock_minimo: 12 },
          { nombre: 'Dulce de leche', unidad: 'kg', stock_actual: 0.8, stock_minimo: 1 },
        ],
      },
    },
  })
  console.log(`✅ Seeded: ${shop.nombre} — Login: maria@ladulce.com / password123`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
