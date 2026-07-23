-- =====================================================================
-- Push notifications: tabela de tokens de dispositivo (FCM/APNs)
-- ---------------------------------------------------------------------
-- Cada dispositivo (celular) registra um token; usamos ele pra enviar
-- push via Firebase. Um usuário pode ter vários dispositivos.
-- =====================================================================

create table if not exists public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null,
  platform text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (token)
);

create index if not exists device_tokens_user_id_idx on public.device_tokens (user_id);

alter table public.device_tokens enable row level security;

drop policy if exists "device_tokens: manage own" on public.device_tokens;
create policy "device_tokens: manage own"
  on public.device_tokens
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant all on public.device_tokens to authenticated, service_role;

-- Upsert seguro do token para o usuário logado. Se o mesmo dispositivo
-- (token) trocar de conta, o registro é reatribuído ao usuário atual.
create or replace function public.save_device_token(p_token text, p_platform text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if p_token is null or btrim(p_token) = '' then
    return;
  end if;

  insert into public.device_tokens (user_id, token, platform)
  values (auth.uid(), p_token, p_platform)
  on conflict (token) do update
    set user_id = excluded.user_id,
        platform = excluded.platform,
        updated_at = now();
end;
$$;

grant execute on function public.save_device_token(text, text) to authenticated;
