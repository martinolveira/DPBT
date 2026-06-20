# pasteleriApp — Next.js Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack SaaS prototype for pastelería order management as a single Next.js 14 app: owner dashboard, client portal, real-time order tracking, Stripe test payments, and WhatsApp bot.

**Architecture:** Single Next.js 14 (App Router) project. API routes handle server logic. A custom `server.ts` wraps Next.js to run Socket.io in the same process — the `io` instance is stored on `global.io` so API routes can emit events. JWT stored in httpOnly cookies; Next.js `middleware.ts` protects `/dashboard/*`. PostgreSQL in Docker Compose via Prisma. Stripe test mode, Twilio WhatsApp Sandbox.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Prisma 5, PostgreSQL 16 (Docker), Socket.io 4, bcryptjs, jsonwebtoken, zod, stripe SDK, twilio SDK, Vitest, Supertest

**Important:** Do NOT run `git commit` at any step. Skip all commit steps in the plan.

---

## File Structure

```
pasteleriApp/
├── docker-compose.yml
└── pasteleriapp/
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── server.ts                        # custom server: Next.js + Socket.io
    ├── .env.example
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.ts
    └── src/
        ├── middleware.ts                # JWT protection for /dashboard
        ├── app/
        │   ├── globals.css
        │   ├── layout.tsx
        │   ├── page.tsx                 # marketing landing
        │   ├── (auth)/
        │   │   ├── login/page.tsx
        │   │   └── registro/page.tsx
        │   ├── dashboard/
        │   │   ├── layout.tsx           # Sidebar + auth guard
        │   │   ├── page.tsx             # KPIs dashboard
        │   │   ├── pedidos/
        │   │   │   ├── page.tsx         # Kanban/List/Calendar tabs
        │   │   │   └── [id]/page.tsx    # order detail
        │   │   ├── catalogo/page.tsx
        │   │   ├── insumos/page.tsx
        │   │   ├── clientes/page.tsx
        │   │   └── configuracion/page.tsx
        │   ├── p/
        │   │   └── [slug]/
        │   │       ├── page.tsx         # public portal landing
        │   │       └── pedido/
        │   │           ├── page.tsx     # order form + live quote
        │   │           ├── pago/page.tsx
        │   │           └── confirmacion/page.tsx
        │   ├── seguimiento/
        │   │   └── [token]/page.tsx     # real-time tracking
        │   └── api/
        │       ├── auth/
        │       │   ├── register/route.ts
        │       │   ├── login/route.ts
        │       │   ├── logout/route.ts
        │       │   └── me/route.ts
        │       ├── orders/
        │       │   ├── route.ts         # GET list + POST create
        │       │   ├── dashboard/route.ts
        │       │   ├── tracking/[token]/route.ts   # public, no auth
        │       │   └── [id]/
        │       │       ├── route.ts
        │       │       ├── estado/route.ts
        │       │       └── payment-intent/route.ts
        │       ├── products/
        │       │   ├── route.ts
        │       │   └── [id]/route.ts
        │       ├── ingredients/
        │       │   ├── route.ts
        │       │   └── [id]/route.ts
        │       ├── customers/
        │       │   ├── route.ts
        │       │   └── [id]/orders/route.ts
        │       ├── shop/route.ts
        │       └── webhooks/
        │           ├── stripe/route.ts
        │           └── whatsapp/route.ts
        ├── lib/
        │   ├── prisma.ts
        │   ├── jwt.ts
        │   ├── socket-server.ts         # registerSocketEvents + emitOrderUpdated
        │   └── socket-client.ts         # client-side socket.io singleton
        ├── services/
        │   ├── auth.service.ts
        │   ├── order.service.ts
        │   ├── product.service.ts
        │   ├── ingredient.service.ts
        │   ├── stripe.service.ts
        │   └── whatsapp.service.ts
        ├── hooks/
        │   ├── useAuth.ts
        │   └── useSocket.ts
        └── components/
            ├── ui/
            │   ├── Button.tsx
            │   ├── Badge.tsx
            │   └── StatCard.tsx
            ├── layout/
            │   ├── Sidebar.tsx
            │   └── DashboardLayout.tsx
            └── orders/
                ├── KanbanBoard.tsx
                ├── OrdersTable.tsx
                └── OrderCard.tsx
```

---

### Task 1: Docker Compose + Next.js project scaffold

