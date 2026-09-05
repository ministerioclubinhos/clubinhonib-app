import { PeriodShortcut } from './types';

/**
 * Rótulo de cada atalho de período.
 *
 * Estava escrito à mão dentro de `SmartFilters`, junto do ícone e da cor. O
 * texto sai daqui para que a mesma escolha apareça igual em qualquer tela que
 * venha a oferecer o filtro.
 */
export const PERIOD_SHORTCUT_LABELS: Record<PeriodShortcut, string> = {
  [PeriodShortcut.TODAY]: 'Hoje',
  [PeriodShortcut.THIS_WEEK]: 'Esta semana',
  [PeriodShortcut.THIS_MONTH]: 'Este mês',
  [PeriodShortcut.LAST_7_DAYS]: '7 dias',
  [PeriodShortcut.LAST_30_DAYS]: '30 dias',
  [PeriodShortcut.THIS_YEAR]: 'Este ano',
  [PeriodShortcut.CUSTOM]: 'Personalizado',
};

/** Ordem em que os atalhos aparecem na barra de filtros. */
export const QUICK_PERIOD_ORDER: PeriodShortcut[] = [
  PeriodShortcut.TODAY,
  PeriodShortcut.THIS_WEEK,
  PeriodShortcut.THIS_MONTH,
  PeriodShortcut.LAST_7_DAYS,
  PeriodShortcut.LAST_30_DAYS,
  PeriodShortcut.THIS_YEAR,
];

/**
 * Faixas de idade e de tempo de participação.
 *
 * São as mesmas que o back usa para agrupar (`metrics.utils.ts`); repetir os
 * limites na tela faria os dois lados divergirem em silêncio.
 */
export const AGE_GROUPS = ['0-5', '6-10', '11-15', '16+'] as const;

export const PARTICIPATION_TIME_RANGES = [
  '0-3 meses',
  '3-6 meses',
  '6-12 meses',
  '1+ ano',
] as const;

/** Quantas casas decimais as taxas mostram — o mesmo do back. */
export const RATE_DECIMAL_PLACES = 1;

/** Página e tamanho padrão das listagens de estatística. */
export const STATISTICS_DEFAULT_PAGE = 1;
export const STATISTICS_DEFAULT_LIMIT = 20;

/**
 * Nome do dia da semana como as listagens o mostram.
 *
 * Aceita as duas grafias porque a API já devolveu ambas: linhas antigas em
 * maiúsculas, as novas em minúsculas.
 */
export const WEEKDAY_NAMES: Record<string, string> = {
  MONDAY: 'Segunda',
  TUESDAY: 'Terça',
  WEDNESDAY: 'Quarta',
  THURSDAY: 'Quinta',
  FRIDAY: 'Sexta',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
  monday: 'Segunda',
  tuesday: 'Terça',
  wednesday: 'Quarta',
  thursday: 'Quinta',
  friday: 'Sexta',
  saturday: 'Sábado',
  sunday: 'Domingo',
};
