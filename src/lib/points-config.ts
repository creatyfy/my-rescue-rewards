/**
 * Configuração centralizada dos multiplicadores de pontos
 * 
 * REGRAS DE NEGÓCIO:
 * - Comprovantes: Usuário ganha 10 pontos por R$1 gasto
 * - Produtos: Custo em pontos = valor do prêmio x 400
 */

// Multiplicador para cálculo de pontos de PRODUTOS/PRÊMIOS
// 1 real = 400 pontos para definir preço de produtos
export const PRODUCT_POINTS_MULTIPLIER = 400;

// Multiplicador para cálculo de pontos de COMPROVANTES
// 1 real = 10 pontos para compras realizadas
export const RECEIPT_POINTS_MULTIPLIER = 10;

/**
 * Calcula os pontos necessários para um produto com base no valor em reais
 * @param valueInReais - Valor do prêmio em reais
 * @returns Pontos calculados (valor x 400)
 */
export function calculateProductPoints(valueInReais: number): number {
  return Math.floor(valueInReais * PRODUCT_POINTS_MULTIPLIER);
}

/**
 * Calcula o valor equivalente em reais de um custo em pontos (para produtos)
 * @param points - Custo em pontos
 * @returns Valor equivalente em reais (pontos / 400)
 */
export function calculateProductValue(points: number): number {
  return points / PRODUCT_POINTS_MULTIPLIER;
}

/**
 * Calcula os pontos ganhos com base no valor de uma compra
 * @param valueInReais - Valor da compra em reais
 * @returns Pontos ganhos (valor x 10)
 */
export function calculateReceiptPoints(valueInReais: number): number {
  return Math.floor(valueInReais * RECEIPT_POINTS_MULTIPLIER);
}

/**
 * Formata o valor em reais para exibição
 * @param value - Valor numérico
 * @returns String formatada em R$
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Formata pontos para exibição
 * @param points - Quantidade de pontos
 * @returns String formatada com separador de milhares
 */
export function formatPoints(points: number): string {
  return points.toLocaleString('pt-BR');
}
