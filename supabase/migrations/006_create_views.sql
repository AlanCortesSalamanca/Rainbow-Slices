create or replace view vw_ingredient_stock as
select
  i.id as ingredient_id,
  i.name,
  i.unit,
  i.minimum_stock,
  coalesce(sum(ism.quantity), 0) as current_stock,
  coalesce(sum(ism.quantity), 0) <= i.minimum_stock as is_low_stock
from ingredients i
left join ingredient_stock_movements ism on ism.ingredient_id = i.id
where i.active = true
group by i.id, i.name, i.unit, i.minimum_stock;

create or replace view vw_ingredient_average_cost as
select
  ingredient_id,
  case
    when sum(quantity) filter (where movement_type = 'purchase') > 0
    then sum(total_cost) filter (where movement_type = 'purchase') / sum(quantity) filter (where movement_type = 'purchase')
    else 0
  end as average_unit_cost
from ingredient_stock_movements
group by ingredient_id;

create or replace view vw_product_recipe_costs as
select
  p.id as product_id,
  p.name as product_name,
  p.sale_price,
  p.presentation,
  p.pieces_per_batch,
  coalesce(sum(pr.quantity_required * coalesce(iac.average_unit_cost, 0)), 0) as batch_cost,
  case when p.pieces_per_batch > 0 then coalesce(sum(pr.quantity_required * coalesce(iac.average_unit_cost, 0)), 0) / p.pieces_per_batch else 0 end as estimated_unit_cost,
  case
    when p.presentation = 'slice' then p.sale_price - (coalesce(sum(pr.quantity_required * coalesce(iac.average_unit_cost, 0)), 0) / p.pieces_per_batch)
    else p.sale_price - coalesce(sum(pr.quantity_required * coalesce(iac.average_unit_cost, 0)), 0)
  end as estimated_profit
from products p
left join product_recipes pr on pr.product_id = p.id
left join vw_ingredient_average_cost iac on iac.ingredient_id = pr.ingredient_id
group by p.id, p.name, p.sale_price, p.presentation, p.pieces_per_batch;

create or replace view vw_product_availability as
select
  p.id as product_id,
  p.name as product_name,
  case
    when count(pr.id) = 0 and p.presentation <> 'custom' then false
    when p.presentation = 'custom' then true
    when bool_and(coalesce(vis.current_stock, 0) >= pr.quantity_required) then true
    else false
  end as can_prepare_one_batch,
  case
    when p.presentation = 'custom' then 999999
    else coalesce(min(floor(coalesce(vis.current_stock, 0) / nullif(pr.quantity_required, 0))), 0)
  end as max_batches_available
from products p
left join product_recipes pr on pr.product_id = p.id
left join vw_ingredient_stock vis on vis.ingredient_id = pr.ingredient_id
where p.status = 'active'
group by p.id, p.name, p.presentation;

create or replace view vw_product_stock as
select
  p.id as product_id,
  p.name,
  p.presentation,
  coalesce(sum(fim.quantity), 0) as current_stock
from products p
left join finished_inventory_movements fim on fim.product_id = p.id
group by p.id, p.name, p.presentation;

create or replace view vw_sales_report as
select
  ir.id as income_record_id,
  ir.income_date,
  ir.amount,
  o.id as order_id,
  oi.product_id,
  oi.product_name,
  oi.presentation,
  oi.quantity,
  oi.line_total,
  dp.id as delivery_point_id,
  dp.name as delivery_point_name
from income_records ir
left join orders o on o.id = ir.order_id
left join order_items oi on oi.order_id = o.id
left join delivery_points dp on dp.id = o.delivery_point_id;
