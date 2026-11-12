import { AI_PROVIDER_LABELS } from '@/features/ai-providers/constants';
import type { AiProviderSettings } from '@/features/ai-providers/types';
import { matchingAiProviderProfile } from '@/features/ai-providers/utils';
import {
  FINAL_REVIEW_LESSON_STATUSES,
  PRODUCTION_COMPLETED_STATUSES,
  STORY_VISUAL_MAX_QUANTITY,
  STORY_VISUAL_MIN_QUANTITY,
  STUDIO_STAGE_QUERY_PARAM,
  getStudioStageOrder,
} from './constants';
import { studioSnapshotKey } from './draftStorage';
import { hubNextStep, hubStageLabel } from './hub.utils';
import {
  AI_PROVIDER_PROFILE_CAPTIONS,
  PRODUCTION_INSTRUCTIONS_KEY_SUFFIX,
  PRODUCTION_SAVE_SHORTCUT_KEY,
  PRODUCTION_STEP_ACTIONS,
  PRODUCTION_TEXTS,
} from './production.constants';
import {
  InstructionsOutcome,
  ProductionHeaderTarget,
  ProductionStageAction,
  type PendingInstructions,
  type ProductionCompletionNotice,
  type ProductionHeaderStep,
  type ProductionProgress,
  type SaveShortcutEvent,
  type VisualConfigForm,
} from './production.types';
import {
  LessonStageStatus,
  LessonVisualOrientation,
  LessonVisualType,
  StudioSnapshotScope,
  type Lesson,
  type LessonStage,
  type LessonStageType,
} from './types';
import { parseStageType } from './utils';

/**
 * Pure rules of the lesson production screen: which action is highlighted, what
 * comes next and what each notice says. Nothing here touches React or the network.
 */

/** The producer already signed this item off (it may be with the reviewer or approved). */
export function isProductionCompleted(stage: Pick<LessonStage, 'status'> | undefined): boolean {
  return Boolean(stage && PRODUCTION_COMPLETED_STATUSES.includes(stage.status));
}

/**
 * Concluding is offered only while there is something to conclude. `allowed` is the
 * workflow rule (editable, has content, nothing pending); a concluded item is editable
 * too, but a save sends it back to "Em produção", so it comes back here on its own.
 */
export function canCompleteProductionStage(
  stage: Pick<LessonStage, 'status'> | undefined,
  allowed: boolean,
  layoutOverflow: boolean
): boolean {
  return allowed && !layoutOverflow && !isProductionCompleted(stage);
}

/** Why "Concluir item" is unavailable, when the producer can do something about it. */
export function completeBlockedReason(input: {
  stage: Pick<LessonStage, 'status'> | undefined;
  layoutOverflow: boolean;
  hasDrafts: boolean;
}): string | null {
  if (input.layoutOverflow) return PRODUCTION_TEXTS.completeBlockedOverflow;
  if (input.hasDrafts) return PRODUCTION_TEXTS.completeBlockedDrafts;
  if (input.stage?.status === LessonStageStatus.PRODUCER_APPROVED)
    return PRODUCTION_TEXTS.completeBlockedDone;
  return null;
}

/**
 * The single highlighted action of an item. Regenerating never is: it is paid and
 * replaces content that already exists.
 */
export function productionStagePrimaryAction(input: {
  stage: Pick<LessonStage, 'status' | 'currentVersionId'> | undefined;
  /** This item has an edit that was not saved yet. */
  edited: boolean;
  generating: boolean;
}): ProductionStageAction | null {
  const { stage } = input;
  if (!stage || input.generating || stage.status === LessonStageStatus.GENERATING) return null;
  if (input.edited) return ProductionStageAction.SAVE;
  if (!stage.currentVersionId) return ProductionStageAction.GENERATE;
  if (isProductionCompleted(stage)) return null;
  return ProductionStageAction.COMPLETE;
}

/**
 * What the header highlights: the next production step while there is one, the
 * review screen once the package left the producer's hands. Follows the Studio
 * dashboard so both screens always point to the same item.
 */
export function productionHeaderStep(lesson: Lesson): ProductionHeaderStep {
  const step = hubNextStep(lesson);
  const stage = PRODUCTION_STEP_ACTIONS.includes(step.action)
    ? parseStageType(
        new URLSearchParams(step.href.split('?')[1] ?? '').get(STUDIO_STAGE_QUERY_PARAM),
        getStudioStageOrder(lesson.category)
      )
    : null;
  return stage
    ? { target: ProductionHeaderTarget.STAGE, label: step.actionLabel, stage }
    : { target: ProductionHeaderTarget.REVIEW, label: PRODUCTION_TEXTS.goToReview, stage: null };
}

/**
 * Item to open after `completed` was concluded: the first one, in production order,
 * that is not concluded yet. Null when the whole package is done.
 */
