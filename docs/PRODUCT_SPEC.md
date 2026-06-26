# Product Spec

## MVP

Rainbow Slices Admin es una aplicación privada para administrar operación interna de cheesecakes en Morelia. No incluye e-commerce público, dashboard ni autenticación avanzada en esta etapa.

## Módulos

- Productos: CRUD, activación, precio, imagen URL, costo estimado, ganancia estimada y disponibilidad.
- Ingredientes: CRUD, unidades, stock mínimo y estado activo/inactivo.
- Inventario de ingredientes: compras, uso en producción y ajustes manuales por movimientos.
- Recetas: ingredientes requeridos por producto para producir 1 batch.
- Producción: valida receta y stock, descuenta ingredientes y genera inventario terminado.
- Inventario terminado: movimientos por producción, reservas, ventas, mermas y ajustes.
- Pedidos: cliente, items, entrega, anticipo, estados, pago y producción requerida.
- Entregas: puntos fijos, horarios fijos y costo de $15 MXN.
- Gastos: manuales excepto ingredientes, que se generan desde entradas de inventario.
- Ingresos: automáticos al entregar pedidos.
- Reportes básicos: ingresos, gastos, ganancia estimada, ventas, mermas y stock bajo.

## Reglas De Negocio

- La unidad principal inicial es la rebanada.
- 1 cheesecake completo producido como `slice` genera 8 rebanadas.
- `whole`, `mini` y `custom` generan 1 unidad por batch.
- Productos `custom` pueden tener precio manual por cotización.
- Los gastos de ingredientes se generan con `add_ingredient_stock`.
- No se registra merma como gasto; solo descuenta inventario terminado.
- Pedidos mayores a $300 MXN requieren anticipo antes de confirmar.
- El anticipo sugerido es 50% del total y debe ser editable.
- Si no hay stock, el pedido puede crearse y queda marcado como `requires_production`.
- No se debe entregar un pedido sin flujo de inventario suficiente en una versión productiva.

## Flujos Principales

1. Registrar compra de ingrediente con cantidad y costo total.
2. Configurar receta de producto.
3. Registrar producción.
4. Crear pedido con items y punto de entrega.
5. Confirmar pedido validando anticipo si aplica.
6. Entregar pedido para marcar pago e ingreso automático.
7. Revisar reportes por periodo.
