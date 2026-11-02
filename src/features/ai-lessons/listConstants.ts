import { LessonStatus } from './types';
import type { ListingBadge } from '@/components/common/listing';

export const PRODUCTION_STATUS_OPTIONS = [
  { value: '', label: 'Todos os status' },
  { value: LessonStatus.DRAFT, label: 'Rascunho' },
  { value: LessonStatus.IN_PROGRESS, label: 'Em produção' },
  { value: LessonStatus.PACKAGE_READY, label: 'Pacote completo' },
  { value: LessonStatus.IN_REVIEW, label: 'Em aprovação' },
  { value: LessonStatus.CHANGES_REQUESTED, label: 'Ajustes solicitados' },
  { value: LessonStatus.READY_FOR_PUBLICATION, label: 'Pronto p/ publicar' },
  { value: LessonStatus.PUBLISHING, label: 'Publicando' },
  { value: LessonStatus.PUBLISHED, label: 'Publicado' },
  { value: LessonStatus.ARCHIVED, label: 'Arquivado' },
];

export const PRODUCTION_SORT_OPTIONS = [
  { value: 'updatedAt:DESC', label: 'Mais recentes primeiro' },
  { value: 'updatedAt:ASC', label: 'Mais antigas primeiro' },
  { value: 'weekNumber:ASC', label: 'Número da semana (1-52)' },
  { value: 'theme:ASC', label: 'Tema (A-Z)' },
];

export const PRODUCTION_PAGE_SIZE_OPTIONS = [6, 12, 24, 48];

export const PRODUCTION_STATUSPRESENTATION: Record<
  string,
  { label: string; color: ListingBadge['color'] }
> = {
  DRAFT: { label: 'RASCUNHO', color: 'warning' },
  IN_PROGRESS: { label: 'EM PRODUÇÃO', color: 'info' },
  PACKAGE_READY: { label: 'PACOTE COMPLETO', color: 'info' },
  IN_REVIEW: { label: 'EM APROVAÇÃO', color: 'warning' },
  CHANGES_REQUESTED: { label: 'AJUSTES SOLICITADOS', color: 'error' },
  READY_FOR_PUBLICATION: { label: 'PRONTO PARA PUBLICAR', color: 'success' },
  PUBLISHING: { label: 'PUBLICANDO', color: 'info' },
  PUBLISHED: { label: 'PUBLICADO', color: 'success' },
  ARCHIVED: { label: 'ARQUIVADO', color: 'default' },
};

export const REVIEW_STATUS_OPTIONS = [
  { value: '', label: 'Todos os status de revisão' },
  { value: LessonStatus.PACKAGE_READY, label: 'Pacote completo' },
  { value: LessonStatus.IN_REVIEW, label: 'Em aprovação' },
  { value: LessonStatus.CHANGES_REQUESTED, label: 'Ajustes solicitados' },
  { value: LessonStatus.READY_FOR_PUBLICATION, label: 'Pronto p/ publicar' },
  { value: LessonStatus.PUBLISHING, label: 'Publicando' },
  { value: LessonStatus.PUBLISHED, label: 'Publicado' },
];

export const REVIEW_STATUSPRESENTATION: Record<
  string,
  { label: string; color: ListingBadge['color'] }
> = {
  DRAFT: { label: 'EM PRODUÇÃO', color: 'info' },
  IN_PROGRESS: { label: 'EM PRODUÇÃO', color: 'info' },
  PACKAGE_READY: { label: 'AGUARDANDO REVISÃO', color: 'warning' },
  IN_REVIEW: { label: 'EM REVISÃO', color: 'warning' },
  CHANGES_REQUESTED: { label: 'AJUSTES SOLICITADOS', color: 'error' },
  READY_FOR_PUBLICATION: { label: 'APROVADO', color: 'success' },
  PUBLISHING: { label: 'PUBLICANDO', color: 'info' },
  PUBLISHED: { label: 'PUBLICADO', color: 'success' },
  ARCHIVED: { label: 'ARQUIVADO', color: 'default' },
};

export const LESSON_CATEGORY_FILTER_OPTIONS = [
  { value: '', label: 'Todos os materiais' },
  { value: 'REGULAR', label: 'Material Semanal' },
  { value: 'SPECIAL', label: 'Material Especial' },
];
