import { getApiErrorCode, getHttpStatus } from '@/utils/apiError';
import {
  LESSON_ERROR_CODES,
  PACKAGE_DOWNLOAD_LESSON_STATUSES,
  PUBLICATION_KIND_LABELS,
  STAGE_PDF_FAILURE_HTTP_STATUSES,
} from './constants';
import {
  LessonCategory,
  LessonStageStatus,
  LessonStatus,
  type Lesson,
  type LessonPublicationDuplicate,
  type LessonPublicationPreview,
} from './types';
import { canPublishLesson } from './workflow';

/** "Material Especial" or "material semanal": a special material is a weekly page with its own title. */
export function publicationKindLabel(isSpecial: boolean): string {
  return isSpecial ? PUBLICATION_KIND_LABELS.special : PUBLICATION_KIND_LABELS.weekly;
}

/** In-app path of a published page; null when the page has no route. */
export function publicationMaterialPath(routePath: string | null | undefined): string | null {
  const clean = routePath?.trim().replace(/^\/+/, '');
  return clean ? `/${clean}` : null;
}

/** The linked page was deleted in Materiais Semanais: the lesson may be published again. */
export function isPublishedMaterialMissing(
  lesson: Pick<Lesson, 'status'>,
  preview: LessonPublicationPreview | undefined
): boolean {
  return lesson.status === LessonStatus.PUBLISHED && preview?.weekMaterial?.exists === false;
}

export function canRepublishLesson(
  lesson: Lesson,
  preview: LessonPublicationPreview | undefined
): boolean {
  return (
    isPublishedMaterialMissing(lesson, preview) &&
    lesson.stages.length > 0 &&
    lesson.stages.every(
      (stage) => stage.status === LessonStageStatus.APPROVED && Boolean(stage.currentVersionId)
    )
  );
}

export function canPublishOrRepublishLesson(
  lesson: Lesson,
  preview: LessonPublicationPreview | undefined
): boolean {
  return canPublishLesson(lesson) || canRepublishLesson(lesson, preview);
}

/** "Definir como semana atual" only makes sense for an existing page that is not current yet. */
export function canSetMaterialAsCurrentWeek(
  lesson: Pick<Lesson, 'status'>,
  preview: LessonPublicationPreview | undefined
): boolean {
  const material = preview?.weekMaterial;
  return (
    lesson.status === LessonStatus.PUBLISHED &&
    Boolean(material?.exists) &&
    material?.currentWeek === false
  );
}

/** The consolidated PDF exists only for a fully approved package. */
export function canDownloadLessonPackage(lesson: Pick<Lesson, 'status' | 'stages'>): boolean {
  return (
    PACKAGE_DOWNLOAD_LESSON_STATUSES.includes(lesson.status) &&
    lesson.stages.length > 0 &&
    lesson.stages.every((stage) => stage.status === LessonStageStatus.APPROVED)
  );
}

export function lessonPackageFileName(
  lesson: Pick<Lesson, 'category' | 'weekNumber' | 'theme'>
): string {
  const slug = lesson.theme
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  const prefix = lesson.category === LessonCategory.SPECIAL ? 'material-especial' : 'licao';
  const week = lesson.weekNumber ? `-semana-${lesson.weekNumber}` : '';
  return `${prefix}${week}${slug ? `-${slug}` : ''}.pdf`;
}

/** Duplicates worth warning about: never the lesson's own page. */
export function publicationDuplicates(
  preview: LessonPublicationPreview | undefined
): LessonPublicationDuplicate[] {
  const ownId = preview?.weekMaterial?.id;
  return (preview?.duplicates ?? []).filter((item) => item.id !== ownId);
}

export function publicationDuplicateWarning(isSpecial: boolean, count: number): string {
  if (count <= 0) return '';
  const subject = isSpecial ? 'com este mesmo título' : 'para esta semana';
  return count === 1
    ? `Já existe um material ${subject}. Publicar cria outro, com endereço próprio; o existente não é alterado.`
    : `Já existem ${count} materiais ${subject}. Publicar cria mais um, com endereço próprio; os existentes não são alterados.`;
}

/** The API message already ends its sentence; never produce "…novamente.." on screen. */
export function publicationFailureNotice(message: string): string {
  const clean = message.trim().replace(/[.\s]+$/, '');
  return `Última tentativa de publicação interrompida: ${clean}. Os itens aprovados foram preservados e você pode retomar o envio quando desejar.`;
}

/** Approval renders the item's PDF first; these failures are about the PDF, not a conflict. */
export function isStagePdfFailure(error: unknown): boolean {
  if (getApiErrorCode(error) === LESSON_ERROR_CODES.stagePdfUnavailable) return true;
  const status = getHttpStatus(error);
  return status !== null && STAGE_PDF_FAILURE_HTTP_STATUSES.includes(status);
}
