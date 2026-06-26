# Architecture

## Stack

- Frontend: React, Vite, TypeScript, React Router y CSS puro.
- Backend: Node.js, Express, TypeScript, Zod y Supabase JS Client.
- Database: Supabase/PostgreSQL.

## Separación Frontend/Backend

El frontend no se conecta directamente a Supabase para operaciones críticas. Consume la API REST del backend. El backend concentra reglas de negocio, validaciones, inventario, producción, pedidos, gastos e ingresos.

## Backend

- `routes`: define endpoints HTTP.
- `controllers`: adapta request/response.
- `services`: reglas de negocio y orquestación.
- `repositories`: acceso a Supabase y RPC SQL.
- `schemas`: validación Zod.
- `middlewares`: errores, 404 y validación.
- `utils`: helpers compartidos.

## Frontend

- `pages`: pantallas administrativas.
- `components`: UI reutilizable.
- `services`: cliente HTTP por módulo.
- `types`: modelos TypeScript por dominio.
- `utils`: helpers de formato.
- `styles`: estilos globales.

## Convenciones De Archivos

- Componentes React en PascalCase y extensión `.tsx`.
- Servicios en camelCase con sufijo `.service.ts`.
- Tipos por dominio con sufijo `.types.ts`.
- CSS siempre separado en archivos `.css`.
- No se usa Tailwind, styled-components ni CSS-in-JS.
- HTML puro solo en `index.html`.
- JSX solo dentro de `.tsx`.
