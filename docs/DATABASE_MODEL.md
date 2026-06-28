# Database Model

## Enums

- `presentation_type`: `slice`, `whole`, `mini`, `custom`.
- `product_status`: `active`, `inactive`.
- `inventory_movement_type`: `purchase`, `production_use`, `production_output`, `reserved`, `unreserved`, `sold`, `waste`, `adjustment`.
- `order_status`: `pending`, `confirmed`, `in_preparation`, `ready`, `delivered`, `cancelled`.
- `payment_status`: `unpaid`, `deposit_paid`, `paid`, `refunded`, `cancelled_no_refund`.
- `expense_category`: `ingredients`, `packaging`, `transport`, `advertising`, `utensils`, `services`, `other`.
- `expense_source`: `manual`, `ingredient_stock`.
- `income_source`: `order`, `manual`.
- `delivery_time_slot`: `11:00`, `16:00`.

## Tablas

- `products`: catálogo de productos y reglas de presentación.
- `ingredients`: catálogo de materia prima.
- `product_recipes`: ingredientes requeridos por batch.
- `ingredient_stock_movements`: movimientos de ingrediente.
- `production_batches`: lotes producidos.
- `production_batches.production_mode`: `recipe` si descuenta ingredientes por receta, `manual` si solo incrementa stock terminado.
- `finished_inventory_movements`: movimientos de inventario terminado.
- `customers`: clientes básicos.
- `delivery_points`: puntos fijos de entrega.
- `orders`: encabezado de pedidos.
- `order_items`: productos dentro de pedidos.
- `expenses`: gastos manuales y automáticos.
- `income_records`: ingresos manuales o por pedido.

## Relaciones

- `product_recipes.product_id` referencia `products.id`.
- `product_recipes.ingredient_id` referencia `ingredients.id`.
- `ingredient_stock_movements.ingredient_id` referencia `ingredients.id`.
- `ingredient_stock_movements.related_expense_id` referencia `expenses.id`.
- `production_batches.product_id` referencia `products.id`.
- `finished_inventory_movements.product_id` referencia `products.id`.
- `orders.customer_id` referencia `customers.id`.
- `orders.delivery_point_id` referencia `delivery_points.id`.
- `order_items.order_id` referencia `orders.id`.
- `order_items.product_id` referencia `products.id`.
- `income_records.order_id` referencia `orders.id`.

## Vistas

- `vw_ingredient_stock`: stock actual y bajo stock de ingredientes.
- `vw_ingredient_average_cost`: costo promedio ponderado de compras.
- `vw_product_recipe_costs`: costo por batch, costo unitario y ganancia estimada.
- `vw_product_availability`: si se puede preparar y batches disponibles.
- `vw_product_stock`: stock terminado por producto.
- `vw_finished_inventory_movements_detail`: movimientos terminados enriquecidos con producto, pedido, item de pedido y lote de producción.
- `vw_sales_report`: ventas, productos y puntos de entrega.

## Funciones

- `add_ingredient_stock`: crea gasto automático y movimiento positivo.
- `register_production`: valida receta y stock, crea lote, descuenta ingredientes y genera stock terminado.
- `register_production`: si hay receta descuenta ingredientes; si no hay receta permite producción manual con costo 0 y genera stock terminado.
- `create_order_with_reservations`: crea pedido, items y reservas de stock en una operación.
- `cancel_order_with_stock_release`: cancela pedido no entregado y libera stock reservado.
- `recalculate_order_totals`: recalcula subtotal, total, anticipo sugerido y saldo.
- `mark_order_delivered`: libera reserva, registra venta, marca entregado/pagado y crea ingreso sin duplicarlo.
- `register_finished_inventory_waste`: valida producto, stock suficiente y crea movimiento `waste` negativo de forma atómica.
- `register_finished_inventory_adjustment`: valida producto, nota obligatoria, stock final no negativo y crea movimiento `adjustment` de forma atómica.

## Migraciones Destructivas

- `010_clear_business_data.sql` es histórica y destructiva porque ejecuta `TRUNCATE` sobre datos de negocio. Se conserva para no reescribir historial de migraciones ya aplicado, pero no debe ejecutarse manualmente en producción.
- La versión manual para entornos locales o QA descartables vive en `database/manual/clear_business_data.sql` e incluye advertencias explícitas.

## Pedidos E Inventario

- `orders.status` controla el flujo operativo.
- `orders.payment_status` controla el estado de pago.
- `order_items` conserva nombre, presentación y precio para historial.
- `finished_inventory_movements.related_order_id` y `related_order_item_id` vinculan reservas, liberaciones y ventas con el pedido.
- Crear pedido genera `reserved` negativo.
- Cancelar pedido no entregado genera `unreserved` positivo.
- Entregar pedido genera `unreserved` positivo y `sold` negativo.
- Registrar merma genera `waste` negativo y no crea gasto.
- Registrar ajuste manual genera `adjustment` positivo o negativo; los negativos no pueden dejar stock menor a 0.
- `finished_inventory_movements.production_batch_id` vincula producción con `production_batches`.
- `set_updated_at`: actualiza `updated_at`.

## Triggers

- `updated_at` en productos, ingredientes, recetas, gastos, clientes y pedidos.
- `trg_set_order_item_line_total` calcula `line_total`.
- `trg_recalculate_order_after_item_change` recalcula totales del pedido.

## Índices

Incluye índices para estados, presentaciones, slugs, ingredientes activos, recetas, movimientos, producción, inventario terminado, clientes, pedidos, items, gastos e ingresos. Ver migraciones `002` a `005` para nombres exactos.
