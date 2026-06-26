create or replace view vw_finished_inventory_movements_detail as
select
  fim.id as movement_id,
  fim.id,
  fim.product_id,
  p.name as product_name,
  p.image_url as product_image_url,
  p.presentation,
  p.sale_price,
  p.pieces_per_batch,
  fim.movement_type,
  fim.quantity,
  fim.related_order_id,
  fim.related_order_item_id,
  fim.production_batch_id,
  o.customer_name as order_customer_name,
  o.customer_phone as order_customer_phone,
  oi.quantity as order_item_quantity,
  oi.unit_price as order_item_unit_price,
  pb.production_date,
  pb.batches_quantity,
  pb.units_produced,
  pb.production_mode,
  fim.notes,
  fim.created_at
from finished_inventory_movements fim
join products p on p.id = fim.product_id
left join orders o on o.id = fim.related_order_id
left join order_items oi on oi.id = fim.related_order_item_id
left join production_batches pb on pb.id = fim.production_batch_id;

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

  select * into v_product from products where id = p_product_id;

  if v_product.id is null then
    raise exception 'Producto no encontrado';
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

  select * into v_product from products where id = p_product_id;

  if v_product.id is null then
    raise exception 'Producto no encontrado';
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
