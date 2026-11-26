import { PeriodShortcut } from '../types';
import { getPeriodDates, type PeriodDates } from './periodHelpers';

const toIso = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const fromIso = (iso: string): Date => {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const shiftDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

/** O recorte de datas já decorrido: o fim nunca passa de hoje. */
export function elapsedRange(period: PeriodShortcut, today: Date = new Date()): PeriodDates | undefined {
  const range = getPeriodDates(period, undefined, undefined, today);
  if (!range) return undefined;
  const todayIso = toIso(today);
  return { startDate: range.startDate, endDate: range.endDate > todayIso ? todayIso : range.endDate };
}

/**
 * O recorte anterior, do mesmo tamanho do que já passou do atual — para
 * comparar o que é comparável (3 dias da semana contra 3 dias da anterior).
 *
 * Semana → semana passada; mês → mês passado; 30 dias → os 30 anteriores;
 * ano → o ano passado até a mesma data.
 */
export function previousRange(period: PeriodShortcut, today: Date = new Date()): PeriodDates | undefined {
  const current = elapsedRange(period, today);
  if (!current) return undefined;
  const start = fromIso(current.startDate);
  const end = fromIso(current.endDate);

  switch (period) {
    case PeriodShortcut.THIS_WEEK:
      return { startDate: toIso(shiftDays(start, -7)), endDate: toIso(shiftDays(end, -7)) };
    case PeriodShortcut.THIS_MONTH: {
      const prevStart = new Date(start.getFullYear(), start.getMonth() - 1, 1);
      const lastDay = new Date(prevStart.getFullYear(), prevStart.getMonth() + 1, 0).getDate();
      const prevEnd = new Date(prevStart.getFullYear(), prevStart.getMonth(), Math.min(end.getDate(), lastDay));
      return { startDate: toIso(prevStart), endDate: toIso(prevEnd) };
    }
    case PeriodShortcut.THIS_YEAR: {
      const prevStart = new Date(start.getFullYear() - 1, 0, 1);
      const prevEnd = new Date(end.getFullYear() - 1, end.getMonth(), Math.min(end.getDate(), new Date(end.getFullYear() - 1, end.getMonth() + 1, 0).getDate()));
      return { startDate: toIso(prevStart), endDate: toIso(prevEnd) };
    }
    default: {
      const length = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
      return { startDate: toIso(shiftDays(start, -length)), endDate: toIso(shiftDays(start, -1)) };
    }
  }
}

/** Variação percentual; `undefined` sem base (anterior zerado). */
export function percentChange(now: number, before: number): number | undefined {
  return before > 0 ? ((now - before) / before) * 100 : undefined;
}
