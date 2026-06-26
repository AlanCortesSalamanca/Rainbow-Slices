create trigger trg_set_order_item_line_total
before insert or update on order_items
for each row execute function set_order_item_line_total();

create trigger trg_recalculate_order_after_item_change
after insert or update or delete on order_items
for each row execute function trigger_recalculate_order_totals();

create trigger trg_products_updated_at
before update on products
for each row execute function set_updated_at();

create trigger trg_ingredients_updated_at
before update on ingredients
for each row execute function set_updated_at();

create trigger trg_product_recipes_updated_at
before update on product_recipes
for each row execute function set_updated_at();

create trigger trg_expenses_updated_at
before update on expenses
for each row execute function set_updated_at();

create trigger trg_customers_updated_at
before update on customers
for each row execute function set_updated_at();

create trigger trg_orders_updated_at
before update on orders
for each row execute function set_updated_at();
