alter table public.receipts
  add column if not exists approved_by uuid,
  add column if not exists approved_at timestamptz;

create index if not exists receipts_approved_by_idx on public.receipts(approved_by);
create index if not exists receipts_approved_at_idx on public.receipts(approved_at);