**Files:**
- Create: `pasteleriApp/docker-compose.yml`
- Create: `pasteleriApp/pasteleriapp/package.json` (via `create-next-app`)
- Create: `pasteleriApp/pasteleriapp/server.ts`
- Create: `pasteleriApp/pasteleriapp/.env.example`
- Create: `pasteleriApp/pasteleriapp/tailwind.config.ts` (update warm theme)

- [ ] **Step 1: Create `docker-compose.yml` at repo root**

```yaml
# pasteleriApp/docker-compose.yml
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
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U pasteleri -d pasteleriapp"]
      interval: 5s
      retries: 5

volumes:
  pgdata:
```

- [ ] **Step 2: Start Docker**

```bash
cd pasteleriApp
docker compose up -d
docker compose ps
```

Expected: `db` shows `healthy`.

- [ ] **Step 3: Scaffold Next.js app**

```bash
cd pasteleriApp
npx create-next-app@latest pasteleriapp \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --no-turbopack \
  --import-alias "@/*"
cd pasteleriapp
```

- [ ] **Step 4: Install additional dependencies**

```bash
npm install socket.io socket.io-client bcryptjs jsonwebtoken zod stripe twilio @prisma/client
npm install -D prisma @types/bcryptjs @types/jsonwebtoken vitest @vitejs/plugin-react supertest @types/supertest ts-node
```

- [ ] **Step 5: Create custom server `server.ts` at project root (next to `package.json`)**

```typescript
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server } from 'socket.io'
import { registerSocketEvents } from './src/lib/socket-server'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000')

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(httpServer, {
    cors: { origin: `http://localhost:${port}` },
  })

  // Store on global so API routes can emit events
  ;(global as any)._io = io

  registerSocketEvents(io)

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
```

- [ ] **Step 6: Create `src/lib/socket-server.ts`**

```typescript
import { Server } from 'socket.io'

export function registerSocketEvents(io: Server) {
  io.on('connection', (socket) => {
    socket.on('join:order', (token: string) => socket.join(`order:${token}`))
    socket.on('leave:order', (token: string) => socket.leave(`order:${token}`))
  })
}

