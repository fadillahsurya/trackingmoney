create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  constraint household_members_household_user_key unique (household_id, user_id)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  type text not null default 'expense' check (type in ('expense')),
  icon text,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_household_name_type_key unique (household_id, name, type)
);

create table if not exists public.saving_goals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  target_amount numeric not null check (target_amount >= 0),
  current_amount numeric not null default 0 check (current_amount >= 0),
  target_date date,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shared_transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  paid_by uuid not null references auth.users(id),
  type text not null check (type in ('contribution', 'expense', 'saving_contribution')),
  amount numeric not null check (amount > 0),
  category_id uuid references public.categories(id) on delete set null,
  saving_goal_id uuid references public.saving_goals(id) on delete set null,
  description text,
  transaction_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.monthly_budgets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  month int not null check (month between 1 and 12),
  year int not null check (year between 2000 and 2200),
  amount numeric not null check (amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint monthly_budgets_household_month_year_key unique (household_id, month, year)
);

create table if not exists public.recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  amount numeric not null check (amount > 0),
  category_id uuid references public.categories(id) on delete set null,
  type text not null check (type in ('expense', 'contribution', 'saving_contribution')),
  frequency text not null default 'monthly' check (frequency in ('monthly')),
  due_day int not null check (due_day between 1 and 31),
  is_active boolean not null default true,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recurring_transaction_logs (
  id uuid primary key default gen_random_uuid(),
  recurring_transaction_id uuid not null references public.recurring_transactions(id) on delete cascade,
  household_id uuid not null references public.households(id) on delete cascade,
  month int not null check (month between 1 and 12),
  year int not null check (year between 2000 and 2200),
  status text not null check (status in ('paid', 'skipped')),
  transaction_id uuid references public.shared_transactions(id) on delete set null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  constraint recurring_transaction_logs_once_per_month_key unique (recurring_transaction_id, month, year)
);

 if not exists public.notification_settings (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null unique references public.households(id) on delete cascade,
  channel text,
  webhook_url text,
  daily_alert_enabled boolean not null default false,
  monthly_alert_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists household_members_user_id_idx on public.household_members(user_id);
create index if not exists categories_household_id_idx on public.categories(household_id);
create index if not exists shared_transactions_household_date_idx on public.shared_transactions(household_id, transaction_date desc);
create index if not exists monthly_budgets_household_year_month_idx on public.monthly_budgets(household_id, year, month);
create index if not exists recurring_transactions_household_active_idx on public.recurring_transactions(household_id, is_active);
create index if not exists saving_goals_household_id_idx on public.saving_goals(household_id);

drop policy if exists "Profiles dapat dibaca sendiri" on public.profiles;
drop policy if exists "Profiles dapat dibuat sendiri" on public.profiles;
drop policy if exists "Profiles dapat diubah sendiri" on public.profiles;
drop policy if exists "Households dapat dibaca member" on public.households;
drop policy if exists "Households dapat dibuat owner" on public.households;
drop policy if exists "Households dapat diubah owner" on public.households;
drop policy if exists "Households dapat dihapus owner" on public.households;
drop policy if exists "Household members dapat dibaca sesama member" on public.household_members;
drop policy if exists "Owner dapat menambahkan anggota maksimal dua" on public.household_members;
drop policy if exists "Owner dapat mengubah anggota household" on public.household_members;
drop policy if exists "Owner dapat menghapus anggota household" on public.household_members;
drop policy if exists "Categories dapat dibaca member" on public.categories;
drop policy if exists "Categories dapat dibuat member" on public.categories;
drop policy if exists "Categories dapat diubah member" on public.categories;
drop policy if exists "Categories dapat dihapus member" on public.categories;
drop policy if exists "Shared transactions dapat dibaca member" on public.shared_transactions;
drop policy if exists "Shared transactions dapat dibuat member" on public.shared_transactions;
drop policy if exists "Shared transactions dapat diubah member" on public.shared_transactions;
drop policy if exists "Shared transactions dapat dihapus member" on public.shared_transactions;
drop policy if exists "Monthly budgets dapat dibaca member" on public.monthly_budgets;
drop policy if exists "Monthly budgets dapat dibuat member" on public.monthly_budgets;
drop policy if exists "Monthly budgets dapat diubah member" on public.monthly_budgets;
drop policy if exists "Monthly budgets dapat dihapus member" on public.monthly_budgets;
drop policy if exists "Recurring transactions dapat dibaca member" on public.recurring_transactions;
drop policy if exists "Recurring transactions dapat dibuat member" on public.recurring_transactions;
drop policy if exists "Recurring transactions dapat diubah member" on public.recurring_transactions;
drop policy if exists "Recurring transactions dapat dihapus member" on public.recurring_transactions;
drop policy if exists "Recurring logs dapat dibaca member" on public.recurring_transaction_logs;
drop policy if exists "Recurring logs dapat dibuat member" on public.recurring_transaction_logs;
drop policy if exists "Recurring logs dapat diubah member" on public.recurring_transaction_logs;
drop policy if exists "Recurring logs dapat dihapus member" on public.recurring_transaction_logs;
drop policy if exists "Saving goals dapat dibaca member" on public.saving_goals;
drop policy if exists "Saving goals dapat dibuat member" on public.saving_goals;
drop policy if exists "Saving goals dapat diubah member" on public.saving_goals;
drop policy if exists "Saving goals dapat dihapus member" on public.saving_goals;
drop policy if exists "Notification settings dapat dibaca member" on public.notification_settings;
drop policy if exists "Notification settings dapat dibuat member" on public.notification_settings;
drop policy if exists "Notification settings dapat diubah member" on public.notification_settings;
drop policy if exists "Notification settings dapat dihapus member" on public.notification_settings;

create or replace function public.is_household_member(target_household_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = target_household_id
      and hm.user_id = auth.uid()
  );
$$;

create or replace function public.household_member_count(target_household_id uuid)
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::integer
  from public.household_members hm
  where hm.household_id = target_household_id;
$$;

create or replace function public.seed_default_categories(target_household_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_household_member(target_household_id) then
    raise exception 'User is not a member of this household';
  end if;

  insert into public.categories (household_id, name, type, icon, color)
  values
    (target_household_id, 'Makan', 'expense', 'utensils', '#16a34a'),
    (target_household_id, 'Transport', 'expense', 'car', '#2563eb'),
    (target_household_id, 'Belanja Rumah', 'expense', 'shopping-basket', '#f59e0b'),
    (target_household_id, 'Tagihan', 'expense', 'receipt', '#dc2626'),
    (target_household_id, 'Hiburan', 'expense', 'ticket', '#9333ea'),
    (target_household_id, 'Kesehatan', 'expense', 'heart-pulse', '#db2777'),
    (target_household_id, 'Lainnya', 'expense', 'circle', '#64748b')
  on conflict (household_id, name, type) do nothing;
end;
$$;

create or replace function public.join_household_by_invite_code(target_invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_household_id uuid;
  current_member_count integer;
begin
  if auth.uid() is null then
    raise exception 'Kamu perlu login terlebih dahulu';
  end if;

  if exists (
    select 1
    from public.household_members hm
    where hm.user_id = auth.uid()
  ) then
    raise exception 'Akun ini sudah tergabung dalam household';
  end if;

  select h.id
  into target_household_id
  from public.households h
  where upper(h.invite_code) = upper(trim(target_invite_code))
  limit 1;

  if target_household_id is null then
    raise exception 'Invite code tidak ditemukan';
  end if;

  select count(*)::integer
  into current_member_count
  from public.household_members hm
  where hm.household_id = target_household_id;

  if current_member_count >= 2 then
    raise exception 'Household ini sudah memiliki 2 anggota';
  end if;

  insert into public.household_members (household_id, user_id, role)
  values (target_household_id, auth.uid(), 'member');

  return target_household_id;
end;
$$;

create or replace function public.mark_recurring_paid(
  target_recurring_transaction_id uuid,
  target_month int,
  target_year int
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  recurring_row public.recurring_transactions%rowtype;
  new_transaction_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Kamu perlu login terlebih dahulu';
  end if;

  select *
  into recurring_row
  from public.recurring_transactions
  where id = target_recurring_transaction_id
    and is_active = true;

  if recurring_row.id is null then
    raise exception 'Transaksi rutin tidak ditemukan';
  end if;

  if not public.is_household_member(recurring_row.household_id) then
    raise exception 'Kamu bukan anggota household ini';
  end if;

  insert into public.shared_transactions (
    household_id,
    created_by,
    paid_by,
    type,
    amount,
    category_id,
    description,
    transaction_date
  )
  values (
    recurring_row.household_id,
    auth.uid(),
    auth.uid(),
    recurring_row.type,
    recurring_row.amount,
    recurring_row.category_id,
    recurring_row.name,
    make_date(target_year, target_month, least(recurring_row.due_day, extract(day from (date_trunc('month', make_date(target_year, target_month, 1)) + interval '1 month - 1 day'))::int))
  )
  returning id into new_transaction_id;

  insert into public.recurring_transaction_logs (
    recurring_transaction_id,
    household_id,
    month,
    year,
    status,
    transaction_id,
    created_by
  )
  values (
    recurring_row.id,
    recurring_row.household_id,
    target_month,
    target_year,
    'paid',
    new_transaction_id,
    auth.uid()
  );

  return new_transaction_id;
exception
  when unique_violation then
    raise exception 'Transaksi rutin bulan ini sudah ditandai';
end;
$$;

create or replace function public.skip_recurring_for_month(
  target_recurring_transaction_id uuid,
  target_month int,
  target_year int
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  recurring_row public.recurring_transactions%rowtype;
  new_log_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Kamu perlu login terlebih dahulu';
  end if;

  select *
  into recurring_row
  from public.recurring_transactions
  where id = target_recurring_transaction_id
    and is_active = true;

  if recurring_row.id is null then
    raise exception 'Transaksi rutin tidak ditemukan';
  end if;

  if not public.is_household_member(recurring_row.household_id) then
    raise exception 'Kamu bukan anggota household ini';
  end if;

  insert into public.recurring_transaction_logs (
    recurring_transaction_id,
    household_id,
    month,
    year,
    status,
    created_by
  )
  values (
    recurring_row.id,
    recurring_row.household_id,
    target_month,
    target_year,
    'skipped',
    auth.uid()
  )
  returning id into new_log_id;

  return new_log_id;
exception
  when unique_violation then
    raise exception 'Transaksi rutin bulan ini sudah ditandai';
end;
$$;

create or replace function public.add_saving_contribution(
  target_saving_goal_id uuid,
  contribution_amount numeric,
  paid_by_user_id uuid,
  contribution_date date
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  saving_goal_row public.saving_goals%rowtype;
  new_transaction_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Kamu perlu login terlebih dahulu';
  end if;

  if contribution_amount <= 0 then
    raise exception 'Nominal kontribusi wajib lebih dari 0';
  end if;

  select *
  into saving_goal_row
  from public.saving_goals
  where id = target_saving_goal_id;

  if saving_goal_row.id is null then
    raise exception 'Target tabungan tidak ditemukan';
  end if;

  if not public.is_household_member(saving_goal_row.household_id) then
    raise exception 'Kamu bukan anggota household ini';
  end if;

  if not exists (
    select 1
    from public.household_members hm
    where hm.household_id = saving_goal_row.household_id
      and hm.user_id = paid_by_user_id
  ) then
    raise exception 'Pembayar bukan anggota household ini';
  end if;

  update public.saving_goals
  set current_amount = current_amount + contribution_amount
  where id = saving_goal_row.id;

  insert into public.shared_transactions (
    household_id,
    created_by,
    paid_by,
    type,
    amount,
    saving_goal_id,
    description,
    transaction_date
  )
  values (
    saving_goal_row.household_id,
    auth.uid(),
    paid_by_user_id,
    'saving_contribution',
    contribution_amount,
    saving_goal_row.id,
    'Kontribusi tabungan: ' || saving_goal_row.name,
    contribution_date
  )
  returning id into new_transaction_id;

  return new_transaction_id;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists households_set_updated_at on public.households;
create trigger households_set_updated_at
before update on public.households
for each row execute function public.set_updated_at();

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists shared_transactions_set_updated_at on public.shared_transactions;
create trigger shared_transactions_set_updated_at
before update on public.shared_transactions
for each row execute function public.set_updated_at();

drop trigger if exists monthly_budgets_set_updated_at on public.monthly_budgets;
create trigger monthly_budgets_set_updated_at
before update on public.monthly_budgets
for each row execute function public.set_updated_at();

drop trigger if exists recurring_transactions_set_updated_at on public.recurring_transactions;
create trigger recurring_transactions_set_updated_at
before update on public.recurring_transactions
for each row execute function public.set_updated_at();

drop trigger if exists saving_goals_set_updated_at on public.saving_goals;
create trigger saving_goals_set_updated_at
before update on public.saving_goals
for each row execute function public.set_updated_at();

drop trigger if exists notification_settings_set_updated_at on public.notification_settings;
create trigger notification_settings_set_updated_at
before update on public.notification_settings
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.categories enable row level security;
alter table public.shared_transactions enable row level security;
alter table public.monthly_budgets enable row level security;
alter table public.recurring_transactions enable row level security;
alter table public.recurring_transaction_logs enable row level security;
alter table public.saving_goals enable row level security;
alter table public.notification_settings enable row level security;

create policy "Profiles dapat dibaca sendiri"
on public.profiles for select
using (id = auth.uid());

create policy "Profiles dapat dibuat sendiri"
on public.profiles for insert
with check (id = auth.uid());

create policy "Profiles dapat diubah sendiri"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "Households dapat dibaca member"
on public.households for select
using (owner_id = auth.uid() or public.is_household_member(id));

create policy "Households dapat dibuat owner"
on public.households for insert
with check (owner_id = auth.uid());

create policy "Households dapat diubah owner"
on public.households for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Households dapat dihapus owner"
on public.households for delete
using (owner_id = auth.uid());

create policy "Household members dapat dibaca sesama member"
on public.household_members for select
using (
  user_id = auth.uid()
  or public.is_household_member(household_id)
);

create policy "Owner dapat menambahkan anggota maksimal dua"
on public.household_members for insert
with check (
  public.household_member_count(household_id) < 2
  and (
    (
      user_id = auth.uid()
      and role = 'owner'
      and exists (
        select 1
        from public.households h
        where h.id = household_id
          and h.owner_id = auth.uid()
      )
    )
    or exists (
      select 1
      from public.households h
      where h.id = household_id
        and h.owner_id = auth.uid()
    )
  )
);

create policy "Owner dapat mengubah anggota household"
on public.household_members for update
using (
  exists (
    select 1
    from public.households h
    where h.id = household_id
      and h.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.households h
    where h.id = household_id
      and h.owner_id = auth.uid()
  )
);

create policy "Owner dapat menghapus anggota household"
on public.household_members for delete
using (
  exists (
    select 1
    from public.households h
    where h.id = household_id
      and h.owner_id = auth.uid()
  )
);

create policy "Categories dapat dibaca member"
on public.categories for select
using (public.is_household_member(household_id));

create policy "Categories dapat dibuat member"
on public.categories for insert
with check (public.is_household_member(household_id));

create policy "Categories dapat diubah member"
on public.categories for update
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

create policy "Categories dapat dihapus member"
on public.categories for delete
using (public.is_household_member(household_id));

create policy "Shared transactions dapat dibaca member"
on public.shared_transactions for select
using (public.is_household_member(household_id));

create policy "Shared transactions dapat dibuat member"
on public.shared_transactions for insert
with check (
  public.is_household_member(household_id)
  and created_by = auth.uid()
  and public.is_household_member(household_id)
);

create policy "Shared transactions dapat diubah member"
on public.shared_transactions for update
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

create policy "Shared transactions dapat dihapus member"
on public.shared_transactions for delete
using (public.is_household_member(household_id));

create policy "Monthly budgets dapat dibaca member"
on public.monthly_budgets for select
using (public.is_household_member(household_id));

create policy "Monthly budgets dapat dibuat member"
on public.monthly_budgets for insert
with check (public.is_household_member(household_id));

create policy "Monthly budgets dapat diubah member"
on public.monthly_budgets for update
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

create policy "Monthly budgets dapat dihapus member"
on public.monthly_budgets for delete
using (public.is_household_member(household_id));

create policy "Recurring transactions dapat dibaca member"
on public.recurring_transactions for select
using (public.is_household_member(household_id));

create policy "Recurring transactions dapat dibuat member"
on public.recurring_transactions for insert
with check (
  public.is_household_member(household_id)
  and created_by = auth.uid()
);

create policy "Recurring transactions dapat diubah member"
on public.recurring_transactions for update
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

create policy "Recurring transactions dapat dihapus member"
on public.recurring_transactions for delete
using (public.is_household_member(household_id));

create policy "Recurring logs dapat dibaca member"
on public.recurring_transaction_logs for select
using (public.is_household_member(household_id));

create policy "Recurring logs dapat dibuat member"
on public.recurring_transaction_logs for insert
with check (
  public.is_household_member(household_id)
  and created_by = auth.uid()
);

create policy "Recurring logs dapat diubah member"
on public.recurring_transaction_logs for update
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

create policy "Recurring logs dapat dihapus member"
on public.recurring_transaction_logs for delete
using (public.is_household_member(household_id));

create policy "Saving goals dapat dibaca member"
on public.saving_goals for select
using (public.is_household_member(household_id));

create policy "Saving goals dapat dibuat member"
on public.saving_goals for insert
with check (
  public.is_household_member(household_id)
  and created_by = auth.uid()
);

create policy "Saving goals dapat diubah member"
on public.saving_goals for update
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

create policy "Saving goals dapat dihapus member"
on public.saving_goals for delete
using (public.is_household_member(household_id));

create policy "Notification settings dapat dibaca member"
on public.notification_settings for select
using (public.is_household_member(household_id));

create policy "Notification settings dapat dibuat member"
on public.notification_settings for insert
with check (public.is_household_member(household_id));

create policy "Notification settings dapat diubah member"
on public.notification_settings for update
using (public.is_household_member(household_id))
with check (public.is_household_member(household_id));

create policy "Notification settings dapat dihapus member"
on public.notification_settings for delete
using (public.is_household_member(household_id));
