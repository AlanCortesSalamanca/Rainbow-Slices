alter table products enable row level security;
alter table ingredients enable row level security;
alter table product_recipes enable row level security;
alter table ingredient_stock_movements enable row level security;
alter table production_batches enable row level security;
alter table finished_inventory_movements enable row level security;
alter table customers enable row level security;
alter table delivery_points enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table expenses enable row level security;
alter table income_records enable row level security;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke execute on all functions in schema public from anon, authenticated;

alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from anon, authenticated;
