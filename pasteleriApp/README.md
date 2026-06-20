# pasteleriApp

Sistema de gestión de pedidos para pastelerías artesanales. Panel de administración, portal de clientes, seguimiento en tiempo real y bot de WhatsApp.

## Requisitos

- **Node.js 20** (ver instalación abajo)
- **Docker Desktop** corriendo

---

## Setup desde cero

### 1. Instalar dependencias

```bash
npm install
```

### 2. Node.js 20

La app requiere Node 20. Si tenés nvm:

```bash
nvm install 20
nvm use 20
```

El repo incluye `.nvmrc` — en cada terminal nueva corrés `nvm use` dentro de la carpeta.

### 3. Variables de entorno

```bash
cp .env.example .env.local
```

El `.env.local` mínimo para correr sin WhatsApp ni Stripe ya viene preconfigurado en `.env.example`. No necesitás cambiar nada para la demo.

### 4. Levantar la base de datos

```bash
# Desde la raíz del repo (donde está docker-compose.yml)
docker compose up -d
```

Verificar que esté healthy:

```bash
docker compose ps
# Debería mostrar dpbt-db-1 con estado "healthy"
```

### 5. Migraciones, seed y datos de demo

```bash
# Aplicar el schema a la base de datos
npx prisma generate
npx prisma migrate deploy

# Datos base (pastelería + productos + ingredientes)
npx prisma db seed

# Datos de demo (clientes + pedidos en todos los estados del Kanban)
npm run demo
```

### 6. Levantar el servidor

```bash
npm run dev
```

App disponible en **http://localhost:3000**

---

## Accesos

| Rol | URL | Email | Contraseña |
|-----|-----|-------|------------|
| Dueña (panel) | http://localhost:3000/login | `maria@ladulce.com` | `password123` |
| Cliente (público) | http://localhost:3000/p/la-dulce-tentacion | — | — |

---

## Qué tiene cargado el demo

**6 productos:** tortas, cupcakes, alfajores, brownies

**6 ingredientes** (2 con stock bajo para mostrar alertas)

**6 clientes:** Ana Martínez, Carlos López, Valentina Rodríguez, Diego Fernández, Sofía González, Martín Suárez

**10 pedidos distribuidos en el Kanban:**

| Estado | Cantidad |
|--------|----------|
| Nuevo | 2 |
| Confirmado | 2 |
| En producción | 2 |
| Listo | 1 |
| Entregado | 2 |
| Cancelado | 1 |

Mix de canales WEB y WhatsApp. Algunos con pago completado, uno reembolsado.

---

## Recetas útiles

```bash
# Recargar solo los datos de demo (idempotente — borra y recrea)
npm run demo

# Resetear la base completa y volver al estado inicial
npx prisma migrate reset   # borra todo + migra + seed automático
npm run demo               # vuelve a cargar datos de demo

# Parar Docker
docker compose down

# Parar Docker y borrar los datos de la base
docker compose down -v
```

---

## Estructura del proyecto

```
pasteleriApp/
├── src/
│   ├── app/          # Rutas Next.js (App Router)
│   │   ├── api/      # API REST
│   │   ├── dashboard/# Panel de administración
│   │   ├── p/        # Portal público del cliente
│   │   └── seguimiento/ # Tracking de pedidos
│   ├── components/   # Componentes React
│   ├── lib/          # Prisma, JWT, Socket.io
│   └── services/     # Lógica de negocio
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts       # Datos base
│   └── demo-data.ts  # Datos de demo
├── server.ts         # Servidor custom (Next.js + Socket.io)
└── docker-compose.yml (en la raíz del repo)
```
