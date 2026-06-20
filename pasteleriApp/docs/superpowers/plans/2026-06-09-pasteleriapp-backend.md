# pasteleriApp — Backend Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete Express + TypeScript backend: Docker/PostgreSQL setup, Prisma schema, auth (JWT), all REST APIs, Socket.io real-time, Stripe payments, and Twilio WhatsApp webhook.

**Architecture:** Single Express app with Prisma ORM connecting to PostgreSQL in Docker. JWT middleware protects owner routes. All shop-scoped queries filter by `shopId` from the JWT payload. Socket.io attaches to the same HTTP server and emits `order:updated` events to per-order rooms. Stripe webhooks update payment state. Twilio webhook drives a stateful WhatsApp bot persisted in `WaBotSession`.

**Tech Stack:** Node.js 20, Express 4, TypeScript 5, Prisma 5, PostgreSQL 16 (Docker), Socket.io 4, bcryptjs, jsonwebtoken, zod, stripe SDK, twilio SDK, Vitest, Supertest

---

## File Structure

```
pasteleriApp/
├── docker-compose.yml
└── pasteleriapp-backend/
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    ├── prisma/
    │   └── schema.prisma
    └── src/
        ├── index.ts                    # HTTP server + Socket.io
        ├── app.ts                      # Express app + middleware
        ├── config.ts                   # env vars (validated at startup)
        ├── lib/
        │   ├── prisma.ts               # Prisma client singleton
        │   └── jwt.ts                  # sign / verify helpers
        ├── middlewares/
        │   ├── auth.middleware.ts      # JWT → req.shopId
        │   └── validate.middleware.ts  # Zod body validation
        ├── services/
        │   ├── auth.service.ts         # register, login
        │   ├── order.service.ts        # create, quote, state machine
        │   ├── product.service.ts      # CRUD
        │   ├── ingredient.service.ts   # CRUD + low-stock query
        │   ├── stripe.service.ts       # PaymentIntent + webhook handler
        │   └── whatsapp.service.ts     # bot state machine
        ├── routes/
        │   ├── index.ts                # mount all routers
        │   ├── auth.routes.ts
        │   ├── orders.routes.ts        # owner CRUD + public tracking
        │   ├── products.routes.ts
        │   ├── customers.routes.ts
        │   ├── ingredients.routes.ts
        │   └── webhooks/
        │       ├── stripe.webhook.ts
        │       └── whatsapp.webhook.ts
        └── socket/
            └── events.ts               # room management + emit helpers
```

**Test files mirror src:**
```
pasteleriapp-backend/
└── src/
    ├── services/__tests__/
    │   ├── auth.service.test.ts
    │   ├── order.service.test.ts
    │   └── ingredient.service.test.ts
    └── routes/__tests__/
        ├── auth.routes.test.ts
        └── orders.routes.test.ts
```

---

### Task 1: Docker Compose + project scaffold

**Files:**
- Create: `pasteleriApp/docker-compose.yml`
- Create: `pasteleriApp/pasteleriapp-backend/package.json`
- Create: `pasteleriApp/pasteleriapp-backend/tsconfig.json`
- Create: `pasteleriApp/pasteleriapp-backend/.env.example`

- [ ] **Step 1: Create docker-compose.yml at the repo root**

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

- [ ] **Step 2: Start Docker and verify postgres is running**

```bash
cd pasteleriApp
docker compose up -d
docker compose ps
```

Expected: `db` service shows `healthy`.

- [ ] **Step 3: Create backend project**

```bash
mkdir pasteleriapp-backend && cd pasteleriapp-backend
npm init -y
```

- [ ] **Step 4: Install dependencies**

```bash
npm install express cors helmet zod bcryptjs jsonwebtoken stripe twilio socket.io
npm install @prisma/client
npm install -D typescript @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken ts-node-dev vitest supertest @types/supertest prisma
```

- [ ] **Step 5: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src"]
}
```

- [ ] **Step 6: Add scripts to package.json**

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 7: Create .env.example**

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
PORT=3001
```

Copy to `.env` and fill in real values (Stripe test keys, Twilio sandbox credentials).

- [ ] **Step 8: Commit**

```bash
cd pasteleriApp
git add docker-compose.yml pasteleriapp-backend/
git commit -m "feat: project scaffold, Docker Compose, backend package setup"
```

---

### Task 2: Prisma schema + migrations

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`

- [ ] **Step 1: Initialize Prisma**

```bash
cd pasteleriapp-backend
npx prisma init --datasource-provider postgresql
```

This creates `prisma/schema.prisma` and adds `DATABASE_URL` to `.env`.

- [ ] **Step 2: Write the full schema**

Replace the contents of `prisma/schema.prisma`:

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

Expected: Migration created and applied, Prisma Client generated.

- [ ] **Step 4: Create Prisma client singleton at `src/lib/prisma.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['query'] : [] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 5: Commit**

```bash
git add prisma/ src/lib/prisma.ts
git commit -m "feat: Prisma schema with all entities, initial migration"
```

---

### Task 3: Express app + config

**Files:**
- Create: `src/config.ts`
- Create: `src/app.ts`
- Create: `src/index.ts`
- Create: `src/lib/jwt.ts`

- [ ] **Step 1: Create `src/config.ts`**

```typescript
function required(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing required env var: ${key}`)
  return val
}

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  jwtSecret: required('JWT_SECRET'),
  stripeSecretKey: required('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: required('STRIPE_WEBHOOK_SECRET'),
  twilioAccountSid: required('TWILIO_ACCOUNT_SID'),
  twilioAuthToken: required('TWILIO_AUTH_TOKEN'),
  twilioWhatsappNumber: required('TWILIO_WHATSAPP_NUMBER'),
  twilioTargetShopId: required('TWILIO_TARGET_SHOP_ID'),
  nodeEnv: process.env.NODE_ENV || 'development',
}
```

- [ ] **Step 2: Create `src/lib/jwt.ts`**

```typescript
import jwt from 'jsonwebtoken'
import { config } from '../config'

