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
  EDIT: '/adm/editar-meditacao',
} as const;

/** Atraso aplicado à busca por tema na listagem. */
export const MEDITATION_SEARCH_DEBOUNCE_MS = 300;

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
