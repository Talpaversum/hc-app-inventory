create schema if not exists app_inventory;

create table if not exists app_inventory.location_kinds (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  is_builtin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists app_inventory.locations (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid,
  kind_id uuid not null references app_inventory.location_kinds(id),
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists locations_parent_id_idx on app_inventory.locations (parent_id);
create unique index if not exists locations_parent_name_uidx on app_inventory.locations (parent_id, name);

create table if not exists app_inventory.attribute_types (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  data_type text not null,
  is_builtin boolean not null default false,
  validation_regex text,
  unique_scope text not null default 'none',
  created_at timestamptz not null default now()
);

create table if not exists app_inventory.item_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  visibility_scope text not null,
  visibility_ref_id text,
  created_by_user_id text,
  is_locked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists app_inventory.item_template_fields (
  template_id uuid not null references app_inventory.item_templates(id) on delete cascade,
  attribute_type_id uuid not null references app_inventory.attribute_types(id),
  required boolean not null default false,
  sort_order int not null default 0,
  primary key (template_id, attribute_type_id)
);

create table if not exists app_inventory.items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references app_inventory.item_templates(id),
  location_id uuid references app_inventory.locations(id),
  name text not null,
  inventory_number text,
  owner_principal_type text,
  owner_principal_id text,
  manager_principal_type text,
  manager_principal_id text,
  registered_at timestamptz not null default now()
);

create index if not exists items_location_id_idx on app_inventory.items (location_id);

create table if not exists app_inventory.item_attribute_values (
  item_id uuid not null references app_inventory.items(id) on delete cascade,
  attribute_type_id uuid not null references app_inventory.attribute_types(id),
  value_string text,
  value_number numeric,
  value_date date,
  primary key (item_id, attribute_type_id)
);

insert into app_inventory.location_kinds (key, label, is_builtin)
values
  ('area', 'Area', true),
  ('building', 'Building', true),
  ('room', 'Room', true)
on conflict (key) do nothing;

insert into app_inventory.attribute_types (key, label, data_type, is_builtin)
values
  ('name', 'Name', 'string', true),
  ('inventory_number', 'Inventory number', 'string', true)
on conflict (key) do nothing;

insert into app_inventory.item_templates (name, visibility_scope, is_locked)
values ('Default item', 'global', true)
on conflict do nothing;

insert into app_inventory.item_template_fields (template_id, attribute_type_id, required, sort_order)
select t.id, a.id,
  case when a.key = 'name' then true else false end,
  case when a.key = 'name' then 0 else 1 end
from app_inventory.item_templates t
join app_inventory.attribute_types a on a.key in ('name', 'inventory_number')
where t.name = 'Default item'
on conflict do nothing;
