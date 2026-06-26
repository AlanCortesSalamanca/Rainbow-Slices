create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  instagram_user text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(phone)
);

create table delivery_points (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  delivery_fee numeric(10,2) not null default 15 check (delivery_fee >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  customer_name text not null,
  customer_phone text not null,
  order_date timestamptz not null default now(),
  delivery_date date not null,
  delivery_time delivery_time_slot not null,
  delivery_point_id uuid not null references delivery_points(id),
  subtotal numeric(10,2) not null default 0 check (subtotal >= 0),
  delivery_fee numeric(10,2) not null default 15 check (delivery_fee >= 0),
  total numeric(10,2) not null default 0 check (total >= 0),
  deposit_required boolean not null default false,
  suggested_deposit numeric(10,2) not null default 0 check (suggested_deposit >= 0),
  deposit_paid numeric(10,2) not null default 0 check (deposit_paid >= 0),
  balance_due numeric(10,2) not null default 0 check (balance_due >= 0),
  requires_production boolean not null default false,
  status order_status not null default 'pending',
  payment_status payment_status not null default 'unpaid',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name text not null,
  presentation presentation_type not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  line_total numeric(10,2) not null default 0 check (line_total >= 0),
  is_custom_price boolean not null default false,
  requires_production boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create index idx_customers_phone on customers(phone);
create index idx_customers_name on customers(name);
create index idx_orders_customer_id on orders(customer_id);
create index idx_orders_status on orders(status);
create index idx_orders_payment_status on orders(payment_status);
create index idx_orders_delivery_date on orders(delivery_date);
create index idx_orders_delivery_point_id on orders(delivery_point_id);
create index idx_orders_requires_production on orders(requires_production);
create index idx_orders_created_at on orders(created_at);
create index idx_order_items_order_id on order_items(order_id);
create index idx_order_items_product_id on order_items(product_id);
