do $$
begin
  if exists (
    select 1
    from income_records
    where source = 'order'
      and order_id is not null
    group by order_id
    having count(*) > 1
  ) then
    raise exception 'Cannot add unique order income index: duplicate order income_records exist. Review and reconcile duplicates before applying migration 016.';
  end if;
end;
$$;

create unique index if not exists idx_income_records_unique_order_income
  on income_records(order_id)
  where source = 'order' and order_id is not null;

create or replace function mark_order_delivered(p_order_id uuid)
returns void
language plpgsql
as $$
declare
  v_order record;
  r record;
  v_net_reserved integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_order_id::text, 0));

  select * into v_order
  from orders
  where id = p_order_id
  for update;

  if v_order.id is null then
    raise exception 'Pedido no encontrado';
  end if;

  if v_order.status = 'delivered' then
    raise exception 'El pedido ya fue entregado';
  end if;

  if v_order.status = 'cancelled' then
    raise exception 'No se puede entregar un pedido cancelado';
  end if;

  if not exists (select 1 from order_items where order_id = p_order_id) then
    raise exception 'El pedido no tiene productos';
  end if;

  if exists (select 1 from income_records where order_id = p_order_id and source = 'order') then
    raise exception 'Este pedido ya tiene ingreso registrado';
  end if;

  for r in select * from order_items where order_id = p_order_id and product_id is not null loop
    perform pg_advisory_xact_lock(hashtextextended(r.product_id::text, 0));

    if exists (
      select 1
      from finished_inventory_movements
      where related_order_id = p_order_id
        and related_order_item_id = r.id
        and movement_type = 'sold'
    ) then
      raise exception 'El item ya tiene venta registrada: %', r.product_name;
    end if;

    select coalesce(sum(
      case
        when movement_type = 'reserved' then -quantity
        when movement_type = 'unreserved' then -quantity
        else 0
      end
    ), 0)
    into v_net_reserved
    from finished_inventory_movements
    where related_order_id = p_order_id
      and related_order_item_id = r.id;

    if v_net_reserved < r.quantity then
      raise exception 'El pedido no tiene stock reservado suficiente para %', r.product_name;
    end if;

    insert into finished_inventory_movements (product_id, movement_type, quantity, related_order_id, related_order_item_id, notes)
    values (r.product_id, 'unreserved', r.quantity, p_order_id, r.id, 'Liberación de reserva al entregar pedido');

    insert into finished_inventory_movements (product_id, movement_type, quantity, related_order_id, related_order_item_id, notes)
    values (r.product_id, 'sold', -r.quantity, p_order_id, r.id, 'Venta generada al entregar pedido');
  end loop;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'delivered_at'
  ) then
    execute $sql$
      update orders
      set status = 'delivered',
          payment_status = 'paid',
          balance_due = 0,
          delivered_at = now(),
          updated_at = now()
      where id = $1
    $sql$ using p_order_id;
  else
    update orders
    set status = 'delivered',
        payment_status = 'paid',
        balance_due = 0,
        updated_at = now()
    where id = p_order_id;
  end if;

  insert into income_records (source, order_id, concept, amount, notes)
  values ('order', p_order_id, 'Venta de pedido', v_order.total, 'Ingreso generado automáticamente al entregar pedido')
  on conflict (order_id) where source = 'order' and order_id is not null do nothing;
end;
$$;