export interface JwtPayload {
  userId: string
  shopId: string
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload
}
```

- [ ] **Step 3: Create `src/middlewares/auth.middleware.ts`**

```typescript
import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/jwt'

export interface AuthRequest extends Request {
  shopId: string
  userId: string
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }
  try {
    const payload = verifyToken(header.slice(7))
    ;(req as AuthRequest).shopId = payload.shopId
    ;(req as AuthRequest).userId = payload.userId
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
```

- [ ] **Step 4: Create `src/middlewares/validate.middleware.ts`**

```typescript
import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({ error: result.error.flatten() })
    }
    req.body = result.data
    next()
  }
}
```

- [ ] **Step 5: Create `src/app.ts`**

```typescript
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { router } from './routes'
import { stripeWebhookRouter } from './routes/webhooks/stripe.webhook'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))

  // Stripe webhook needs raw body — must be before express.json()
  app.use('/webhook/stripe', express.raw({ type: 'application/json' }), stripeWebhookRouter)

  app.use(express.json())
  app.use('/api', router)

  app.get('/health', (_req, res) => res.json({ ok: true }))

  return app
}
```

- [ ] **Step 6: Create `src/index.ts`**

```typescript
import 'dotenv/config'
import http from 'http'
import { Server } from 'socket.io'
import { createApp } from './app'
import { config } from './config'
import { registerSocketEvents } from './socket/events'

const app = createApp()
const httpServer = http.createServer(app)

export const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:5173' },
})

registerSocketEvents(io)

httpServer.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`)
})
```

- [ ] **Step 7: Create `src/socket/events.ts`**

```typescript
import { Server } from 'socket.io'

export function registerSocketEvents(io: Server) {
  io.on('connection', (socket) => {
    socket.on('join:order', (token: string) => {
      socket.join(`order:${token}`)
    })
    socket.on('leave:order', (token: string) => {
      socket.leave(`order:${token}`)
    })
  })
}

export function emitOrderUpdated(io: Server, token: string, estado: string) {
  io.to(`order:${token}`).emit('order:updated', { token, estado })
}
```

- [ ] **Step 8: Create `src/routes/index.ts` (empty router to be filled)**

```typescript
import { Router } from 'express'
import { authRouter } from './auth.routes'
import { ordersRouter } from './orders.routes'
import { productsRouter } from './products.routes'
import { customersRouter } from './customers.routes'
import { ingredientsRouter } from './ingredients.routes'
import { whatsappWebhookRouter } from './webhooks/whatsapp.webhook'

export const router = Router()

router.use('/auth', authRouter)
router.use('/orders', ordersRouter)
router.use('/products', productsRouter)
router.use('/customers', customersRouter)
router.use('/ingredients', ingredientsRouter)
router.use('/webhook/whatsapp', whatsappWebhookRouter)
```

- [ ] **Step 9: Verify server starts**

```bash
cp .env.example .env
# Fill JWT_SECRET with any string for now, e.g.: JWT_SECRET=dev-secret-change-me
npm run dev
```

Expected: "Server running on port 3001". `curl http://localhost:3001/health` returns `{"ok":true}`.

- [ ] **Step 10: Commit**

```bash
git add src/
git commit -m "feat: Express app scaffold, JWT middleware, Socket.io setup"
```

---

### Task 4: Auth service (TDD)

**Files:**
- Create: `src/services/auth.service.ts`
- Create: `src/services/__tests__/auth.service.test.ts`
- Create: `src/routes/auth.routes.ts`
- Create: `src/routes/__tests__/auth.routes.test.ts`

- [ ] **Step 1: Create test setup file `src/test-setup.ts`**

```typescript
import { prisma } from './lib/prisma'
import { afterAll, beforeEach } from 'vitest'

beforeEach(async () => {
  // Clean all tables in reverse dependency order
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

Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest run"
  },
  "vitest": {
    "setupFiles": ["src/test-setup.ts"],
    "environment": "node"
  }
}
```

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['src/test-setup.ts'],
    environment: 'node',
  },
})
```

Set `TEST_DATABASE_URL` in `.env` and create the test DB:
```bash
docker exec -it pasteleriapp-db-1 psql -U pasteleri -c "CREATE DATABASE pasteleriapp_test;"
```

Update `src/lib/prisma.ts` to use `TEST_DATABASE_URL` in test env:
```typescript
// At top, before PrismaClient instantiation:
if (process.env.NODE_ENV === 'test' && process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
}
```

Run migration against test DB:
```bash
DATABASE_URL=$TEST_DATABASE_URL npx prisma migrate deploy
```

- [ ] **Step 2: Write failing tests for auth service**

Create `src/services/__tests__/auth.service.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { registerShop, loginUser } from '../auth.service'

describe('auth.service', () => {
  describe('registerShop', () => {
    it('creates a shop and user, returns token', async () => {
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
      await registerShop({
        shopNombre: 'Shop A',
        slug: 'duplicado',
        email: 'a@test.com',
        password: 'pass',
        nombre: 'A',
      })
      await expect(
        registerShop({
          shopNombre: 'Shop B',
          slug: 'duplicado',
          email: 'b@test.com',
          password: 'pass',
          nombre: 'B',
        })
      ).rejects.toThrow('slug already taken')
    })
  })

  describe('loginUser', () => {
    it('returns token for valid credentials', async () => {
      await registerShop({
        shopNombre: 'Test',
        slug: 'test',
        email: 'login@test.com',
        password: 'mypassword',
        nombre: 'Test User',
      })
      const result = await loginUser('login@test.com', 'mypassword')
      expect(result.token).toBeDefined()
    })

    it('throws for wrong password', async () => {
      await registerShop({
        shopNombre: 'Test',
        slug: 'test2',
        email: 'login2@test.com',
        password: 'correct',
        nombre: 'Test',
      })
      await expect(loginUser('login2@test.com', 'wrong')).rejects.toThrow('Invalid credentials')
    })

    it('throws for unknown email', async () => {
      await expect(loginUser('ghost@test.com', 'pass')).rejects.toThrow('Invalid credentials')
    })
  })
})
```

- [ ] **Step 3: Run tests to confirm they fail**

```bash
NODE_ENV=test npm test
```

Expected: `FAIL` — `registerShop` is not defined.

- [ ] **Step 4: Implement `src/services/auth.service.ts`**

```typescript
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { signToken } from '../lib/jwt'

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
      users: {
        create: { email: input.email, password_hash, nombre: input.nombre },
      },
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

