import { MediaPlatform, MediaType, MediaUploadType } from '@/store/slices/types';
import {
  MEDITATION_FILE_FIELD,
  MEDITATION_PAYLOAD_FIELD,
  MEDITATION_WEEK_DAYS,
  MEDITATION_WEEK_DAY_LABELS,
} from './constants';
import {
  MeditationDayDraft,
  MeditationFormValues,
  MeditationRequest,
  MeditationResponse,
  MeditationSortField,
  MeditationSortOrder,
  MeditationWeekDay,
} from './types';

/** Rótulo em português de um dia, com fallback para valores desconhecidos. */
export const weekDayLabel = (day: string): string =>
  MEDITATION_WEEK_DAY_LABELS[day as MeditationWeekDay] ?? day;

/** Interpreta `YYYY-MM-DD` no fuso local, sem deslocar o dia. */
export const parseDateAsLocal = (date: string): Date =>
  new Date(`${date}T00:00:00`);

/** True quando a data cai numa segunda-feira. */
export const isMonday = (date: string): boolean =>
  Boolean(date) && parseDateAsLocal(date).getDay() === 1;

/** True quando a data cai numa sexta-feira. */
export const isFriday = (date: string): boolean =>
  Boolean(date) && parseDateAsLocal(date).getDay() === 5;

/** Formata uma data ISO para exibição em pt-BR. */
export const formatPtBrDate = (date: string): string =>
  parseDateAsLocal(date).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

/** Dias ainda não preenchidos, considerando o que está em edição. */
export const availableWeekDays = (
  days: MeditationDayDraft[],
  editingIndex: number | null,
): MeditationWeekDay[] =>
  MEDITATION_WEEK_DAYS.filter(
    (day) =>
      !days.some((item) => item.day === day) ||
      (editingIndex !== null && days[editingIndex]?.day === day),
  );

/** Ordena os dias de segunda a sexta. */
export const sortDays = (days: MeditationDayDraft[]): MeditationDayDraft[] =>
  [...days].sort(
    (a, b) =>
      MEDITATION_WEEK_DAYS.indexOf(a.day) - MEDITATION_WEEK_DAYS.indexOf(b.day),
  );

/** Converte a meditação carregada da API no rascunho editável de dias. */
export const toDayDrafts = (
  meditation: MeditationResponse | null,
): MeditationDayDraft[] =>
  sortDays(
    (meditation?.days ?? []).map((day) => ({
      id: day.id,
      day: day.day,
      verse: day.verse,
      topic: day.topic,
    })),
  );

/** Monta o JSON enviado no campo multipart da requisição. */
export const buildMeditationPayload = (
  values: MeditationFormValues,
  days: MeditationDayDraft[],
  meditationId?: string,
): MeditationRequest => {
  const isUpload = values.uploadType === MediaUploadType.UPLOAD;
  const stored = values.storedMedia;

  // Upload sem arquivo novo: a mídia guardada é reenviada pelo id e pela URL
  // para que a API reaproveite o objeto que já está no S3. Sem isso, a API não
  // reconhece o item e o arquivo atual se perde.
  const keepsStoredFile = isUpload && !values.file && Boolean(stored?.url);

  return {
    ...(meditationId ? { id: meditationId } : {}),
    topic: values.topic.trim(),
    startDate: values.startDate,
    endDate: values.endDate,
    media: {
      ...(stored?.id ? { id: stored.id } : {}),
      title: values.topic.trim(),
      description: `Meditação da semana de ${values.startDate} a ${values.endDate}`,
      mediaType: MediaType.DOCUMENT,
      uploadType: values.uploadType,
      isLocalFile: isUpload,
      url: isUpload
        ? keepsStoredFile
          ? (stored?.url ?? '')
          : ''
        : values.url.trim(),
      ...(values.file
        ? { originalName: values.file.name, size: values.file.size }
        : keepsStoredFile
          ? {
              ...(stored?.originalName
                ? { originalName: stored.originalName }
                : {}),
              ...(stored?.size ? { size: stored.size } : {}),
            }
          : {}),
      ...(isUpload ? {} : { platformType: values.platformType }),
    },
    days: sortDays(days).map((day) => ({
      day: day.day,
      verse: day.verse.trim(),
      topic: day.topic.trim(),
    })),
  };
};

/** Monta o corpo multipart de criação/edição. */
export const buildMeditationFormData = (
  values: MeditationFormValues,
  days: MeditationDayDraft[],
  meditationId?: string,
): FormData => {
  const formData = new FormData();

  if (values.uploadType === MediaUploadType.UPLOAD && values.file) {
    formData.append(MEDITATION_FILE_FIELD, values.file);
  }

  formData.append(
    MEDITATION_PAYLOAD_FIELD,
    JSON.stringify(buildMeditationPayload(values, days, meditationId)),
  );

  return formData;
};

/** Valores iniciais do formulário, a partir da meditação carregada. */
export const toFormValues = (
  meditation: MeditationResponse | null,
): MeditationFormValues => ({
  topic: meditation?.topic ?? '',
  startDate: meditation?.startDate ?? '',
  endDate: meditation?.endDate ?? '',
  uploadType: meditation?.media?.uploadType ?? MediaUploadType.LINK,
  url: meditation?.media?.url ?? '',
  platformType: meditation?.media?.platformType ?? MediaPlatform.ANY,
  file: null,
  storedMedia: meditation?.media ?? null,
});

/** Duas letras do tema, para o avatar do card. */
export function meditationInitials(topic: string): string {
  const parts = topic.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

/** Data de hoje como `YYYY-MM-DD`, no fuso local. */
export function todayAsDateOnly(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * Situação do período da meditação em relação a hoje.
 *
 * A comparação é feita entre textos `YYYY-MM-DD`, que ordenam igual às datas:
 * converter para `Date` traria de volta o deslocamento de fuso.
 */
export function periodStatus(meditation: {
  startDate: string;
  endDate: string;
}): 'current' | 'upcoming' | 'past' {
  const today = todayAsDateOnly();
  if (meditation.startDate > today) return 'upcoming';
  if (meditation.endDate < today) return 'past';
  return 'current';
}

/** Divide o valor do seletor de ordenação em campo e direção. */
export function parseSortOption(value: string): {
  sort: MeditationSortField;
  order: MeditationSortOrder;
} {
  const [sort, order] = value.split(':');
  const field: MeditationSortField =
    sort === 'topic' ? 'topic' : sort === 'createdAt' ? 'createdAt' : 'startDate';
  return { sort: field, order: order === 'ASC' ? 'ASC' : 'DESC' };
}