export function nextStageNeedingProduction(
  lesson: Pick<Lesson, 'stages' | 'category'>,
  completed: LessonStageType
): LessonStageType | null {
  return (
    getStudioStageOrder(lesson.category).find((type) => {
      if (type === completed) return false;
      const stage = lesson.stages.find((item) => item.type === type);
      return Boolean(stage) && !isProductionCompleted(stage);
    }) ?? null
  );
}

export function completionNoticeText(
  lesson: Pick<Lesson, 'category'>,
  notice: ProductionCompletionNotice
): string {
  const done = `“${hubStageLabel(lesson, notice.completed)}” concluído.`;
  return notice.next
    ? `${done} Próximo: “${hubStageLabel(lesson, notice.next)}”.`
    : `${done} ${PRODUCTION_TEXTS.packageReady}`;
}

export function productionProgress(lesson: Pick<Lesson, 'stages' | 'status'>): ProductionProgress {
  const finalReview = FINAL_REVIEW_LESSON_STATUSES.includes(lesson.status);
  const count = lesson.stages.filter((stage) =>
    finalReview ? stage.status === LessonStageStatus.APPROVED : isProductionCompleted(stage)
  ).length;
  const total = lesson.stages.length;
  return { count, total, percent: total ? Math.round((count / total) * 100) : 0, finalReview };
}

/** "IA: OpenAI · gpt-4o-mini — perfil de teste"; null while the settings are unknown. */
export function aiProviderCaption(
  settings: Pick<AiProviderSettings, 'llmProvider' | 'openai' | 'gemini'> | undefined
): string | null {
  const active = settings?.[settings.llmProvider];
  const provider = settings ? AI_PROVIDER_LABELS[settings.llmProvider] : undefined;
  if (!settings || !provider || !active?.generalModel) return null;
  const profile = AI_PROVIDER_PROFILE_CAPTIONS[matchingAiProviderProfile(settings)];
  return `IA: ${provider} · ${active.generalModel} — ${profile}`;
}

const enumValue = <T extends string>(values: readonly T[], value: unknown): T | '' =>
  values.find((item) => item === value) ?? '';

/**
 * Form values for the story visuals from the saved configuration. The weekly lesson
 * always uses the cut-out kit; the special one never does and has to choose.
 */
export function resolveVisualConfigForm(
  config: Record<string, unknown>,
  isSpecial: boolean
): VisualConfigForm {
  const savedType = enumValue(Object.values(LessonVisualType), config.type);
  const quantity = config.quantity;
  return {
    visualType: !isSpecial
      ? LessonVisualType.CUTOUT_KIT
      : savedType === LessonVisualType.CUTOUT_KIT
        ? ''
        : savedType,
    visualOrientation: enumValue(Object.values(LessonVisualOrientation), config.orientation),
    visualQuantity:
      typeof quantity === 'number' && quantity >= 1 && quantity <= STORY_VISUAL_MAX_QUANTITY
        ? quantity
        : '',
  };
}

/** Same completeness rule the configuration steps apply before enabling "Gerar". */
export function isVisualConfigComplete(form: VisualConfigForm): boolean {
  const quantity = Number(form.visualQuantity);
  return (
    Boolean(form.visualType) &&
    Boolean(form.visualOrientation) &&
    Number.isInteger(quantity) &&
    quantity >= STORY_VISUAL_MIN_QUANTITY &&
    quantity <= STORY_VISUAL_MAX_QUANTITY
  );
}

/**
 * What to do with the instructions sent along with a generation. The job runs in the
 * background, so the answer comes from the item as later snapshots show it.
 */
export function instructionsOutcome(
  pending: PendingInstructions,
  stage: Pick<LessonStage, 'status' | 'currentVersionId'> | undefined
): InstructionsOutcome {
  if (!stage || stage.status === LessonStageStatus.FAILED) return InstructionsOutcome.KEEP;
  if (stage.status === LessonStageStatus.GENERATING) return InstructionsOutcome.WAIT;
  return stage.currentVersionId !== pending.versionId
    ? InstructionsOutcome.CLEAR
    : InstructionsOutcome.WAIT;
}

/** Ctrl+S / Cmd+S, without Alt (AltGr+S types a character on some layouts). */
export function isSaveShortcut(event: SaveShortcutEvent): boolean {
  return (
    (event.ctrlKey || event.metaKey) &&
    !event.altKey &&
    event.key.toLowerCase() === PRODUCTION_SAVE_SHORTCUT_KEY
  );
}

export function productionInstructionsKey(userId: string, lessonId: string): string {
  return userId && lessonId
    ? studioSnapshotKey(
        StudioSnapshotScope.LESSON_DRAFTS,
        userId,
        `${lessonId}:${PRODUCTION_INSTRUCTIONS_KEY_SUFFIX}`
      )
    : '';
}
