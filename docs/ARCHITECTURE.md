# Architecture

## Stack

- Frontend: React, Vite, TypeScript, React Router y CSS puro.
- Backend: Node.js, Express, TypeScript, Zod y Supabase JS Client.
- Database: Supabase/PostgreSQL.

## Separación Frontend/Backend

El frontend no se conecta directamente a Supabase para operaciones críticas. Consume la API REST del backend. El backend concentra reglas de negocio, validaciones, inventario, producción, pedidos, gastos e ingresos.

La vista pública también consume backend, pero solo mediante endpoints públicos explícitos bajo `/api/public`. El frontend público nunca usa Supabase directamente ni recibe llaves privilegiadas.

## Autenticación

El frontend usa Supabase Auth únicamente para iniciar sesión, mantener sesión local y obtener el `access_token`. No usa Supabase para operaciones críticas de negocio.

Flujo:

1. El usuario entra a `/login`.
2. El frontend autentica con Supabase Auth usando `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
3. Supabase devuelve una sesión con `access_token`.
4. `apiClient` adjunta `Authorization: Bearer <access_token>` a cada request de negocio.
5. El backend valida el token con Supabase Auth.
6. El middleware exige `role: admin` en `user_metadata` o `app_metadata`.
7. Si el token falta o expiró, responde `401`; si no tiene rol admin, responde `403`.

La `SUPABASE_SERVICE_ROLE_KEY` vive solo en backend y se usa para tareas administrativas como crear el usuario admin inicial. Nunca se expone al frontend.

El backend también aplica headers de seguridad con `helmet` y rate limiting básico sobre `/api` para reducir abuso accidental o automatizado.

## Backend

- `routes`: define endpoints HTTP.
- `controllers`: adapta request/response.
- `services`: reglas de negocio y orquestación.
- `repositories`: acceso a Supabase y RPC SQL.
- `schemas`: validación Zod.
- `middlewares`: errores, 404 y validación.
- `auth.middleware`: valida JWT de Supabase y autoriza solo usuarios admin.
- `utils`: helpers compartidos.

## Endpoints Públicos Y Administrativos

- `/api/public/products` es público y no requiere token; solo expone productos activos con campos seguros para cliente.
- `/api/public/*` tiene rate limit adicional para tráfico anónimo.
- `/api/auth` queda público para login/me administrativo según corresponda.
- Después de esas rutas, `routes/index.ts` aplica `requireAdminAuth` para proteger `/api/products`, `/api/orders`, `/api/inventory`, `/api/production`, `/api/reports` y demás endpoints admin.
- La service role key de Supabase permanece únicamente en backend y nunca se expone al frontend público ni admin.
- Las tablas de aplicación tienen RLS habilitado y se revoca acceso directo a `anon`/`authenticated`; las operaciones de negocio pasan por backend.

## Supabase Storage

- Las imágenes de productos se suben desde el panel admin mediante `POST /api/uploads/product-image`.
- El frontend no sube archivos directo a Supabase Storage; envía `multipart/form-data` al backend.
- El backend valida formato, tamaño, nombre del bucket y existencia del bucket antes de subir.
- Como el flujo guarda URLs públicas, el backend también valida que el bucket sea público para evitar URLs rotas.
- `SUPABASE_STORAGE_BUCKET` debe ser solo el nombre del bucket, por ejemplo `rainbaw-slices-web`.
- El backend usa `supabase.storage.from(bucket).upload(...)` y obtiene la URL con `getPublicUrl(...)`.
- La URL pública devuelta se guarda en `products.image_url`.
- Para que `products.image_url` abra en navegador y en la landing pública, el bucket debe ser público o tener policy de lectura pública.

## Inventario Y Pedidos

El inventario terminado se calcula por movimientos en `finished_inventory_movements`.

- Producción crea `production_output` positivo.
- Pedido crea `reserved` negativo y baja stock disponible.
- Cancelación crea `unreserved` positivo y regresa stock reservado.
- Entrega crea `unreserved` positivo y `sold` negativo para mantener historial sin doble descuento.
- Merma crea `waste` negativo y no genera gasto.
- Ajuste manual crea `adjustment` positivo o negativo con nota obligatoria.

Las operaciones críticas de producción y pedido usan funciones PostgreSQL para mantener atomicidad y evitar pedidos parcialmente creados.

Merma y ajuste manual usan funciones PostgreSQL con `pg_advisory_xact_lock` por producto para validar stock actual e impedir que dos operaciones concurrentes dejen inventario negativo.

El backend expone `vw_finished_inventory_movements_detail` mediante el repository de inventario para trazar movimientos con producto, pedido, item de pedido y lote de producción relacionados. El frontend solo consume endpoints REST protegidos y nunca consulta Supabase directamente para inventario.

El backend valida transiciones de estado de pedido en `orders.service`. El frontend muestra acciones permitidas para UX, pero la autorización real de estados y anticipo ocurre en backend.

## Frontend

- `pages`: pantallas públicas y administrativas.
- `components`: UI reutilizable.
- `services`: cliente HTTP por módulo.
- `types`: modelos TypeScript por dominio.
- `utils`: helpers de formato.
- `styles`: estilos globales.
- `auth`: cliente de Supabase Auth, contexto de sesión y rutas protegidas.

## Vista Pública Y Admin

- `/` renderiza `PublicHomePage` como landing pública para clientes.
- La vista pública no usa `AppLayout`, no muestra sidebar y no requiere sesión.
- La vista pública consume `GET /api/public/products` mediante un cliente público sin `Authorization` para mostrar sabores reales.
- Los CTAs de pedido abren WhatsApp con mensajes prellenados.
- `/login` conserva el acceso administrativo con Supabase Auth.
- Las rutas administrativas (`/products`, `/orders`, `/inventory`, etc.) siguen envueltas en `ProtectedRoute` y `AppLayout`.
- Los componentes públicos viven separados bajo `components/public` para no acoplar la landing con el panel admin.

## Deploy

- Vercel despliega el frontend estático desde `frontend/dist` usando `vercel.json` en la raíz del monorepo.
- React Router usa rewrites a `index.html` para que rutas públicas y admin funcionen al refrescar navegador.
- El backend Express requiere un runtime Node.js aparte y debe exponer una URL HTTPS configurada en `VITE_API_URL`.
- El backend valida CORS con `CORS_ORIGIN`; puede recibir múltiples dominios separados por coma para producción y previews.
- Las variables `SUPABASE_SERVICE_ROLE_KEY` y `SUPABASE_STORAGE_BUCKET` solo viven en el backend desplegado, nunca en Vercel frontend.

## Convenciones De Archivos

- Componentes React en PascalCase y extensión `.tsx`.
- Servicios en camelCase con sufijo `.service.ts`.
- Tipos por dominio con sufijo `.types.ts`.
- CSS siempre separado en archivos `.css`.
- No se usa Tailwind, styled-components ni CSS-in-JS.
- HTML puro solo en `index.html`.
- JSX solo dentro de `.tsx`.
