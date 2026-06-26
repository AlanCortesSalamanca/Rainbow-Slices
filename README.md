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

## Flujo Operativo MVP

1. Crear productos activos. Si el producto es por rebanada, configura `Unidades generadas por producción` con las rebanadas reales que genera un cheesecake.
2. Registrar producción desde `Producción`. Si el producto no tiene receta, se permite producción manual sin descontar ingredientes y se incrementa stock terminado.
3. Ver stock en `Inventario terminado`.
4. Crear pedidos seleccionando productos activos con stock disponible.
5. Al guardar un pedido, el backend reserva stock con movimiento `reserved` y el stock baja inmediatamente.
6. Si se cancela antes de entregar, el backend libera reserva con `unreserved`.
7. Si se entrega, el backend registra `unreserved` y `sold` para mantener historial sin doble descuento, y genera ingreso automático.

## Estructura

```text
frontend/   Aplicación React administrativa.
backend/    API REST y reglas de negocio.
database/   Migraciones, seeds y notas de base de datos.
docs/       Especificación funcional, arquitectura, API y modelo de datos.
```
