import { useMemo } from 'react';
import { EMPTY_STRUCTURED_DATA, EMPTY_TIPTAP_DOCUMENT } from './constants';
import { localizeLegacyDocumentLabels } from './presentation.utils';
import { LessonStageType, type Lesson } from './types';
import { useLessonLocalDrafts } from './useLessonLocalDrafts';
import { objectValue } from './utils';

/** The selected item as the screen shows it: server version, local edit and its notes. */
export function useProductionStage(
  lessonId: string,
  lesson: Lesson | undefined,
  selectedType: LessonStageType
) {
  const stage = useMemo(
    () => lesson?.stages.find((item) => item.type === selectedType),
    [lesson, selectedType]
  );
  const version = stage?.versions.find((item) => item.id === stage.currentVersionId);
  const local = useLessonLocalDrafts(lessonId, stage, version);
  // Only the server copy needs the legacy relabeling; a local edit already went through it.
  const remoteDocument = useMemo(
    () => localizeLegacyDocumentLabels(version?.tiptapAstJson ?? EMPTY_TIPTAP_DOCUMENT),
    [version?.tiptapAstJson]
  );
  const comments = useMemo(
    () => (lesson?.comments ?? []).filter((comment) => comment.sectionKey === selectedType),
    [lesson?.comments, selectedType]
  );
  // The memory verse is chosen in the base lesson and reused by the items that depend on it.
  const baseStage = lesson?.stages.find((item) => item.type === LessonStageType.LESSON);
  const baseVersion = baseStage?.versions.find((item) => item.id === baseStage.currentVersionId);
  const memoryVerse = objectValue(baseVersion?.structuredDataJson?.memoryVerse);

  return {
    stage,
    version,
    local,
    remoteDocument,
    document: local.draft?.document ?? remoteDocument,
    structuredData:
      local.draft?.structuredData ?? version?.structuredDataJson ?? EMPTY_STRUCTURED_DATA,
    /** This item has an edit that was not saved yet. */
    edited: Boolean(local.draft?.document),
    comments,
    verse: memoryVerse.text
      ? { reference: String(memoryVerse.reference), text: String(memoryVerse.text) }
      : null,
  };
}
