import { AttendanceWeekState } from '../types';
import type { AttendanceTimelineWeek } from '../types';

/**
 * Regras puras da frequência (linha do tempo e séries semanais).
 *
 * Ficam fora dos componentes para serem testadas sem montar a tela.
 */

/**
 * O estado em que uma semana da linha do tempo aparece.
 *
 * A pagela registrada vence tudo: se o clubinho lançou num feriado, a semana
 * tem pagela. Sem pagela, exceção e futuro **não** são falta — é a mesma regra
 * que o back usa para contar `weeksMissing`.
 */
export function attendanceWeekState(
  week: Pick<AttendanceTimelineWeek, 'hasPagela' | 'isException' | 'isPending'>,
): AttendanceWeekState {
  if (week.hasPagela) return AttendanceWeekState.WithPagela;
  if (week.isException) return AttendanceWeekState.Exception;
  if (week.isPending) return AttendanceWeekState.Pending;

  return AttendanceWeekState.Missing;
}

/**
 * Semanas em ordem cronológica (mais antiga primeiro), sem mexer na entrada.
 *
 * `lastSixWeeks` chega do back da mais nova para a mais antiga; plotar nessa
 * ordem desenha a série de trás para frente.
 */
export function sortWeeksAscending<T extends { year: number; week: number }>(
  weeks: readonly T[],
): T[] {
  return [...weeks].sort((a, b) => a.year - b.year || a.week - b.week);
}
