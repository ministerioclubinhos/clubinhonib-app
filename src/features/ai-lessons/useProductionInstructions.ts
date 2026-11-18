import { useEffect, useRef, useState } from 'react';
import { isReviewFeedbackMap } from './drafts';
import { readStudioSnapshot, resolveStudioStorage } from './draftStorage';
import { instructionsOutcome, productionInstructionsKey } from './production.utils';
import {
  InstructionsOutcome,
  type PendingInstructions,
  type ProductionInstructionsMap,
} from './production.types';
import { usePersistedStudioState, useStudioUserId } from './usePersistedStudioState';
import type { LessonStage, LessonStageType } from './types';

/**
 * Instructions typed for the AI, per item, kept across a reload like the document
 * edits are. An item's text is cleared only once the generation that used it produced
 * a new version; if it fails, the text stays so the retry does not start from nothing.
 */
export function useProductionInstructions(lessonId: string, stages: LessonStage[] | undefined) {
  const userId = useStudioUserId();
  const storageKey = productionInstructionsKey(userId, lessonId);
  const [instructions, setInstructions] = useState<ProductionInstructionsMap>({});
  const [loadedKey, setLoadedKey] = useState('');
  const pending = useRef<Partial<Record<LessonStageType, PendingInstructions>>>({});

  useEffect(() => {
    if (!storageKey || loadedKey === storageKey) return;
    // Same shape as the reviewer notes: one text per item.
    setInstructions(
      readStudioSnapshot(resolveStudioStorage(), storageKey, isReviewFeedbackMap) ?? {}
    );
    pending.current = {};
    setLoadedKey(storageKey);
  }, [loadedKey, storageKey]);
  // Nothing is written before the stored snapshot was read, so a mount never erases it.
  usePersistedStudioState(loadedKey === storageKey ? storageKey : '', instructions);

  useEffect(() => {
    for (const [type, sent] of Object.entries(pending.current) as [
      LessonStageType,
      PendingInstructions,
    ][]) {
      const outcome = instructionsOutcome(
        sent,
        stages?.find((item) => item.type === type)
      );
      if (outcome === InstructionsOutcome.WAIT) continue;
      delete pending.current[type];
      if (outcome === InstructionsOutcome.CLEAR)
        // Text typed while the job ran belongs to the next generation: keep it.
        setInstructions((current) =>
          current[type] === sent.text ? { ...current, [type]: '' } : current
        );
    }
  }, [stages]);

  return {
    /** Empty until this lesson's snapshot was read, so another lesson's text never shows. */
    textFor: (stage: LessonStageType) =>
      loadedKey === storageKey ? (instructions[stage] ?? '') : '',
    change: (stage: LessonStageType, text: string) =>
      setInstructions((current) => ({ ...current, [stage]: text })),
    markSent: (stage: LessonStageType, sent: PendingInstructions) => {
      if (sent.text) pending.current[stage] = sent;
    },
    /** The request itself was refused: no job will ever answer for this text. */
    cancelSent: (stage: LessonStageType) => {
      delete pending.current[stage];
    },
  };
}