- [ ] **Step 5: Run tests to confirm they pass**

```bash
NODE_ENV=test npm test src/services/__tests__/auth.service.test.ts
```

Expected: 5 tests pass.

- [ ] **Step 6: Create `src/routes/auth.routes.ts`**

```typescript
import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middlewares/validate.middleware'
import { registerShop, loginUser } from '../services/auth.service'
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware'

export const authRouter = Router()

const registerSchema = z.object({
  shopNombre: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with dashes'),
  email: z.string().email(),
  password: z.string().min(6),
  nombre: z.string().min(2),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

authRouter.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const result = await registerShop(req.body)
    res.status(201).json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

authRouter.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const result = await loginUser(req.body.email, req.body.password)
    res.json(result)
  } catch {
    res.status(401).json({ error: 'Invalid credentials' })
  }
})

authRouter.get('/me', authMiddleware, async (req, res) => {
  const { shopId, userId } = req as AuthRequest
  const user = await import('../lib/prisma').then(({ prisma }) =>
    prisma.user.findUnique({ where: { id: userId }, include: { shop: true } })
  )
  res.json(user)
})
```

- [ ] **Step 7: Write route integration tests**

Create `src/routes/__tests__/auth.routes.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import supertest from 'supertest'
import { createApp } from '../../app'

const app = createApp()
const req = supertest(app)

describe('POST /api/auth/register', () => {
  it('creates shop and returns token', async () => {
    const res = await req.post('/api/auth/register').send({
      shopNombre: 'Mi Pastelería',
      slug: 'mi-pasteleria',
      email: 'owner@test.com',
      password: 'password123',
      nombre: 'Ana López',
    })
    expect(res.status).toBe(201)
    expect(res.body.token).toBeDefined()
    expect(res.body.shop.slug).toBe('mi-pasteleria')
  })

  it('returns 400 for duplicate slug', async () => {
    await req.post('/api/auth/register').send({
      shopNombre: 'A', slug: 'dup', email: 'a@test.com', password: 'pass123', nombre: 'A',
    })
    const res = await req.post('/api/auth/register').send({
      shopNombre: 'B', slug: 'dup', email: 'b@test.com', password: 'pass123', nombre: 'B',
    })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  it('returns token for valid credentials', async () => {
    await req.post('/api/auth/register').send({
      shopNombre: 'Test', slug: 'test', email: 'login@test.com', password: 'pass123', nombre: 'T',
    })
    const res = await req.post('/api/auth/login').send({
      email: 'login@test.com', password: 'pass123',
    })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
  })

  it('returns 401 for wrong password', async () => {
    await req.post('/api/auth/register').send({
      shopNombre: 'X', slug: 'x', email: 'x@test.com', password: 'correct', nombre: 'X',
    })
    const res = await req.post('/api/auth/login').send({ email: 'x@test.com', password: 'wrong' })
    expect(res.status).toBe(401)
  })
})
```

- [ ] **Step 8: Run all tests**

```bash
NODE_ENV=test npm test
```

Expected: all tests pass.

- [ ] **Step 9: Commit**

```bash
git add src/services/auth.service.ts src/services/__tests__/ src/routes/auth.routes.ts src/routes/__tests__/ src/test-setup.ts vitest.config.ts
git commit -m "feat: auth service + routes with TDD (register, login, JWT)"
```

---

### Task 5: Products API (TDD)

**Files:**
- Create: `src/services/product.service.ts`
- Create: `src/routes/products.routes.ts`

- [ ] **Step 1: Write failing test**

Create `src/services/__tests__/product.service.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../../lib/prisma'
import { createProduct, listProducts, updateProduct, deleteProduct } from '../product.service'

let shopId: string

beforeEach(async () => {
  const shop = await prisma.shop.create({
    data: { nombre: 'Test Shop', slug: `shop-${Date.now()}` },
  })
  shopId = shop.id
})

describe('product.service', () => {
  it('creates a product scoped to a shop', async () => {
    const p = await createProduct(shopId, {
      nombre: 'Torta de fresas',
      precio_base: 3200,
      categoria: 'tortas',
    })
    expect(p.nombre).toBe('Torta de fresas')
    expect(p.shop_id).toBe(shopId)
  })

  it('lists only products from the shop', async () => {
    const other = await prisma.shop.create({ data: { nombre: 'Other', slug: 'other' } })
    await createProduct(shopId, { nombre: 'Mío', precio_base: 100, categoria: 'x' })
    await createProduct(other.id, { nombre: 'Ajeno', precio_base: 200, categoria: 'x' })

    const products = await listProducts(shopId)
    expect(products).toHaveLength(1)
    expect(products[0].nombre).toBe('Mío')
  })

  it('updates product', async () => {
    const p = await createProduct(shopId, { nombre: 'Old', precio_base: 100, categoria: 'x' })
    const updated = await updateProduct(shopId, p.id, { nombre: 'New', precio_base: 200 })
    expect(updated.nombre).toBe('New')
    expect(updated.precio_base).toBe(200)
  })

  it('soft-deletes by setting activo=false', async () => {
    const p = await createProduct(shopId, { nombre: 'ToDelete', precio_base: 100, categoria: 'x' })
    await deleteProduct(shopId, p.id)
    const products = await listProducts(shopId)
    expect(products).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
NODE_ENV=test npm test src/services/__tests__/product.service.test.ts
```

