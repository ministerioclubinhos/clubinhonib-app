import { DEFAULT_APP_TITLE } from '@/constants/app';

/**
 * Resolve o título final do documento a partir de um título opcional.
 * Retorna o título padrão caso o valor seja vazio ou indefinido.
 */
export function resolveDocumentTitle(
  pageTitle?: string | null,
  defaultTitle: string = DEFAULT_APP_TITLE,
): string {
  const trimmed = pageTitle?.trim();
  return trimmed || defaultTitle;
}

/**
 * Determina o título a ser restaurado quando o componente de página for desmontado.
 * Restaura o título anterior caso seja diferente do título atual da página;
 * caso contrário, volta ao título padrão da aplicação.
 */
export function resolveRestoredTitle(
  previousTitle?: string | null,
  currentTitle?: string | null,
  defaultTitle: string = DEFAULT_APP_TITLE,
): string {
  const prevTrimmed = previousTitle?.trim();
  const currTrimmed = currentTitle?.trim();

  if (prevTrimmed && prevTrimmed !== currTrimmed) {
    return prevTrimmed;
  }

  return defaultTitle;
}
