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

- `GET /inventory/finished`: lista stock terminado por producto.
- `GET /inventory/finished/:productId`: detalle del producto con resumen y movimientos recientes.
- `GET /inventory/finished/:productId/movements`: movimientos filtrables del producto.
- `GET /inventory/ingredients`
- `POST /inventory/finished/adjustment`: registra ajuste manual.
- `POST /inventory/finished/waste`: registra merma.

Query params opcionales para `GET /inventory/finished`:

- `search`
- `presentation`: `slice`, `whole`, `mini`, `custom`
- `status`: `with_stock`, `out_of_stock`, `negative`
- `sort`: `stock_asc`, `stock_desc`, `name`

Respuesta de `GET /inventory/finished`:

```json
[
  {
    "product_id": "uuid",
    "name": "Cheesecake de Fresa",
    "image_url": "https://...",
    "presentation": "slice",
    "sale_price": 55,
    "pieces_per_batch": 9,
    "current_stock": 12,
    "status": "available"
  }
]
```

Query params opcionales para `GET /inventory/finished/:productId/movements`:

- `movement_type`: `production_output`, `reserved`, `unreserved`, `sold`, `waste`, `adjustment`
- `date_from`
- `date_to`
- `related_order_id`
- `related_production_batch_id`

Payload de merma:

```json
{
  "product_id": "uuid",
  "quantity": 2,
  "notes": "Se dañaron durante transporte"
}
```

Reglas de merma:

- `quantity` debe ser mayor a 0.
- No puede ser mayor al stock actual.
- Inserta `movement_type = waste` con cantidad negativa.
- No genera gasto.

Payload de ajuste manual:

```json
{
  "product_id": "uuid",
  "quantity": -1,
  "notes": "Corrección por conteo físico"
}
```

Reglas de ajuste:

- `quantity` no puede ser 0.
- Las notas son obligatorias.
- Si `quantity` es negativo, no puede dejar stock menor a 0.
- Inserta `movement_type = adjustment` con la cantidad indicada.

## Orders

- `GET /orders`
- `GET /orders/:id`
- `POST /orders`
- `PUT /orders/:id`
- `PATCH /orders/:id/status`
- `POST /orders/:id/deliver`
- `POST /orders/:id/cancel`

Query params opcionales para `GET /orders`:

- `status`
- `payment_status`
- `delivery_date`
- `delivery_point_id`
- `search`

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

Transiciones de estado:

- `pending` a `confirmed`
- `confirmed` a `in_preparation`
- `in_preparation` a `ready`
- `ready` se entrega con `POST /orders/:id/deliver`

`PATCH /orders/:id/status` no permite marcar `delivered` ni `cancelled`; esas acciones usan endpoints específicos.

Reglas de anticipo:

- Si `total > 300`, no se permite confirmar sin `deposit_paid > 0`.
- Si `deposit_paid > 0` y es menor al total, `payment_status = deposit_paid`.
- Si `deposit_paid >= total`, `payment_status = paid`.

`PUT /orders/:id` permite actualizar datos básicos si el pedido no está `delivered` ni `cancelled`:

- cliente
- teléfono
- fecha/hora/punto de entrega
- costo de entrega
- anticipo pagado
- notas

No edita items en esta etapa para no romper reservas de stock.

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
