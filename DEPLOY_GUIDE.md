# Guía de Deploy — Ediciones Felicitas
### Paso a paso para llevar el sitio a producción

**Tiempo estimado:** 45–60 minutos  
**Quién lo hace:** El cliente, con asistencia del desarrollador si es necesario  
**Resultado:** Sitio web 100% funcional en internet, con pagos reales y libros digitales protegidos

---

## Resumen de plataformas

| Plataforma | Para qué sirve | Costo |
|------------|---------------|-------|
| **Cloudflare R2** | Guardar portadas e libros digitales | Gratis hasta 10GB |
| **Railway** | Servidor backend + base de datos PostgreSQL | ~$5 USD/mes |
| **Vercel** | Frontend (el sitio web que ve el cliente) | Gratis |
| **MercadoPago** | Recibir pagos | Comisión por venta |

---

## PASO 1 — Cloudflare R2 (almacenamiento de archivos)

> **Qué hace:** Guarda de forma segura las portadas de los libros y los archivos digitales (PDF/epub) que los compradores descargan después de pagar.

### 1.1 Crear cuenta

1. Ir a **[cloudflare.com](https://cloudflare.com)**
2. Hacer clic en **"Sign Up"**
3. Completar con email y contraseña
4. Verificar el email

### 1.2 Crear el bucket

1. En el panel de Cloudflare, ir a **R2** en el menú izquierdo
2. Hacer clic en **"Create bucket"**
3. En **Bucket name** escribir exactamente: `ediciones-felicitas`
4. Dejar el resto por defecto → hacer clic en **"Create bucket"**

### 1.3 Habilitar acceso público (para las portadas)

1. Dentro del bucket recién creado, ir a la pestaña **"Settings"**
2. Buscar la sección **"Public access"**
3. Hacer clic en **"Allow Access"** → confirmar
4. Aparecerá una URL con formato:
   ```
   https://pub-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.r2.dev
   ```
5. **Copiar esa URL** — se va a necesitar más adelante como `R2_PUBLIC_URL`

### 1.4 Crear credenciales de API

1. Volver a la pantalla principal de R2
2. Hacer clic en **"Manage R2 API Tokens"** (esquina superior derecha)
3. Hacer clic en **"Create API Token"**
4. Configurar así:
   - **Token name:** `ediciones-felicitas-backend`
   - **Permissions:** `Object Read & Write`
   - **Specify bucket:** seleccionar `ediciones-felicitas`
5. Hacer clic en **"Create API Token"**
6. **IMPORTANTE:** En la pantalla siguiente aparecen los valores. Copiarlos AHORA porque no se vuelven a mostrar:

| Variable | Valor a copiar |
|----------|---------------|
| `R2_ACCOUNT_ID` | Account ID (aparece en la misma página) |
| `R2_ACCESS_KEY_ID` | Access Key ID |
| `R2_SECRET_ACCESS_KEY` | Secret Access Key |

---

## PASO 2 — Railway (servidor + base de datos)

> **Qué hace:** Corre el servidor que procesa los pedidos, se comunica con MercadoPago y guarda toda la información en una base de datos PostgreSQL.

### 2.1 Aceptar la invitación

1. Revisar el email — el desarrollador habrá enviado una invitación al proyecto de Railway
2. Hacer clic en el link de invitación
3. Crear cuenta o iniciar sesión en **[railway.app](https://railway.app)**
4. Aceptar la invitación al proyecto `ediciones-felicitas`

### 2.2 Verificar que el proyecto tiene los servicios

Una vez dentro del proyecto de Railway, deberían verse dos servicios:
- **Backend** (el servidor Node.js)
- **PostgreSQL** (la base de datos)

Si no están, avisar al desarrollador antes de continuar.

### 2.3 Configurar las variables de entorno

1. Hacer clic en el servicio **Backend**
2. Ir a la pestaña **"Variables"**
3. Hacer clic en **"New Variable"** y agregar cada una de estas:

> ⚠️ Agregar cada variable por separado. No copiar el bloque entero.

**Variables básicas:**

| Variable | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |

**Variables del administrador:**

| Variable | Valor |
|----------|-------|
| `ADMIN_USER` | El nombre de usuario admin que quieras (ej: `felicitas_admin`) |
| `ADMIN_PASSWORD` | Una contraseña segura (mínimo 12 caracteres, con mayúsculas, números y símbolos) |

**Variables de seguridad:**

| Variable | Valor |
|----------|-------|
| `JWT_SECRET` | Un texto largo y aleatorio — ver instrucción abajo |

> Para generar el `JWT_SECRET`: ir a **[generate-secret.vercel.app](https://generate-secret.vercel.app/64)** — copiar el texto que aparece (es un código de 64 caracteres). No compartirlo con nadie.

**Variables de base de datos:**

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | Se copia automáticamente si Railway conecta el servicio PostgreSQL |
| `DB_SSL_REJECT_UNAUTHORIZED` | `false` |

> Para obtener `DATABASE_URL`: hacer clic en el servicio **PostgreSQL** → pestaña **"Variables"** → copiar el valor de `DATABASE_URL` y pegarlo en las variables del Backend.

**Variables de MercadoPago** *(completar en el Paso 3)*:

| Variable | Valor |
|----------|-------|
| `MP_ACCESS_TOKEN` | *(se obtiene en el Paso 3)* |
| `MP_WEBHOOK_SECRET` | *(se obtiene en el Paso 3)* |

**Variables de Cloudflare R2** *(copiar los valores del Paso 1)*:

| Variable | Valor |
|----------|-------|
| `R2_ACCOUNT_ID` | El que se copió en el Paso 1.4 |
| `R2_ACCESS_KEY_ID` | El que se copió en el Paso 1.4 |
| `R2_SECRET_ACCESS_KEY` | El que se copió en el Paso 1.4 |
| `R2_BUCKET_NAME` | `ediciones-felicitas` |
| `R2_PUBLIC_URL` | La URL del Paso 1.3 (formato `https://pub-xxxx.r2.dev`) |

**Variables de URLs** *(completar después del Paso 4)*:

| Variable | Valor |
|----------|-------|
| `FRONTEND_URL` | *(se obtiene en el Paso 4 — la URL de Vercel)* |
| `BACKEND_URL` | La URL del propio servicio en Railway |

> Para obtener `BACKEND_URL`: en el servicio Backend de Railway → pestaña **"Settings"** → sección **"Domains"** → copiar la URL que aparece (formato `https://algo.up.railway.app`).

### 2.4 Hacer el deploy

1. Ir a la pestaña **"Deployments"** del servicio Backend
2. Hacer clic en **"Deploy"** (o el deploy debería iniciar automáticamente al guardar variables)
3. Esperar 2–3 minutos
4. Verificar que el log termina con:
   ```
   Database connected successfully.
   Server running on port 3001
   ```

Si aparece un error `ERROR: Faltan variables de entorno requeridas`, revisar que todas las variables del punto 2.3 estén cargadas correctamente.

---

## PASO 3 — MercadoPago

> **Qué hace:** Conecta el sitio con tu cuenta de MercadoPago para recibir pagos reales.

### 3.1 Obtener credenciales de producción

1. Iniciar sesión en **[mercadopago.com.ar](https://mercadopago.com.ar)**
2. Ir al **Panel de Desarrolladores**: [mercadopago.com.ar/developers/panel/app](https://mercadopago.com.ar/developers/panel/app)
3. Seleccionar la aplicación `ediciones-felicitas` (o crearla si no existe)
4. Ir a **"Credenciales de producción"**
5. Copiar el **Access Token de producción** (empieza con `APP_USR-`)
6. Volver a Railway y completar la variable `MP_ACCESS_TOKEN` con ese valor

> ⚠️ **Importante:** Usar las credenciales de **producción**, no las de prueba (test). Las de prueba empiezan con `TEST-`.

### 3.2 Configurar el webhook

El webhook es la forma en que MercadoPago avisa al sitio cuando alguien pagó.

1. En el panel de desarrolladores, ir a **"Webhooks"**
2. Hacer clic en **"Configurar notificaciones"**
3. Completar así:
   - **URL:** `https://[tu-backend-railway].up.railway.app/api/orders/webhook`
   - Reemplazar `[tu-backend-railway]` con el dominio real de Railway del Paso 2.3
   - **Eventos:** seleccionar `Pagos`
4. Hacer clic en **"Guardar"**
5. Una vez guardado, aparece la **Clave secreta del webhook**
6. Copiar esa clave y cargarla en Railway como `MP_WEBHOOK_SECRET`

---

## PASO 4 — Vercel (frontend)

> **Qué hace:** Publica el sitio web que los usuarios visitan — el catálogo, el carrito, el checkout y el panel de administración.

### 4.1 Aceptar la invitación

1. Revisar el email — el desarrollador habrá enviado una invitación al proyecto de Vercel
2. Hacer clic en el link → crear cuenta o iniciar sesión en **[vercel.com](https://vercel.com)**
3. Aceptar la invitación al proyecto

### 4.2 Verificar el deploy

1. Una vez dentro del proyecto en Vercel, debería verse un deploy reciente
2. Hacer clic en **"Visit"** para ver el sitio
3. Si el sitio carga correctamente, el frontend está listo

### 4.3 Copiar la URL del frontend

1. En el panel de Vercel, copiar la URL del proyecto (formato `https://ediciones-felicitas.vercel.app` o con dominio propio)
2. Volver a Railway y completar la variable `FRONTEND_URL` con esa URL
3. Hacer un nuevo deploy en Railway para que tome el nuevo valor

---

## PASO 5 — Verificación final

Una vez completados todos los pasos anteriores, verificar que todo funciona:

### ✅ Checklist de verificación

**El sitio:**
- [ ] Entrar al sitio desde el link de Vercel — debe cargar el catálogo
- [ ] Hacer clic en un libro — debe mostrar el detalle
- [ ] Agregar al carrito — debe funcionar

**El panel admin:**
- [ ] Ir a `https://[tu-sitio]/admin`
- [ ] Iniciar sesión con el `ADMIN_USER` y `ADMIN_PASSWORD` configurados
- [ ] Verificar que se ven los libros en el inventario
- [ ] Subir una portada de prueba — debe aparecer en el libro

**Los pagos:**
- [ ] Hacer un pedido de prueba completo (con una tarjeta de prueba de MercadoPago)
- [ ] Verificar que la orden aparece en el panel admin con estado "Aprobado"

---

## Resolución de problemas comunes

**El backend no arranca:**
> Revisar que todas las variables de entorno estén cargadas en Railway. El log del deploy muestra exactamente cuál falta.

**Las imágenes no cargan:**
> Verificar que `R2_PUBLIC_URL` esté correcta y que el bucket tenga Public Access habilitado (Paso 1.3).

**Los pagos no se acreditan:**
> Verificar que `MP_ACCESS_TOKEN` sean las credenciales de **producción** y que el webhook esté configurado con la URL correcta de Railway.

**El panel admin no deja entrar:**
> Verificar que `ADMIN_USER` y `ADMIN_PASSWORD` estén cargados en Railway y que el deploy se haya reiniciado después de cargarlos.

---

## Contacto

Ante cualquier duda o problema durante el proceso, contactar al desarrollador.  
El tiempo estimado de resolución de cualquier inconveniente técnico es de **menos de 2 horas** en horario laboral.

---

*Documento generado para el proyecto Ediciones Felicitas — Abril 2026*
