import { useEffect, useRef, useState } from 'react';
import { aiLessonsService } from './api';
import { downloadLessonPdf, lessonPdfError } from './pdf';

/** Downloads the consolidated PDF of a fully approved package. */
export function useLessonPackageDownload(lessonId: string, fileName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    setError(null);
    setLoading(false);
    return () => {
      active.current = false;
    };
  }, [lessonId]);
  return {
    loading,
    error,
    dismissError: () => setError(null),
    download: async () => {
      if (loading || !lessonId) return;
      setLoading(true);
      setError(null);
      try {
        const blob = await aiLessonsService.exportPdf(lessonId);
        if (active.current) downloadLessonPdf(blob, fileName);
      } catch (failure) {
        const message = await lessonPdfError(failure);
        if (active.current) setError(message);
      } finally {
        if (active.current) setLoading(false);
      }
    },
  };
}
