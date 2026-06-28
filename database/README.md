# Database

Las migraciones SQL viven en `database/migrations` y deben ejecutarse en orden ascendente.

## Orden

1. `001_create_enums.sql`
2. `002_create_catalog_tables.sql`
3. `003_create_inventory_tables.sql`
4. `004_create_order_tables.sql`
5. `005_create_finance_tables.sql`
6. `006_create_views.sql`
7. `007_create_functions.sql`
8. `008_create_triggers.sql`
9. `009_seed_initial_data.sql`
10. `010_clear_business_data.sql` — histórica y destructiva; no repetir manualmente en producción.
11. `011_update_production_stock_and_orders.sql`
12. `012_harden_stock_reservation_functions.sql`
13. `013_create_inventory_movement_views.sql`
14. `014_require_active_product_for_finished_inventory_adjustments.sql`
15. `015_enable_rls_for_application_tables.sql`
16. `016_fix_order_delivery_financial_consistency.sql`

## Notas

- El inventario se calcula por movimientos.
- Las compras de ingredientes deben usar `add_ingredient_stock` para crear gasto e inventario en una sola operación.
- La producción debe usar `register_production` para validar receta, descontar ingredientes y generar stock terminado.
- La entrega de pedidos debe usar `mark_order_delivered` para registrar ingreso automático sin duplicarlo.
- `010_clear_business_data.sql` contiene `TRUNCATE` y solo se conserva por historial de migraciones aplicadas. No lo ejecutes manualmente contra producción.
- La limpieza manual de bases locales/QA descartables vive en `database/manual/clear_business_data.sql` y requiere respaldo previo.
