insert into products (name, slug, category, presentation, pieces_per_batch, sale_price, preparation_time_days, status, is_custom)
values
  ('Cheesecake de Fresa Rebanada', 'cheesecake-fresa-rebanada', 'Cheesecake', 'slice', 8, 0, 1, 'active', false),
  ('Cheesecake de Mazapán Rebanada', 'cheesecake-mazapan-rebanada', 'Cheesecake', 'slice', 8, 0, 1, 'active', false),
  ('Cheesecake de Oreo Rebanada', 'cheesecake-oreo-rebanada', 'Cheesecake', 'slice', 8, 0, 1, 'active', false),
  ('Cheesecake Carlos V Rebanada', 'cheesecake-carlos-v-rebanada', 'Cheesecake', 'slice', 8, 0, 1, 'active', false),
  ('Cheesecake Normal Rebanada', 'cheesecake-normal-rebanada', 'Cheesecake', 'slice', 8, 0, 1, 'active', false),
  ('Cheesecake Personalizado', 'cheesecake-personalizado', 'Cheesecake', 'custom', 1, 0, 1, 'active', true)
on conflict (slug) do nothing;

insert into ingredients (name, unit, minimum_stock)
values
  ('Queso crema', 'g', 500),
  ('Galleta base', 'g', 300),
  ('Mantequilla', 'g', 200),
  ('Azúcar', 'g', 300),
  ('Fresas', 'g', 300),
  ('Mazapán', 'pieza', 5),
  ('Oreo', 'g', 300),
  ('Chocolate Carlos V', 'g', 300),
  ('Caja', 'pieza', 5),
  ('Etiqueta', 'pieza', 5)
on conflict (name) do nothing;

insert into delivery_points (name, delivery_fee)
values
  ('Centro de Morelia', 15),
  ('Carrillo', 15),
  ('CFE de Colonia Industrial', 15)
on conflict (name) do nothing;
