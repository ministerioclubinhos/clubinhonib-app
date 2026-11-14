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

/** Posição temporal usada para apresentar um evento no modo de cards. */
export enum EventCardStatus {
  TODAY = 'today',
  TOMORROW = 'tomorrow',
  SOON = 'soon',
  LATER = 'later',
  PAST = 'past',
}

/** Recorte temporal disponível na visualização em cards. */
export enum EventCardsPeriod {
  WEEK = 'week',
  MONTH = 'month',
  ALL = 'all',
}

/** Visualizações disponíveis na agenda pública. */
export enum EventsViewMode {
  CARDS = 'cards',
  CALENDAR = 'calendar',
}

/**
 * Modelo consumido pela tela legada de agenda.
 *
 * A API possui campos adicionais em `EventResponse`; esta interface mantém o
 * contrato mínimo compartilhado pela página, calendário, cards e modais.
 */
export interface AppEvent {
  id: string;
  title: string;
  location: string;
  /**
   * Dia que o evento mostra. Para um encontro de clubinho é a próxima
   * ocorrência — a data da primeira sozinha faria o card dizer "há oito meses"
   * sobre um encontro que acontece no sábado que vem.
   */
  date: string;
  /**
   * Todos os dias em que o evento acontece, em `YYYY-MM-DD`, como a API
   * calculou: um encontro de clubinho já vem limitado ao período letivo e sem
   * os dias de exceção. É o que o calendário desenha.
   */
  occurrences?: string[];
  /**
   * Preenchido quando o evento é o encontro semanal de um clubinho.
   *
   * A tela usa isto para não oferecer editar nem excluir: esses encontros são
   * mantidos pelo cadastro do clubinho, e a API recusa a alteração. Para tirar
   * um do calendário, desative ou exclua o clubinho.
   */
  clubId?: string | null;
  /**
   * Horário em `HH:mm`. O encontro de clubinho tem hora própria; a data do
   * evento não a carrega, e derivá-la dali dava sempre meia-noite.
   */
  time?: string | null;
  description: string;
  media?: {
    url: string;
    originalName?: string;
    size?: number;
    createdAt?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  audience?: string;
}

/** Eventos separados para a hierarquia visual do modo de cards. */
export interface EventCardGroups {
  upcoming: AppEvent[];
  past: AppEvent[];
}

/** Partes curtas da data exibidas no calendário visual de um card. */
export interface EventCardDateParts {
  day: string;
  month: string;
  complement: string;
  full: string;
}

/** Contrato da visualização em cards. */
export interface EventsCardsViewProps {
  eventos: AppEvent[];
  isAdmin: boolean;
  isLoading: boolean;
  period: EventCardsPeriod;
  onPeriodChange: (period: EventCardsPeriod) => void;
  onOpenDetails: (event: AppEvent) => void;
  onAdd: () => void;
  onEdit: (event: AppEvent) => void;
  onDelete: (event: AppEvent) => void;
}

/** Contrato do calendário mensal controlado pela página. */
export interface EventsCalendarViewProps {
  eventos: AppEvent[];
  isAdmin: boolean;
  isLoading: boolean;
  calendarMonth: string;
  onCalendarMonthChange: (month: string) => void;
  onOpenDetails: (event: AppEvent) => void;
  onAdd: () => void;
  onEdit: (event: AppEvent) => void;
  onDelete: (event: AppEvent) => void;
}

/** Contrato de um card individual de evento. */
export interface EventCardProps {
  event: AppEvent;
  isAdmin: boolean;
  status: EventCardStatus;
  onOpenDetails: (event: AppEvent) => void;
  onEdit: (event: AppEvent) => void;
  onDelete: (event: AppEvent) => void;
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
  /**
   * Dias em que o evento acontece, em `YYYY-MM-DD`.
   *
   * Vem pronto da API: um encontro de clubinho já chega limitado ao período
   * letivo e sem os dias de exceção. O cálculo mora no backend porque período e
   * exceção são cadastro administrativo — o site aberto não os consulta.
   */
  occurrences: string[];
  /** Horário no formato `HH:mm`. */
  time: string | null;
  /** Preenchido quando o evento veio de um clubinho. */
  clubId: string | null;
  media: EventMediaResponse | null;
  createdAt: string;
  updatedAt: string;
}

/** Parâmetros aceitos por `GET /events`. */
export interface EventListQuery {
  /** Primeiro dia incluído, em `YYYY-MM-DD`. */
  from?: string;
  /** Último dia incluído, em `YYYY-MM-DD`. */
  to?: string;
}

/**
 * O mínimo para saber em que dias um evento aparece.
 *
 * Estrutural, e não a resposta inteira da API, porque o calendário trabalha com
 * `AppEvent` e a página de agenda com `EventResponse` — as duas têm o que
 * importa aqui.
 */
export interface OccurrenceSource {
  id: string;
  date: string;
  occurrences?: string[];
}

/**
 * Uma aparição do evento no calendário. Um evento comum gera uma; um encontro
 * de clubinho gera uma por semana do período letivo dentro do intervalo
 * exibido.
 */
export interface EventOccurrence<T extends OccurrenceSource = EventResponse> {
  /** Chave estável da aparição, para `key` de lista. */
  key: string;
  event: T;
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
