create table if not exists location_kinds (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  is_builtin boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid,
  kind_id uuid not null references location_kinds(id),
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists locations_parent_id_idx on locations (parent_id);
create unique index if not exists locations_parent_name_uidx on locations (parent_id, name);

create table if not exists attribute_types (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  data_type text not null,
  is_builtin boolean not null default false,
  validation_regex text,
  unique_scope text not null default 'none',
  created_at timestamptz not null default now()
);

create table if not exists item_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  visibility_scope text not null,
  visibility_ref_id text,
  created_by_user_id text,
  is_locked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists item_template_fields (
  template_id uuid not null references item_templates(id) on delete cascade,
  attribute_type_id uuid not null references attribute_types(id),
  required boolean not null default false,
  sort_order int not null default 0,
  primary key (template_id, attribute_type_id)
);

create table if not exists items (
  template_id uuid references item_templates(id),
  location_id uuid references locations(id),
  name text not null,
  inventory_number text,
  owner_principal_type text,
  owner_principal_id text,
  manager_principal_type text,
  manager_principal_id text,
  registered_at timestamptz not null default now()
);

create index if not exists items_location_id_idx on items (location_id);

create table if not exists item_attribute_values (
  item_id uuid not null references items(id) on delete cascade,
  attribute_type_id uuid not null references attribute_types(id),
  value_string text,
  value_number numeric,
  value_date date,
  primary key (item_id, attribute_type_id)
);

insert into location_kinds (key, label, is_builtin)
values
  ('area', 'Area', true),
  ('building', 'Building', true),
  ('room', 'Room', true)
on conflict (key) do nothing;

insert into attribute_types (key, label, data_type, is_builtin)
values
  ('name', 'Name', 'string', true),
  ('inventory_number', 'Inventory number', 'string', true)
on conflict (key) do nothing;

insert into item_templates (name, visibility_scope, is_locked)
values ('Default item', 'global', true)
on conflict do nothing;

insert into item_template_fields (template_id, attribute_type_id, required, sort_order)
select t.id, a.id,
  case when a.key = 'name' then true else false end,
  case when a.key = 'name' then 0 else 1 end
from item_templates t
join attribute_types a on a.key in ('name', 'inventory_number')
where t.name = 'Default item'
on conflict do nothing;
