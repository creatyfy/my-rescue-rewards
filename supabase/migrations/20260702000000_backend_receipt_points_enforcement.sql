-- Enforce receipt points calculation fully in the backend.
-- Rule: 10 points for each R$1 spent.

create or replace function public.calculate_receipt_points(p_purchase_value numeric)
returns integer
language sql
immutable
as $$
  select floor(p_purchase_value * 10)::int;
$$;

alter table public.purchase_receipts
  drop constraint if exists purchase_receipts_points_matches_purchase_value;

alter table public.purchase_receipts
  add constraint purchase_receipts_points_matches_purchase_value
  check (points = public.calculate_receipt_points(purchase_value));

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

  v_points := public.calculate_receipt_points(p_purchase_value);
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

drop policy if exists "Purchase receipts: insert own" on public.purchase_receipts;

-- Authenticated clients cannot insert purchase receipts directly.
-- Creation must go through public.submit_receipt() where points are calculated server-side.
create policy "Purchase receipts: direct insert denied"
on public.purchase_receipts
for insert
to authenticated
with check (false);


grant execute on function public.calculate_receipt_points(numeric) to authenticated;
grant execute on function public.submit_receipt(text, numeric, text, text) to authenticated;
grant execute on function public.submit_receipt(text, numeric, text) to authenticated;
