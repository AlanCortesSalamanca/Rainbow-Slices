# Architecture

## Stack

- Frontend: React, Vite, TypeScript, React Router y CSS puro.
- Backend: Node.js, Express, TypeScript, Zod y Supabase JS Client.
- Database: Supabase/PostgreSQL.

## Separación Frontend/Backend

El frontend no se conecta directamente a Supabase para operaciones críticas. Consume la API REST del backend. El backend concentra reglas de negocio, validaciones, inventario, producción, pedidos, gastos e ingresos.

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

## Frontend

- `pages`: pantallas administrativas.
- `components`: UI reutilizable.
- `services`: cliente HTTP por módulo.
- `types`: modelos TypeScript por dominio.
- `utils`: helpers de formato.
- `styles`: estilos globales.
- `auth`: cliente de Supabase Auth, contexto de sesión y rutas protegidas.

## Convenciones De Archivos

- Componentes React en PascalCase y extensión `.tsx`.
- Servicios en camelCase con sufijo `.service.ts`.
- Tipos por dominio con sufijo `.types.ts`.
- CSS siempre separado en archivos `.css`.
- No se usa Tailwind, styled-components ni CSS-in-JS.
- HTML puro solo en `index.html`.
- JSX solo dentro de `.tsx`.
