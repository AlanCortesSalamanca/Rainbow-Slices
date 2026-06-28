# Rainbow Slices Admin

Aplicación web privada para administrar Rainbow Slices, un emprendimiento de cheesecakes en Morelia. El MVP cubre catálogo, ingredientes, recetas, producción, inventario terminado, pedidos, entregas, gastos, ingresos y reportes básicos.

## Stack

- Frontend: React, Vite, TypeScript, React Router y CSS puro.
- Backend: Node.js, Express, TypeScript, Zod y Supabase JS Client.
- Base de datos: Supabase/PostgreSQL con migraciones SQL versionadas.

## Desarrollo local

1. Instalar dependencias:

```bash
npm run install:all
```

2. Configurar variables de entorno:

- `backend/.env`
- `frontend/.env` si aplica

3. Levantar frontend y backend al mismo tiempo:

```bash
npm run dev
```

4. URLs esperadas:

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

La service role key de Supabase solo debe vivir en `backend/.env`. Nunca debe colocarse en frontend ni en variables `VITE_`.

## Vista pública

- `/` muestra la landing pública de Rainbow Slices para clientes.
- `/login` entra al panel administrativo privado.
- Los botones de pedido abren WhatsApp con mensajes prellenados al número `2761274898`.
- La sección “Elige tu sabor favorito” consume `GET /api/public/products` para mostrar productos activos reales.
- El endpoint público solo devuelve datos seguros de cliente: nombre, descripción, presentación, precio, imagen y stock actual.
- La vista pública no usa `AppLayout` administrativo ni muestra sidebar.
- El panel administrativo sigue protegido detrás de `/login`.
- Las tablas de Supabase tienen RLS habilitado; el frontend no consulta tablas directamente.

## Instalación Manual

```bash
cd rainbow-slices-admin/frontend
npm install

cd ../backend
npm install
```

## Variables De Entorno

Copia `backend/.env.example` a `backend/.env` y configura los valores reales:

```bash
cp backend/.env.example backend/.env
```

El backend debe usar una llave segura para operaciones administrativas. No coloques credenciales reales en archivos versionados.

Para imágenes de productos, `SUPABASE_STORAGE_BUCKET` debe contener solo el nombre del bucket de Supabase Storage, no una URL del dashboard. Ejemplo:

```env
SUPABASE_STORAGE_BUCKET=rainbaw-slices-web
```

También copia `frontend/.env.example` a `frontend/.env` y configura la URL de API y las credenciales públicas de Supabase Auth:

```bash
cp frontend/.env.example frontend/.env
```

## Autenticación administrativa

1. Configurar `backend/.env`:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`

2. Configurar `frontend/.env`:

- `VITE_API_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

3. Crear admin inicial:

```bash
npm run create:admin
```

4. Levantar app:

```bash
npm run dev
```

5. Abrir login:

```text
http://localhost:5173/login
```

Notas de seguridad:

- `SUPABASE_SERVICE_ROLE_KEY` nunca debe ir en frontend.
- `VITE_SUPABASE_ANON_KEY` sí puede vivir en frontend porque es la key pública para Supabase Auth.
- No commitear `.env` reales.

## Supabase Storage para imágenes de productos

- Crea el bucket en Supabase Dashboard → Storage.
- Configura `SUPABASE_STORAGE_BUCKET` en `backend/.env` con solo el nombre del bucket.
- No uses URLs como `https://supabase.com/dashboard/project/.../storage/files/buckets/...` en `SUPABASE_STORAGE_BUCKET`.
- Si se usan URLs públicas en `products.image_url`, el bucket debe ser público o tener una policy que permita lectura pública.
- El backend rechaza buckets privados en este flujo para evitar guardar URLs públicas que no abren en navegador.
- El backend sube imágenes mediante `POST /api/uploads/product-image`.
- El frontend guarda la URL pública devuelta en `products.image_url`.
- Para imágenes públicas de productos, se recomienda un bucket público como `rainbaw-slices-web`.

