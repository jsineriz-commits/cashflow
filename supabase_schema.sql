-- Copia y pega esto en el SQL Editor de Supabase (https://app.supabase.com/project/YOUR_PROJECT/sql)

-- 1. Tabla de Productos
create table public.products (
  id text primary key,
  name text not null,
  price numeric not null,
  cost numeric default 0,
  frequency text not null default 'monthly'
);

-- 2. Tabla de Costos Fijos
create table public.costs (
  id text primary key,
  name text not null,
  amount numeric not null,
  type text not null,
  frequency text not null
);

-- 3. Tabla de Ventas Históricas (Nótese product_id referenciando al Front)
create table public.historical_sales (
  id text primary key,
  product_id text not null,
  period text not null,
  volume numeric not null
);

-- 4. Tabla de Simulaciones
create table public.simulations (
  id text primary key default gen_random_uuid()::text,
  product_id text not null,
  month text not null,
  volume numeric not null
);

-- Habilitar los permisos públicos (ATENCIÓN: SOLO PARA ESTE MVP. UNA VEZ QUE AGREGUEMOS AUTENTICACIÓN ESTO DEBE CERRARSE)
alter table public.products enable row level security;
create policy "permitir todo a anon products" on public.products for all using (true);

alter table public.costs enable row level security;
create policy "permitir todo a anon costs" on public.costs for all using (true);

alter table public.historical_sales enable row level security;
create policy "permitir todo a anon historical" on public.historical_sales for all using (true);

alter table public.simulations enable row level security;
create policy "permitir todo a anon simulations" on public.simulations for all using (true);
