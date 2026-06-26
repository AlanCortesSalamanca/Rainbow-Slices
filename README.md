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

## Estructura

```text
frontend/   Aplicación React administrativa.
backend/    API REST y reglas de negocio.
database/   Migraciones, seeds y notas de base de datos.
docs/       Especificación funcional, arquitectura, API y modelo de datos.
```