## Deploy En Vercel

El archivo `vercel.json` en la raíz despliega solo el frontend React/Vite:

- Install command: `npm --prefix frontend install`
- Build command: `npm --prefix frontend run build`
- Output directory: `frontend/dist`
- Rewrites configurados para React Router y rutas como `/login`, `/products` o `/orders`.

Variables requeridas en Vercel:

```env
VITE_API_URL=https://tu-backend.com/api
VITE_SUPABASE_URL=https://tu-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

El backend Express no queda desplegado por Vercel con esta configuración. Debe estar publicado en un servicio Node.js compatible y su URL debe configurarse en `VITE_API_URL`.

Variables requeridas en el backend desplegado:

```env
NODE_ENV=production
CORS_ORIGIN=https://tu-app.vercel.app,https://tu-dominio.com
SUPABASE_URL=https://tu-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
SUPABASE_STORAGE_BUCKET=rainbaw-slices-web
```

`CORS_ORIGIN` acepta varios orígenes separados por coma para permitir el dominio de Vercel y un dominio personalizado.

## Correr Frontend Manualmente

```bash
cd frontend
npm run dev
```

## Correr Backend Manualmente

```bash
cd backend
npm run dev
```

Con los scripts raíz, la API quedará disponible en `http://localhost:3000/api` durante desarrollo local.

## Migraciones

Ejecuta los archivos de `database/migrations` en orden ascendente desde el SQL editor de Supabase o usando tu flujo de migraciones preferido.

Nota de seguridad: `database/migrations/010_clear_business_data.sql` es una migración histórica destructiva que ejecuta `TRUNCATE`. No debe repetirse manualmente en producción. Para limpieza controlada de bases locales o QA descartables, usa `database/manual/clear_business_data.sql` solo después de respaldar datos y confirmar que no estás conectado a producción.

## Flujo Operativo MVP

1. Crear productos activos. Si el producto es por rebanada, configura `Unidades generadas por producción` con las rebanadas reales que genera un cheesecake.
2. Registrar producción desde `Producción`. Si el producto no tiene receta, se permite producción manual sin descontar ingredientes y se incrementa stock terminado.
3. Ver stock en `Inventario terminado`.
4. Abrir el detalle de inventario de un producto para revisar movimientos por producción, pedido, merma o ajuste.
5. Registrar merma solo si hay stock suficiente; la merma inserta `waste` negativo y no genera gasto.
6. Registrar ajuste manual con nota obligatoria; los ajustes negativos no pueden dejar stock menor a 0.
7. Crear pedidos seleccionando productos activos con stock disponible.
8. Al guardar un pedido, el backend reserva stock con movimiento `reserved` y el stock baja inmediatamente.
9. Si se cancela antes de entregar, el backend libera reserva con `unreserved`.
10. Si se entrega, el backend registra `unreserved` y `sold` para mantener historial sin doble descuento, y genera ingreso automático.

El stock terminado se calcula como la suma de `finished_inventory_movements.quantity` por producto. Los movimientos esperados son `production_output`, `reserved`, `unreserved`, `sold`, `waste` y `adjustment`.

Estados permitidos de pedido:

- `pending` -> `confirmed`
- `confirmed` -> `in_preparation`
- `in_preparation` -> `ready`
- `ready` -> entrega mediante acción `Marcar entregado`
- `pending`, `confirmed`, `in_preparation`, `ready` pueden cancelarse
- `delivered` y `cancelled` son estados finales

Pedidos mayores a $300 MXN requieren anticipo antes de confirmarse.

## Estructura

```text
frontend/   Aplicación React pública y administrativa.
backend/    API REST y reglas de negocio.
database/   Migraciones, seeds y notas de base de datos.
docs/       Especificación funcional, arquitectura, API y modelo de datos.
```
