export enum LessonStageStatus {
  NOT_STARTED = 'NOT_STARTED',
  GENERATING = 'GENERATING',
  DRAFT = 'DRAFT',
  PRODUCER_APPROVED = 'PRODUCER_APPROVED',
  IN_REVIEW = 'IN_REVIEW',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  APPROVED = 'APPROVED',
  FAILED = 'FAILED',
  STALE = 'STALE',
}

export enum LessonStageType {
  LESSON = 'LESSON',
  LESSON_VISUALS = 'LESSON_VISUALS',
  STANDARD_GAME = 'STANDARD_GAME',
  VERSE_VISUALS = 'VERSE_VISUALS',
  VERSE_FIXATION = 'VERSE_FIXATION',
  MEDITATION_YOUNGER = 'MEDITATION_YOUNGER',
  MEDITATION_OLDER = 'MEDITATION_OLDER',
  MANUAL_WORK = 'MANUAL_WORK',
}

export enum LessonVisualType {
  STORY_SEQUENCE = 'STORY_SEQUENCE',
  CHARACTER_AND_EMOTION = 'CHARACTER_AND_EMOTION',
  VISUAL_ANCHORS = 'VISUAL_ANCHORS',
  INTERACTIVE_COLORING = 'INTERACTIVE_COLORING',
}

export enum LessonVisualOrientation {
  LANDSCAPE = 'LANDSCAPE',
  PORTRAIT = 'PORTRAIT',
}

export interface VisualAsset {
  id?: string;
  purpose?: string;
  sourceExcerpt?: string;
  altText?: string;
  displayText?: string;
  url?: string;
  identityReference?: boolean;
}

export interface StoryVisualConfigurationProps {
  visualType: LessonVisualType | '';
  visualOrientation: LessonVisualOrientation | '';
  visualQuantity: number | '';
  instructions: string;
  hasVersion: boolean;
  isGenerating: boolean;
  canGenerate: boolean;
  onVisualTypeChange: (value: LessonVisualType) => void;
  onVisualOrientationChange: (value: LessonVisualOrientation) => void;
  onVisualQuantityChange: (value: number | '') => void;
  onInstructionsChange: (value: string) => void;
  onGenerate: () => void;
}
