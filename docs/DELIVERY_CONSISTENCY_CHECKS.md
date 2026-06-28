# Delivery Consistency Checks

Use these checks after applying migration `016_fix_order_delivery_financial_consistency.sql`.

Do not run destructive cleanup scripts as part of these checks.

## Preflight

Confirm there are no duplicate automatic order incomes before applying the unique index:

```sql
select order_id, count(*)
from income_records
where source = 'order'
  and order_id is not null
group by order_id
having count(*) > 1;
```

The query must return zero rows. If it returns rows, reconcile those orders manually before applying migration `016`.

## Delivery With Partial Deposit

Choose an order that is not `delivered` or `cancelled`, has reserved stock, and has `deposit_paid < total`.

```sql
begin;

select id, status, payment_status, total, deposit_paid, balance_due
from orders
where id = '<ORDER_ID>'
for update;

select mark_order_delivered('<ORDER_ID>');

select id, status, payment_status, total, deposit_paid, balance_due
from orders
where id = '<ORDER_ID>';

select source, order_id, concept, amount, count(*) over (partition by order_id, source) as income_count
from income_records
where order_id = '<ORDER_ID>'
  and source = 'order';

select movement_type, quantity, related_order_id, related_order_item_id
from finished_inventory_movements
where related_order_id = '<ORDER_ID>'
order by created_at, id;

rollback;
```

Expected result:

- `deposit_paid` is unchanged.
- `balance_due` is `0` because delivery closes the operational balance.
- `payment_status` is `paid` because the order is considered fully settled at delivery time.
- Exactly one `income_records` row exists for `source = 'order'` and the order.
- Delivery creates `unreserved` positive and `sold` negative movements.

## Double Delivery Attempt

```sql
begin;

select mark_order_delivered('<ORDER_ID>');

savepoint second_delivery;

-- This must fail with "El pedido ya fue entregado" or an existing income/stock error.
select mark_order_delivered('<ORDER_ID>');

rollback to savepoint second_delivery;

select count(*) as order_income_count
from income_records
where order_id = '<ORDER_ID>'
  and source = 'order';

rollback;
```

Expected result: `order_income_count = 1` inside the transaction.

## Cancelled Order Attempt

```sql
select mark_order_delivered('<CANCELLED_ORDER_ID>');
```

Expected result: the function fails with `No se puede entregar un pedido cancelado`.

## API Checks

```bash
curl -i http://localhost:3000/health
curl -i http://localhost:3000/api/public/products
curl -i http://localhost:3000/api/products
```

Expected result:

- `/health` returns `200`.
- `/api/public/products` returns `200` and does not include `internal_notes`.
- `/api/products` without bearer token returns `401`.
