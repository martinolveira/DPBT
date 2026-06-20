# pasteleriApp — Guía de instalación

## Requisitos previos

- Node.js 20 (ver abajo cómo instalarlo)
- Docker Desktop instalado y corriendo
- Git

---

## 1. Clonar e instalar

```bash
git clone <url-del-repo>
cd pasteleriApp/pasteleriapp
npm install
```

---

## 2. Node.js 20 (obligatorio)

La app requiere Node 20. Si tenés nvm:

```bash
nvm install 20
nvm use 20
```

Para que quede como default:

```bash
nvm alias default 20
```

Si no tenés nvm, instalalo desde https://github.com/nvm-sh/nvm  
El repo incluye un `.nvmrc` — en cada terminal nueva corré `nvm use` dentro de la carpeta del proyecto.

---

## 3. Base de datos (Docker)

El archivo `docker-compose.yml` está en la raíz del repo (`pasteleriApp/`, no en `pasteleriapp/`).

```bash
# Desde la carpeta raíz del repo (pasteleriApp/)
docker compose up -d
```

Esto levanta PostgreSQL 16 en el puerto 5432 con:
- **DB:** `pasteleriapp`
- **Usuario:** `pasteleri`
- **Contraseña:** `pasteleri123`

Verificar que esté corriendo:

```bash
docker compose ps
```

Debería mostrar el contenedor `db` con estado `healthy`.

---

## 4. Variables de entorno

Dentro de `pasteleriapp/`, crear el archivo `.env.local`:

```bash
cp .env.example .env.local
```

El archivo mínimo para correr la app **sin WhatsApp ni Stripe**:

```env
DATABASE_URL=postgresql://pasteleri:pasteleri123@localhost:5432/pasteleriapp
JWT_SECRET=cambiar-esto-por-una-cadena-larga-aleatoria
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORT=3000
```

> Para generar un JWT_SECRET seguro: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

## 5. Migraciones y seed

Correr desde `pasteleriapp/` con Node 20 activo:

```bash
# Aplicar el esquema a la base de datos
npx prisma migrate deploy

# Cargar datos de prueba (pastelería demo + productos)
npx prisma db seed
```

### Datos que inserta el seed

| Campo | Valor |
|-------|-------|
| Pastelería | La Dulce Tentación |
| URL pública | `/p/la-dulce-tentacion` |
| Email dueña | `maria@ladulce.com` |
| Contraseña | `password123` |

**Productos:**
- Torta de fresas — $3.200
- Torta de chocolate — $3.500
- Cupcakes x12 — $1.800
- Alfajores x24 — $2.400
- Torta 3 pisos — $12.000
- Brownies mix x10 — $1.800

**Ingredientes** (2 con stock bajo para demo):
- Chocolate cobertura — stock actual 1.5 kg (mínimo 2 kg)
- Dulce de leche — stock actual 0.8 kg (mínimo 1 kg)

---

## 6. Levantar el servidor

```bash
# Desde pasteleriapp/
npm run dev
```

La app queda disponible en **http://localhost:3000**

---

## 7. Verificar que todo funciona

| URL | Qué es |
|-----|--------|
| http://localhost:3000 | Landing page |
| http://localhost:3000/login | Login del panel |
| http://localhost:3000/p/la-dulce-tentacion | Portal del cliente (demo) |

Login con: `maria@ladulce.com` / `password123`

---

## Parar todo

```bash
# Parar la app: Ctrl+C en la terminal donde corre npm run dev

# Parar Docker
docker compose down

# Parar Docker y borrar los datos de la base
docker compose down -v
```

---

---

# Configuración del bot de WhatsApp

El bot usa **Twilio Sandbox para WhatsApp**. Es gratuito para pruebas. El flujo es:

1. Un cliente escribe al número de Twilio por WhatsApp
2. Twilio hace un POST a `/api/webhooks/whatsapp` en tu servidor
3. El bot responde con preguntas hasta tomar el pedido completo
4. El pedido queda registrado en el panel con canal `WHATSAPP`

---

## Paso 1 — Crear cuenta Twilio

1. Ir a https://www.twilio.com y crear una cuenta gratuita
2. En el dashboard, ir a **Messaging → Try it out → Send a WhatsApp message**
3. Vas a ver el **Twilio Sandbox for WhatsApp** con un número (ej: `+1 415 523 8886`)

