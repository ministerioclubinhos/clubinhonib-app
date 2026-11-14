import type {
  MediaPlatform,
  MediaType,
  MediaUploadType,
} from '@/store/slices/types';

/** Dias que compõem uma meditação semanal. */
export enum MeditationWeekDay {
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
}

/** Mídia da meditação exatamente como a API devolve. */
export interface MeditationMediaResponse {
  id: string;
  title: string;
  description: string;
  mediaType: MediaType;
  uploadType: MediaUploadType;
  platformType?: MediaPlatform;
  url: string;
  isLocalFile: boolean;
  originalName?: string;
  size?: number;
}

/** Um dia da meditação, como a API devolve. */
export interface MeditationDayResponse {
  id: string;
  day: MeditationWeekDay;
  verse: string;
  topic: string;
}

/** Contrato de resposta de `/meditations`. */
export interface MeditationResponse {
  id: string;
  topic: string;
  /** Data no formato `YYYY-MM-DD`. */
  startDate: string;
  /** Data no formato `YYYY-MM-DD`. */
  endDate: string;
  days: MeditationDayResponse[];
  /** `null` quando a meditação ainda não tem mídia associada. */
  media: MeditationMediaResponse | null;
  createdAt: string;
  updatedAt: string;
}

/** Envelope paginado devolvido pela API. */
export interface PaginatedMeditations {
  data: MeditationResponse[];
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

/** Campo pelo qual a listagem pode ser ordenada. */
export type MeditationSortField = 'startDate' | 'topic' | 'createdAt';

/** Direção da ordenação. */
export type MeditationSortOrder = 'ASC' | 'DESC';

/** Recorte de período aceito pela API. */
export type MeditationPeriodFilter = 'current' | 'upcoming' | 'past';

/** Filtros aplicados pela API, não pela tela. */
export interface MeditationQuery {
  page?: number;
  limit?: number;
  searchString?: string;
  period?: MeditationPeriodFilter;
  sort?: MeditationSortField;
  order?: MeditationSortOrder;
}

/** Um dia em edição no formulário. */
export interface MeditationDayDraft {
  /** Presente apenas quando o dia já veio da API. */
  id?: string;
  day: MeditationWeekDay;
  verse: string;
  topic: string;
}

/** Campos da meditação editados no formulário. */
export interface MeditationFormValues {
  topic: string;
  /** Data no formato `YYYY-MM-DD`. */
  startDate: string;
  /** Data no formato `YYYY-MM-DD`. */
  endDate: string;
  uploadType: MediaUploadType;
  url: string;
  platformType: MediaPlatform;
  file: File | null;
  /**
   * Mídia já gravada, quando a meditação veio da API. É ela que permite manter
   * o arquivo no S3 numa edição que não troca o arquivo.
   */
  storedMedia: MeditationMediaResponse | null;
}

/** Mídia enviada no corpo da requisição. */
export interface MeditationMediaRequest {
  /** Presente apenas quando a mídia já veio da API. */
  id?: string;
  title: string;
  description: string;
  mediaType: MediaType;
  uploadType: MediaUploadType;
  isLocalFile: boolean;
  url: string;
  platformType?: MediaPlatform;
  originalName?: string;
  size?: number;
}

/** JSON enviado no campo multipart `meditationData`. */
export interface MeditationRequest {
  id?: string;
  topic: string;
  startDate: string;
  endDate: string;
  media: MeditationMediaRequest;
  days: { day: MeditationWeekDay; verse: string; topic: string }[];
}

/** Quais campos obrigatórios do formulário estão pendentes. */
export interface MeditationFormErrors {
  topic: boolean;
  startDate: boolean;
  endDate: boolean;
}