export function emitOrderUpdated(token: string, estado: string) {
  const io: Server | undefined = (global as any)._io
  io?.to(`order:${token}`).emit('order:updated', { token, estado })
}
```

- [ ] **Step 7: Update `package.json` scripts**

```json
{
  "scripts": {
    "dev": "ts-node --project tsconfig.server.json server.ts",
    "build": "next build",
    "start": "NODE_ENV=production ts-node --project tsconfig.server.json server.ts",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 8: Create `tsconfig.server.json` for ts-node (server.ts uses CommonJS)**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "node"
  },
  "include": ["server.ts", "src/lib/socket-server.ts"]
}
```

- [ ] **Step 9: Create `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['src/test-setup.ts'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 10: Create `.env.example`**

```
DATABASE_URL=postgresql://pasteleri:pasteleri123@localhost:5432/pasteleriapp
TEST_DATABASE_URL=postgresql://pasteleri:pasteleri123@localhost:5432/pasteleriapp_test
JWT_SECRET=change-me-in-production-use-long-random-string
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
TWILIO_TARGET_SHOP_ID=shop-id-for-whatsapp-prototype
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORT=3000
```

Copy to `.env.local` and fill values.

- [ ] **Step 11: Update Tailwind with warm theme in `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        warm: {
          50:  '#fdf6ec',
          100: '#f5e6d3',
          200: '#e8d5b7',
          300: '#d4b896',
          400: '#c2855a',
          500: '#a0522d',
          600: '#7c4a1e',
          700: '#5c3a1e',
          800: '#3d2010',
          900: '#1e0f05',
        },
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 12: Verify dev server starts**

```bash
cp .env.example .env.local
# Fill JWT_SECRET with any string
npm run dev
```

Expected: "Ready on http://localhost:3000", Next.js default page loads.

---

### Task 2: Prisma schema + migrations

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`
- Create: `src/test-setup.ts`

- [ ] **Step 1: Initialize Prisma**

```bash
cd pasteleriApp/pasteleriapp
npx prisma init --datasource-provider postgresql
```

- [ ] **Step 2: Write full schema — replace `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Shop {
  id               String         @id @default(cuid())
  nombre           String
  slug             String         @unique
  logo_url         String?
  capacidad_diaria Int            @default(10)
  createdAt        DateTime       @default(now())
  users            User[]
  products         Product[]
  orders           Order[]
  ingredients      Ingredient[]
  waSessions       WaBotSession[]
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password_hash String
  nombre        String
  shop_id       String
  shop          Shop     @relation(fields: [shop_id], references: [id])
  createdAt     DateTime @default(now())
}

model Customer {
  id        String   @id @default(cuid())
  nombre    String
  email     String?
  telefono  String?
  whatsapp  String?
  orders    Order[]
  createdAt DateTime @default(now())
}

model Product {
  id          String      @id @default(cuid())
  nombre      String
  descripcion String?
  precio_base Float
  categoria   String
  activo      Boolean     @default(true)
  shop_id     String
  shop        Shop        @relation(fields: [shop_id], references: [id])
  orderItems  OrderItem[]
}

model Order {
  id             String      @id @default(cuid())
  token          String      @unique @default(cuid())
  estado         OrderEstado @default(NUEVO)
  canal          Canal       @default(WEB)
  fecha_entrega  DateTime
  notas_cliente  String?
  notas_internas String?
  total          Float
  shop_id        String
  customer_id    String
  shop           Shop        @relation(fields: [shop_id], references: [id])
  customer       Customer    @relation(fields: [customer_id], references: [id])
  items          OrderItem[]
  payment        Payment?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
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
  id                       String        @id @default(cuid())
  monto                    Float
  stripe_payment_intent_id String?       @unique
  estado                   PaymentEstado @default(PENDIENTE)
  order_id                 String        @unique
  order                    Order         @relation(fields: [order_id], references: [id])
  createdAt                DateTime      @default(now())
}

model Ingredient {
  id           String @id @default(cuid())
  nombre       String
  unidad       String
  stock_actual Float
  stock_minimo Float
  shop_id      String
  shop         Shop   @relation(fields: [shop_id], references: [id])
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

  @@unique([whatsapp_number, shop_id])
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

- [ ] **Step 3: Run migration**

```bash
npx prisma migrate dev --name init
```

Expected: migration applied, Prisma Client generated.

- [ ] **Step 4: Create test database**

```bash
docker exec -it pasteleriapp-db-1 psql -U pasteleri -c "CREATE DATABASE pasteleriapp_test;"
DATABASE_URL=$TEST_DATABASE_URL npx prisma migrate deploy
```

- [ ] **Step 5: Create `src/lib/prisma.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

if (process.env.NODE_ENV === 'test' && process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 6: Create `src/lib/jwt.ts`**

```typescript
import jwt from 'jsonwebtoken'

export interface JwtPayload {
  userId: string
  shopId: string
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
}
```

- [ ] **Step 7: Create `src/test-setup.ts`**

```typescript
import { prisma } from '@/lib/prisma'
import { afterAll, beforeEach } from 'vitest'

beforeEach(async () => {
  await prisma.payment.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.waBotSession.deleteMany()
  await prisma.ingredient.deleteMany()
  await prisma.product.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()
  await prisma.shop.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})
```

- [ ] **Step 8: Run empty test suite to verify setup**

```bash
NODE_ENV=test npm test
```

Expected: "No test files found" or 0 tests — no errors.

---

### Task 3: Auth service + API routes (TDD)

**Files:**
- Create: `src/services/auth.service.ts`
- Create: `src/services/__tests__/auth.service.test.ts`
- Create: `src/app/api/auth/register/route.ts`
- Create: `src/app/api/auth/login/route.ts`
- Create: `src/app/api/auth/logout/route.ts`
- Create: `src/app/api/auth/me/route.ts`
- Create: `src/middleware.ts`

- [ ] **Step 1: Write failing tests**

Create `src/services/__tests__/auth.service.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { registerShop, loginUser } from '../auth.service'

describe('auth.service', () => {
  describe('registerShop', () => {
    it('creates shop and user, returns token', async () => {
      const result = await registerShop({
        shopNombre: 'La Dulce Tentación',
        slug: 'la-dulce-tentacion',
        email: 'maria@test.com',
        password: 'password123',
        nombre: 'María García',
      })
      expect(result.token).toBeDefined()
      expect(result.shop.slug).toBe('la-dulce-tentacion')
      expect(result.user.email).toBe('maria@test.com')
    })

    it('throws if slug already taken', async () => {
      await registerShop({ shopNombre: 'A', slug: 'dup', email: 'a@test.com', password: 'pass', nombre: 'A' })
      await expect(
        registerShop({ shopNombre: 'B', slug: 'dup', email: 'b@test.com', password: 'pass', nombre: 'B' })
      ).rejects.toThrow('slug already taken')
    })
  })

  describe('loginUser', () => {
    it('returns token for valid credentials', async () => {
      await registerShop({ shopNombre: 'T', slug: 'test', email: 'login@test.com', password: 'mypass', nombre: 'T' })
      const result = await loginUser('login@test.com', 'mypass')
      expect(result.token).toBeDefined()
    })

    it('throws for wrong password', async () => {
      await registerShop({ shopNombre: 'T', slug: 'test2', email: 'l2@test.com', password: 'correct', nombre: 'T' })
      await expect(loginUser('l2@test.com', 'wrong')).rejects.toThrow('Invalid credentials')
    })

    it('throws for unknown email', async () => {
      await expect(loginUser('ghost@test.com', 'pass')).rejects.toThrow('Invalid credentials')
    })
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
NODE_ENV=test npm test
```

Expected: FAIL — `registerShop` not defined.

- [ ] **Step 3: Implement `src/services/auth.service.ts`**

```typescript
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
```

- [ ] **Step 4: Run tests — confirm pass**

```bash
NODE_ENV=test npm test
```

Expected: 5 tests pass.

- [ ] **Step 5: Create `src/app/api/auth/register/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { registerShop } from '@/services/auth.service'

const schema = z.object({
  shopNombre: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  email: z.string().email(),
  password: z.string().min(6),
  nombre: z.string().min(2),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  try {
    const result = await registerShop(parsed.data)
    const response = NextResponse.json({ shop: result.shop, user: result.user }, { status: 201 })
    response.cookies.set('token', result.token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 })
    return response
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
```

- [ ] **Step 6: Create `src/app/api/auth/login/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { loginUser } from '@/services/auth.service'

const schema = z.object({ email: z.string().email(), password: z.string() })

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  try {
    const result = await loginUser(parsed.data.email, parsed.data.password)
    const response = NextResponse.json({ shop: result.shop, user: result.user })
    response.cookies.set('token', result.token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 })
    return response
  } catch {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }
}
```

- [ ] **Step 7: Create `src/app/api/auth/logout/route.ts`**

```typescript
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('token')
  return response
}
```

- [ ] **Step 8: Create `src/app/api/auth/me/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const payload = verifyToken(token)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { shop: true },
    })
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}
```

- [ ] **Step 9: Create `src/middleware.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    verifyToken(token)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
```

- [ ] **Step 10: Test auth endpoints manually**

```bash
npm run dev
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"shopNombre":"Test","slug":"test","email":"t@t.com","password":"pass123","nombre":"T"}' \
  -c cookies.txt
# Check cookie set
cat cookies.txt
```

Expected: 201 response with shop data and `token` cookie set.

---

### Task 4: Products + Ingredients + Customers APIs (TDD)

**Files:**
- Create: `src/services/product.service.ts` + `__tests__/product.service.test.ts`
- Create: `src/services/ingredient.service.ts` + `__tests__/ingredient.service.test.ts`
- Create: `src/app/api/products/route.ts` + `[id]/route.ts`
- Create: `src/app/api/ingredients/route.ts` + `[id]/route.ts`
- Create: `src/app/api/customers/route.ts` + `[id]/orders/route.ts`
- Create: `src/app/api/shop/route.ts`
- Create: `src/lib/api-helpers.ts`

- [ ] **Step 1: Create `src/lib/api-helpers.ts` — shared auth extraction for API routes**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, JwtPayload } from './jwt'

export function getAuthPayload(req: NextRequest): JwtPayload | null {
  const token = req.cookies.get('token')?.value
  if (!token) return null
  try {
    return verifyToken(token)
  } catch {
    return null
  }
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

- [ ] **Step 2: Write failing product service tests**

Create `src/services/__tests__/product.service.test.ts`:

```typescript
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
```

- [ ] **Step 3: Implement `src/services/product.service.ts`**

```typescript
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
```

- [ ] **Step 4: Write failing ingredient tests**

Create `src/services/__tests__/ingredient.service.test.ts`:

```typescript
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
```

- [ ] **Step 5: Implement `src/services/ingredient.service.ts`**

```typescript
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
```

- [ ] **Step 6: Run all tests**

```bash
NODE_ENV=test npm test
```

Expected: 9+ tests pass.

- [ ] **Step 7: Create `src/app/api/products/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthPayload, unauthorized } from '@/lib/api-helpers'
import { createProduct, listProducts } from '@/services/product.service'

const schema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  precio_base: z.number().positive(),
  categoria: z.string().min(1),
})

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  return NextResponse.json(await listProducts(auth.shopId))
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  return NextResponse.json(await createProduct(auth.shopId, parsed.data), { status: 201 })
}
```

- [ ] **Step 8: Create `src/app/api/products/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthPayload, unauthorized } from '@/lib/api-helpers'
import { updateProduct, deleteProduct } from '@/services/product.service'

const schema = z.object({
  nombre: z.string().min(1).optional(),
  descripcion: z.string().optional(),
  precio_base: z.number().positive().optional(),
  categoria: z.string().min(1).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  try {
    return NextResponse.json(await updateProduct(auth.shopId, params.id, parsed.data))
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  await deleteProduct(auth.shopId, params.id)
  return new NextResponse(null, { status: 204 })
}
```

- [ ] **Step 9: Create ingredients and customers API routes following the same pattern**

`src/app/api/ingredients/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthPayload, unauthorized } from '@/lib/api-helpers'
import { createIngredient, listIngredients, getLowStock } from '@/services/ingredient.service'

const schema = z.object({
  nombre: z.string().min(1),
  unidad: z.string().min(1),
  stock_actual: z.number().min(0),
  stock_minimo: z.number().min(0),
})

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const { searchParams } = new URL(req.url)
  if (searchParams.get('low') === 'true') {
    return NextResponse.json(await getLowStock(auth.shopId))
  }
  return NextResponse.json(await listIngredients(auth.shopId))
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  return NextResponse.json(await createIngredient(auth.shopId, parsed.data), { status: 201 })
}
```

`src/app/api/ingredients/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthPayload, unauthorized } from '@/lib/api-helpers'
import { updateIngredient } from '@/services/ingredient.service'

const schema = z.object({
  nombre: z.string().optional(),
  unidad: z.string().optional(),
  stock_actual: z.number().min(0).optional(),
  stock_minimo: z.number().min(0).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  return NextResponse.json(await updateIngredient(auth.shopId, params.id, parsed.data))
}
```

`src/app/api/customers/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthPayload, unauthorized } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const customers = await prisma.customer.findMany({
    where: { orders: { some: { shop_id: auth.shopId } } },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(customers)
}
```

`src/app/api/customers/[id]/orders/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthPayload, unauthorized } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const orders = await prisma.order.findMany({
    where: { customer_id: params.id, shop_id: auth.shopId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(orders)
}
```

`src/app/api/shop/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthPayload, unauthorized } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  nombre: z.string().min(2).optional(),
  logo_url: z.string().url().optional(),
  capacidad_diaria: z.number().int().positive().optional(),
})

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  return NextResponse.json(await prisma.shop.findUnique({ where: { id: auth.shopId } }))
}

export async function PATCH(req: NextRequest) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  return NextResponse.json(await prisma.shop.update({ where: { id: auth.shopId }, data: parsed.data }))
}
```

---

### Task 5: Order service + API routes (TDD)

**Files:**
- Create: `src/services/order.service.ts` + `__tests__/order.service.test.ts`
- Create: `src/app/api/orders/route.ts`
- Create: `src/app/api/orders/dashboard/route.ts`
- Create: `src/app/api/orders/tracking/[token]/route.ts`
- Create: `src/app/api/orders/[id]/route.ts`
- Create: `src/app/api/orders/[id]/estado/route.ts`
- Create: `src/app/api/orders/[id]/payment-intent/route.ts`

- [ ] **Step 1: Write failing tests**

Create `src/services/__tests__/order.service.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'
import { createOrder, getOrderByToken, transitionState } from '../order.service'

let shopId: string
let productId: string

beforeEach(async () => {
  const shop = await prisma.shop.create({ data: { nombre: 'T', slug: `o-${Date.now()}` } })
  shopId = shop.id
  const product = await prisma.product.create({
    data: { nombre: 'Torta', precio_base: 3000, categoria: 'tortas', shop_id: shopId },
  })
  productId = product.id
})

describe('createOrder', () => {
  it('creates order with calculated total', async () => {
    const order = await createOrder({
      shopId,
      canal: 'WEB',
      fechaEntrega: new Date('2026-06-20'),
      customer: { nombre: 'Ana', email: 'ana@test.com' },
      items: [{ productId, cantidad: 2 }],
    })
    expect(order.total).toBe(6000)
    expect(order.estado).toBe('NUEVO')
    expect(order.token).toBeDefined()
  })
})

describe('getOrderByToken', () => {
  it('returns null for unknown token', async () => {
    expect(await getOrderByToken('nope')).toBeNull()
  })

  it('returns order with relations', async () => {
    const created = await createOrder({
      shopId, canal: 'WEB', fechaEntrega: new Date('2026-06-20'),
      customer: { nombre: 'Luis' }, items: [{ productId, cantidad: 1 }],
    })
    const found = await getOrderByToken(created.token)
    expect(found?.customer.nombre).toBe('Luis')
    expect(found?.items).toHaveLength(1)
  })
})

describe('transitionState', () => {
  it('NUEVO → CONFIRMADO succeeds', async () => {
    const order = await createOrder({
      shopId, canal: 'WEB', fechaEntrega: new Date('2026-06-20'),
      customer: { nombre: 'X' }, items: [{ productId, cantidad: 1 }],
    })
    const updated = await transitionState(shopId, order.id, 'CONFIRMADO')
    expect(updated.estado).toBe('CONFIRMADO')
  })

  it('NUEVO → ENTREGADO throws', async () => {
    const order = await createOrder({
      shopId, canal: 'WEB', fechaEntrega: new Date('2026-06-20'),
      customer: { nombre: 'Y' }, items: [{ productId, cantidad: 1 }],
    })
    await expect(transitionState(shopId, order.id, 'ENTREGADO')).rejects.toThrow('Invalid transition')
  })

  it('can cancel from any non-terminal state', async () => {
    const order = await createOrder({
      shopId, canal: 'WEB', fechaEntrega: new Date('2026-06-20'),
      customer: { nombre: 'Z' }, items: [{ productId, cantidad: 1 }],
    })
    const cancelled = await transitionState(shopId, order.id, 'CANCELADO')
    expect(cancelled.estado).toBe('CANCELADO')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
NODE_ENV=test npm test src/services/__tests__/order.service.test.ts
```

- [ ] **Step 3: Implement `src/services/order.service.ts`**

```typescript
import { OrderEstado, Canal } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const TRANSITIONS: Record<OrderEstado, OrderEstado[]> = {
  NUEVO:         ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO:    ['EN_PRODUCCION', 'CANCELADO'],
  EN_PRODUCCION: ['LISTO', 'CANCELADO'],
  LISTO:         ['ENTREGADO', 'CANCELADO'],
  ENTREGADO:     [],
  CANCELADO:     [],
}

interface CreateOrderInput {
  shopId: string
  canal: Canal
  fechaEntrega: Date
  notasCliente?: string
  customer: { nombre: string; email?: string; telefono?: string; whatsapp?: string }
  items: { productId: string; cantidad: number; personalizacion?: string; restricciones?: string }[]
}

export async function createOrder(input: CreateOrderInput) {
  const products = await prisma.product.findMany({
    where: { id: { in: input.items.map(i => i.productId) }, shop_id: input.shopId },
  })
  if (products.length !== input.items.length) throw new Error('Some products not found')

  const priceMap = new Map(products.map(p => [p.id, p.precio_base]))
  const total = input.items.reduce((sum, item) => sum + priceMap.get(item.productId)! * item.cantidad, 0)
  const customer = await prisma.customer.create({ data: input.customer })

  return prisma.order.create({
    data: {
      shop_id: input.shopId,
      customer_id: customer.id,
      canal: input.canal,
      fecha_entrega: input.fechaEntrega,
      notas_cliente: input.notasCliente,
      total,
      items: {
        create: input.items.map(item => ({
          product_id: item.productId,
          cantidad: item.cantidad,
          precio_unitario: priceMap.get(item.productId)!,
          personalizacion: item.personalizacion,
          restricciones: item.restricciones,
        })),
      },
    },
    include: { items: { include: { product: true } }, customer: true },
  })
}

export async function getOrderByToken(token: string) {
  return prisma.order.findUnique({
    where: { token },
    include: { items: { include: { product: true } }, customer: true, payment: true },
  })
}

export async function transitionState(shopId: string, orderId: string, nextState: OrderEstado) {
  const order = await prisma.order.findUnique({ where: { id: orderId, shop_id: shopId } })
  if (!order) throw new Error('Order not found')

  if (!TRANSITIONS[order.estado].includes(nextState)) {
    throw new Error(`Invalid transition: ${order.estado} → ${nextState}`)
  }

  return prisma.order.update({ where: { id: orderId }, data: { estado: nextState } })
}

export async function listOrders(shopId: string, estado?: OrderEstado) {
  return prisma.order.findMany({
    where: { shop_id: shopId, ...(estado ? { estado } : {}) },
    include: { customer: true, items: true, payment: true },
    orderBy: { fecha_entrega: 'asc' },
  })
}

export async function getDashboardStats(shopId: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const [activeOrders, todayDeliveries, unconfirmed, revenueResult, allIngredients] = await Promise.all([
    prisma.order.count({ where: { shop_id: shopId, estado: { notIn: ['ENTREGADO', 'CANCELADO'] } } }),
    prisma.order.findMany({
      where: { shop_id: shopId, fecha_entrega: { gte: today, lt: tomorrow }, estado: { notIn: ['CANCELADO'] } },
      include: { customer: true },
    }),
    prisma.order.findMany({
      where: { shop_id: shopId, estado: 'NUEVO' },
      include: { customer: true, items: { include: { product: true } } },
      take: 10,
    }),
    prisma.order.aggregate({
      where: { shop_id: shopId, createdAt: { gte: monthStart } },
      _sum: { total: true },
    }),
    prisma.ingredient.findMany({ where: { shop_id: shopId } }),
  ])

  return {
    activeOrders,
    todayDeliveries,
    unconfirmed,
    monthRevenue: revenueResult._sum.total ?? 0,
    lowStock: allIngredients.filter(i => i.stock_actual <= i.stock_minimo),
  }
}
```

- [ ] **Step 4: Run tests — confirm pass**

```bash
NODE_ENV=test npm test
```

Expected: all tests pass.

- [ ] **Step 5: Create order API routes**

`src/app/api/orders/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthPayload, unauthorized } from '@/lib/api-helpers'
import { createOrder, listOrders } from '@/services/order.service'
import { OrderEstado } from '@prisma/client'

const createSchema = z.object({
  fechaEntrega: z.string().datetime(),
  notasCliente: z.string().optional(),
  canal: z.enum(['WEB', 'WHATSAPP']).default('WEB'),
  customer: z.object({
    nombre: z.string().min(1),
    email: z.string().email().optional(),
    telefono: z.string().optional(),
  }),
  items: z.array(z.object({
    productId: z.string(),
    cantidad: z.number().int().positive(),
    personalizacion: z.string().optional(),
    restricciones: z.string().optional(),
  })).min(1),
})

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const estado = new URL(req.url).searchParams.get('estado') as OrderEstado | null
  return NextResponse.json(await listOrders(auth.shopId, estado ?? undefined))
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const parsed = createSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  try {
    const order = await createOrder({
      shopId: auth.shopId,
      ...parsed.data,
      fechaEntrega: new Date(parsed.data.fechaEntrega),
    })
    return NextResponse.json(order, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
```

`src/app/api/orders/dashboard/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthPayload, unauthorized } from '@/lib/api-helpers'
import { getDashboardStats } from '@/services/order.service'

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  return NextResponse.json(await getDashboardStats(auth.shopId))
}
```

`src/app/api/orders/tracking/[token]/route.ts` (public — no auth):

```typescript
import { NextResponse } from 'next/server'
import { getOrderByToken } from '@/services/order.service'

export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const order = await getOrderByToken(params.token)
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}
```

`src/app/api/orders/[id]/estado/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { OrderEstado } from '@prisma/client'
import { getAuthPayload, unauthorized } from '@/lib/api-helpers'
import { transitionState } from '@/services/order.service'
import { emitOrderUpdated } from '@/lib/socket-server'

const schema = z.object({ estado: z.nativeEnum(OrderEstado) })

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid estado' }, { status: 400 })
  try {
    const order = await transitionState(auth.shopId, params.id, parsed.data.estado)
    emitOrderUpdated(order.token, order.estado)
    return NextResponse.json(order)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
```

`src/app/api/orders/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthPayload, unauthorized } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const order = await prisma.order.findUnique({
    where: { id: params.id, shop_id: auth.shopId },
    include: { customer: true, items: { include: { product: true } }, payment: true },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(order)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  const { notas_internas } = await req.json()
  const order = await prisma.order.update({
    where: { id: params.id, shop_id: auth.shopId },
    data: { notas_internas },
  })
  return NextResponse.json(order)
}
```

---

### Task 6: Stripe + WhatsApp bot

**Files:**
- Create: `src/services/stripe.service.ts`
- Create: `src/services/whatsapp.service.ts`
- Create: `src/app/api/orders/[id]/payment-intent/route.ts`
- Create: `src/app/api/webhooks/stripe/route.ts`
- Create: `src/app/api/webhooks/whatsapp/route.ts`

- [ ] **Step 1: Create `src/services/stripe.service.ts`**

```typescript
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

export async function createPaymentIntent(orderId: string, shopId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId, shop_id: shopId } })
  if (!order) throw new Error('Order not found')

  const sena = Math.max(Math.round(order.total * 0.3), 500)
  const intent = await stripe.paymentIntents.create({
    amount: sena * 100,
    currency: 'ars',
    metadata: { orderId, shopId },
  })

  await prisma.payment.create({
    data: { order_id: orderId, monto: sena, stripe_payment_intent_id: intent.id },
  })

  return { clientSecret: intent.client_secret, amount: sena }
}
```

- [ ] **Step 2: Create `src/app/api/orders/[id]/payment-intent/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthPayload, unauthorized } from '@/lib/api-helpers'
import { createPaymentIntent } from '@/services/stripe.service'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthPayload(req)
  if (!auth) return unauthorized()
  try {
    return NextResponse.json(await createPaymentIntent(params.id, auth.shopId))
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
```

- [ ] **Step 3: Create `src/app/api/webhooks/stripe/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/services/stripe.service'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent
    await prisma.payment.updateMany({
      where: { stripe_payment_intent_id: intent.id },
      data: { estado: 'COMPLETADO' },
    })
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object as Stripe.PaymentIntent
    await prisma.payment.updateMany({
      where: { stripe_payment_intent_id: intent.id },
      data: { estado: 'FALLIDO' },
    })
  }

  return NextResponse.json({ received: true })
}
```

- [ ] **Step 4: Create `src/services/whatsapp.service.ts`**

```typescript
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
      data: { estado: newEstado, datos_parciales: newDatos },
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
    return reply(from, `Excelente, ${product.nombre}. ¿Alguna personalización o escribí "ninguna"?`)
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
```

- [ ] **Step 5: Create `src/app/api/webhooks/whatsapp/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { handleIncomingMessage } from '@/services/whatsapp.service'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const from = formData.get('From') as string
  const body = formData.get('Body') as string
  if (!from || !body) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  try {
    await handleIncomingMessage(from, body)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('WhatsApp webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

- [ ] **Step 6: Run all tests**

```bash
NODE_ENV=test npm test
```

Expected: all tests pass.

---

### Task 7: Seed data

**Files:**
- Create: `prisma/seed.ts`

- [ ] **Step 1: Create `prisma/seed.ts`**

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

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
```

- [ ] **Step 2: Add seed script to `package.json`**

```json
{
  "prisma": {
    "seed": "ts-node --project tsconfig.server.json prisma/seed.ts"
  }
}
```

- [ ] **Step 3: Run seed**

```bash
npx prisma db seed
```

Expected: "✅ Seeded: La Dulce Tentación"

- [ ] **Step 4: Final backend verification**

```bash
npm run dev
# In another terminal:
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@ladulce.com","password":"password123"}' \
  -c cookies.txt

curl http://localhost:3000/api/products -b cookies.txt
curl http://localhost:3000/api/orders/dashboard -b cookies.txt
```

Expected: products returns 6 items, dashboard returns stats.

---

## Post-backend checklist

Before moving to the Owner Dashboard (Plan 2), verify:

- [ ] `docker compose up -d` starts postgres
- [ ] `npm run dev` starts Next.js on port 3000
- [ ] `/api/auth/register` creates shop + sets cookie
- [ ] `/api/auth/login` with seed credentials returns shop data
- [ ] `/api/products` (authenticated) returns product list
- [ ] `/api/orders/dashboard` returns KPIs
- [ ] All tests pass: `NODE_ENV=test npm test`
