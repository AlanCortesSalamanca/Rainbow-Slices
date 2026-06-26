create or replace function register_finished_inventory_waste(
  p_product_id uuid,
  p_quantity integer,
  p_notes text default null
)
returns uuid
language plpgsql
as $$
declare
  v_product record;
  v_stock integer;
  v_movement_id uuid;
begin
  if p_quantity <= 0 then
    raise exception 'La merma debe ser mayor a 0';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_product_id::text, 0));

  select * into v_product
  from products
  where id = p_product_id
    and status = 'active';

  if v_product.id is null then
    raise exception 'Producto no encontrado o inactivo';
  end if;

  select coalesce(current_stock, 0)
  into v_stock
  from vw_product_stock
  where product_id = p_product_id;

  v_stock := coalesce(v_stock, 0);

  if p_quantity > v_stock then
    raise exception 'Stock insuficiente para registrar merma. Disponible: %, solicitado: %', v_stock, p_quantity;
  end if;

  insert into finished_inventory_movements (product_id, movement_type, quantity, notes)
  values (p_product_id, 'waste', -p_quantity, nullif(trim(coalesce(p_notes, '')), ''))
  returning id into v_movement_id;

  return v_movement_id;
end;
$$;

create or replace function register_finished_inventory_adjustment(
  p_product_id uuid,
  p_quantity integer,
  p_notes text
)
returns uuid
language plpgsql
as $$
declare
  v_product record;
  v_stock integer;
  v_movement_id uuid;
begin
  if p_quantity = 0 then
    raise exception 'El ajuste no puede ser 0';
  end if;

  if nullif(trim(coalesce(p_notes, '')), '') is null then
    raise exception 'Las notas son obligatorias para ajustes manuales';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_product_id::text, 0));

  select * into v_product
  from products
  where id = p_product_id
    and status = 'active';

  if v_product.id is null then
    raise exception 'Producto no encontrado o inactivo';
  end if;

  select coalesce(current_stock, 0)
  into v_stock
  from vw_product_stock
  where product_id = p_product_id;

  v_stock := coalesce(v_stock, 0);

  if v_stock + p_quantity < 0 then
    raise exception 'El ajuste dejaría stock negativo. Disponible: %, ajuste: %', v_stock, p_quantity;
  end if;

  insert into finished_inventory_movements (product_id, movement_type, quantity, notes)
  values (p_product_id, 'adjustment', p_quantity, trim(p_notes))
  returning id into v_movement_id;

  return v_movement_id;
end;
$$;
