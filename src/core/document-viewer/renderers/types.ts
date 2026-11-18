export interface RendererProps {
  bytes: ArrayBuffer;
  /**
   * URL (blob:) do mesmo conteúdo, criada e revogada por quem renderiza o
   * viewer. É estável durante toda a vida do documento — o PDF precisa disso:
   * um `file` recriado a cada render faz o react-pdf recarregar em laço.
   */
  objectUrl: string;
  /** Chamado quando o arquivo está corrompido ou a biblioteca não consegue renderizá-lo. */
  onError: () => void;
}
