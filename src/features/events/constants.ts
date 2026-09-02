import { EventAudience, EventType, Weekday } from './types';

/** Caminho base dos endpoints de evento. */
export const EVENTS_ENDPOINT = '/events';

/** Campo multipart que carrega o JSON das requisições. */
export const EVENT_PAYLOAD_FIELD = 'eventData';

/** Campo multipart do arquivo enviado. */
export const EVENT_FILE_FIELD = 'file';

/**
 * O cliente Axios usa `application/json` por padrão, o que faria o Axios
 * serializar o FormData como JSON. Requisições multipart declaram o tipo; o
 * navegador acrescenta o boundary.
 */
export const MULTIPART_HEADERS = {
  'Content-Type': 'multipart/form-data',
} as const;

/** Rota pública da agenda. */
export const EVENTS_ROUTE = '/eventos';

/** Rótulos exibidos para cada público. */
export const EVENT_AUDIENCE_LABELS: Record<EventAudience, string> = {
  [EventAudience.ALL]: 'Todos',
  [EventAudience.TEACHERS]: 'Professores',
  [EventAudience.COORDINATORS]: 'Coordenadores',
};

/** Rótulos exibidos para cada tipo de evento. */
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  [EventType.VISIT]: 'Visita',
  [EventType.MEETING]: 'Reunião',
  [EventType.CUSTOM]: 'Outro',
};

/** Posição de cada dia da semana em `Date.getDay()`. */
export const WEEKDAY_INDEX: Record<Weekday, number> = {
  [Weekday.MONDAY]: 1,
  [Weekday.TUESDAY]: 2,
  [Weekday.WEDNESDAY]: 3,
  [Weekday.THURSDAY]: 4,
  [Weekday.FRIDAY]: 5,
  [Weekday.SATURDAY]: 6,
};

/** Rótulo de cada dia da semana. */
export const WEEKDAY_LABELS: Record<Weekday, string> = {
  [Weekday.MONDAY]: 'Segunda-feira',
  [Weekday.TUESDAY]: 'Terça-feira',
  [Weekday.WEDNESDAY]: 'Quarta-feira',
  [Weekday.THURSDAY]: 'Quinta-feira',
  [Weekday.FRIDAY]: 'Sexta-feira',
  [Weekday.SATURDAY]: 'Sábado',
};

/** Texto exibido quando o encontro não tem horário cadastrado. */
export const EVENT_TIME_FALLBACK = 'Horário a definir';
