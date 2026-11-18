import { PeriodShortcut } from '../types';

/** Um par de datas do filtro; qualquer ponta pode ainda não existir. */
export interface PartialDateRange {
  startDate?: string;
  endDate?: string;
}

/**
 * As datas que o filtro passa a ter quando o atalho de período muda.
 *
 * Um atalho comum usa o intervalo calculado para ele. "Personalizado" não tem
 * intervalo próprio — e antes isso apagava as duas datas, de modo que a tela
 * mandava `period=custom` sozinho e cada endpoint escolhia a sua janela padrão:
 * as abas mostravam recortes diferentes sem avisar. Agora "Personalizado"
 * mantém as datas que já estavam em uso até a pessoa escolher outras.
 */
export function resolveRangeOnPeriodChange(
  period: PeriodShortcut,
  shortcutRange: PartialDateRange | null,
  previous: PartialDateRange,
): PartialDateRange {
  if (period === PeriodShortcut.CUSTOM || !shortcutRange) {
    return { startDate: previous.startDate, endDate: previous.endDate };
  }

  return { startDate: shortcutRange.startDate, endDate: shortcutRange.endDate };
}
