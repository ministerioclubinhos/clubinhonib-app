import {
  AppEvent,
  EventAudience,
  EventCardDateParts,
  EventCardGroups,
  EventCardStatus,
  EventCardsPeriod,
  EventFormValues,
  EventListQuery,
  EventMediaRequest,
  EventRequest,
  EventResponse,
  EventType,
} from './types';
import {
  EVENT_CARD_SOON_THRESHOLD_DAYS,
  EVENT_FILE_FIELD,
  EVENT_PAYLOAD_FIELD,
  EVENT_TIME_FALLBACK,
  WEEKDAY_LABELS,
} from './constants';
import { EventOccurrence, OccurrenceSource, Weekday } from './types';

/**
 * Dia do evento como data local.
 *
 * A data vem em texto: `new Date('2026-04-12')` é lido como meia-noite UTC e
 * vira o dia anterior em qualquer fuso negativo, o nosso incluído.
 */
export const toEventDay = (value: string): Date => {
  const [datePart] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);

  if (!year || !month || !day) return new Date(value);

  return new Date(year, month - 1, day);
};

/** Data do evento no formato do Brasil. */
export const formatEventDate = (value: string): string =>
  toEventDay(value).toLocaleDateString('pt-BR');

/** Partes da data usadas para montar a hierarquia visual de um card. */
export const formatEventCardDate = (value: string): EventCardDateParts => {
  const date = toEventDay(value);

  return {
    day: date.toLocaleDateString('pt-BR', { day: '2-digit' }),
    month: date
      .toLocaleDateString('pt-BR', { month: 'short' })
      .replace('.', '')
      .toUpperCase(),
    complement: `${date.toLocaleDateString('pt-BR', {
      weekday: 'long',
    })}, ${date.getFullYear()}`,
    full: date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
  };
};

const calendarDayNumber = (date: Date): number =>
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

/** Situação temporal de um evento em relação a uma data de referência. */
export const getEventCardStatus = (
  value: string,
  referenceDate = new Date(),
): EventCardStatus => {
  const eventDate = toEventDay(value);
  const differenceInDays = Math.round(
    (calendarDayNumber(eventDate) - calendarDayNumber(referenceDate)) /
      (24 * 60 * 60 * 1000),
  );

  if (differenceInDays < 0 || Number.isNaN(differenceInDays)) {
    return EventCardStatus.PAST;
  }
  if (differenceInDays === 0) return EventCardStatus.TODAY;
  if (differenceInDays === 1) return EventCardStatus.TOMORROW;
  if (differenceInDays <= EVENT_CARD_SOON_THRESHOLD_DAYS) {
    return EventCardStatus.SOON;
  }
  return EventCardStatus.LATER;
};

const eventTimestamp = (event: AppEvent): number => {
  const timestamp = toEventDay(event.date).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

/**
 * Separa próximos e anteriores sem alterar a lista recebida.
 * Próximos crescem por data; anteriores mostram primeiro o mais recente.
 */
export const groupEventsForCards = (
  events: AppEvent[],
  referenceDate = new Date(),
): EventCardGroups => {
  const upcoming: AppEvent[] = [];
  const past: AppEvent[] = [];

  events.forEach((event) => {
    const target =
      getEventCardStatus(event.date, referenceDate) === EventCardStatus.PAST
        ? past
        : upcoming;
    target.push(event);
  });

  upcoming.sort((left, right) => eventTimestamp(left) - eventTimestamp(right));
  past.sort((left, right) => eventTimestamp(right) - eventTimestamp(left));

  return { upcoming, past };
};

/**
 * Monta o recorte que a grade de cards envia à API.
 *
 * "Esta semana" considera o restante da semana atual, até domingo; "Este
 * mês", o restante do mês. "Todos" não envia limites.
 */
export const buildEventCardsQuery = (
  period: EventCardsPeriod,
  referenceDate = new Date(),
): EventListQuery => {
  if (period === EventCardsPeriod.ALL) return {};

  const start = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
  );

  let end: Date;
  if (period === EventCardsPeriod.WEEK) {
    const daysUntilSunday = (7 - start.getDay()) % 7;
    end = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + daysUntilSunday,
    );
  } else {
    end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
  }

  return { from: toDayKey(start), to: toDayKey(end) };
};

