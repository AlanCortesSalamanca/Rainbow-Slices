# API Spec

Base URL local: `http://localhost:3000/api`.

Todos los endpoints administrativos requieren:

```http
Authorization: Bearer <access_token>
```

El token debe venir de Supabase Auth y pertenecer a un usuario con `role: "admin"` en `user_metadata` o `app_metadata`.

## Auth

- `GET /auth/me`: devuelve el usuario autenticado.

Respuesta:

```json
{
  "id": "uuid",
  "email": "admin@example.com",
  "role": "admin",
  "name": "Administrador"
}
```

## Products

- `GET /products`: lista productos. Query opcional: `status`, `presentation`.
- `GET /products/:id`: detalle con costo y disponibilidad.
- `POST /products`: crea producto.
- `PUT /products/:id`: actualiza producto.
- `PATCH /products/:id/status`: cambia `active` o `inactive`.
- `DELETE /products/:id`: desactiva producto.

Payload mínimo de creación:

```json
{
  "name": "Cheesecake de Oreo Rebanada",
  "presentation": "slice",
  "sale_price": 55
}
```

## Ingredients

- `GET /ingredients`
- `GET /ingredients/:id`
- `POST /ingredients`
- `PUT /ingredients/:id`
- `PATCH /ingredients/:id/status`
- `POST /ingredients/:id/stock`

Stock payload:

```json
{
  "quantity": 1000,
  "total_cost": 180,
  "notes": "Compra semanal"
}
```

## Recipes

- `GET /products/:productId/recipe`
- `POST /products/:productId/recipe`
- `PUT /products/:productId/recipe`
- `DELETE /products/:productId/recipe/:recipeItemId`

Payload:

```json
{
  "items": [
    { "ingredient_id": "uuid", "quantity_required": 500 }
  ]
}
```

## Production

- `GET /production`
- `POST /production`

Payload:

```json
{
  "product_id": "uuid",
  "batches_quantity": 1,
  "notes": "Producción para viernes"
}
```

Respuesta de creación:

```json
{
  "id": "uuid",
  "product_id": "uuid",
  "batches_quantity": 1,
  "units_produced": 9,
  "production_mode": "manual",
  "estimated_total_cost": 0
}
```

Si el producto no tiene receta, `production_mode` será `manual` y no se descuentan ingredientes.

## Inventory

- `GET /inventory/finished`
- `GET /inventory/ingredients`
- `POST /inventory/finished/adjustment`
- `POST /inventory/finished/waste`

## Orders

- `GET /orders`
- `GET /orders/:id`
- `POST /orders`
- `PUT /orders/:id`
- `PATCH /orders/:id/status`
- `POST /orders/:id/deliver`
- `POST /orders/:id/cancel`

Payload de creación:

```json
{
  "customer_name": "Cliente",
  "customer_phone": "4430000000",
  "delivery_date": "2026-06-30",
  "delivery_time": "16:00",
  "delivery_point_id": "uuid",
  "delivery_fee": 15,
  "deposit_paid": 0,
  "items": [
    {
      "product_id": "uuid",
      "product_name": "Cheesecake de Fresa Rebanada",
      "presentation": "slice",
      "quantity": 2,
      "unit_price": 55
    }
  ]
}
```

Al crear pedido, el backend valida stock y crea movimientos `reserved`. Si el stock no alcanza, responde `400` y no crea pedido parcial.

## Delivery Points

- `GET /delivery-points`: lista puntos activos de entrega.

## Expenses

- `GET /expenses`
- `POST /expenses`

Solo acepta gastos manuales no relacionados a ingredientes.

## Reports

- `GET /reports/summary`
- `GET /reports/sales-by-product`
- `GET /reports/sales-by-delivery-point`
- `GET /reports/stock-low`
- `GET /reports/waste`

Los endpoints de reportes aceptan `from` y `to` cuando aplica.

## Uploads

- `POST /uploads/product-image`: sube una imagen de producto a Supabase Storage y devuelve una URL pública.

Payload: `multipart/form-data` con campo `image`.

Respuesta:

```json
{
  "imageUrl": "https://..."
}
```

Restricciones:

- Formatos permitidos: JPEG, PNG, WEBP y GIF.
- Tamaño máximo: 5 MB.
- El frontend debe guardar la URL devuelta en `products.image_url` mediante `POST /products` o `PUT /products/:id`.

## Errores Comunes

- `400`: payload inválido, regla de negocio incumplida o RPC SQL rechazada.
- `401`: token faltante, inválido o expirado.
- `403`: usuario autenticado sin rol admin.
- `404`: recurso no encontrado.
- `500`: error inesperado de servidor o Supabase.