---

## Paso 2 — Unirse al Sandbox

Para que alguien pueda chatear con el bot, cada persona tiene que mandar un mensaje de activación al número de Twilio:

```
join <palabra-clave>
```

La palabra clave te la muestra Twilio en el dashboard del Sandbox (ej: `join silver-fox`).  
Mándala desde WhatsApp al número del sandbox y Twilio confirma la conexión.

---

## Paso 3 — Exponer el servidor local (ngrok)

Twilio necesita una URL pública para enviar los mensajes entrantes. En desarrollo se usa ngrok:

```bash
# Instalar ngrok si no lo tenés
npm install -g ngrok
# o desde https://ngrok.com/download

# Exponer el puerto 3000
ngrok http 3000
```

Ngrok te da una URL como `https://abc123.ngrok.io`. Copiá esa URL.

---

## Paso 4 — Configurar el webhook en Twilio

1. En el dashboard de Twilio, ir al **Sandbox for WhatsApp**
2. En el campo **"When a message comes in"**, pegar:
   ```
   https://abc123.ngrok.io/api/webhooks/whatsapp
   ```
3. Método: `HTTP POST`
4. Guardar

---

## Paso 5 — Variables de entorno para WhatsApp

Agregar al `.env.local`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
TWILIO_TARGET_SHOP_ID=<id-de-la-pasteleria>
```

Dónde encontrar cada valor:

| Variable | Dónde está |
|----------|-----------|
| `TWILIO_ACCOUNT_SID` | Dashboard principal de Twilio → Account Info |
| `TWILIO_AUTH_TOKEN` | Dashboard principal de Twilio → Account Info (hacer click en "show") |
| `TWILIO_WHATSAPP_NUMBER` | Sandbox for WhatsApp → número del sandbox, con prefijo `whatsapp:` |
| `TWILIO_TARGET_SHOP_ID` | Ver abajo |

### Obtener el TWILIO_TARGET_SHOP_ID

Es el ID interno de la pastelería en la base de datos. Correr:

```bash
# Desde pasteleriapp/
npx prisma studio
```

Ir a la tabla `Shop`, copiar el `id` de la pastelería que va a recibir los pedidos por WhatsApp.

O con una query directa:

```bash
npx prisma db execute --stdin <<< "SELECT id, nombre FROM \"Shop\";"
```

---

## Paso 6 — Reiniciar y probar

```bash
# Reiniciar el servidor para que tome las nuevas variables
npm run dev
```

Desde WhatsApp, mandá `hola` al número del Sandbox. El bot debería responder.

---

## Flujo del bot

```
Vos:  hola
Bot:  ¿Para qué fecha necesitás el pedido? (ej: 20/06/2026)

Vos:  25/06/2026
Bot:  Perfecto, para el 25/06/2026. ¿Qué querés pedir?
      1. Torta de fresas - $3200
      2. Torta de chocolate - $3500
      ...
      Respondé con el número.

Vos:  1
Bot:  Excelente, Torta de fresas. ¿Alguna personalización? o escribí "ninguna"

Vos:  Feliz cumple Ana
Bot:  ¿Restricciones alimentarias? o "ninguna"

Vos:  ninguna
Bot:  Resumen:
      📅 25/06/2026
      🎂 Torta de fresas
      ✏️  Feliz cumple Ana
      💰 $3200
      ¿Confirmamos? (si/no)

Vos:  si
Bot:  ✅ ¡Pedido registrado! Seguilo aquí:
      http://localhost:3000/seguimiento/abc123...
```

El pedido aparece en el panel en **Pedidos → Kanban → columna "Nuevo"**.

---

## Notas

- El Sandbox de Twilio es solo para pruebas. Para producción se necesita un número de WhatsApp Business aprobado.
- La URL de ngrok cambia cada vez que reiniciás ngrok (plan gratuito). Hay que actualizar el webhook en Twilio cada vez.
- Si `NEXT_PUBLIC_APP_URL` sigue siendo `http://localhost:3000`, el link de seguimiento que manda el bot va a ser local. Para que el cliente pueda abrirlo, cambiarlo por la URL de ngrok.
