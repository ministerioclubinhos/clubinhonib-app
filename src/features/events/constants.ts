import {
  EventAudience,
  EventCardStatus,
  EventCardsPeriod,
  EventType,
  Weekday,
} from './types';
import type { ChipProps } from '@mui/material';

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

/** Até quantos dias um evento recebe o destaque "Em breve". */
export const EVENT_CARD_SOON_THRESHOLD_DAYS = 7;

/** Rótulos temporais curtos do modo de cards. */
export const EVENT_CARD_STATUS_LABELS: Record<EventCardStatus, string> = {
  [EventCardStatus.TODAY]: 'Hoje',
  [EventCardStatus.TOMORROW]: 'Amanhã',
  [EventCardStatus.SOON]: 'Em breve',
  [EventCardStatus.LATER]: 'Programado',
  [EventCardStatus.PAST]: 'Realizado',
};

/** Opções do recorte temporal mostrado na grade de cards. */
export const EVENT_CARDS_PERIOD_LABELS: Record<EventCardsPeriod, string> = {
  [EventCardsPeriod.WEEK]: 'Esta semana',
  [EventCardsPeriod.MONTH]: 'Este mês',
  [EventCardsPeriod.ALL]: 'Todos',
};

/** Explicação curta do recorte selecionado. */
export const EVENT_CARDS_PERIOD_DESCRIPTIONS: Record<EventCardsPeriod, string> = {
  [EventCardsPeriod.WEEK]: 'De hoje até domingo.',
  [EventCardsPeriod.MONTH]: 'De hoje até o fim do mês.',
  [EventCardsPeriod.ALL]: 'Agenda completa, incluindo eventos anteriores.',
};

/** Cores semânticas dos selos, todas vindas da paleta Material UI. */
export const EVENT_CARD_STATUS_COLORS: Record<EventCardStatus, NonNullable<ChipProps['color']>> = {
  [EventCardStatus.TODAY]: 'error',
  [EventCardStatus.TOMORROW]: 'warning',
  [EventCardStatus.SOON]: 'success',
  [EventCardStatus.LATER]: 'info',
  [EventCardStatus.PAST]: 'default',
};

/** Imagem institucional usada quando um evento não possui mídia própria. */
export const EVENT_FALLBACK_IMAGE_URL =
  import.meta.env?.VITE_CLUBINHO_FALLBACK_IMAGE_URL ??
  import.meta.env?.VITE_SHELTER_FALLBACK_IMAGE_URL ??
  '';
