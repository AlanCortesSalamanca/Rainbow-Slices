create or replace function register_production(
  p_product_id uuid,
  p_batches_quantity integer,
  p_notes text default null
)
returns uuid
language plpgsql
as $$
declare
  v_product record;
  v_batch_id uuid;
  v_units_produced integer;
  v_batch_cost numeric(10,2) := 0;
  v_total_cost numeric(10,2) := 0;
  v_has_recipe boolean := false;
  v_production_mode text := 'manual';
  v_current_stock numeric(12,3);
  r record;
begin
  if p_batches_quantity <= 0 then
    raise exception 'La cantidad de producción debe ser mayor a 0';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_product_id::text, 0));

  select * into v_product from products where id = p_product_id and status = 'active';

  if v_product.id is null then
    raise exception 'Producto no encontrado o inactivo';
  end if;

  v_units_produced := v_product.pieces_per_batch * p_batches_quantity;

  if v_units_produced <= 0 then
    raise exception 'Las unidades producidas deben ser mayores a 0';
  end if;

  select exists (select 1 from product_recipes where product_id = p_product_id) into v_has_recipe;

  if v_has_recipe then
    v_production_mode := 'recipe';

    for r in
      select pr.ingredient_id, i.name as ingredient_name, pr.quantity_required * p_batches_quantity as required_quantity
      from product_recipes pr
      join ingredients i on i.id = pr.ingredient_id
      where pr.product_id = p_product_id
    loop
      perform pg_advisory_xact_lock(hashtextextended(r.ingredient_id::text, 0));

      select coalesce(current_stock, 0)
      into v_current_stock
      from vw_ingredient_stock
      where ingredient_id = r.ingredient_id;

      v_current_stock := coalesce(v_current_stock, 0);

      if v_current_stock < r.required_quantity then
        raise exception 'Ingrediente insuficiente: %. Disponible: %, requerido: %', r.ingredient_name, v_current_stock, r.required_quantity;
      end if;
    end loop;

    select coalesce(batch_cost, 0) into v_batch_cost from vw_product_recipe_costs where product_id = p_product_id;
    v_total_cost := v_batch_cost * p_batches_quantity;
  end if;

  insert into production_batches (product_id, batches_quantity, units_produced, estimated_total_cost, production_mode, notes)
  values (p_product_id, p_batches_quantity, v_units_produced, v_total_cost, v_production_mode, p_notes)
  returning id into v_batch_id;

  if v_has_recipe then
    for r in
      select ingredient_id, quantity_required * p_batches_quantity as required_quantity
      from product_recipes
      where product_id = p_product_id
    loop
      insert into ingredient_stock_movements (ingredient_id, movement_type, quantity, total_cost, notes, related_production_batch_id)
      values (r.ingredient_id, 'production_use', -r.required_quantity, 0, 'Uso en producción', v_batch_id);
    end loop;
  end if;

  insert into finished_inventory_movements (product_id, production_batch_id, movement_type, quantity, notes)
  values (
    p_product_id,
    v_batch_id,
    'production_output',
    v_units_produced,
    case when v_production_mode = 'manual' then 'Producción manual sin receta' else 'Producción registrada con receta' end
  );

  return v_batch_id;
end;
$$;

