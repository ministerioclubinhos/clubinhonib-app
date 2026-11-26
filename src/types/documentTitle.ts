/**
 * Tipos e opções de configuração para o hook e utilitários de document title.
 */

export interface UseDocumentTitleOptions {
  /**
   * Se verdadeiro, restaura o título do documento quando o componente for desmontado.
   * Padrão: true.
   */
  restoreOnUnmount?: boolean;
  /**
   * Título padrão para o qual reverter caso o título anterior seja inválido ou igual ao atual.
   * Padrão: DEFAULT_APP_TITLE ('Clubinhos NIB').
   */
  defaultTitle?: string;
}
