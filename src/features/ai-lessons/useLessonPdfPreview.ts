import { useEffect, useRef, useState } from 'react';
import { aiLessonsService } from '@/services/aiLessonsService';
import type { LessonStageType } from './types';
import { lessonPdfError } from './pdf';

/**
 * Preview of the item PDF. A version is immutable, so its PDF is converted once per screen
 * and reused until the stage, the version or the lock changes.
 */
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
  const cached = useRef<string | null>(null);
  useEffect(() => {
    requestId.current += 1;
    setUrl(null);
    setError(null);
    setLoading(false);
    return () => {
      requestId.current += 1;
      if (cached.current) URL.revokeObjectURL(cached.current);
      cached.current = null;
    };
  }, [lessonId, stage, lockVersion, versionId]);
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
      if (cached.current) {
        setError(null);
        setUrl(cached.current);
        return;
      }
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
        if (current !== requestId.current) return;
        cached.current = URL.createObjectURL(blob);
        setUrl(cached.current);
      } catch (failure) {
        const message = await lessonPdfError(failure);
        if (current === requestId.current) setError(message);
      } finally {
        if (current === requestId.current) setLoading(false);
      }
    },
  };
}
