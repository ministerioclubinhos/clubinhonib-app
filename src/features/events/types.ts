/** Público a quem o evento se destina. Espelha o enum do backend. */
export enum EventAudience {
  ALL = 'all',
  TEACHERS = 'teachers',
  COORDINATORS = 'coordinators',
}

/** Natureza do evento. Espelha o enum do backend. */
export enum EventType {
  VISIT = 'visit',
  MEETING = 'meeting',
  CUSTOM = 'custom',
}

/** Dia da semana do encontro recorrente. Espelha o enum do backend. */
export enum Weekday {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
}

/** Mídia do evento, como a API devolve. */
export interface EventMediaResponse {
  id: string;
  title: string;
  description: string;
  url: string;
  isLocalFile: boolean;
  originalName?: string;
  size?: number;
}

/** Contrato de resposta de `/events`. */
export interface EventResponse {
  id: string;
  title: string;
  description: string;
  /** Data em texto ISO (`YYYY-MM-DD` ou com hora). */
  date: string;
  location: string;
  audience: EventAudience;
  eventType?: EventType;
  /**
   * Um evento não público só vem para quem está autenticado. Os encontros de
   * clubinho entram assim.
   */
  public: boolean;
  /** Encontro semanal: `weekday` e `time` valem para todas as semanas. */
  isRecurring: boolean;
  weekday: Weekday | null;
  /** Horário no formato `HH:mm`. */
  time: string | null;
  /** Preenchido quando o evento veio de um clubinho. */
  clubId: string | null;
  media: EventMediaResponse | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Uma aparição do evento no calendário. Um evento comum gera uma; um encontro
 * semanal gera uma por semana dentro do intervalo exibido.
 */
export interface EventOccurrence {
  /** Chave estável da aparição, para `key` de lista. */
  key: string;
  event: EventResponse;
  /** Dia da aparição, já como data local. */
  date: Date;
}

/** Campos do evento editados no formulário. */
export interface EventFormValues {
  title: string;
  /** Data no formato `YYYY-MM-DD`. */
  date: string;
  location: string;
  description: string;
  audience: EventAudience;
  eventType: EventType;
}

/** Quais campos obrigatórios estão pendentes. */
export interface EventFormErrors {
  title: boolean;
  date: boolean;
  location: boolean;
  description: boolean;
}

/** Mídia enviada no corpo da requisição. */
export interface EventMediaRequest {
  id?: string;
  title?: string;
  description?: string;
  mediaType: 'image';
  uploadType: 'upload' | 'link';
  isLocalFile: boolean;
  url?: string;
  originalName?: string;
  size?: number;
}

/** JSON enviado no campo multipart `eventData`. */
export interface EventRequest {
  title: string;
  date: string;
  location: string;
  description: string;
  audience: EventAudience;
  eventType: EventType;
  media?: EventMediaRequest;
}