Expected: FAIL — `createProduct` not defined.

- [ ] **Step 3: Implement `src/services/product.service.ts`**

```typescript
import { prisma } from '../lib/prisma'

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
  return prisma.product.findMany({ where: { shop_id: shopId, activo: true } })
}

export async function updateProduct(shopId: string, id: string, data: Partial<CreateProductInput>) {
  return prisma.product.update({ where: { id, shop_id: shopId }, data })
}

export async function deleteProduct(shopId: string, id: string) {
  return prisma.product.update({ where: { id, shop_id: shopId }, data: { activo: false } })
}
```

- [ ] **Step 4: Run tests — confirm pass**

```bash
NODE_ENV=test npm test src/services/__tests__/product.service.test.ts
```

Expected: 4 tests pass.

- [ ] **Step 5: Create `src/routes/products.routes.ts`**

```typescript
import { Router } from 'express'
import { z } from 'zod'
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import { createProduct, listProducts, updateProduct, deleteProduct } from '../services/product.service'

export const productsRouter = Router()
productsRouter.use(authMiddleware)

const productSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().optional(),
  precio_base: z.number().positive(),
  categoria: z.string().min(1),
})

productsRouter.get('/', async (req, res) => {
  const products = await listProducts((req as AuthRequest).shopId)
  res.json(products)
})

productsRouter.post('/', validate(productSchema), async (req, res) => {
  const product = await createProduct((req as AuthRequest).shopId, req.body)
  res.status(201).json(product)
})

productsRouter.patch('/:id', validate(productSchema.partial()), async (req, res) => {
  try {
    const product = await updateProduct((req as AuthRequest).shopId, req.params.id, req.body)
    res.json(product)
  } catch {
    res.status(404).json({ error: 'Product not found' })
  }
})

productsRouter.delete('/:id', async (req, res) => {
  await deleteProduct((req as AuthRequest).shopId, req.params.id)
  res.status(204).send()
})
```

- [ ] **Step 6: Commit**

```bash
git add src/services/product.service.ts src/services/__tests__/product.service.test.ts src/routes/products.routes.ts
git commit -m "feat: products CRUD API with TDD"
```

---

### Task 6: Order service — create + quote calculation (TDD)

