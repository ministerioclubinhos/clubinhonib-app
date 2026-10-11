import { useEffect } from 'react';

import { DEFAULT_APP_TITLE } from '@/constants/app';
import type { UseDocumentTitleOptions } from '@/types/documentTitle';
import { resolveDocumentTitle, resolveRestoredTitle } from '@/utils/documentTitle';

/**
 * Hook para gerenciar o título da aba do navegador (`document.title`).
 * Aplica o título fornecido ao montar e, ao desmontar, restaura o título anterior
 * ou volta ao título padrão da aplicação ('Clubinhos NIB'), garantindo que títulos
 * de páginas específicas não fiquem persistidos ao navegar para outras rotas.
 */
export function useDocumentTitle(
  title?: string | null,
  options: UseDocumentTitleOptions = {},
): void {
  const { restoreOnUnmount = true, defaultTitle = DEFAULT_APP_TITLE } = options;

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const previousTitle = document.title;
    const resolvedTitle = resolveDocumentTitle(title, defaultTitle);
    document.title = resolvedTitle;

    return () => {
      if (restoreOnUnmount && typeof document !== 'undefined') {
        document.title = resolveRestoredTitle(previousTitle, resolvedTitle, defaultTitle);
      }
    };
  }, [title, restoreOnUnmount, defaultTitle]);
}
