# pasteleriApp — Diseño del prototipo de alta fidelidad

**Fecha:** 2026-06-09  
**Objetivo:** Prototipo funcional para validación con pastelerías reales y presentación académica  
**Alcance:** SaaS multi-tenant — panel de la emprendedora + portal del cliente + bot de WhatsApp

---

## 1. Contexto y objetivo

pasteleriApp es una plataforma SaaS que centraliza la gestión de pedidos de pastelerías artesanales independientes. Cada pastelería registrada obtiene su propio espacio aislado (tenant), un panel de control interno y un portal público donde sus clientes pueden hacer y seguir pedidos.

El prototipo debe:
- Ser funcional end-to-end (no solo visual)
- Cubrir los dos actores: emprendedora y cliente
- Servir para validación con usuarios reales y presentación académica

---

## 2. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Estilos | Tailwind CSS (tema cálido custom) |
| API | Next.js API Routes (reemplazan Express) |
| Base de datos | PostgreSQL (Docker Compose) |
| ORM | Prisma |
| Auth | JWT en httpOnly cookie + middleware.ts de Next.js |
| Tiempo real | Socket.io con custom server (`server.ts`) |
| Pagos | Stripe (modo test) |
| Bot WhatsApp | Twilio WhatsApp Sandbox |
| Deploy | Railway o Render (custom server, no serverless) |

**Infraestructura local:**
- PostgreSQL corre en Docker Compose — no se usa instalación local
- `docker-compose.yml` en la raíz del proyecto define el servicio `db`
- Un único proyecto Next.js reemplaza los dos proyectos separados (frontend + backend)

---

## 3. Arquitectura general

Un único proyecto Next.js (`pasteleriapp/`). Las API routes en `src/app/api/` manejan la lógica del servidor. Un `server.ts` custom envuelve Next.js para poder correr Socket.io en el mismo proceso.

**Multi-tenancy:**  
Cada pastelería registrada tiene un `shop_id` único. Todas las tablas llevan ese campo como foreign key. Las pastelerías acceden por slug: `pasteleriapp.com/p/:slug` (portal público) y `/dashboard` (panel privado protegido por JWT).

**Rutas principales:**
- `/` — landing de marketing de pasteleriApp
- `/registro` — registro de nueva pastelería (crea Shop + User)
- `/login` — login de la emprendedora
- `/dashboard/*` — panel privado (requiere JWT)
- `/p/:slug` — portal público de la pastelería
- `/p/:slug/pedido` — formulario de pedido
- `/seguimiento/:token` — seguimiento del pedido (sin login)

---

## 4. Modelo de datos

```prisma
model Shop {
  id              String   @id @default(cuid())
  nombre          String
  slug            String   @unique
  logo_url        String?
  capacidad_diaria Int     @default(10)
  createdAt       DateTime @default(now())
  users           User[]
  products        Product[]
  orders          Order[]
  ingredients     Ingredient[]
  waSessions      WaBotSession[]
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  password_hash String
  nombre       String
  shop_id      String
  shop         Shop     @relation(fields: [shop_id], references: [id])
  createdAt    DateTime @default(now())
}

model Customer {
  id           String   @id @default(cuid())
  nombre       String
  email        String?
  telefono     String?
  whatsapp     String?
  orders       Order[]
  createdAt    DateTime @default(now())
}

model Product {
  id          String   @id @default(cuid())
  nombre      String
  descripcion String?
  precio_base Float
  categoria   String
  activo      Boolean  @default(true)
  shop_id     String
  shop        Shop     @relation(fields: [shop_id], references: [id])
  orderItems  OrderItem[]
}

model Order {
  id              String      @id @default(cuid())
  token           String      @unique @default(cuid())
  estado          OrderEstado @default(NUEVO)
  canal           Canal       @default(WEB)
  fecha_entrega   DateTime
  notas_cliente   String?
  notas_internas  String?
  total           Float
  shop_id         String
  customer_id     String
  shop            Shop        @relation(fields: [shop_id], references: [id])
  customer        Customer    @relation(fields: [customer_id], references: [id])
  items           OrderItem[]
  payment         Payment?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model OrderItem {
  id              String   @id @default(cuid())
  cantidad        Int
  precio_unitario Float
  personalizacion String?
  restricciones   String?
  order_id        String
  product_id      String
  order           Order    @relation(fields: [order_id], references: [id])
  product         Product  @relation(fields: [product_id], references: [id])
}

model Payment {
  id                      String        @id @default(cuid())
  monto                   Float
  stripe_payment_intent_id String?      @unique
  estado                  PaymentEstado @default(PENDIENTE)
  order_id                String        @unique
  order                   Order         @relation(fields: [order_id], references: [id])
  createdAt               DateTime      @default(now())
}

model Ingredient {
  id            String  @id @default(cuid())
  nombre        String
  unidad        String
  stock_actual  Float
  stock_minimo  Float
  shop_id       String
  shop          Shop    @relation(fields: [shop_id], references: [id])
}

model WaBotSession {
  id              String   @id @default(cuid())
  whatsapp_number String
  estado          String
  datos_parciales Json
  shop_id         String
  shop            Shop     @relation(fields: [shop_id], references: [id])
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum OrderEstado {
  NUEVO
  CONFIRMADO
  EN_PRODUCCION
  LISTO
  ENTREGADO
  CANCELADO
}

enum Canal {
  WEB
  WHATSAPP
}

enum PaymentEstado {
  PENDIENTE
  COMPLETADO
  FALLIDO
  REEMBOLSADO
}
```

