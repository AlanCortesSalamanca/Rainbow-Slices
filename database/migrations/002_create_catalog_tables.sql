create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  category text not null default 'Cheesecake',
  description text,
  presentation presentation_type not null default 'slice',
  pieces_per_batch integer not null default 8 check (pieces_per_batch > 0),
  sale_price numeric(10,2) not null default 0 check (sale_price >= 0),
  image_url text,
  preparation_time_days integer not null default 1 check (preparation_time_days >= 0),
  status product_status not null default 'active',
  is_custom boolean not null default false,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (presentation = 'slice' and pieces_per_batch = 8)
    or (presentation in ('whole', 'mini', 'custom') and pieces_per_batch = 1)
  )
);

create table ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  unit text not null,
  minimum_stock numeric(12,3) not null default 0 check (minimum_stock >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_recipes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id),
  quantity_required numeric(12,3) not null check (quantity_required > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id, ingredient_id)
);

create index idx_products_status on products(status);
create index idx_products_presentation on products(presentation);
create index idx_products_category on products(category);
create index idx_products_slug on products(slug);
create index idx_ingredients_active on ingredients(active);
create index idx_ingredients_name on ingredients(name);
create index idx_product_recipes_product_id on product_recipes(product_id);
create index idx_product_recipes_ingredient_id on product_recipes(ingredient_id);
