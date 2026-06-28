-- WARNING: DESTRUCTIVE MANUAL SCRIPT
-- This script deletes business data with TRUNCATE.
-- Do not run it in production.
-- Do not include it in the normal migration flow.
-- Use only in disposable local/QA databases after taking a backup.

truncate table
  income_records,
  finished_inventory_movements,
  ingredient_stock_movements,
  production_batches,
  order_items,
  orders,
  customers,
  delivery_points,
  product_recipes,
  products,
  ingredients,
  expenses
restart identity cascade;
