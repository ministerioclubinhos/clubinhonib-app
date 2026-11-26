import { LessonStageType } from '../types';
import { visualAssets } from '../utils';

export const manualWorkPreviewData = (data: Record<string, unknown>) => ({
  imageUrl: visualAssets(data, LessonStageType.MANUAL_WORK)[0]?.url ?? '',
  verse: `“${String(data.verseText ?? '')}” (${String(data.verseReference ?? '')} - NVI)`,
});
