import twilio from 'twilio'
import { prisma } from '@/lib/prisma'
import { createOrder } from './order.service'

const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)

type BotEstado = 'START' | 'WAITING_FECHA' | 'WAITING_PRODUCTO' | 'WAITING_PERSONALIZACION' | 'WAITING_RESTRICCIONES' | 'WAITING_CONFIRMACION'

interface DatosParciales {
  fecha?: string
  productoId?: string
  productoNombre?: string
  personalizacion?: string
  restricciones?: string
  precioUnitario?: number
}

async function reply(to: string, body: string) {
  await client.messages.create({ from: process.env.TWILIO_WHATSAPP_NUMBER!, to, body })
}

export async function handleIncomingMessage(from: string, body: string) {
  const shopId = process.env.TWILIO_TARGET_SHOP_ID!
  const msg = body.trim()

  const session = await prisma.waBotSession.upsert({
    where: { whatsapp_number_shop_id: { whatsapp_number: from, shop_id: shopId } },
    update: {},
    create: { whatsapp_number: from, shop_id: shopId, estado: 'START', datos_parciales: {} },
  })

  const estado = session.estado as BotEstado
  const datos = session.datos_parciales as DatosParciales

  async function next(newEstado: BotEstado, newDatos: DatosParciales) {
    await prisma.waBotSession.update({
      where: { id: session.id },
      data: { estado: newEstado, datos_parciales: newDatos as any },
    })
  }

  if (estado === 'START' || msg.toLowerCase().startsWith('hola')) {
    await next('WAITING_FECHA', {})
    return reply(from, '¡Hola! 🎂 ¿Para qué fecha necesitás el pedido? (ej: 20/06/2026)')
  }

  if (estado === 'WAITING_FECHA') {
    const products = await prisma.product.findMany({ where: { shop_id: shopId, activo: true }, take: 5 })
    const lista = products.map((p, i) => `${i + 1}. ${p.nombre} - $${p.precio_base}`).join('\n')
    await next('WAITING_PRODUCTO', { ...datos, fecha: msg })
    return reply(from, `Perfecto, para el ${msg}. ¿Qué querés pedir?\n\n${lista}\n\nRespondé con el número.`)
  }

  if (estado === 'WAITING_PRODUCTO') {
    const products = await prisma.product.findMany({ where: { shop_id: shopId, activo: true }, take: 5 })
    const idx = parseInt(msg) - 1
    if (isNaN(idx) || idx < 0 || idx >= products.length) {
      return reply(from, 'Por favor respondé con el número del producto.')
    }
    const product = products[idx]
    await next('WAITING_PERSONALIZACION', { ...datos, productoId: product.id, productoNombre: product.nombre, precioUnitario: product.precio_base })
    return reply(from, `Excelente, ${product.nombre}. ¿Alguna personalización? o escribí "ninguna"`)
  }

  if (estado === 'WAITING_PERSONALIZACION') {
    await next('WAITING_RESTRICCIONES', { ...datos, personalizacion: msg === 'ninguna' ? undefined : msg })
    return reply(from, '¿Restricciones alimentarias? (sin gluten, sin lactosa, etc.) o "ninguna"')
  }

  if (estado === 'WAITING_RESTRICCIONES') {
    const d = { ...datos, restricciones: msg === 'ninguna' ? undefined : msg }
    await next('WAITING_CONFIRMACION', d)
    return reply(from,
      `Resumen:\n📅 ${d.fecha}\n🎂 ${d.productoNombre}\n✏️ ${d.personalizacion || 'Sin personalización'}\n⚠️ ${d.restricciones || 'Sin restricciones'}\n💰 $${d.precioUnitario}\n\n¿Confirmamos? (si/no)`)
  }

  if (estado === 'WAITING_CONFIRMACION') {
    if (msg.toLowerCase().startsWith('si') || msg.toLowerCase() === 'sí') {
      const [day, month, year] = (datos.fecha || '').split('/').map(Number)
      const order = await createOrder({
        shopId,
        canal: 'WHATSAPP',
        fechaEntrega: new Date(year, month - 1, day),
        customer: { nombre: 'Cliente WhatsApp', whatsapp: from },
        items: [{ productId: datos.productoId!, cantidad: 1, personalizacion: datos.personalizacion, restricciones: datos.restricciones }],
      })
      await prisma.waBotSession.update({ where: { id: session.id }, data: { estado: 'START', datos_parciales: {} } })
      const url = `${process.env.NEXT_PUBLIC_APP_URL}/seguimiento/${order.token}`
      return reply(from, `✅ ¡Pedido registrado! Seguilo aquí:\n${url}\n\n¡Gracias! 🎂`)
    }
    await prisma.waBotSession.update({ where: { id: session.id }, data: { estado: 'START', datos_parciales: {} } })
    return reply(from, 'Pedido cancelado. Escribí "hola" cuando quieras intentar de nuevo.')
  }

  return reply(from, 'Escribí "hola" para hacer un nuevo pedido.')
}
