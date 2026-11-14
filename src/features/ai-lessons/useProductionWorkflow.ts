import { useEffect, useRef, useState } from 'react';
import { useAiProviderSettings } from '@/features/ai-providers/hooks';
import { getApiErrorCode, getErrorMessage, getHttpStatus } from '@/utils/apiError';
import { HTTP_STATUS_CONFLICT, LESSON_ERROR_CODES } from './constants';
import { isLessonDraftOutdated } from './drafts';
import {
  useDeleteLessonDraft,
  useGenerateStage,
  useStageAction,
  useUpdateDraftContent,
} from './hooks';
import { MANUAL_SAVE_CHANGE_SUMMARY } from './presentation.constants';
import { PRODUCTION_NO_ACTIONS, PRODUCTION_TEXTS } from './production.constants';
import type { ProductionCompletionNotice, UseProductionWorkflowInput } from './production.types';
import {
  aiProviderCaption,
  canCompleteProductionStage,
  completeBlockedReason,
  isProductionCompleted,
  nextStageNeedingProduction,
  productionStagePrimaryAction,
} from './production.utils';
import {
  LessonStageAction,
  LessonStageStatus,
  LessonStageType,
  ProductionConfirmationKind,
  type LessonStage,
  type LessonVisualOrientation,
  type LessonVisualType,
  type ProductionConfirmation,
} from './types';
import { useElapsedSeconds } from './useElapsedSeconds';
import { useProductionInstructions } from './useProductionInstructions';
import { useSaveShortcut } from './useSaveShortcut';
import { useVisualConfigForm } from './useVisualConfigForm';
import {
  isReviewCycleActive,
  lessonProductionActions,
  regenerationLockReason,
  stagesInvalidatedBy,
  staleOriginStage,
} from './workflow';

/**
 * Everything the producer can do to the selected item: generate, save, conclude and
 * delete, with the confirmations and the conflict handling each one needs.
 */
