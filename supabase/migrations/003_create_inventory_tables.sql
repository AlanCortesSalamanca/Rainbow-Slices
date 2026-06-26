create table ingredient_stock_movements (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid not null references ingredients(id),
  movement_type inventory_movement_type not null,
  quantity numeric(12,3) not null,
  unit_cost numeric(10,4) default 0 check (unit_cost >= 0),
  total_cost numeric(10,2) default 0 check (total_cost >= 0),
  notes text,
  related_expense_id uuid,
  related_production_batch_id uuid,
  created_at timestamptz not null default now(),
  check (
    (movement_type = 'purchase' and quantity > 0)
    or (movement_type = 'production_use' and quantity < 0)
    or (movement_type = 'adjustment' and quantity <> 0)
  )
);

create table production_batches (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  batches_quantity integer not null default 1 check (batches_quantity > 0),
  units_produced integer not null check (units_produced > 0),
  estimated_total_cost numeric(10,2) not null default 0,
  production_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create table finished_inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  production_batch_id uuid references production_batches(id),
  movement_type inventory_movement_type not null,
  quantity integer not null,
  related_order_id uuid,
  related_order_item_id uuid,
  notes text,
  created_at timestamptz not null default now(),
  check (
    (movement_type in ('production_output', 'unreserved') and quantity > 0)
    or (movement_type in ('reserved', 'sold', 'waste') and quantity < 0)
    or (movement_type = 'adjustment' and quantity <> 0)
  )
);

create index idx_ingredient_movements_ingredient_id on ingredient_stock_movements(ingredient_id);
create index idx_ingredient_movements_type on ingredient_stock_movements(movement_type);
create index idx_ingredient_movements_created_at on ingredient_stock_movements(created_at);
create index idx_ingredient_movements_production_batch on ingredient_stock_movements(related_production_batch_id);
create index idx_production_batches_product_id on production_batches(product_id);
create index idx_production_batches_date on production_batches(production_date);
create index idx_finished_inventory_product_id on finished_inventory_movements(product_id);
create index idx_finished_inventory_type on finished_inventory_movements(movement_type);
create index idx_finished_inventory_batch_id on finished_inventory_movements(production_batch_id);
create index idx_finished_inventory_order_id on finished_inventory_movements(related_order_id);
create index idx_finished_inventory_created_at on finished_inventory_movements(created_at);
