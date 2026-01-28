-- Adicionar novas colunas à tabela products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS prize_value_reais numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS points_calculated integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS points_manual_edit boolean DEFAULT false;

-- Comentários para documentação
COMMENT ON COLUMN public.products.prize_value_reais IS 'Valor do prêmio em reais informado pelo administrador';
COMMENT ON COLUMN public.products.points_calculated IS 'Pontos calculados automaticamente (valor x 600)';
COMMENT ON COLUMN public.products.points_manual_edit IS 'Indica se o custo em pontos foi editado manualmente';