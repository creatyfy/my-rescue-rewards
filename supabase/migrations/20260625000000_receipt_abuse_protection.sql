create table if not exists public.receipt_submission_rate_limits (
  scope text not null check (scope in ('user', 'ip')),
  identifier text not null,
  window_start timestamptz not null,
  attempts integer not null default 0 check (attempts >= 0),
  updated_at timestamptz not null default now(),
  primary key (scope, identifier, window_start)
);

alter table public.receipt_submission_rate_limits enable row level security;

create policy "Service role manages receipt rate limits"
on public.receipt_submission_rate_limits
as permissive
for all
to service_role
using (true)
with check (true);

create or replace function public.enforce_receipt_submission_rate_limit(
  p_user_id uuid,
  p_client_ip text,
  p_window_seconds integer default 300,
  p_max_user_attempts integer default 5,
  p_max_ip_attempts integer default 20
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window_start timestamptz;
  v_user_attempts integer;
  v_ip_attempts integer;
begin
  v_window_start := to_timestamp(
    floor(extract(epoch from now()) / greatest(p_window_seconds, 60)) * greatest(p_window_seconds, 60)
  );

  insert into public.receipt_submission_rate_limits (scope, identifier, window_start, attempts)
  values ('user', p_user_id::text, v_window_start, 1)
  on conflict (scope, identifier, window_start)
  do update set
    attempts = public.receipt_submission_rate_limits.attempts + 1,
    updated_at = now()
  returning attempts into v_user_attempts;

  if v_user_attempts > greatest(p_max_user_attempts, 1) then
    raise exception using errcode = 'P0001', message = 'rate_limit_user';
  end if;

  if p_client_ip is not null and btrim(p_client_ip) <> '' then
    insert into public.receipt_submission_rate_limits (scope, identifier, window_start, attempts)
    values ('ip', p_client_ip, v_window_start, 1)
    on conflict (scope, identifier, window_start)
    do update set
      attempts = public.receipt_submission_rate_limits.attempts + 1,
      updated_at = now()
    returning attempts into v_ip_attempts;

    if v_ip_attempts > greatest(p_max_ip_attempts, 1) then
      raise exception using errcode = 'P0001', message = 'rate_limit_ip';
    end if;
  end if;
end;
$$;

grant execute on function public.enforce_receipt_submission_rate_limit(uuid, text, integer, integer, integer) to authenticated;

alter table public.purchase_receipts
  add column if not exists receipt_identifier text,
  add column if not exists receipt_fingerprint text;

update public.purchase_receipts
set receipt_identifier = coalesce(receipt_identifier, 'RCPT-' || replace(gen_random_uuid()::text, '-', '')),
    receipt_fingerprint = coalesce(receipt_fingerprint, md5(id::text));

alter table public.purchase_receipts
  alter column receipt_identifier set default ('RCPT-' || replace(gen_random_uuid()::text, '-', '')),
  alter column receipt_identifier set not null,
  alter column receipt_fingerprint set not null;

create unique index if not exists purchase_receipts_receipt_identifier_key
  on public.purchase_receipts(receipt_identifier);

create unique index if not exists purchase_receipts_receipt_fingerprint_key
  on public.purchase_receipts(receipt_fingerprint);

create or replace function public.submit_receipt(
  p_qr_code_token text,
  p_purchase_value numeric,
  p_receipt_image_url text,
  p_receipt_fingerprint text default null
)
returns table (
  receipt_id uuid,
  receipt_identifier text,
  points integer,
  status public.receipt_status
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_store_id uuid;
  v_qr_code_id uuid;
  v_points integer;
  v_headers jsonb;
  v_client_ip text;
  v_receipt_fingerprint text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  v_headers := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
  v_client_ip := coalesce(
    nullif(split_part(v_headers ->> 'x-forwarded-for', ',', 1), ''),
    nullif(v_headers ->> 'cf-connecting-ip', ''),
    nullif(v_headers ->> 'x-real-ip', '')
  );

  perform public.enforce_receipt_submission_rate_limit(auth.uid(), v_client_ip);

  select q.store_id, q.id
    into v_store_id, v_qr_code_id
  from public.qr_codes q
  join public.stores s on s.id = q.store_id
  where q.qr_value = p_qr_code_token
    and q.is_active = true
    and s.is_active = true
  limit 1;

  if v_store_id is null then
    raise exception 'invalid store qr';
  end if;

  if p_purchase_value is null or p_purchase_value < 10 then
    raise exception 'purchase value below minimum';
  end if;

  v_points := floor(p_purchase_value)::int;
  v_receipt_fingerprint := coalesce(nullif(btrim(p_receipt_fingerprint), ''), md5(p_receipt_image_url));

  begin
    insert into public.purchase_receipts (
      user_id,
      store_id,
      qr_code_id,
      purchase_value,
      points,
      status,
      receipt_image_url,
      receipt_identifier,
      receipt_fingerprint
    ) values (
      auth.uid(),
      v_store_id,
      v_qr_code_id,
      p_purchase_value,
      v_points,
      'pending',
      p_receipt_image_url,
      'RCPT-' || replace(gen_random_uuid()::text, '-', ''),
      v_receipt_fingerprint
    )
    returning id, public.purchase_receipts.receipt_identifier, public.purchase_receipts.points, public.purchase_receipts.status
    into receipt_id, receipt_identifier, points, status;
  exception
    when unique_violation then
      raise exception using errcode = '23505', message = 'duplicate_receipt';
  end;

  return next;
end;
$$;



create or replace function public.submit_receipt(
  p_qr_code_token text,
  p_purchase_value numeric,
  p_receipt_image_url text
)
returns table (
  receipt_id uuid,
  points integer,
  status public.receipt_status
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select r.receipt_id, r.points, r.status
  from public.submit_receipt(
    p_qr_code_token,
    p_purchase_value,
    p_receipt_image_url,
    md5(p_receipt_image_url)
  ) as r;
end;
$$;

grant execute on function public.submit_receipt(text, numeric, text, text) to authenticated;
grant execute on function public.submit_receipt(text, numeric, text) to authenticated;
