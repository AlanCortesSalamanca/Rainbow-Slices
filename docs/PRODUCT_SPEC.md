# Product Spec

## MVP

Rainbow Slices Admin es una aplicación privada para administrar operación interna de cheesecakes en Morelia. No incluye e-commerce público, dashboard ni autenticación avanzada en esta etapa.

## Módulos

- Productos: CRUD, activación, precio, imagen URL, costo estimado, ganancia estimada y disponibilidad.
- Ingredientes: CRUD, unidades, stock mínimo y estado activo/inactivo.
- Inventario de ingredientes: compras, uso en producción y ajustes manuales por movimientos.
- Recetas: ingredientes requeridos por producto para producir 1 batch.
- Producción: valida receta y stock, descuenta ingredientes y genera inventario terminado.
- Producción manual: si un producto no tiene receta, permite incrementar stock terminado sin descontar ingredientes y registra costo estimado 0.
- Inventario terminado: movimientos por producción, reservas, ventas, mermas y ajustes.
- Pedidos: cliente, items, entrega, anticipo, estados, pago y producción requerida.
- Entregas: puntos fijos, horarios fijos y costo de $15 MXN.
- Gastos: manuales excepto ingredientes, que se generan desde entradas de inventario.
- Ingresos: automáticos al entregar pedidos.
- Reportes básicos: ingresos, gastos, ganancia estimada, ventas, mermas y stock bajo.

## Reglas De Negocio

- La unidad principal inicial es la rebanada.
- En productos `slice`, `pieces_per_batch` define cuántas rebanadas/unidades genera una producción y es editable.
- `whole`, `mini` y `custom` generan 1 unidad por batch.
- Productos `custom` pueden tener precio manual por cotización.
- Los gastos de ingredientes se generan con `add_ingredient_stock`.
- No se registra merma como gasto; solo descuenta inventario terminado.
- Pedidos mayores a $300 MXN requieren anticipo antes de confirmar.
- El anticipo sugerido es 50% del total y debe ser editable.
- Si no hay stock, el pedido puede crearse y queda marcado como `requires_production`.
- No se debe entregar un pedido sin flujo de inventario suficiente en una versión productiva.
- En el MVP operativo actual, el pedido solo se crea si hay stock suficiente y reserva inventario inmediatamente.
- Al crear pedido se inserta `reserved -cantidad`.
- Al cancelar pedido no entregado se inserta `unreserved +cantidad`.
- Al entregar pedido se inserta `unreserved +cantidad` y `sold -cantidad`; el stock no se descuenta doble.

## Flujos Principales

1. Registrar compra de ingrediente con cantidad y costo total.
2. Configurar receta de producto.
3. Registrar producción.
4. Crear pedido con items y punto de entrega.
5. El pedido reserva stock automáticamente.
6. Confirmar pedido validando anticipo si aplica.
7. Entregar pedido para marcar pago e ingreso automático.
8. Revisar reportes por periodo.
