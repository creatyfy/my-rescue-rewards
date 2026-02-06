create or replace function public.submit_receipt_from_edge(
  p_user_id uuid,
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
begin
  if auth.role() <> 'service_role' then
    raise exception 'service role required';
  end if;

  if p_user_id is null then
    raise exception 'user_id required';
  end if;

  perform set_config('request.jwt.claim.sub', p_user_id::text, true);

  return query
  select r.receipt_id, r.receipt_identifier, r.points, r.status
  from public.submit_receipt(
    p_qr_code_token,
    p_purchase_value,
    p_receipt_image_url,
    p_receipt_fingerprint
  ) as r;
end;
$$;

revoke all on function public.submit_receipt_from_edge(uuid, text, numeric, text, text) from public;
revoke all on function public.submit_receipt_from_edge(uuid, text, numeric, text, text) from anon;
revoke all on function public.submit_receipt_from_edge(uuid, text, numeric, text, text) from authenticated;
grant execute on function public.submit_receipt_from_edge(uuid, text, numeric, text, text) to service_role;

revoke execute on function public.submit_receipt(text, numeric, text) from authenticated;
revoke execute on function public.submit_receipt(text, numeric, text, text) from authenticated;
