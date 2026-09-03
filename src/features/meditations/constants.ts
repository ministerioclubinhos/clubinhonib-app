import { MeditationWeekDay } from './types';

/** Caminho base dos endpoints de meditação. */
export const MEDITATIONS_ENDPOINT = '/meditations';

/** Campo multipart que carrega o JSON das requisições. */
export const MEDITATION_PAYLOAD_FIELD = 'meditationData';

/** Campo multipart que carrega o arquivo da mídia. */
export const MEDITATION_FILE_FIELD = 'file';

/**
 * O cliente Axios usa `application/json` por padrão, o que faria o Axios
 * serializar o FormData como JSON. Requisições multipart declaram o tipo; o
 * navegador acrescenta o boundary.
 */
export const MULTIPART_HEADERS = {
  'Content-Type': 'multipart/form-data',
} as const;

/** Rotas administrativas das telas de meditação. */
export const MEDITATION_ROUTES = {
  MANAGE: '/adm/meditacoes',
  /** O id vai na URL: sem ele um F5 na edição perdia a meditação carregada. */
  EDIT: '/adm/editar-meditacao',
} as const;

/** Caminho da edição de uma meditação específica. */
export const meditationEditPath = (id: string): string =>
  `${MEDITATION_ROUTES.EDIT}/${id}`;

/** Tamanho de página padrão e opções oferecidas na paginação. */
export const MEDITATIONS_DEFAULT_LIMIT = 12;
export const MEDITATIONS_PAGE_SIZE_OPTIONS = [12, 24, 48];

/** Opções do filtro de período, na ordem em que aparecem. */
export const MEDITATION_PERIOD_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'current', label: 'Desta semana' },
  { value: 'upcoming', label: 'Futuras' },
  { value: 'past', label: 'Encerradas' },
] as const;

/** Opções de ordenação, na ordem em que aparecem. */
export const MEDITATION_SORT_OPTIONS = [
  { value: 'startDate:DESC', label: 'Período mais recente' },
  { value: 'startDate:ASC', label: 'Período mais antigo' },
  { value: 'topic:ASC', label: 'Tema (A–Z)' },
  { value: 'topic:DESC', label: 'Tema (Z–A)' },
] as const;

/** Dias da semana da meditação, na ordem de exibição. */
export const MEDITATION_WEEK_DAYS: readonly MeditationWeekDay[] = [
  MeditationWeekDay.Monday,
  MeditationWeekDay.Tuesday,
  MeditationWeekDay.Wednesday,
  MeditationWeekDay.Thursday,
  MeditationWeekDay.Friday,
];

/** Quantidade exata de dias exigida pela API. */
export const MEDITATION_DAYS_COUNT = MEDITATION_WEEK_DAYS.length;

/** Rótulo em português de cada dia. */
export const MEDITATION_WEEK_DAY_LABELS: Record<MeditationWeekDay, string> = {
  [MeditationWeekDay.Monday]: 'Segunda-feira',
  [MeditationWeekDay.Tuesday]: 'Terça-feira',
  [MeditationWeekDay.Wednesday]: 'Quarta-feira',
  [MeditationWeekDay.Thursday]: 'Quinta-feira',
  [MeditationWeekDay.Friday]: 'Sexta-feira',
};
