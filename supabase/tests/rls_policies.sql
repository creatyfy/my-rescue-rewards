-- Manual RLS validation script for local Supabase.
-- Replace UUID placeholders with real IDs before running.

begin;

-- Regular user context.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

-- Expect: only own data in profiles/receipts/ledger.
select * from public.profiles;
select * from public.receipts;
select * from public.points_ledger;

-- Expect: cannot promote self to admin through profile update (blocked in DB trigger).
update public.profiles
set role = 'admin'
where user_id = auth.uid();

-- Expect: cannot view another user's receipt.
select *
from public.receipts
where user_id = '00000000-0000-0000-0000-000000000009';

-- Admin context (this user must truly be admin in DB role tables).
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

-- Expect: admin can view cross-user receipts and sensitive profile fields.
select user_id, role, full_name, phone, cpf
from public.profiles;

select * from public.receipts;

rollback;
