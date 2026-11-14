import { LessonCategory, LessonStatus } from './types';
import { REVIEW_LESSON_STATUSES } from './constants';
import { LESSON_CATEGORY_LABELS, LESSON_STATUS_PRESENTATION } from './presentation.constants';
import type { ListingBadge } from '@/components/common/listing';

const statusOption = (status: LessonStatus) => ({
  value: status,
  label: LESSON_STATUS_PRESENTATION[status].label,
});

export const PRODUCTION_STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  ...Object.values(LessonStatus).map(statusOption),
];

export const PRODUCTION_SORT_OPTIONS = [
  { value: 'updatedAt:DESC', label: 'Mais recentes primeiro' },
  { value: 'updatedAt:ASC', label: 'Mais antigas primeiro' },
  { value: 'weekNumber:ASC', label: 'Número da semana (1-52)' },
  { value: 'theme:ASC', label: 'Tema (A-Z)' },
];

export const PRODUCTION_PAGE_SIZE_OPTIONS = [6, 12, 24, 48];

const badge = (status: LessonStatus): { label: string; color: ListingBadge['color'] } => ({
  label: LESSON_STATUS_PRESENTATION[status].label.toUpperCase(),
  color: LESSON_STATUS_PRESENTATION[status].color,
});

export const PRODUCTION_STATUSPRESENTATION = Object.fromEntries(
  Object.values(LessonStatus).map((status) => [status, badge(status)])
) as Record<LessonStatus, { label: string; color: ListingBadge['color'] }>;

export const REVIEW_STATUS_OPTIONS = [
  { value: '', label: 'Todos os status de revisão' },
  ...REVIEW_LESSON_STATUSES.map(statusOption),
];

/** The review queue reads the same statuses; only "package ready" means "waiting for me". */
export const REVIEW_STATUSPRESENTATION: Record<
  LessonStatus,
  { label: string; color: ListingBadge['color'] }
> = {
  ...PRODUCTION_STATUSPRESENTATION,
  [LessonStatus.PACKAGE_READY]: { label: 'AGUARDANDO REVISÃO', color: 'warning' },
};

export const LESSON_CATEGORY_FILTER_OPTIONS = [
  { value: '', label: 'Todos os materiais' },
  ...Object.values(LessonCategory).map((value) => ({
    value,
    label: LESSON_CATEGORY_LABELS[value],
  })),
];
