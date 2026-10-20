-- =========================================================================
-- Meu Resgate — Zerar o sistema de pontos (dados de teste)
-- Projeto: quhfnktjmkakskuhjamf
--
-- Corrige os saldos negativos que sobraram após apagar os comprovantes.
-- RESET TOTAL: remove todos os lançamentos de pontos e os resgates de teste.
-- Depois disso, TODOS os saldos ficam em 0 (base limpa para testar).
--
-- ⚠️ É destrutivo e serve só porque são dados de teste.
-- COMO RODAR: Supabase Dashboard -> SQL Editor -> New query -> colar -> Run.
-- =========================================================================

-- 1) remove todos os lançamentos (ganhos, gastos e ajustes)
delete from public.points_ledger;

-- 2) remove os resgates de teste
delete from public.redemptions;

-- Conferência (devem voltar 0 e 0):
select
  (select count(*) from public.points_ledger) as lancamentos,
  (select count(*) from public.redemptions)   as resgates;

-- Conferência de saldos (não deve retornar nenhuma linha):
select user_id, coalesce(sum(amount),0) as saldo
from public.points_ledger
group by user_id
having coalesce(sum(amount),0) <> 0;
