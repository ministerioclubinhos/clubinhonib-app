import {
  EventAudience,
  EventFormValues,
  EventMediaRequest,
  EventRequest,
  EventResponse,
  EventType,
} from './types';
import {
  EVENT_FILE_FIELD,
  EVENT_PAYLOAD_FIELD,
  EVENT_TIME_FALLBACK,
  WEEKDAY_INDEX,
  WEEKDAY_LABELS,
} from './constants';
import { EventOccurrence, Weekday } from './types';

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

/** Rótulo do dia da semana do encontro. */
export const weekdayLabel = (weekday: Weekday | null): string =>
  weekday ? WEEKDAY_LABELS[weekday] : '';

/** Quando o encontro acontece, em uma linha: "Quarta-feira · 15:00". */
export const describeRecurrence = (event: EventResponse): string =>
  [weekdayLabel(event.weekday), formatEventTime(event.time)]
    .filter((part) => part.length > 0)
    .join(' · ');

/** Meia-noite do dia informado, sem hora. */
const atMidnight = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/**
 * Aparições do evento dentro do intervalo pedido.
 *
 * Um evento comum aparece uma vez, se a data cair no intervalo. Um encontro
 * semanal aparece toda semana no dia dele, a partir da primeira ocorrência —
 * é assim que o clubinho fica no calendário sem gerar uma linha por semana no
 * banco.
 */
export const expandOccurrences = (
  event: EventResponse,
  rangeStart: Date,
  rangeEnd: Date,
): EventOccurrence[] => {
  const start = atMidnight(rangeStart);
  const end = atMidnight(rangeEnd);
  const firstDay = atMidnight(toEventDay(event.date));

  if (!event.isRecurring || !event.weekday) {
    return firstDay >= start && firstDay <= end
      ? [{ key: event.id, event, date: firstDay }]
      : [];
  }

  // A primeira aparição é o dia da semana do encontro dentro do intervalo,
  // nunca antes da data em que o encontro passou a existir.
  const from = firstDay > start ? firstDay : start;
  const distance = (WEEKDAY_INDEX[event.weekday] - from.getDay() + 7) % 7;

  const occurrences: EventOccurrence[] = [];
  const cursor = new Date(
    from.getFullYear(),
    from.getMonth(),
    from.getDate() + distance,
  );

  while (cursor <= end) {
    const date = new Date(cursor);
    occurrences.push({
      key: `${event.id}-${date.toISOString().slice(0, 10)}`,
      event,
      date,
    });
    cursor.setDate(cursor.getDate() + 7);
  }

  return occurrences;
};

/** Aparições de vários eventos no intervalo, ordenadas por data. */
export const expandAllOccurrences = (
  events: EventResponse[],
  rangeStart: Date,
  rangeEnd: Date,
): EventOccurrence[] =>
  events
    .flatMap((event) => expandOccurrences(event, rangeStart, rangeEnd))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
