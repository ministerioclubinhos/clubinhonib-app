/**
 * Tipos das props que o Recharts entrega aos tooltips customizados.
 *
 * O Recharts chama o componente de `content` com esse formato, mas os tipos
 * exportados pela biblioteca variam entre versões e tipos de gráfico; declarar
 * o contrato aqui evita o `any` que cada gráfico repetia.
 */

/** Uma série do tooltip, na posição correspondente ao ponto sob o cursor. */
export interface ChartTooltipEntry<TPayload = Record<string, unknown>> {
  name?: string;
  value?: number | string;
  /** Cor da série; o Recharts usa `color`, `stroke` ou `fill` conforme o gráfico. */
  color?: string;
  stroke?: string;
  fill?: string;
  dataKey?: string | number;
  /** Registro original da série, como veio dos dados do gráfico. */
  payload: TPayload;
}

/** Props recebidas por um tooltip customizado. */
export interface ChartTooltipProps<TPayload = Record<string, unknown>> {
  active?: boolean;
  label?: string | number;
  payload?: ChartTooltipEntry<TPayload>[];
}

/**
 * Converte o valor de uma série para número.
 *
 * O Recharts entrega `value` como número ou string conforme o gráfico, e ele
 * pode faltar quando o ponto não tem dado — formatar direto quebrava nesses
 * casos.
 */
export function toChartNumber(value: number | string | undefined): number {
  const parsed = typeof value === 'string' ? Number(value) : value;
  return Number.isFinite(parsed) ? (parsed as number) : 0;
}
