create or replace function add_ingredient_stock(
  p_ingredient_id uuid,
  p_quantity numeric,
  p_total_cost numeric,
  p_notes text default null
)
returns void
language plpgsql
as $$
declare
  v_expense_id uuid;
  v_ingredient_name text;
  v_unit_cost numeric(10,4);
begin
  if p_quantity <= 0 then
    raise exception 'La cantidad debe ser mayor a 0';
  end if;

  if p_total_cost < 0 then
    raise exception 'El costo total no puede ser negativo';
  end if;

  select name into v_ingredient_name from ingredients where id = p_ingredient_id;

  if v_ingredient_name is null then
    raise exception 'Ingrediente no encontrado';
  end if;

  v_unit_cost := p_total_cost / p_quantity;

  insert into expenses (concept, category, source, amount, notes)
  values ('Compra de ingrediente: ' || v_ingredient_name, 'ingredients', 'ingredient_stock', p_total_cost, p_notes)
  returning id into v_expense_id;

  insert into ingredient_stock_movements (ingredient_id, movement_type, quantity, unit_cost, total_cost, notes, related_expense_id)
  values (p_ingredient_id, 'purchase', p_quantity, v_unit_cost, p_total_cost, p_notes, v_expense_id);
end;
$$;

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
  v_batch_cost numeric(10,2);
  v_total_cost numeric(10,2);
  r record;
begin
  if p_batches_quantity <= 0 then
    raise exception 'La cantidad de producción debe ser mayor a 0';
  end if;

  select * into v_product from products where id = p_product_id and status = 'active';

  if v_product.id is null then
    raise exception 'Producto no encontrado o inactivo';
  end if;

  if not exists (select 1 from product_recipes where product_id = p_product_id) and v_product.presentation <> 'custom' then
    raise exception 'El producto no tiene receta configurada';
  end if;

  for r in
    select pr.ingredient_id, i.name as ingredient_name, pr.quantity_required * p_batches_quantity as required_quantity, coalesce(vis.current_stock, 0) as current_stock
    from product_recipes pr
    join ingredients i on i.id = pr.ingredient_id
    left join vw_ingredient_stock vis on vis.ingredient_id = pr.ingredient_id
    where pr.product_id = p_product_id
  loop
    if r.current_stock < r.required_quantity then
      raise exception 'Ingrediente insuficiente: %. Disponible: %, requerido: %', r.ingredient_name, r.current_stock, r.required_quantity;
    end if;
  end loop;

  select coalesce(batch_cost, 0) into v_batch_cost from vw_product_recipe_costs where product_id = p_product_id;

  v_total_cost := v_batch_cost * p_batches_quantity;
  v_units_produced := v_product.pieces_per_batch * p_batches_quantity;

  insert into production_batches (product_id, batches_quantity, units_produced, estimated_total_cost, notes)
  values (p_product_id, p_batches_quantity, v_units_produced, v_total_cost, p_notes)
  returning id into v_batch_id;

  for r in
    select ingredient_id, quantity_required * p_batches_quantity as required_quantity
    from product_recipes
    where product_id = p_product_id
  loop
    insert into ingredient_stock_movements (ingredient_id, movement_type, quantity, total_cost, notes, related_production_batch_id)
    values (r.ingredient_id, 'production_use', -r.required_quantity, 0, 'Uso en producción', v_batch_id);
  end loop;

  insert into finished_inventory_movements (product_id, production_batch_id, movement_type, quantity, notes)
  values (p_product_id, v_batch_id, 'production_output', v_units_produced, 'Producción registrada');

  return v_batch_id;
end;
$$;

create or replace function recalculate_order_totals(p_order_id uuid)
returns void
language plpgsql
as $$
declare
  v_subtotal numeric(10,2);
  v_delivery_fee numeric(10,2);
  v_total numeric(10,2);
  v_deposit_required boolean;
  v_suggested_deposit numeric(10,2);
  v_deposit_paid numeric(10,2);
begin
  select coalesce(sum(line_total), 0) into v_subtotal from order_items where order_id = p_order_id;
  select delivery_fee, deposit_paid into v_delivery_fee, v_deposit_paid from orders where id = p_order_id;
  v_total := v_subtotal + coalesce(v_delivery_fee, 0);
  v_deposit_required := v_total > 300;
  v_suggested_deposit := case when v_deposit_required then round(v_total * 0.50, 2) else 0 end;

  update orders
  set subtotal = v_subtotal,
      total = v_total,
      deposit_required = v_deposit_required,
      suggested_deposit = v_suggested_deposit,
      balance_due = greatest(v_total - coalesce(v_deposit_paid, 0), 0),
      updated_at = now()
  where id = p_order_id;
end;
$$;

create or replace function set_order_item_line_total()
returns trigger
language plpgsql
as $$
begin
  new.line_total := new.quantity * new.unit_price;
  return new;
end;
$$;

create or replace function trigger_recalculate_order_totals()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform recalculate_order_totals(old.order_id);
    return old;
  end if;

  perform recalculate_order_totals(new.order_id);
  return new;
end;
$$;

create or replace function mark_order_delivered(p_order_id uuid)
returns void
language plpgsql
as $$
declare
  v_order record;
  r record;
begin
  select * into v_order from orders where id = p_order_id;

  if v_order.id is null then
    raise exception 'Pedido no encontrado';
  end if;

  if v_order.status = 'cancelled' then
    raise exception 'No se puede entregar un pedido cancelado';
  end if;

  if exists (select 1 from income_records where order_id = p_order_id and source = 'order') then
    return;
  end if;

  for r in select * from order_items where order_id = p_order_id and product_id is not null loop
    insert into finished_inventory_movements (product_id, movement_type, quantity, related_order_id, related_order_item_id, notes)
    values (r.product_id, 'sold', -r.quantity, p_order_id, r.id, 'Venta generada al entregar pedido');
  end loop;

  update orders
  set status = 'delivered', payment_status = 'paid', deposit_paid = total, balance_due = 0, updated_at = now()
  where id = p_order_id;

  insert into income_records (source, order_id, concept, amount, notes)
  values ('order', p_order_id, 'Venta de pedido', v_order.total, 'Ingreso generado automáticamente al entregar pedido');
end;
$$;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
