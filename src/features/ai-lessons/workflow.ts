import {
  LessonStageStatus,
  LessonStatus,
  StageAssetIssue,
  type AcknowledgedStageVersions,
  type Lesson,
  type LessonStage,
  type LessonStageType,
} from './types';
import {
  EDITABLE_STAGE_STATUSES,
  GENERATION_BLOCKED_LESSON_STATUSES,
  PRODUCTION_COMPLETED_STATUSES,
  getStudioStageOrder,
} from './constants';

export function lessonProductionActions(
  lesson: Lesson,
  stage: LessonStage | undefined,
  hasDraft: boolean,
  pending: boolean
) {
  const busy =
    pending ||
    lesson.status === LessonStatus.PUBLISHING ||
    lesson.stages.some((item) => item.status === LessonStageStatus.GENERATING);
  const stageOrder = getStudioStageOrder(lesson.category);
  const index = stage ? stageOrder.indexOf(stage.type) : -1;
  const previous = lesson.stages.find((item) => item.type === stageOrder[index - 1]);
  const dependencyReady =
    index === 0 || Boolean(previous && PRODUCTION_COMPLETED_STATUSES.includes(previous.status));
  const editable = Boolean(stage && EDITABLE_STAGE_STATUSES.includes(stage.status));
  return {
    canEdit: editable && Boolean(stage?.currentVersionId) && !busy,
    canSave: editable && hasDraft && !busy,
    canGenerate:
      Boolean(stage) &&
      dependencyReady &&
      !GENERATION_BLOCKED_LESSON_STATUSES.includes(lesson.status) &&
      !busy &&
      !hasDraft,
    canComplete: editable && Boolean(stage?.currentVersionId) && !busy && !hasDraft,
    dependencyReady,
  };
}

export function canPublishLesson(lesson: Lesson): boolean {
  return (
    lesson.status === LessonStatus.READY_FOR_PUBLICATION &&
    lesson.stages.length === getStudioStageOrder(lesson.category).length &&
    lesson.stages.every(
      (stage) => stage.status === LessonStageStatus.APPROVED && Boolean(stage.currentVersionId)
    )
  );
}

/** Stages that a save or regeneration of `origin` will mark as outdated (and unapprove). */
export function stagesInvalidatedBy(lesson: Lesson, origin: LessonStageType): LessonStage[] {
  const order = getStudioStageOrder(lesson.category);
  const index = order.indexOf(origin);
  if (index < 0) return [];
  return order
    .slice(index + 1)
    .map((type) => lesson.stages.find((item) => item.type === type))
    .filter(
      (item): item is LessonStage =>
        Boolean(item) &&
        item?.status !== LessonStageStatus.NOT_STARTED &&
        item?.status !== LessonStageStatus.STALE
    );
}

/** The earlier stage whose newest content made `stage` outdated, when it can be told apart. */
export function staleOriginStage(lesson: Lesson, stage: LessonStage): LessonStageType | null {
  const order = getStudioStageOrder(lesson.category);
  const index = order.indexOf(stage.type);
  const ownVersion = stage.versions.find((item) => item.id === stage.currentVersionId);
  if (index <= 0 || !ownVersion) return null;
  const ownTime = Date.parse(ownVersion.createdAt);
  let origin: LessonStageType | null = null;
  let newest = ownTime;
  for (const type of order.slice(0, index)) {
    const candidate = lesson.stages.find((item) => item.type === type);
    const version = candidate?.versions.find((item) => item.id === candidate.currentVersionId);
    const time = version ? Date.parse(version.createdAt) : Number.NaN;
    if (Number.isFinite(time) && time > newest) {
      newest = time;
      origin = type;
    }
  }
  return origin;
}

export function canDeleteLesson(lesson: Pick<Lesson, 'status'>): boolean {
  // The API keeps published and archived lessons; they leave the list by being archived.
  return ![LessonStatus.PUBLISHED, LessonStatus.PUBLISHING, LessonStatus.ARCHIVED].includes(
    lesson.status
  );
}

export function canReopenStage(
  lessonStatus: LessonStatus,
  stage: LessonStage | undefined,
  busy: boolean
): boolean {
  return (
    lessonStatus === LessonStatus.READY_FOR_PUBLICATION &&
    stage?.status === LessonStageStatus.APPROVED &&
    Boolean(stage.currentVersionId) &&
    !busy
  );
}

/** Why the reviewer cannot decide on this item right now; null when the decision is open. */
export function reviewBlockReason(input: {
  lessonStatus: LessonStatus;
  stageStatus: LessonStageStatus | undefined;
  hasVersion: boolean;
  busy: boolean;
  assetIssue: StageAssetIssue;
  versionChanged: boolean;
}): string | null {
  if (input.lessonStatus === LessonStatus.PUBLISHING) return 'A publicação está em andamento.';
  if (input.busy) return 'Há uma geração em andamento nesta lição. Aguarde a conclusão.';
  if (input.lessonStatus === LessonStatus.PACKAGE_READY)
    return 'Inicie a revisão do pacote para habilitar a decisão por item.';
  if (input.lessonStatus === LessonStatus.READY_FOR_PUBLICATION)
    return 'Todos os itens estão aprovados. Para corrigir algo antes de publicar, descreva o ajuste e reabra o item.';
  if (input.lessonStatus === LessonStatus.ARCHIVED) return 'Esta lição está arquivada.';
  if (input.lessonStatus === LessonStatus.PUBLISHED)
    return 'A lição já foi publicada e não pode mais ser alterada pelo Estúdio.';
  if (![LessonStatus.IN_REVIEW, LessonStatus.CHANGES_REQUESTED].includes(input.lessonStatus))
    return 'O pacote ainda está em produção e não foi enviado para revisão.';
  if (!input.hasVersion) return 'Este item ainda não possui conteúdo gerado.';
  if (input.stageStatus === LessonStageStatus.APPROVED) return 'Este item já foi aprovado.';
  if (input.stageStatus !== LessonStageStatus.IN_REVIEW)
    return 'Este item voltou para a produção e ainda não foi reenviado para revisão.';
  if (input.versionChanged)
    return 'Este item recebeu uma nova versão. Confirme que revisou a versão atual para decidir.';
  if (input.assetIssue === StageAssetIssue.MISSING)
    return 'Há artes obrigatórias ausentes neste item; devolva-o para ajustes.';
  if (input.assetIssue === StageAssetIssue.BROKEN)
    return 'Há imagens que não carregaram neste item; devolva-o para ajustes ou recarregue a página.';
  return null;
}

export function captureStageVersions(lesson: Lesson): AcknowledgedStageVersions {
  return Object.fromEntries(
    lesson.stages.map((stage) => [stage.type, stage.currentVersionId])
  ) as AcknowledgedStageVersions;
}

export function hasStageVersionChanged(
  acknowledged: AcknowledgedStageVersions,
  stage: LessonStage | undefined
): boolean {
  if (!stage || !(stage.type in acknowledged)) return false;
  return acknowledged[stage.type] !== stage.currentVersionId;
}
