import { useMemo, useState } from 'react';
import { getErrorMessage, getHttpStatus } from '@/utils/apiError';
import { HTTP_STATUS_CONFLICT } from './constants';
import { useRegenerateStageImages } from './hooks';
import { IMAGE_REGENERATION_TEXTS } from './image-regeneration.constants';
import {
  imageBriefView,
  imageRegenerationBlockedReason,
  mustRegenerateAllImages,
  regenerableImages,
} from './image-regeneration.utils';
import type { LessonStage, LessonVersion } from './types';

interface UseImageRegenerationInput {
  lessonId: string;
  stage: LessonStage | undefined;
  /** The saved version: the images come from it, never from an unsaved edit. */
  version: LessonVersion | undefined;
  canGenerate: boolean;
  edited: boolean;
  refetch: () => unknown;
}

/**
 * Regenerating only some images of an item: which images exist, whether it is
 * allowed now, and the request itself. Once accepted, the item is "generating"
 * like any other generation, and the rest of the screen follows the lesson.
 */
export function useImageRegeneration({
  lessonId,
  stage,
  version,
  canGenerate,
  edited,
  refetch,
}: UseImageRegenerationInput) {
  const mutation = useRegenerateStageImages();
  const [open, setOpen] = useState(false);
  const images = useMemo(
    () => (stage ? regenerableImages(stage.type, version?.structuredDataJson) : []),
    [stage, version?.structuredDataJson]
  );
  const brief = useMemo(
    () => imageBriefView(version?.structuredDataJson),
    [version?.structuredDataJson]
  );
  const blockedReason = !stage
    ? null
    : images.length === 0
      ? IMAGE_REGENERATION_TEXTS.blocked.missing
      : imageRegenerationBlockedReason({ stage, images, edited });

  const close = () => {
    if (mutation.isPending) return;
    setOpen(false);
    mutation.reset();
  };

  const submit = (assetIds: string[], instructions: string) => {
    if (!stage || mutation.isPending || assetIds.length === 0) return;
    mutation.mutate(
      {
        id: lessonId,
        payload: {
          stage: stage.type,
          lockVersion: stage.lockVersion,
          assetIds,
          instructions: instructions.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          mutation.reset();
        },
        // Someone changed the item meanwhile: bring the current version to the screen.
        onError: (error) => {
          if (getHttpStatus(error) === HTTP_STATUS_CONFLICT) void refetch();
        },
      }
    );
  };

  return {
    /** The item has images at all; without them there is no button. */
    available: images.length > 0,
    enabled: images.length > 0 && canGenerate && !blockedReason,
    blockedReason,
    images,
    brief,
    setOnly: stage ? mustRegenerateAllImages(stage.type) : false,
    open,
    openDialog: () => {
      mutation.reset();
      setOpen(true);
    },
    close,
    submit,
    pending: mutation.isPending,
    error: mutation.isError
      ? getErrorMessage(mutation.error, IMAGE_REGENERATION_TEXTS.fallbackError)
      : null,
  };
}

export type ImageRegeneration = ReturnType<typeof useImageRegeneration>;
