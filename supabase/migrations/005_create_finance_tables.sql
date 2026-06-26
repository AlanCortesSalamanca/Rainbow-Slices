create table expenses (
  id uuid primary key default gen_random_uuid(),
  concept text not null,
  category expense_category not null,
  source expense_source not null default 'manual',
  amount numeric(10,2) not null check (amount >= 0),
  expense_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table income_records (
  id uuid primary key default gen_random_uuid(),
  source income_source not null default 'order',
  order_id uuid references orders(id),
  concept text not null,
  amount numeric(10,2) not null check (amount >= 0),
  income_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

alter table ingredient_stock_movements
  add constraint fk_ingredient_movement_expense foreign key (related_expense_id) references expenses(id),
  add constraint fk_ingredient_movement_batch foreign key (related_production_batch_id) references production_batches(id);

alter table finished_inventory_movements
  add constraint fk_finished_inventory_order foreign key (related_order_id) references orders(id),
  add constraint fk_finished_inventory_order_item foreign key (related_order_item_id) references order_items(id);

create index idx_expenses_category on expenses(category);
create index idx_expenses_source on expenses(source);
create index idx_expenses_date on expenses(expense_date);
create index idx_income_records_order_id on income_records(order_id);
create index idx_income_records_date on income_records(income_date);
create index idx_income_records_source on income_records(source);
