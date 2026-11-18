import { useCallback, useEffect, useState } from 'react';

import { extractErrorMessage, isCancelledRequest } from '@/utils/apiError';

import { apiFetchIdeaAiDocument, apiSaveIdeaAiDocument } from './api';
import type { IdeaTiptapDocument } from './document-editor/editor.types';
import type { IdeaAiDocument } from './types';

/**
 * Carrega o documento melhorado quando o editor abre e salva a edição.
 *
 * `draft` é o que está no editor; `isDirty` só fica verdadeiro depois que a
 * pessoa muda algo, para o fechamento pedir confirmação apenas quando há o que
 * perder.
 */
export function useIdeaAiDocumentEditor(
  open: boolean,
  sectionId: string,
  sourceMediaId: string,
  enhancementId: string
) {
  const [loaded, setLoaded] = useState<IdeaAiDocument | null>(null);
  const [draft, setDraft] = useState<IdeaTiptapDocument | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true);
    setLoadError('');
    setSaveError('');
    setLoaded(null);
    setDraft(null);
    setIsDirty(false);
    apiFetchIdeaAiDocument(sectionId, sourceMediaId, { signal: controller.signal })
      .then((data) => {
        setLoaded(data);
        setDraft(data.document);
      })
      .catch((error: unknown) => {
        if (isCancelledRequest(error)) return;
        setLoadError(extractErrorMessage(error, 'Não foi possível abrir o documento.'));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [open, sectionId, sourceMediaId, reload]);

  const edit = useCallback((next: IdeaTiptapDocument) => {
    setDraft(next);
    setIsDirty(true);
  }, []);

  const retry = useCallback(() => setReload((value) => value + 1), []);

  /** Devolve se salvou. O erro da API (409, 422…) fica em `saveError`. */
  const save = useCallback(async (): Promise<boolean> => {
    if (!draft || saving) return false;
    setSaving(true);
    setSaveError('');
    try {
      await apiSaveIdeaAiDocument(sectionId, sourceMediaId, {
        enhancementId,
        document: draft,
      });
      setIsDirty(false);
      return true;
    } catch (error: unknown) {
      setSaveError(extractErrorMessage(error, 'Não foi possível gerar o PDF.'));
      return false;
    } finally {
      setSaving(false);
    }
  }, [draft, saving, sectionId, sourceMediaId, enhancementId]);

  return {
    loaded,
    draft,
    isDirty,
    loading,
    loadError,
    saving,
    saveError,
    setSaveError,
    edit,
    retry,
    save,
  };
}
