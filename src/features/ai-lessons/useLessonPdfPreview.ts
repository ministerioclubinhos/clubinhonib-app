import { useEffect, useRef, useState } from 'react';
import { aiLessonsService } from '@/services/aiLessonsService';
import type { LessonStageType } from './types';
import { lessonPdfError } from './pdf';

export function useLessonPdfPreview(
  lessonId: string,
  stage: LessonStageType,
  lockVersion?: number,
  versionId?: string | null
) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);
  useEffect(() => {
    requestId.current += 1;
    setUrl(null);
    setError(null);
    setLoading(false);
    return () => {
      requestId.current += 1;
    };
  }, [lessonId, stage, lockVersion, versionId]);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url]
  );
  return {
    url,
    error,
    loading,
    close: () => {
      requestId.current += 1;
      setUrl(null);
      setError(null);
      setLoading(false);
    },
    open: async () => {
      const current = ++requestId.current;
      setLoading(true);
      setError(null);
      setUrl(null);
      try {
        const blob = await aiLessonsService.previewStagePdf(
          lessonId,
          stage,
          lockVersion,
          versionId ?? undefined
        );
        if (current === requestId.current) setUrl(URL.createObjectURL(blob));
      } catch (failure) {
        const message = await lessonPdfError(failure);
        if (current === requestId.current) setError(message);
      } finally {
        if (current === requestId.current) setLoading(false);
      }
    },
  };
}