---

## 5. Pantallas del prototipo

### Panel de la emprendedora (`/dashboard`)

| Pantalla | Ruta | Descripción |
|---|---|---|
| Dashboard | `/dashboard` | KPIs del día (pedidos activos, ingresos del mes, entregas hoy, stock bajo), lista de entregas del día, pedidos sin confirmar con botones confirmar/rechazar |
| Pedidos | `/dashboard/pedidos` | Vista flexible con 3 tabs: Kanban (columnas por estado con drag & drop) / Lista (tabla con filtros) / Calendario (carga vs capacidad disponible por día) |
| Detalle de pedido | `/dashboard/pedidos/:id` | Info completa del pedido, cambio de estado manual, notas internas, historial de cambios |
| Catálogo | `/dashboard/catalogo` | CRUD de productos: nombre, precio base, categoría, activar/desactivar |
| Insumos | `/dashboard/insumos` | Lista de ingredientes con stock actual vs mínimo, editar cantidades, badge de alerta cuando stock < mínimo |
| Clientes | `/dashboard/clientes` | Lista de clientes con cantidad de pedidos e historial |
| Configuración | `/dashboard/configuracion` | Nombre del shop, logo, slug, capacidad diaria, reglas de precio |

### Portal del cliente (`/p/:slug`)

| Pantalla | Ruta | Descripción |
|---|---|---|
| Landing | `/p/:slug` | Presentación de la pastelería, catálogo visible, botón "Hacer pedido" |
| Formulario de pedido | `/p/:slug/pedido` | Fecha de entrega, selección de producto, personalización, restricciones alimentarias, presupuesto calculado en tiempo real a medida que completan el form |
| Pago de seña | `/p/:slug/pedido/pago` | Checkout de Stripe (modo test) integrado en el flujo |
| Confirmación | `/p/:slug/pedido/confirmacion` | Resumen del pedido + link de seguimiento |
| Seguimiento | `/seguimiento/:token` | Estado actual con línea de tiempo visual, actualización en tiempo real vía Socket.io |

### Auth / Onboarding

| Pantalla | Ruta | Descripción |
|---|---|---|
| Landing marketing | `/` | Presentación de pasteleriApp, beneficios, CTA de registro |
| Registro | `/registro` | Formulario: nombre de la pastelería, slug, email, contraseña |
| Login | `/login` | Email + contraseña, genera JWT |
| Recuperar contraseña | `/recuperar` | Email → link de reset |

---

## 6. Diseño visual

**Paleta (estilo cálido & artesanal):**
- Fondo base: `#fdf6ec` (crema cálido)
- Sidebar: `#3d2010` / `#5c3a1e` (café oscuro)
- Acento principal: `#c2855a` (terracota/caramelo)
- Texto principal: `#3d2010`
- Texto secundario: `#a0522d`
- Bordes: `#e8d5b7`
- Alertas/avisos: `#fef3c7` / `#f59e0b`
- Éxito: `#d1fae5` / `#10b981`

**Tipografía:** Inter (sans-serif), system stack como fallback  
**Componentes:** Tailwind CSS con clases custom para el tema cálido  
**Navegación:** Sidebar lateral fijo de 200px, siempre visible en el panel de la emprendedora

---

## 7. Flujos clave

### Flujo web — cliente hace un pedido
1. Cliente entra a `/p/:slug`
2. Hace click en "Hacer pedido"
3. Completa formulario → el presupuesto se calcula en vivo (`sum(cantidad * precio_base)` por cada ítem seleccionado)
4. Paga la seña vía Stripe Checkout (modo test)
5. Recibe page de confirmación con link único `/seguimiento/:token`
6. En esa URL ve el estado en tiempo real via Socket.io

