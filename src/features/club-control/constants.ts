import type { ClubCheckStatus } from './types';

/**
 * Rótulo de cada situação de clubinho na semana.
 *
 * Estava escrito à mão dentro de `ClubsListTable` e de `ClubCheckDetail`, e as
 * duas cópias já divergiam: a segunda não tratava `pending`, `inactive` nem
 * `out_of_period` — as três caíam no rótulo genérico do `default`.
 */
export const CLUB_STATUS_LABELS: Record<ClubCheckStatus, string> = {
  ok: 'Completo',
  pending: 'Pendente',
  partial: 'Parcial',
  missing: 'Faltando',
  exception: 'Exceção',
  inactive: 'Desativado',
  out_of_period: 'Fora do período',
};

/**
 * Gravidade de cada situação, no vocabulário do MUI.
 *
 * `pending` e `out_of_period` são informativos de propósito: a semana ainda não
 * chegou, ou nem existe no período letivo — nenhum dos dois é falta.
 */
export const CLUB_STATUS_SEVERITY: Record<
  ClubCheckStatus,
  'success' | 'warning' | 'error' | 'info'
> = {
  ok: 'success',
  pending: 'info',
  partial: 'warning',
  missing: 'error',
  exception: 'info',
  inactive: 'info',
  out_of_period: 'info',
};

/** As situações que pedem atenção de quem administra. */
export const CLUB_STATUSES_WITH_PROBLEM: ClubCheckStatus[] = [
  'missing',
  'partial',
];

/** Tipos de exceção de calendário, com o rótulo que a tela mostra. */
export const EXCEPTION_TYPE_LABELS: Record<string, string> = {
  holiday: 'Feriado',
  event: 'Evento',
  maintenance: 'Manutenção',
  vacation: 'Recesso',
  other: 'Outro',
};

/** Página e tamanho padrão da listagem de clubinhos da semana. */
export const CLUB_CONTROL_DEFAULT_PAGE = 1;
export const CLUB_CONTROL_DEFAULT_LIMIT = 20;

/** Um feriado sugerido no cadastro de exceções. */
export type SuggestedHoliday = {
  date: string;
  label: string;
  recurrent: boolean;
};

/**
 * Feriados oferecidos como atalho ao cadastrar uma exceção.
 *
 * Estavam escritos dentro do JSX de `ExceptionManagement`. A data é só o dia e
 * o mês que importam — todos são recorrentes, então o ano serve apenas de
 * referência para a formatação.
 */
export const SUGGESTED_HOLIDAYS: SuggestedHoliday[] = [
  { date: '2024-12-25', label: 'Natal', recurrent: true },
  { date: '2025-01-01', label: 'Ano Novo', recurrent: true },
  { date: '2025-04-21', label: 'Tiradentes', recurrent: true },
  { date: '2025-05-01', label: 'Trabalho', recurrent: true },
  { date: '2025-09-07', label: 'Independência', recurrent: true },
  { date: '2025-10-12', label: 'N. Sra. Aparecida', recurrent: true },
  { date: '2025-11-02', label: 'Finados', recurrent: true },
  { date: '2025-11-15', label: 'Proclamação', recurrent: true },
  { date: '2025-11-20', label: 'Consciência Negra', recurrent: true },
];