/** Recorte enviado à API quando o calendário exibe um mês. */
export const buildEventCalendarQuery = (calendarMonth: string): EventListQuery => {
  const parsedMonth = toEventDay(calendarMonth);
  const targetMonth = Number.isNaN(parsedMonth.getTime()) ? new Date() : parsedMonth;
  const start = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
  const end = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);

  return { from: toDayKey(start), to: toDayKey(end) };
};

/** Contagem curta e com plural correto para os títulos das seções. */
export const formatEventCount = (count: number): string =>
  `${count} ${count === 1 ? 'evento' : 'eventos'}`;

/** Valor aceito por um `<input type="date">`. */
export const toDateInputValue = (value: string): string =>
  value ? value.split('T')[0] : '';

/** True quando o evento é hoje ou ainda vai acontecer. */
export const isUpcoming = (value: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return toEventDay(value) >= today;
};

/** Ordena por data, do mais próximo para o mais distante. */
export const sortByDate = (events: EventResponse[]): EventResponse[] =>
  [...events].sort(
    (a, b) => toEventDay(a.date).getTime() - toEventDay(b.date).getTime(),
  );

/** Valores iniciais do formulário a partir do evento carregado. */
export const toFormValues = (event: EventResponse | null): EventFormValues => ({
  title: event?.title ?? '',
  date: toDateInputValue(event?.date ?? ''),
  location: event?.location ?? '',
  description: event?.description ?? '',
  audience: event?.audience ?? EventAudience.ALL,
  eventType: event?.eventType ?? EventType.CUSTOM,
});

/**
 * Mídia enviada no corpo.
 *
 * Sem arquivo novo, a URL guardada é reenviada para que a API reaproveite o
 * objeto que já está no S3; com arquivo novo, a URL vai vazia e o backend
 * grava a do upload.
 */
const toMediaRequest = (
  values: EventFormValues,
  file: File | null,
  stored: EventResponse['media'],
  removeMedia: boolean,
): EventMediaRequest | undefined => {
  if (removeMedia) return undefined;
  if (!file && !stored) return undefined;

  return {
    ...(stored?.id ? { id: stored.id } : {}),
    title: values.title,
    description: `Imagem do evento: ${values.title}`,
    mediaType: 'image',
    uploadType: 'upload',
    isLocalFile: true,
    ...(file
      ? { url: '', originalName: file.name, size: file.size }
      : {
          url: stored?.url ?? '',
          ...(stored?.originalName ? { originalName: stored.originalName } : {}),
          ...(stored?.size ? { size: stored.size } : {}),
        }),
  };
};

/** JSON enviado no campo multipart. */
export const buildEventPayload = (
  values: EventFormValues,
  file: File | null,
  stored: EventResponse | null,
  removeMedia = false,
): EventRequest => ({
  title: values.title.trim(),
  date: values.date,
  location: values.location.trim(),
  description: values.description.trim(),
  audience: values.audience,
  eventType: values.eventType,
  ...(() => {
    const media = toMediaRequest(values, file, stored?.media ?? null, removeMedia);
    return media ? { media } : {};
  })(),
});

/** Corpo multipart de criação/edição. */
export const buildEventFormData = (
  values: EventFormValues,
  file: File | null,
  stored: EventResponse | null = null,
  removeMedia = false,
): FormData => {
  const formData = new FormData();

  if (file) formData.append(EVENT_FILE_FIELD, file);

  formData.append(
    EVENT_PAYLOAD_FIELD,
    JSON.stringify(buildEventPayload(values, file, stored, removeMedia)),
  );

  return formData;
};

/** Quais campos obrigatórios ficaram em branco. */
export const validateEventForm = (values: EventFormValues) => ({
  title: !values.title.trim(),
  date: !values.date,
  location: !values.location.trim(),
  description: !values.description.trim(),
});

/** Horário do encontro, ou o texto de reserva quando não há. */
export const formatEventTime = (time: string | null): string =>
  time?.trim() ? time : EVENT_TIME_FALLBACK;

/**
 * O horário que a tela mostra para um evento.
 *
 * O encontro de clubinho guarda a hora em `time`; a data dele é só o dia. O
 * calendário tirava a hora da data e chegava sempre a `00:00`, que virava
 * "Horário não informado" mesmo com o clubinho tendo horário cadastrado.
 *
 * Um evento comum pode trazer a hora dentro da própria data — essa continua
 * valendo quando não há `time`.
 */
