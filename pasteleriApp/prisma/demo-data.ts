import { PrismaClient, OrderEstado, PaymentEstado } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const DEMO_TAG = '__demo__'

async function main() {
  const shop = await prisma.shop.findUnique({ where: { slug: 'la-dulce-tentacion' } })
  if (!shop) throw new Error('Corré el seed primero: npx prisma db seed')

  const products = await prisma.product.findMany({ where: { shop_id: shop.id } })
  const byName = (n: string) => products.find(p => p.nombre.startsWith(n))!

  // Borrar datos demo anteriores (idempotente)
  const demoCustomers = await prisma.customer.findMany({ where: { nombre: { contains: DEMO_TAG } } })
  const demoIds = demoCustomers.map(c => c.id)
  if (demoIds.length) {
    const orders = await prisma.order.findMany({ where: { customer_id: { in: demoIds } } })
    const orderIds = orders.map(o => o.id)
    await prisma.payment.deleteMany({ where: { order_id: { in: orderIds } } })
    await prisma.orderItem.deleteMany({ where: { order_id: { in: orderIds } } })
    await prisma.order.deleteMany({ where: { id: { in: orderIds } } })
    await prisma.customer.deleteMany({ where: { id: { in: demoIds } } })
  }

  // Clientes demo
  const clientes = await Promise.all([
    prisma.customer.create({ data: { nombre: `Ana Martínez ${DEMO_TAG}`, email: 'ana.martinez@gmail.com', telefono: '1156781234' } }),
    prisma.customer.create({ data: { nombre: `Carlos López ${DEMO_TAG}`, email: 'carlitos_1988@hotmail.com', telefono: '1145239876' } }),
    prisma.customer.create({ data: { nombre: `Valentina Rodríguez ${DEMO_TAG}`, whatsapp: '5491167894321' } }),
    prisma.customer.create({ data: { nombre: `Diego Fernández ${DEMO_TAG}`, email: 'diegof@empresa.com', telefono: '1133456789' } }),
    prisma.customer.create({ data: { nombre: `Sofía González ${DEMO_TAG}`, email: 'sofi.gonzalez@yahoo.com' } }),
    prisma.customer.create({ data: { nombre: `Martín Suárez ${DEMO_TAG}`, whatsapp: '5491198765432' } }),
  ])
  const [ana, carlos, valentina, diego, sofia, martin] = clientes

  const d = (offsetDays: number) => {
    const date = new Date('2026-06-20')
    date.setDate(date.getDate() + offsetDays)
    return date
  }

  type OrderInput = {
    customer_id: string
    estado: OrderEstado
    fecha_entrega: Date
    notas_cliente?: string
    notas_internas?: string
    items: { product: ReturnType<typeof byName>; cantidad: number; personalizacion?: string; restricciones?: string }[]
    payment?: { estado: PaymentEstado; monto?: number }
    createdAt?: Date
  }

  const ordersToCreate: OrderInput[] = [
    // NUEVO — recién entrados
    {
      customer_id: ana.id, estado: 'NUEVO', fecha_entrega: d(5),
      notas_cliente: 'Es para el cumpleaños de mi hija, que le gustan las fresas',
      items: [
        { product: byName('Torta de fresas'), cantidad: 1, personalizacion: 'Feliz cumple Lucía', restricciones: 'Sin gluten si es posible' },
        { product: byName('Cupcakes'), cantidad: 1 },
      ],
    },
    {
      customer_id: carlos.id, estado: 'NUEVO', fecha_entrega: d(4),
      notas_cliente: 'Para evento corporativo',
      items: [
        { product: byName('Alfajores'), cantidad: 2 },
        { product: byName('Brownies'), cantidad: 1 },
      ],
    },
    // CONFIRMADO
    {
      customer_id: valentina.id, estado: 'CONFIRMADO', fecha_entrega: d(3),
      notas_cliente: 'Boda civil, necesito que sea imponente',
      notas_internas: 'Llamar para confirmar sabores del relleno',
      items: [
        { product: byName('Torta 3 pisos'), cantidad: 1, personalizacion: 'V&M 21/06/2026', restricciones: 'Sin maní' },
      ],
      payment: { estado: 'COMPLETADO' },
    },
    {
      customer_id: diego.id, estado: 'CONFIRMADO', fecha_entrega: d(3),
      items: [
        { product: byName('Torta de chocolate'), cantidad: 1, personalizacion: 'Feliz retiro papá' },
        { product: byName('Alfajores'), cantidad: 1 },
      ],
      payment: { estado: 'COMPLETADO' },
    },
    // EN_PRODUCCION
    {
      customer_id: sofia.id, estado: 'EN_PRODUCCION', fecha_entrega: d(1),
      notas_internas: 'Ya en horno, sacar a las 16hs',
      items: [
        { product: byName('Torta de fresas'), cantidad: 1, personalizacion: 'Happy Birthday Sofi!' },
        { product: byName('Cupcakes'), cantidad: 1, personalizacion: 'Con toppers de unicornio' },
      ],
      payment: { estado: 'COMPLETADO' },
    },
    {
      customer_id: martin.id, estado: 'EN_PRODUCCION', fecha_entrega: d(2),
      items: [
        { product: byName('Brownies'), cantidad: 2 },
      ],
      payment: { estado: 'PENDIENTE' },
    },
    // LISTO — para retirar
    {
      customer_id: ana.id, estado: 'LISTO', fecha_entrega: d(0),
      notas_internas: 'Lista en caja 3, espera retiro',
      items: [
        { product: byName('Cupcakes'), cantidad: 1, personalizacion: 'Sin decoración extra' },
      ],
      payment: { estado: 'COMPLETADO' },
    },
    // ENTREGADO — historial
    {
      customer_id: carlos.id, estado: 'ENTREGADO', fecha_entrega: d(-3),
      items: [
        { product: byName('Torta de chocolate'), cantidad: 1, personalizacion: 'Feliz aniversario' },
      ],
      payment: { estado: 'COMPLETADO' },
      createdAt: d(-6),
    },
    {
      customer_id: valentina.id, estado: 'ENTREGADO', fecha_entrega: d(-5),
      items: [
        { product: byName('Alfajores'), cantidad: 1 },
        { product: byName('Brownies'), cantidad: 1 },
      ],
      payment: { estado: 'COMPLETADO' },
      createdAt: d(-8),
    },
    // CANCELADO
    {
      customer_id: diego.id, estado: 'CANCELADO', fecha_entrega: d(2),
      notas_internas: 'Cliente canceló por cambio de fecha del evento',
      items: [
        { product: byName('Torta 3 pisos'), cantidad: 1 },
      ],
      payment: { estado: 'REEMBOLSADO' },
      createdAt: d(-2),
    },
  ]

  for (const o of ordersToCreate) {
    const total = o.items.reduce((sum, item) => sum + item.product.precio_base * item.cantidad, 0)
    const order = await prisma.order.create({
      data: {
        estado: o.estado,
        canal: o.canal,
        fecha_entrega: o.fecha_entrega,
        notas_cliente: o.notas_cliente,
        notas_internas: o.notas_internas,
        total,
        shop_id: shop.id,
        customer_id: o.customer_id,
        ...(o.createdAt ? { createdAt: o.createdAt } : {}),
        items: {
          create: o.items.map(item => ({
            cantidad: item.cantidad,
            precio_unitario: item.product.precio_base,
            personalizacion: item.personalizacion,
            restricciones: item.restricciones,
            product_id: item.product.id,
          })),
        },
      },
    })

    if (o.payment) {
      await prisma.payment.create({
        data: {
          monto: o.payment.monto ?? total * 0.3,
          estado: o.payment.estado,
          order_id: order.id,
        },
      })
    }
  }

  console.log(`✅ Demo data cargada: ${clientes.length} clientes, ${ordersToCreate.length} pedidos`)
  console.log('   Estados: 2 NUEVO · 2 CONFIRMADO · 2 EN_PRODUCCION · 1 LISTO · 2 ENTREGADO · 1 CANCELADO')
  console.log('   Login: maria@ladulce.com / password123 → http://localhost:3000/dashboard')
}

main().catch(console.error).finally(() => prisma.$disconnect())
