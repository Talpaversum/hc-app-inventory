create extension if not exists pgcrypto;

create table if not exists location_kinds (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  key text not null,
  label text not null,
  sort_order int not null default 100,
  is_builtin boolean not null default false,
  created_at timestamptz not null default now(),
  unique (tenant_id, key)
);

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  parent_id uuid references locations(id) on delete set null,
  kind_id uuid not null references location_kinds(id),
  name text not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, parent_id, name)
);

create index if not exists locations_tenant_parent_id_idx on locations (tenant_id, parent_id);

create table if not exists attribute_types (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  key text not null,
  label text not null,
  data_type text not null,
  validation_regex text,
  unique_scope text not null default 'none',
  is_builtin boolean not null default false,
  created_at timestamptz not null default now(),
  unique (tenant_id, key)
);

create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  name text not null,
  visibility_scope text not null,
  visibility_ref_id text,
  is_locked boolean not null default false,
  created_at timestamptz not null default now(),
  unique (tenant_id, name)
);

create table if not exists template_fields (
  template_id uuid not null references templates(id) on delete cascade,
  attribute_type_id uuid not null references attribute_types(id),
  required boolean not null default false,
  sort_order int not null default 0,
  primary key (template_id, attribute_type_id)
);

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  template_id uuid references templates(id),
  location_id uuid references locations(id),
  name text not null,
  inventory_number text,
  owner_type text,
  owner_id text,
  manager_type text,
  manager_id text,
  registered_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists items_tenant_location_id_idx on items (tenant_id, location_id);

create table if not exists item_attributes (
  item_id uuid not null references items(id) on delete cascade,
  attribute_type_id uuid not null references attribute_types(id),
  value_string text,
  value_number numeric,
  value_date date,
  primary key (item_id, attribute_type_id)
);

insert into location_kinds (tenant_id, key, label, sort_order, is_builtin)
select t.id, v.key, v.label, v.sort_order, true
from core.tenants t
cross join (
  values
    ('area', 'Area', 10),
    ('building', 'Building', 20),
    ('room', 'Room', 30)
) as v(key, label, sort_order)
on conflict (tenant_id, key) do nothing;

insert into attribute_types (tenant_id, key, label, data_type, is_builtin)
select t.id, v.key, v.label, v.data_type, true
from core.tenants t
cross join (
  values
    ('name', 'Name', 'string'),
    ('inventory_number', 'Inventory number', 'string')
) as v(key, label, data_type)
on conflict (tenant_id, key) do nothing;

insert into templates (tenant_id, name, visibility_scope, is_locked)
select t.id, 'Default item', 'global', true
from core.tenants t
on conflict (tenant_id, name) do nothing;

insert into template_fields (template_id, attribute_type_id, required, sort_order)
select tpl.id,
       at.id,
       case when at.key = 'name' then true else false end,
       case when at.key = 'name' then 0 else 1 end
from templates tpl
join attribute_types at
  on at.tenant_id = tpl.tenant_id
 and at.key in ('name', 'inventory_number')
where tpl.name = 'Default item'
on conflict do nothing;
