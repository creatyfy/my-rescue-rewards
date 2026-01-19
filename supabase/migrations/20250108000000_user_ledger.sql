create or replace function public.get_user_ledger(p_user_id uuid, p_limit integer default 20)
returns table (
  ledger_id uuid,
  ledger_type ledger_type,
  amount integer,
  created_at timestamptz,
  receipt_status receipt_status,
  redemption_status redemption_status,
  establishment_name text,
  product_name text,
  protocol_number text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_user_id <> auth.uid() and not public.is_admin() then
    raise exception 'not authorized';
  end if;

  return query
  select
    pl.id as ledger_id,
    pl.type as ledger_type,
    pl.amount,
    pl.created_at,
    r.status as receipt_status,
    rd.status as redemption_status,
    e.name as establishment_name,
    p.name as product_name,
    r.protocol_number
  from public.points_ledger pl
  left join public.receipts r
    on pl.reference_type = 'receipt'
   and pl.reference_id = r.id
  left join public.establishments e
    on r.establishment_id = e.id
  left join public.redemptions rd
    on pl.reference_type = 'redemption'
   and pl.reference_id = rd.id
  left join public.products p
    on rd.product_id = p.id
  where pl.user_id = p_user_id
  order by pl.created_at desc
  limit greatest(coalesce(p_limit, 20), 1);
end;
$$;

grant execute on function public.get_user_ledger(uuid, integer) to authenticated;
