-- Manual RLS validation script for local Supabase.
-- Replace the UUID placeholders with real user/admin IDs.

begin;

-- Simulate regular user context.
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

-- Expect: only own profile rows visible/updatable.
select * from profiles;
update profiles set full_name = full_name where user_id = auth.uid();

-- Expect: can insert receipt/redemption for self.
insert into receipts (user_id, establishment_id, purchase_value, points_earned)
values (auth.uid(), '00000000-0000-0000-0000-000000000010', 10.00, 1);

insert into redemptions (user_id, product_id, points_spent)
values (auth.uid(), '00000000-0000-0000-0000-000000000020', 100);

-- Expect: cannot update receipts or products (admin-only).
update receipts set status = 'approved' where user_id = auth.uid();
update products set name = name;

-- Simulate admin context (ensure this user has admin role in user_roles).
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
select set_config('request.jwt.claim.role', 'authenticated', true);

-- Expect: admin can manage roles, establishments, products, receipts updates.
select * from user_roles;
insert into establishments (name, qr_code_token)
values ('Admin Store', 'token-1');
update receipts set status = 'approved';

rollback;