**Files:**
- Create: `src/services/order.service.ts`
- Create: `src/services/__tests__/order.service.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/services/__tests__/order.service.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../../lib/prisma'
import { createOrder, getOrderByToken, transitionState } from '../order.service'
import { OrderEstado } from '@prisma/client'

let shopId: string
let productId: string

beforeEach(async () => {
  const shop = await prisma.shop.create({ data: { nombre: 'Test', slug: `s-${Date.now()}` } })
  shopId = shop.id
  const product = await prisma.product.create({
    data: { nombre: 'Torta', precio_base: 3000, categoria: 'tortas', shop_id: shopId },
  })
  productId = product.id
})

describe('createOrder', () => {
  it('creates order with items and calculates total', async () => {
    const order = await createOrder({
      shopId,
      canal: 'WEB',
      fechaEntrega: new Date('2026-06-20'),
      customer: { nombre: 'Ana', email: 'ana@test.com' },
      items: [{ productId, cantidad: 2, personalizacion: 'Sin gluten' }],
    })
    expect(order.total).toBe(6000) // 2 × 3000
    expect(order.items).toHaveLength(1)
    expect(order.token).toBeDefined()
    expect(order.estado).toBe('NUEVO')
  })

  it('creates customer record', async () => {
    const order = await createOrder({
      shopId,
      canal: 'WEB',
      fechaEntrega: new Date('2026-06-20'),
      customer: { nombre: 'Luis', email: 'luis@test.com' },
      items: [{ productId, cantidad: 1 }],
    })
    const customer = await prisma.customer.findUnique({ where: { id: order.customer_id } })
    expect(customer?.nombre).toBe('Luis')
  })
})

describe('getOrderByToken', () => {
  it('returns order with items and customer', async () => {
    const created = await createOrder({
      shopId,
      canal: 'WEB',
      fechaEntrega: new Date('2026-06-20'),
      customer: { nombre: 'Carlos', email: 'carlos@test.com' },
      items: [{ productId, cantidad: 1 }],
    })
    const found = await getOrderByToken(created.token)
    expect(found).not.toBeNull()
    expect(found!.customer.nombre).toBe('Carlos')
    expect(found!.items).toHaveLength(1)
  })

  it('returns null for unknown token', async () => {
    const found = await getOrderByToken('nonexistent-token')
    expect(found).toBeNull()
  })
})

describe('transitionState', () => {
  it('advances NUEVO → CONFIRMADO', async () => {
    const order = await createOrder({
      shopId,
      canal: 'WEB',
      fechaEntrega: new Date('2026-06-20'),
      customer: { nombre: 'X', email: 'x@test.com' },
      items: [{ productId, cantidad: 1 }],
    })
    const updated = await transitionState(shopId, order.id, 'CONFIRMADO')
    expect(updated.estado).toBe('CONFIRMADO')
  })

  it('throws for invalid transition (NUEVO → ENTREGADO)', async () => {
    const order = await createOrder({
      shopId,
      canal: 'WEB',
      fechaEntrega: new Date('2026-06-20'),
      customer: { nombre: 'Y', email: 'y@test.com' },
      items: [{ productId, cantidad: 1 }],
    })
    await expect(transitionState(shopId, order.id, 'ENTREGADO')).rejects.toThrow('Invalid transition')
  })

  it('allows CANCELADO from any non-terminal state', async () => {
    const order = await createOrder({
      shopId,
      canal: 'WEB',
      fechaEntrega: new Date('2026-06-20'),
      customer: { nombre: 'Z', email: 'z@test.com' },
      items: [{ productId, cantidad: 1 }],
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

Expected: FAIL.

- [ ] **Step 3: Implement `src/services/order.service.ts`**

```typescript
import { OrderEstado, Canal, Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'

// Valid transitions: from → allowed next states
const TRANSITIONS: Record<OrderEstado, OrderEstado[]> = {
  NUEVO:        ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO:   ['EN_PRODUCCION', 'CANCELADO'],
  EN_PRODUCCION:['LISTO', 'CANCELADO'],
  LISTO:        ['ENTREGADO', 'CANCELADO'],
  ENTREGADO:    [],
  CANCELADO:    [],
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
  const total = input.items.reduce((sum, item) => sum + (priceMap.get(item.productId)! * item.cantidad), 0)

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

  const allowed = TRANSITIONS[order.estado]
  if (!allowed.includes(nextState)) {
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
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [activeOrders, todayDeliveries, unconfirmed, revenueResult, lowStock] = await Promise.all([
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
      where: { shop_id: shopId, createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
      _sum: { total: true },
    }),
    prisma.ingredient.findMany({
      where: { shop_id: shopId, stock_actual: { lte: prisma.ingredient.fields.stock_minimo } },
    }),
  ])

  return {
    activeOrders,
    todayDeliveries,
    unconfirmed,
    monthRevenue: revenueResult._sum.total ?? 0,
    lowStock,
  }
}
```

- [ ] **Step 4: Fix low-stock query (Prisma doesn't support field comparisons in where directly)**

Replace the lowStock query in `getDashboardStats`:

```typescript
// Replace the lowStock prisma query with:
const allIngredients = await prisma.ingredient.findMany({ where: { shop_id: shopId } })
const lowStock = allIngredients.filter(i => i.stock_actual <= i.stock_minimo)
```

And remove the lowStock from the `Promise.all`. Use a separate fetch.

- [ ] **Step 5: Run tests — confirm pass**

```bash
NODE_ENV=test npm test src/services/__tests__/order.service.test.ts
```

Expected: 7 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/services/order.service.ts src/services/__tests__/order.service.test.ts
git commit -m "feat: order service — create, token lookup, state machine with TDD"
```

---

### Task 7: Orders routes (owner + public tracking)

**Files:**
- Create: `src/routes/orders.routes.ts`

- [ ] **Step 1: Create `src/routes/orders.routes.ts`**

```typescript
import { Router } from 'express'
import { z } from 'zod'
import { OrderEstado } from '@prisma/client'
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import { createOrder, getOrderByToken, transitionState, listOrders, getDashboardStats } from '../services/order.service'
import { io } from '../index'
import { emitOrderUpdated } from '../socket/events'

export const ordersRouter = Router()

const createOrderSchema = z.object({
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

// Public: get order by token (no auth needed)
ordersRouter.get('/tracking/:token', async (req, res) => {
  const order = await getOrderByToken(req.params.token)
  if (!order) return res.status(404).json({ error: 'Order not found' })
  res.json(order)
})

// All routes below require auth
ordersRouter.use(authMiddleware)

ordersRouter.get('/dashboard', async (req, res) => {
  const stats = await getDashboardStats((req as AuthRequest).shopId)
  res.json(stats)
})

ordersRouter.get('/', async (req, res) => {
  const { estado } = req.query
  const orders = await listOrders(
    (req as AuthRequest).shopId,
    estado as OrderEstado | undefined
  )
  res.json(orders)
})

ordersRouter.post('/', validate(createOrderSchema), async (req, res) => {
  try {
    const order = await createOrder({
      shopId: (req as AuthRequest).shopId,
      ...req.body,
      fechaEntrega: new Date(req.body.fechaEntrega),
    })
    res.status(201).json(order)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

ordersRouter.patch('/:id/estado', async (req, res) => {
  const { estado } = req.body
  if (!estado) return res.status(400).json({ error: 'estado required' })
  try {
    const order = await transitionState((req as AuthRequest).shopId, req.params.id, estado)
    emitOrderUpdated(io, order.token, order.estado)
    res.json(order)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

ordersRouter.patch('/:id/notas', async (req, res) => {
  const { prisma } = await import('../lib/prisma')
  const order = await prisma.order.update({
    where: { id: req.params.id, shop_id: (req as AuthRequest).shopId },
    data: { notas_internas: req.body.notas_internas },
  })
  res.json(order)
})
```

- [ ] **Step 2: Fix circular import** — `orders.routes.ts` imports `io` from `index.ts` which imports `app.ts` which imports `routes/index.ts` which imports `orders.routes.ts`. Break this by exporting `io` from `socket/events.ts` instead.

Update `src/socket/events.ts`:
```typescript
import { Server } from 'socket.io'

let _io: Server | null = null

export function registerSocketEvents(io: Server) {
  _io = io
  io.on('connection', (socket) => {
    socket.on('join:order', (token: string) => socket.join(`order:${token}`))
    socket.on('leave:order', (token: string) => socket.leave(`order:${token}`))
  })
}

export function emitOrderUpdated(token: string, estado: string) {
  _io?.to(`order:${token}`).emit('order:updated', { token, estado })
}
```

Update `orders.routes.ts` — remove `io` import, call `emitOrderUpdated(order.token, order.estado)` without `io` parameter.

Update `src/index.ts` — remove `io` export, `registerSocketEvents` no longer needs it as param.

- [ ] **Step 3: Test manually**

```bash
npm run dev
# In another terminal:
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"shopNombre":"Test","slug":"test","email":"t@t.com","password":"pass123","nombre":"T"}'
# Copy token from response, then:
curl http://localhost:3001/api/orders -H "Authorization: Bearer <token>"
```

Expected: `[]` (empty array).

- [ ] **Step 4: Commit**

```bash
git add src/routes/orders.routes.ts src/socket/events.ts src/index.ts
git commit -m "feat: orders routes — CRUD, state transitions, public tracking endpoint"
```

---

### Task 8: Ingredients API + Customers API (TDD)

**Files:**
- Create: `src/services/ingredient.service.ts`
- Create: `src/routes/ingredients.routes.ts`
- Create: `src/routes/customers.routes.ts`

- [ ] **Step 1: Write failing ingredient tests**

Create `src/services/__tests__/ingredient.service.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { prisma } from '../../lib/prisma'
import { createIngredient, listIngredients, updateStock, getLowStock } from '../ingredient.service'

let shopId: string

beforeEach(async () => {
  const shop = await prisma.shop.create({ data: { nombre: 'T', slug: `i-${Date.now()}` } })
  shopId = shop.id
})

describe('ingredient.service', () => {
  it('creates ingredient', async () => {
    const i = await createIngredient(shopId, { nombre: 'Harina', unidad: 'kg', stock_actual: 10, stock_minimo: 2 })
    expect(i.nombre).toBe('Harina')
  })

  it('getLowStock returns only ingredients below minimum', async () => {
    await createIngredient(shopId, { nombre: 'Harina', unidad: 'kg', stock_actual: 1, stock_minimo: 2 })
    await createIngredient(shopId, { nombre: 'Azúcar', unidad: 'kg', stock_actual: 5, stock_minimo: 2 })
    const low = await getLowStock(shopId)
    expect(low).toHaveLength(1)
    expect(low[0].nombre).toBe('Harina')
  })

  it('updateStock sets new value', async () => {
    const i = await createIngredient(shopId, { nombre: 'Leche', unidad: 'L', stock_actual: 5, stock_minimo: 1 })
    const updated = await updateStock(shopId, i.id, 10)
    expect(updated.stock_actual).toBe(10)
  })
})
```

- [ ] **Step 2: Run to confirm failure, then implement**

```bash
NODE_ENV=test npm test src/services/__tests__/ingredient.service.test.ts
```

Create `src/services/ingredient.service.ts`:

```typescript
import { prisma } from '../lib/prisma'

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

export async function updateStock(shopId: string, id: string, stock_actual: number) {
  return prisma.ingredient.update({ where: { id, shop_id: shopId }, data: { stock_actual } })
}

export async function updateIngredient(shopId: string, id: string, data: Partial<CreateIngredientInput>) {
  return prisma.ingredient.update({ where: { id, shop_id: shopId }, data })
}

export async function getLowStock(shopId: string) {
  const all = await prisma.ingredient.findMany({ where: { shop_id: shopId } })
  return all.filter(i => i.stock_actual <= i.stock_minimo)
}
```

- [ ] **Step 3: Run tests — confirm pass**

```bash
NODE_ENV=test npm test src/services/__tests__/ingredient.service.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 4: Create `src/routes/ingredients.routes.ts`**

```typescript
import { Router } from 'express'
import { z } from 'zod'
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import { createIngredient, listIngredients, updateIngredient, getLowStock } from '../services/ingredient.service'

export const ingredientsRouter = Router()
ingredientsRouter.use(authMiddleware)

const ingredientSchema = z.object({
  nombre: z.string().min(1),
  unidad: z.string().min(1),
  stock_actual: z.number().min(0),
  stock_minimo: z.number().min(0),
})

ingredientsRouter.get('/', async (req, res) => {
  const ingredients = await listIngredients((req as AuthRequest).shopId)
  res.json(ingredients)
})

ingredientsRouter.get('/low-stock', async (req, res) => {
  const low = await getLowStock((req as AuthRequest).shopId)
  res.json(low)
})

ingredientsRouter.post('/', validate(ingredientSchema), async (req, res) => {
  const ingredient = await createIngredient((req as AuthRequest).shopId, req.body)
  res.status(201).json(ingredient)
})

ingredientsRouter.patch('/:id', validate(ingredientSchema.partial()), async (req, res) => {
  try {
    const ingredient = await updateIngredient((req as AuthRequest).shopId, req.params.id, req.body)
    res.json(ingredient)
  } catch {
    res.status(404).json({ error: 'Ingredient not found' })
  }
})
```

- [ ] **Step 5: Create `src/routes/customers.routes.ts`**

```typescript
import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware'
import { prisma } from '../lib/prisma'

export const customersRouter = Router()
customersRouter.use(authMiddleware)

customersRouter.get('/', async (req, res) => {
  const shopId = (req as AuthRequest).shopId
  const customers = await prisma.customer.findMany({
    where: { orders: { some: { shop_id: shopId } } },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(customers)
})

customersRouter.get('/:id/orders', async (req, res) => {
  const shopId = (req as AuthRequest).shopId
  const orders = await prisma.order.findMany({
    where: { customer_id: req.params.id, shop_id: shopId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(orders)
})
```

- [ ] **Step 6: Run all tests**

```bash
NODE_ENV=test npm test
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/services/ingredient.service.ts src/services/__tests__/ingredient.service.test.ts src/routes/ingredients.routes.ts src/routes/customers.routes.ts
git commit -m "feat: ingredients CRUD + customers list API with TDD"
```

---

### Task 9: Stripe integration

**Files:**
- Create: `src/services/stripe.service.ts`
- Create: `src/routes/webhooks/stripe.webhook.ts`

- [ ] **Step 1: Create `src/services/stripe.service.ts`**

```typescript
import Stripe from 'stripe'
import { config } from '../config'
import { prisma } from '../lib/prisma'

export const stripe = new Stripe(config.stripeSecretKey, { apiVersion: '2024-04-10' })

export async function createPaymentIntent(orderId: string, shopId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId, shop_id: shopId },
    include: { shop: true },
  })
  if (!order) throw new Error('Order not found')

  // Seña = 30% del total (mínimo $500 ARS)
  const sena = Math.max(Math.round(order.total * 0.3), 500)

  const intent = await stripe.paymentIntents.create({
    amount: sena * 100, // Stripe usa centavos
    currency: 'ars',
    metadata: { orderId, shopId },
  })

  await prisma.payment.create({
    data: {
      order_id: orderId,
      monto: sena,
      stripe_payment_intent_id: intent.id,
      estado: 'PENDIENTE',
    },
  })

  return { clientSecret: intent.client_secret, amount: sena }
}
```

- [ ] **Step 2: Create `src/routes/webhooks/stripe.webhook.ts`**

```typescript
import { Router } from 'express'
import Stripe from 'stripe'
import { stripe } from '../../services/stripe.service'
import { config } from '../../config'
import { prisma } from '../../lib/prisma'

export const stripeWebhookRouter = Router()

stripeWebhookRouter.post('/', async (req, res) => {
  const sig = req.headers['stripe-signature']
  if (!sig) return res.status(400).send('Missing signature')

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, config.stripeWebhookSecret)
  } catch {
    return res.status(400).send('Invalid signature')
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

  res.json({ received: true })
})
```

- [ ] **Step 3: Add payment intent route to orders router**

Add to `src/routes/orders.routes.ts`:

```typescript
import { createPaymentIntent } from '../services/stripe.service'

// After existing routes:
ordersRouter.post('/:id/payment-intent', async (req, res) => {
  try {
    const result = await createPaymentIntent(req.params.id, (req as AuthRequest).shopId)
    res.json(result)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})
```

- [ ] **Step 4: Test with Stripe CLI**

Install Stripe CLI, then:

```bash
stripe listen --forward-to localhost:3001/webhook/stripe
# In another terminal, trigger a test event:
stripe trigger payment_intent.succeeded
```

Expected: webhook handler receives event, logs no errors.

- [ ] **Step 5: Commit**

```bash
git add src/services/stripe.service.ts src/routes/webhooks/stripe.webhook.ts
git commit -m "feat: Stripe PaymentIntent creation and webhook handler"
```

---

### Task 10: WhatsApp bot (Twilio Sandbox)

**Files:**
- Create: `src/services/whatsapp.service.ts`
- Create: `src/routes/webhooks/whatsapp.webhook.ts`

- [ ] **Step 1: Create bot state machine `src/services/whatsapp.service.ts`**

```typescript
import twilio from 'twilio'
import { config } from '../config'
import { prisma } from '../lib/prisma'
import { createOrder } from './order.service'

const client = twilio(config.twilioAccountSid, config.twilioAuthToken)

type BotEstado = 'START' | 'WAITING_FECHA' | 'WAITING_PRODUCTO' | 'WAITING_PERSONALIZACION' | 'WAITING_RESTRICCIONES' | 'WAITING_CONFIRMACION'

interface DatosParciales {
  fecha?: string
  productoId?: string
  productoNombre?: string
  personalizacion?: string
  restricciones?: string
  precioUnitario?: number
}

async function getOrCreateSession(whatsappNumber: string, shopId: string) {
  return prisma.waBotSession.upsert({
    where: { whatsapp_number_shop_id: { whatsapp_number: whatsappNumber, shop_id: shopId } },
    update: {},
    create: { whatsapp_number: whatsappNumber, shop_id: shopId, estado: 'START', datos_parciales: {} },
  })
}

async function reply(to: string, body: string) {
  await client.messages.create({ from: config.twilioWhatsappNumber, to, body })
}

export async function handleIncomingMessage(from: string, body: string) {
  const shopId = config.twilioTargetShopId
  const session = await getOrCreateSession(from, shopId)
  const estado = session.estado as BotEstado
  const datos = session.datos_parciales as DatosParciales
  const msg = body.trim()

  async function updateSession(newEstado: BotEstado, newDatos: DatosParciales) {
    await prisma.waBotSession.update({
      where: { id: session.id },
      data: { estado: newEstado, datos_parciales: newDatos },
    })
  }

  if (estado === 'START' || msg.toLowerCase().includes('hola') || msg.toLowerCase().includes('pedir')) {
    await updateSession('WAITING_FECHA', {})
    return reply(from, '¡Hola! 🎂 Bienvenido/a. ¿Para qué fecha necesitás el pedido? (ej: 20/06/2026)')
  }

  if (estado === 'WAITING_FECHA') {
    const products = await prisma.product.findMany({ where: { shop_id: shopId, activo: true }, take: 5 })
    const lista = products.map((p, i) => `${i + 1}. ${p.nombre} - $${p.precio_base}`).join('\n')
    await updateSession('WAITING_PRODUCTO', { ...datos, fecha: msg })
    return reply(from, `Perfecto, anotado para el ${msg}. ¿Qué querés pedir?\n\n${lista}\n\nRespondé con el número.`)
  }

  if (estado === 'WAITING_PRODUCTO') {
    const products = await prisma.product.findMany({ where: { shop_id: shopId, activo: true }, take: 5 })
    const idx = parseInt(msg) - 1
    if (isNaN(idx) || idx < 0 || idx >= products.length) {
      return reply(from, 'Por favor respondé con el número del producto.')
    }
    const product = products[idx]
    await updateSession('WAITING_PERSONALIZACION', { ...datos, productoId: product.id, productoNombre: product.nombre, precioUnitario: product.precio_base })
    return reply(from, `Excelente, ${product.nombre}. ¿Alguna personalización? (sabor, diseño, texto) o escribí "ninguna"`)
  }

  if (estado === 'WAITING_PERSONALIZACION') {
    await updateSession('WAITING_RESTRICCIONES', { ...datos, personalizacion: msg === 'ninguna' ? undefined : msg })
    return reply(from, '¿Tenés alguna restricción alimentaria? (sin gluten, sin lactosa, etc.) o escribí "ninguna"')
  }

  if (estado === 'WAITING_RESTRICCIONES') {
    const newDatos = { ...datos, restricciones: msg === 'ninguna' ? undefined : msg }
    await updateSession('WAITING_CONFIRMACION', newDatos)
    return reply(from,
      `Resumen de tu pedido:\n\n📅 Fecha: ${newDatos.fecha}\n🎂 Producto: ${newDatos.productoNombre}\n✏️ Personalización: ${newDatos.personalizacion || 'Ninguna'}\n⚠️ Restricciones: ${newDatos.restricciones || 'Ninguna'}\n💰 Precio estimado: $${newDatos.precioUnitario}\n\n¿Confirmamos? (si/no)`
    )
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
      const trackingUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/seguimiento/${order.token}`
      return reply(from, `✅ ¡Pedido registrado! Seguí el estado en tiempo real aquí:\n${trackingUrl}\n\n¡Gracias por elegirnos! 🎂`)
    } else {
      await updateSession('START', {})
      return reply(from, 'Pedido cancelado. Escribí "hola" cuando quieras intentar de nuevo.')
    }
  }

  return reply(from, 'Escribí "hola" para hacer un nuevo pedido.')
}
```

- [ ] **Step 2: Create `src/routes/webhooks/whatsapp.webhook.ts`**

```typescript
import { Router } from 'express'
import { handleIncomingMessage } from '../../services/whatsapp.service'

export const whatsappWebhookRouter = Router()

whatsappWebhookRouter.post('/', async (req, res) => {
  const { From, Body } = req.body
  if (!From || !Body) return res.status(400).send('Missing From or Body')
  try {
    await handleIncomingMessage(From, Body)
    res.status(200).send()
  } catch (err) {
    console.error('WhatsApp webhook error:', err)
    res.status(500).send()
  }
})
```

- [ ] **Step 3: Configure Twilio Sandbox**

1. Go to [console.twilio.com](https://console.twilio.com) → Messaging → Try it Out → Send a WhatsApp message
2. Join the sandbox (send the sandbox join code from your phone)
3. Set Webhook URL to `https://<your-ngrok-url>/api/webhook/whatsapp` (use `ngrok http 3001` for local dev)
4. Fill in `.env` with your Twilio credentials and a real `TWILIO_TARGET_SHOP_ID` (from DB after registering a shop)

- [ ] **Step 4: Test the bot end-to-end**

Send "hola" from your WhatsApp to the sandbox number. Follow the conversation. Verify the order appears in the database:

```bash
docker exec -it pasteleriapp-db-1 psql -U pasteleri -d pasteleriapp -c "SELECT id, estado, canal, total FROM \"Order\" ORDER BY \"createdAt\" DESC LIMIT 5;"
```

- [ ] **Step 5: Commit**

```bash
git add src/services/whatsapp.service.ts src/routes/webhooks/whatsapp.webhook.ts
git commit -m "feat: WhatsApp bot — Twilio Sandbox state machine, creates orders via chat"
```

---

### Task 11: Final backend wiring + seed data

**Files:**
- Create: `prisma/seed.ts`

- [ ] **Step 1: Add shop config routes to `src/routes/index.ts`**

Add a shop router for GET/PATCH of shop settings:

```typescript
// Add to src/routes/index.ts
import { shopRouter } from './shop.routes'
router.use('/shop', shopRouter)
```

Create `src/routes/shop.routes.ts`:

```typescript
import { Router } from 'express'
import { z } from 'zod'
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validate.middleware'
import { prisma } from '../lib/prisma'

export const shopRouter = Router()
shopRouter.use(authMiddleware)

const updateShopSchema = z.object({
  nombre: z.string().min(2).optional(),
  logo_url: z.string().url().optional(),
  capacidad_diaria: z.number().int().positive().optional(),
})

shopRouter.get('/', async (req, res) => {
  const shop = await prisma.shop.findUnique({ where: { id: (req as AuthRequest).shopId } })
  res.json(shop)
})

shopRouter.patch('/', validate(updateShopSchema), async (req, res) => {
  const shop = await prisma.shop.update({
    where: { id: (req as AuthRequest).shopId },
    data: req.body,
  })
  res.json(shop)
})
```

- [ ] **Step 2: Create seed script `prisma/seed.ts`**

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
          { nombre: 'Cupcakes x12', descripcion: 'Docena de cupcakes personalizables', precio_base: 1800, categoria: 'cupcakes' },
          { nombre: 'Alfajores x24', descripcion: 'Alfajores de maicena con dulce de leche', precio_base: 2400, categoria: 'alfajores' },
          { nombre: 'Torta 3 pisos', descripcion: 'Para bodas y eventos especiales', precio_base: 12000, categoria: 'tortas' },
          { nombre: 'Brownies mix x10', descripcion: 'Variedad de brownies artesanales', precio_base: 1800, categoria: 'masas' },
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

  console.log(`Seeded shop: ${shop.nombre} (slug: ${shop.slug})`)
  console.log('Login: maria@ladulce.com / password123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

Add to `package.json` (inside the root `{}` alongside `"scripts"`):
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

- [ ] **Step 2: Run seed**

```bash
npx prisma db seed
```

Expected: "Seeded shop: La Dulce Tentación".

- [ ] **Step 3: Run full test suite**

```bash
NODE_ENV=test npm test
```

Expected: all tests pass.

- [ ] **Step 4: Final commit**

```bash
git add prisma/seed.ts package.json
git commit -m "feat: seed data for La Dulce Tentación demo shop"
```

---

## Post-backend checklist

Before moving to Plan 2 (Owner Dashboard), verify these endpoints work manually:

```bash
# 1. Register + login
curl -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" \
  -d '{"shopNombre":"Test","slug":"test123","email":"test@test.com","password":"pass123","nombre":"Test"}'

# 2. Get products (should be empty for new shop, populated for seeded shop)
TOKEN=<from login>
curl http://localhost:3001/api/products -H "Authorization: Bearer $TOKEN"

# 3. Dashboard stats
curl http://localhost:3001/api/orders/dashboard -H "Authorization: Bearer $TOKEN"

# 4. Health
curl http://localhost:3001/health
```

All should return 200 with valid JSON.
