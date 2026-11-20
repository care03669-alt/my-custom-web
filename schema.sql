-- Jalankan seluruh file ini di Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Prompt tanpa judul',
  category text not null default 'custom',
  content text not null,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists prompts_user_created_idx on public.prompts(user_id, created_at desc);
create index if not exists prompts_favorite_idx on public.prompts(user_id, is_favorite);

alter table public.profiles enable row level security;
alter table public.prompts enable row level security;

-- Membuat profil otomatis saat pengguna mendaftar.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Fungsi pemeriksaan role admin. Role tidak dapat diubah oleh user biasa.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

drop policy if exists "profile read own or admin" on public.profiles;
create policy "profile read own or admin" on public.profiles
for select to authenticated using (id = auth.uid() or public.is_admin());

-- Profil tidak dapat diedit dari client pada starter ini; perubahan role dilakukan oleh admin melalui SQL.

drop policy if exists "prompts read own or admin" on public.prompts;
create policy "prompts read own or admin" on public.prompts
for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists "prompts insert own" on public.prompts;
create policy "prompts insert own" on public.prompts
for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "prompts update own" on public.prompts;
create policy "prompts update own" on public.prompts
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "prompts delete own or admin" on public.prompts;
create policy "prompts delete own or admin" on public.prompts
for delete to authenticated using (user_id = auth.uid() or public.is_admin());

-- RPC dashboard admin. Hanya role admin yang bisa memanggil.
create or replace function public.admin_overview()
returns json language plpgsql security definer set search_path = public
as $$
declare result json;
begin
  if not public.is_admin() then raise exception 'Forbidden'; end if;
  select json_build_object(
    'users', (select count(*) from public.profiles),
    'prompts', (select count(*) from public.prompts),
    'favorites', (select count(*) from public.prompts where is_favorite = true)
  ) into result;
  return result;
end;
$$;

create or replace function public.admin_list_profiles()
returns table(id uuid, full_name text, role text, created_at timestamptz)
language plpgsql security definer set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Forbidden'; end if;
  return query select p.id, p.full_name, p.role, p.created_at
  from public.profiles p order by p.created_at desc limit 50;
end;
$$;

revoke all on function public.admin_overview() from public;
revoke all on function public.admin_list_profiles() from public;
grant execute on function public.admin_overview() to authenticated;
grant execute on function public.admin_list_profiles() to authenticated;

-- Setelah akun pertama berhasil dibuat, jalankan query ini untuk menjadikannya admin:
-- update public.profiles set role = 'admin' where id = 'UUID-AKUN-ANDA';
