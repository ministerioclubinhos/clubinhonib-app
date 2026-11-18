/**
 * Contas de taxa usadas pelos cartões e gráficos.
 *
 * Funções puras: nada de React, nada de tema.
 */

/**
 * Média de uma taxa ponderada pelo tamanho de cada grupo.
 *
 * A média simples das linhas trata grupos de tamanhos diferentes como iguais:
 * meninos com 90% em 10 pagelas e meninas com 50% em 90 dava 70%, quando a
 * taxa real do conjunto é 54%.
 *
 * Devolve `null` quando não há nenhuma pagela nos grupos — ausência de dado
 * não é 0%.
 */
export function weightedAverageRate<T extends { total: number }>(
  rows: readonly T[],
  pickRate: (row: T) => number,
): number | null {
  let weightSum = 0;
  let weighted = 0;

  for (const row of rows) {
    const weight = Number(row.total);
    const rate = Number(pickRate(row));
    if (!Number.isFinite(weight) || weight <= 0 || !Number.isFinite(rate)) continue;

    weightSum += weight;
    weighted += rate * weight;
  }

  return weightSum > 0 ? weighted / weightSum : null;
}

/**
 * Variação percentual entre dois valores.
 *
 * `null` quando não existe base de comparação (valor anterior ausente, zero ou
 * inválido): dividir por zero mostrava "Infinity%" / "NaN%" no cartão.
 */
export function percentChange(current: number, previous?: number | null): number | null {
  if (previous === undefined || previous === null) return null;
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return null;

  return ((current - previous) / Math.abs(previous)) * 100;
}