### Flujo WhatsApp — bot Twilio Sandbox
1. Cliente escribe al número del sandbox de la pastelería
2. Bot saluda y pregunta: ¿Para qué fecha es tu pedido?
3. Conversación guiada: fecha → producto → personalización → restricciones alimentarias
4. Bot muestra resumen + presupuesto estimado → "¿Confirmamos?"
5. Si el cliente confirma → se crea `Order` + `Customer` en el sistema, canal = WHATSAPP
6. Bot responde con link `/seguimiento/:token`
7. La emprendedora ve el pedido en su panel con badge "WhatsApp"

### Flujo de confirmación — emprendedora
1. Emprendedora ve pedido NUEVO en dashboard o panel de pedidos
2. Revisa los detalles → click en "Confirmar" o "Rechazar"
3. Si confirma: pedido pasa a CONFIRMADO
4. Emprendedora avanza el estado manualmente a lo largo del ciclo de producción
5. Al marcar LISTO: cliente recibe notificación (el estado en `/seguimiento/:token` cambia en tiempo real)

### State machine de pedidos
```
NUEVO → CONFIRMADO → EN_PRODUCCION → LISTO → ENTREGADO
  ↓           ↓             ↓           ↓
CANCELADO  CANCELADO   CANCELADO   CANCELADO
```

---

## 8. Integraciones externas

**Stripe (pagos):**
- Modo test — tarjeta `4242 4242 4242 4242` para demos
- Se crea un `PaymentIntent` por pedido
- Webhook de Stripe actualiza el `Payment.estado` cuando el pago completa

**Twilio WhatsApp Sandbox:**
- En desarrollo todas las pastelerías comparten el número del sandbox de Twilio — el shop se identifica por el número de destino configurado en el mensaje inicial (limitación del sandbox, aceptable para prototipo)
- El backend expone un webhook `POST /webhook/whatsapp` que recibe mensajes de Twilio
- El estado de la conversación se persiste en `WaBotSession` (JSON con los datos parciales recopilados)
- Para el prototipo se usa un único shop_id fijo al configurar las credenciales de Twilio

**Socket.io (tiempo real):**
- El cliente en `/seguimiento/:token` se suscribe a una room por `token`
- Cuando la emprendedora cambia el estado de un pedido, el backend emite un evento a esa room
- El frontend actualiza la UI sin recargar

---

## 9. Infraestructura local (desarrollo)

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: pasteleriapp
      POSTGRES_USER: pasteleri
      POSTGRES_PASSWORD: pasteleri123
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

Variables de entorno del backend (`.env`):
```
DATABASE_URL=postgresql://pasteleri:pasteleri123@localhost:5432/pasteleriapp
JWT_SECRET=...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

---

## 10. Estructura de repositorio

```
pasteleriApp/
├── docker-compose.yml
├── docs/
│   └── superpowers/specs/
└── pasteleriapp/                    # único proyecto Next.js
    ├── server.ts                    # custom server con Socket.io
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── prisma/
    │   └── schema.prisma
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx             # landing marketing
        │   ├── (auth)/login/        # login page
        │   ├── (auth)/registro/     # registro page
        │   ├── dashboard/           # panel emprendedora (protegido)
        │   │   ├── layout.tsx       # sidebar
        │   │   ├── page.tsx         # KPIs
        │   │   ├── pedidos/
        │   │   ├── catalogo/
        │   │   ├── insumos/
        │   │   ├── clientes/
        │   │   └── configuracion/
        │   ├── p/[slug]/            # portal público de la pastelería
        │   │   └── pedido/          # formulario + pago
        │   ├── seguimiento/[token]/ # tracking en tiempo real
        │   └── api/                 # API routes (reemplazan Express)
        │       ├── auth/
        │       ├── orders/
        │       ├── products/
        │       ├── ingredients/
        │       ├── customers/
        │       ├── shop/
        │       └── webhooks/
        ├── middleware.ts            # protección JWT para /dashboard
        ├── lib/
        │   ├── prisma.ts
        │   ├── jwt.ts
        │   └── socket-client.ts
        ├── services/                # lógica de negocio reutilizable
        ├── hooks/
        └── components/
```

---

## 11. Criterios de éxito del prototipo

- [ ] Una pastelería puede registrarse y configurar su shop
- [ ] Un cliente puede hacer un pedido completo vía web (form → pago → seguimiento)
- [ ] Un cliente puede hacer un pedido vía WhatsApp (bot conversacional)
- [ ] La emprendedora puede confirmar/rechazar pedidos desde el dashboard
- [ ] La emprendedora puede avanzar estados de pedido manualmente
- [ ] El cliente ve el cambio de estado en tiempo real en `/seguimiento/:token`
- [ ] El dashboard muestra KPIs, entregas del día y alertas de stock
- [ ] El calendario de producción muestra pedidos vs capacidad disponible