create or replace function create_order_with_reservations(
  p_customer_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_delivery_date date,
  p_delivery_time delivery_time_slot,
  p_delivery_point_id uuid,
  p_delivery_fee numeric,
  p_deposit_paid numeric,
  p_notes text,
  p_items jsonb
)
returns uuid
language plpgsql
as $$
declare
  v_order_id uuid;
  v_order_item_id uuid;
  v_item jsonb;
  v_product record;
  v_product_id uuid;
  v_quantity integer;
  v_unit_price numeric(10,2);
  v_stock integer;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'El pedido debe tener al menos un producto';
  end if;

  insert into orders (customer_id, customer_name, customer_phone, delivery_date, delivery_time, delivery_point_id, delivery_fee, deposit_paid, requires_production, notes)
  values (p_customer_id, p_customer_name, p_customer_phone, p_delivery_date, p_delivery_time, p_delivery_point_id, coalesce(p_delivery_fee, 15), coalesce(p_deposit_paid, 0), false, p_notes)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item ->> 'product_id')::uuid;
    v_quantity := (v_item ->> 'quantity')::integer;
    v_unit_price := coalesce((v_item ->> 'unit_price')::numeric(10,2), 0);

    if v_product_id is null then
      raise exception 'Cada item del pedido debe tener producto';
    end if;

    if v_quantity <= 0 then
      raise exception 'La cantidad del pedido debe ser mayor a 0';
    end if;

    if v_unit_price < 0 then
      raise exception 'El precio del producto no puede ser negativo';
    end if;

    perform pg_advisory_xact_lock(hashtextextended(v_product_id::text, 0));

    select * into v_product from products where id = v_product_id and status = 'active';

    if v_product.id is null then
      raise exception 'Producto no encontrado o inactivo';
    end if;

    select coalesce(current_stock, 0) into v_stock from vw_product_stock where product_id = v_product_id;
    v_stock := coalesce(v_stock, 0);

    if v_stock < v_quantity then
      raise exception 'Stock insuficiente para %. Disponible: %, solicitado: %', v_product.name, v_stock, v_quantity;
    end if;

    insert into order_items (order_id, product_id, product_name, presentation, quantity, unit_price, line_total, is_custom_price, requires_production, notes)
    values (v_order_id, v_product.id, v_product.name, v_product.presentation, v_quantity, v_unit_price, v_quantity * v_unit_price, coalesce((v_item ->> 'is_custom_price')::boolean, false), false, nullif(v_item ->> 'notes', ''))
    returning id into v_order_item_id;

    insert into finished_inventory_movements (product_id, movement_type, quantity, related_order_id, related_order_item_id, notes)
    values (v_product.id, 'reserved', -v_quantity, v_order_id, v_order_item_id, 'Reserva de stock al crear pedido');
  end loop;

  perform recalculate_order_totals(v_order_id);

  return v_order_id;
end;
$$;

create or replace function cancel_order_with_stock_release(
  p_order_id uuid,
  p_notes text default null
)
returns void
language plpgsql
as $$
declare
  v_order record;
  r record;
  v_net_reserved integer;
begin
  select * into v_order from orders where id = p_order_id;

  if v_order.id is null then
    raise exception 'Pedido no encontrado';
  end if;

  if v_order.status = 'delivered' then
    raise exception 'No se puede cancelar un pedido entregado';
  end if;

  if v_order.status = 'cancelled' then
    raise exception 'El pedido ya está cancelado';
  end if;

  for r in select * from order_items where order_id = p_order_id and product_id is not null loop
    perform pg_advisory_xact_lock(hashtextextended(r.product_id::text, 0));

    if exists (
      select 1 from finished_inventory_movements
      where related_order_id = p_order_id
        and related_order_item_id = r.id
        and movement_type = 'sold'
    ) then
      raise exception 'No se puede liberar stock de un item ya vendido: %', r.product_name;
    end if;

    select coalesce(sum(case when movement_type = 'reserved' then -quantity when movement_type = 'unreserved' then -quantity else 0 end), 0)
    into v_net_reserved
    from finished_inventory_movements
    where related_order_id = p_order_id
      and related_order_item_id = r.id;

    if v_net_reserved > 0 then
      insert into finished_inventory_movements (product_id, movement_type, quantity, related_order_id, related_order_item_id, notes)
      values (r.product_id, 'unreserved', v_net_reserved, p_order_id, r.id, 'Liberación de reserva al cancelar pedido');
    end if;
  end loop;

  update orders
  set
    status = 'cancelled',
    payment_status = case
      when v_order.status in ('in_preparation', 'ready') or v_order.requires_production then 'cancelled_no_refund'::payment_status
      else 'refunded'::payment_status
    end,
    notes = coalesce(p_notes, notes),
    updated_at = now()
  where id = p_order_id;
end;
$$;
