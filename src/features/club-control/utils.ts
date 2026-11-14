import {
  CLUB_STATUSES_WITH_PROBLEM,
  CLUB_STATUS_LABELS,
  CLUB_STATUS_SEVERITY,
  EXCEPTION_TYPE_LABELS,
} from './constants';
import type { ClubCheckStatus } from './types';

/**
 * Regras puras do controle de clubinho.
 *
 * Estavam dentro dos componentes, o que impedia testá-las sem montar a tela.
 */

/** Rótulo da situação; situação desconhecida vira "Indefinido". */
export function clubStatusLabel(status: string): string {
  return CLUB_STATUS_LABELS[status as ClubCheckStatus] ?? 'Indefinido';
}

/** Gravidade da situação, no vocabulário do MUI. */
export function clubStatusSeverity(
  status: string,
): 'success' | 'warning' | 'error' | 'info' {
  return CLUB_STATUS_SEVERITY[status as ClubCheckStatus] ?? 'info';
}

/**
 * Se a situação pede atenção de quem administra.
 *
 * `pending` fica de fora de propósito: o dia do clubinho ainda não chegou, e
 * cobrar aí faria toda segunda-feira parecer um problema.
 */
export function clubHasProblem(status: string): boolean {
  return CLUB_STATUSES_WITH_PROBLEM.includes(status as ClubCheckStatus);
}

/** Rótulo do tipo de exceção; tipo desconhecido volta como veio. */
export function exceptionTypeLabel(type: string): string {
  return EXCEPTION_TYPE_LABELS[type] ?? type;
}

/**
 * Confere as datas de um período letivo.
 *
 * A regra estava dentro do `handleSubmitEdit` do formulário, o que impedia
 * testá-la sem montar o diálogo — e ela é o que impede um período de terminar
 * antes de começar, ou de atravessar a virada do ano letivo.
 */
export function validatePeriodDates(
  startDate: string,
  endDate: string,
  year: number,
): { valid: boolean; message?: string } {
  const invalido =
    !startDate ||
    !endDate ||
    startDate > endDate ||
    Number(startDate.slice(0, 4)) !== year ||
    Number(endDate.slice(0, 4)) !== year;

  return invalido
    ? {
        valid: false,
        message: 'Informe datas válidas, em ordem, dentro do ano letivo.',
      }
    : { valid: true };
}

/**
 * Percentual de crianças com pagela.
 *
 * Denominador zero devolve `0`, e não `NaN`: clubinho sem criança cadastrada
 * aparece com 0%, que é o que a tela deve mostrar.
 */
export function completionRate(withPagela: number, total: number): number {
  return total > 0 ? Math.round((withPagela / total) * 1000) / 10 : 0;
}