export function useProductionWorkflow({
  id,
  lesson,
  data,
  selectedType,
  selectStage,
  lessonGone,
  refetch,
  onDeleted,
}: UseProductionWorkflowInput) {
  const { stage, version, local, edited } = data;
  const generate = useGenerateStage();
  const save = useUpdateDraftContent();
  const complete = useStageAction(LessonStageAction.COMPLETE);
  const deleteMutation = useDeleteLessonDraft();
  const providerSettings = useAiProviderSettings();
  const instructions = useProductionInstructions(id, lesson?.stages);
  const visual = useVisualConfigForm(selectedType, version, lesson?.category);

  const [confirmation, setConfirmation] = useState<ProductionConfirmation | null>(null);
  const [completionNotice, setCompletionNotice] = useState<ProductionCompletionNotice | null>(null);
  const [layoutOverflow, setLayoutOverflow] = useState(false);
  // `isPending` only changes on the next render; this closes the same-frame double click.
  const submitting = useRef(false);

  useEffect(() => {
    setLayoutOverflow(false);
  }, [selectedType, id]);

  const stageGenerating = generate.isPending || stage?.status === LessonStageStatus.GENERATING;
  const generationLocked =
    generate.isPending ||
    Boolean(lesson?.stages.some((item) => item.status === LessonStageStatus.GENERATING));
  const generation = generationLocked ? (lesson?.generation ?? null) : null;
  const elapsedSeconds = useElapsedSeconds(generationLocked, generation?.startedAt);

  const blocked =
    lessonGone || complete.isPending || generate.isPending || deleteMutation.isPending;
  const actions = lesson
    ? lessonProductionActions(lesson, stage, local.hasDrafts, blocked || save.isPending)
    : PRODUCTION_NO_ACTIONS;
  // Typing may continue during save; later edits keep their own draft revision.
  const editorEditable = lesson
    ? lessonProductionActions(lesson, stage, false, blocked).canEdit
    : false;
  const draftOutdated = isLessonDraftOutdated(local.draft, stage);
  const saveEnabled = edited && actions.canSave && !draftOutdated;
  const impactedStages = lesson && stage ? stagesInvalidatedBy(lesson, stage.type) : [];
  const stageInstructions = instructions.textFor(selectedType);
  // Retrying the story visuals without its three choices would only be refused by the API.
  const canRetry =
    actions.canGenerate && (stage?.type !== LessonStageType.LESSON_VISUALS || visual.complete);

  const guarded = (run: (release: () => void) => void) => {
    if (submitting.current) return;
    submitting.current = true;
    run(() => {
      submitting.current = false;
    });
  };

  const completeStage = (target: LessonStage, acknowledgeStale = false) =>
    guarded((release) =>
      complete.mutate(
        { id, stage: target.type, lockVersion: target.lockVersion, acknowledgeStale },
        {
          onSuccess: (updated) => {
            // Concluding is the end of this item: move on to the one that still needs work.
            const next = nextStageNeedingProduction(updated, target.type);
            setCompletionNotice({ completed: target.type, next });
            if (next) selectStage(next);
          },
          onError: (err) => {
            // The API asks for an explicit decision before concluding an outdated item.
            if (getApiErrorCode(err) === LESSON_ERROR_CODES.staleUpstream) {
              complete.reset();
              setConfirmation({ kind: ProductionConfirmationKind.COMPLETE_OUTDATED });
              return;
            }
            if (getHttpStatus(err) === HTTP_STATUS_CONFLICT) void refetch();
          },
          onSettled: release,
        }
      )
    );

  const runGeneration = () => {
    if (!stage || !actions.canGenerate) return;
    const target = stage.type;
    setCompletionNotice(null);
    guarded((release) =>
      generate.mutate(
        {
          id,
          payload: {
            stage: target,
            revisionInstructions: stageInstructions || undefined,
            ...(target === LessonStageType.LESSON_VISUALS
              ? {
                  visualType: visual.visualType as LessonVisualType,
                  visualOrientation: visual.visualOrientation as LessonVisualOrientation,
                  visualQuantity: Number(visual.visualQuantity),
                  visualStyle: visual.visualStyle,
                }
              : {}),
          },
        },
        {
          onSuccess: () =>
            instructions.markSent(target, {
              text: stageInstructions,
              versionId: stage.currentVersionId,
            }),
          onError: () => instructions.cancelSent(target),
          onSettled: release,
        }
      )
    );
  };

  const requestGeneration = () => {
    if (!stage || !actions.canGenerate) return;
    // Replacing existing content is paid and may outdate what depends on it: always confirm.
    if (stage.currentVersionId) setConfirmation({ kind: ProductionConfirmationKind.REGENERATE });
    else runGeneration();
  };

  const runSave = () => {
    const sent = local.draft;
    if (!sent || !actions.canSave) return;
    guarded((release) =>
      save.mutate(
        {
          id: sent.lessonId,
          payload: {
            stage: sent.stage,
            lockVersion: sent.lockVersion,
            tiptapAstJson: sent.document,
            structuredDataJson: sent.structuredData ?? undefined,
            changeSummary: MANUAL_SAVE_CHANGE_SUMMARY,
          },
        },
        {
          onSuccess: (saved) => {
            const savedStage = saved.stages.find((item) => item.type === sent.stage);
            if (savedStage) local.acknowledge(sent, savedStage);
          },
          onSettled: release,
        }
      )
    );
  };

  const requestSave = () => {
    // Same conditions as the button, so the shortcut can never save what the button would not.
    if (!saveEnabled || confirmation) return;
    if (impactedStages.length) setConfirmation({ kind: ProductionConfirmationKind.SAVE });
    else runSave();
  };
  useSaveShortcut(requestSave);

  const confirmDelete = () =>
    guarded((release) => deleteMutation.mutate(id, { onSuccess: onDeleted, onSettled: release }));

  const confirmCurrent = () => {
    const kind = confirmation?.kind;
    setConfirmation(null);
    if (kind === ProductionConfirmationKind.SAVE) runSave();
    if (kind === ProductionConfirmationKind.REGENERATE) runGeneration();
    if (kind === ProductionConfirmationKind.COMPLETE_OUTDATED && stage) completeStage(stage, true);
    if (kind === ProductionConfirmationKind.DISCARD) {
      local.discard();
      save.reset();
    }
    if (kind === ProductionConfirmationKind.REBASE) {
      local.rebase();
      save.reset();
    }
  };

  // A failed save is shown beside the item it belongs to, not on whichever item is open.
  const saveFailed =
    save.isError && !draftOutdated && save.variables?.payload.stage === selectedType;

  return {
    actions,
    editorEditable,
    draftOutdated,
    saveEnabled,
    canRetry,
    canComplete: canCompleteProductionStage(stage, actions.canComplete, layoutOverflow),
    completed: isProductionCompleted(stage),
    primaryAction: productionStagePrimaryAction({ stage, edited, generating: stageGenerating }),
    completeBlockedReason: completeBlockedReason({
      stage,
      layoutOverflow,
      hasDrafts: local.hasDrafts,
    }),
    regenerationLock: actions.regenerationLocked ? regenerationLockReason(stage) : null,
    staleOrigin:
      lesson && stage?.status === LessonStageStatus.STALE ? staleOriginStage(lesson, stage) : null,
    reviewCycleActive: lesson ? isReviewCycleActive(lesson) : false,
    impactedStages,
    stageGenerating,
    generationLocked,
    generation,
    elapsedSeconds,
    savePending: save.isPending,
    completePending: complete.isPending,
    deletePending: deleteMutation.isPending,
    /** Nothing may be deleted while work of this screen is in flight or unsaved. */
    deleteDisabled: generationLocked || local.hasDrafts || save.isPending || complete.isPending,
    saveError: saveFailed
      ? getHttpStatus(save.error) === HTTP_STATUS_CONFLICT
        ? PRODUCTION_TEXTS.saveConflict
        : getErrorMessage(save.error, PRODUCTION_TEXTS.saveFailed)
      : null,
    completeError: complete.isError
      ? getHttpStatus(complete.error) === HTTP_STATUS_CONFLICT
        ? PRODUCTION_TEXTS.completeConflict
        : getErrorMessage(complete.error, PRODUCTION_TEXTS.completeFailed)
      : null,
    deleteError: deleteMutation.isError
      ? getErrorMessage(deleteMutation.error, PRODUCTION_TEXTS.deleteError)
      : null,
    // A failed settings request must never get in the way of generating.
    providerCaption: providerSettings.isError ? null : aiProviderCaption(providerSettings.data),
    instructions: stageInstructions,
    setInstructions: (text: string) => instructions.change(selectedType, text),
    visual,
    confirmation,
    completionNotice,
    dismissCompletionNotice: () => setCompletionNotice(null),
    setLayoutOverflow,
    closeConfirmation: () => setConfirmation(null),
    confirmCurrent,
    requestDiscard: () => setConfirmation({ kind: ProductionConfirmationKind.DISCARD }),
    requestRebase: () => setConfirmation({ kind: ProductionConfirmationKind.REBASE }),
    requestGeneration,
    runGeneration,
    requestSave,
    completeStage,
    confirmDelete,
    resetDelete: () => deleteMutation.reset(),
    /** Opening another item by hand ends what the last conclusion was announcing. */
    openStage: (type: LessonStageType) => {
      complete.reset();
      setCompletionNotice(null);
      selectStage(type);
    },
  };
}
