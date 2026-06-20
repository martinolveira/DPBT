# pasteleriApp — Guía de demo

## Seed data

El archivo de seed está en `pasteleriapp/prisma/seed.ts`.  
Los datos se insertan con `npx prisma db seed` y usan `upsert` — si ya existen no los duplica, si los borraste los vuelve a crear.

Para resetear la base completa y volver al estado inicial:

```bash
# Desde pasteleriapp/
npx prisma migrate reset
# Esto borra todo, corre las migraciones y ejecuta el seed automáticamente
```

---

## Login como dueña (panel de gestión)

URL: **http://localhost:3000/login**

| Campo | Valor |
|-------|-------|
| Email | `maria@ladulce.com` |
| Contraseña | `password123` |

Después del login entrás al panel en `/dashboard`. Desde ahí podés ver:

- **Dashboard** — KPIs, entregas del día, pedidos sin confirmar
- **Pedidos** — vista Kanban (por estado) o Lista (tabla). Click en un pedido para ver el detalle y cambiar el estado
- **Catalogo** — los 6 productos del seed, botón para agregar más
- **Insumos** — 6 ingredientes; Chocolate cobertura y Dulce de leche aparecen en alerta amarilla (stock bajo)
- **Clientes** — se puebla solo cuando entran pedidos
- **Configuracion** — nombre de la pastelería y capacidad diaria

---

## Entrar como cliente

URL: **http://localhost:3000/p/la-dulce-tentacion**

No requiere login. El cliente ve el catálogo y puede hacer un pedido.

### Flujo completo

1. Ir a `/p/la-dulce-tentacion`
2. Click en **"Hacer un pedido"**
3. Completar el formulario:
   - Nombre (ej: `Juan Pérez`)
   - Email (opcional)
   - Fecha de entrega (cualquier fecha futura)
   - Seleccionar uno o más productos del dropdown
   - El total se calcula en tiempo real
   - Personalización y restricciones son opcionales
4. Click en **"Confirmar pedido"**
5. Página de confirmación → click en **"Seguir mi pedido"**
6. Tracking en `/seguimiento/<token>` — muestra la línea de tiempo del estado

### Verificar que el pedido llegó al panel

Volver al panel como María → **Pedidos** → columna **"Nuevo"** → debería aparecer el pedido recién creado.

Para confirmarlo: entrar al detalle del pedido → click **"Confirmar"** → el tracking del cliente se actualiza en tiempo real (Socket.io).

---

## Tarjetas de prueba de Stripe

> Stripe solo está activo si configuraste `STRIPE_SECRET_KEY` en `.env.local`. Sin esa variable el pago falla silenciosamente.

Todas las tarjetas usan:
- **Vencimiento:** cualquier fecha futura (ej: `12/34`)
- **CVC:** cualquier 3 dígitos (ej: `123`)
- **Nombre:** cualquier texto

| Número | Resultado |
|--------|-----------|
| `4242 4242 4242 4242` | Pago exitoso |
| `4000 0000 0000 0002` | Tarjeta rechazada |
| `4000 0025 0000 3155` | Requiere autenticación 3D Secure |
| `4000 0000 0000 9995` | Fondos insuficientes |
| `4000 0000 0000 3220` | 3D Secure 2 — siempre autenticado |

La seña que cobra la app es el 30% del total del pedido (mínimo $500).

---

## Estados de un pedido

Los pedidos pasan por estos estados en orden:

```
NUEVO → CONFIRMADO → EN PRODUCCION → LISTO → ENTREGADO
```

Desde cualquier estado se puede pasar a `CANCELADO`.

En el panel, el detalle de cada pedido muestra los botones para avanzar al siguiente estado. El cliente lo ve actualizado en tiempo real en su página de seguimiento.
