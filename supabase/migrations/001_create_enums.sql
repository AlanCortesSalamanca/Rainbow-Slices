create extension if not exists pgcrypto;

create type presentation_type as enum ('slice', 'whole', 'mini', 'custom');
create type product_status as enum ('active', 'inactive');
create type inventory_movement_type as enum ('purchase', 'production_use', 'production_output', 'reserved', 'unreserved', 'sold', 'waste', 'adjustment');
create type order_status as enum ('pending', 'confirmed', 'in_preparation', 'ready', 'delivered', 'cancelled');
create type payment_status as enum ('unpaid', 'deposit_paid', 'paid', 'refunded', 'cancelled_no_refund');
create type expense_category as enum ('ingredients', 'packaging', 'transport', 'advertising', 'utensils', 'services', 'other');
create type expense_source as enum ('manual', 'ingredient_stock');
create type income_source as enum ('order', 'manual');
create type delivery_time_slot as enum ('11:00', '16:00');