export const eventTimeLabel = (event: {
  date: string;
  time?: string | null;
}): string => {
  if (event.time?.trim()) return event.time.slice(0, 5);

  const [, horaDaData] = event.date.split('T');
  const hora = horaDaData?.slice(0, 5);

  return hora && hora !== '00:00' ? hora : EVENT_TIME_FALLBACK;
};

/** Rótulo do dia da semana do encontro. */
export const weekdayLabel = (weekday: Weekday | null): string =>
  weekday ? WEEKDAY_LABELS[weekday] : '';

/** Quando o encontro acontece, em uma linha: "Quarta-feira · 15:00". */
export const describeRecurrence = (event: EventResponse): string =>
  [weekdayLabel(event.weekday), formatEventTime(event.time)]
    .filter((part) => part.length > 0)
    .join(' · ');

/**
 * True quando o evento é o encontro semanal de um clubinho.
 *
 * Encontro de clubinho não se edita nem se exclui pela agenda: quem manda nele
 * é o cadastro do clubinho, e a API recusa as duas operações.
 */
export const isClubMeeting = (event: { clubId?: string | null }): boolean =>
  Boolean(event.clubId);

/** Meia-noite do dia informado, sem hora. */
const atMidnight = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Data em `YYYY-MM-DD`, para comparar dia com dia sem envolver fuso. */
const toDayKey = (date: Date): string => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

/**
 * Dias em que o evento acontece.
 *
 * Vem da API, que é quem cruza o dia da semana do clubinho com o período letivo
 * e as exceções.
 *
 * Campo **ausente** e lista **vazia** são coisas diferentes: ausente é resposta
 * antiga, de antes desse campo existir, e cai para a própria data do evento;
 * vazia é a API dizendo que o evento não acontece em dia nenhum — o caso de não
 * haver período letivo cadastrado. Tratar as duas igual faria o calendário
 * inventar um encontro justamente onde a regra diz que não há.
 */
const occurrencesOf = (event: {
  date: string;
  occurrences?: string[];
}): string[] => {
  const declaradas = event.occurrences;
  const validas = (declaradas ?? []).filter((date) => date.trim() !== '');

  if (validas.length > 0) return validas;

  // Lista vazia é a API afirmando que o evento não acontece em dia nenhum — o
  // caso de não haver período letivo cadastrado. É diferente de campo ausente
  // (resposta antiga) e de lista só com data em branco (registro sem data no
  // cadastro): nesses dois a agenda recua para a data que já resolveu.
  if (declaradas !== undefined && declaradas.length === 0) return [];

  return event.date.trim() ? [toDayKey(toEventDay(event.date))] : [];
};

/**
 * O dia que o evento mostra em uma lista.
 *
 * A próxima ocorrência a partir de hoje; se todas já passaram, a última. Um
 * encontro de clubinho que começou em março precisa aparecer como "sábado que
 * vem", não como a data em que a série nasceu.
 */
export const displayDate = (
  event: { date: string; occurrences?: string[] },
  referenceDate = new Date(),
): string => {
  const dates = occurrencesOf(event);
  const today = toDayKey(atMidnight(referenceDate));

  return (
    dates.find((date) => date >= today) ??
    dates[dates.length - 1] ??
    event.date
  );
};

/**
 * Aparições do evento dentro do intervalo pedido.
 *
 * As datas não são recalculadas aqui: a API já mandou quais são, com o período
 * letivo e as exceções aplicados. Repetir a conta no front significaria manter
 * duas versões da mesma regra — e a do front não tem como saber que a semana do
 * feriado não conta.
 */
export const expandOccurrences = <T extends OccurrenceSource>(
  event: T,
  rangeStart: Date,
  rangeEnd: Date,
): EventOccurrence<T>[] => {
  const start = toDayKey(atMidnight(rangeStart));
  const end = toDayKey(atMidnight(rangeEnd));

  return occurrencesOf(event)
    .filter((date) => date >= start && date <= end)
    .map((date) => ({
      key: `${event.id}-${date}`,
      event,
      date: toEventDay(date),
    }));
};

/** Aparições de vários eventos no intervalo, ordenadas por data. */
export const expandAllOccurrences = <T extends OccurrenceSource>(
  events: T[],
  rangeStart: Date,
  rangeEnd: Date,
): EventOccurrence<T>[] =>
  events
    .flatMap((event) => expandOccurrences(event, rangeStart, rangeEnd))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
