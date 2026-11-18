import { DocumentFormat } from './types';

/** Extensão (minúscula, sem ponto) → formato renderizado pelo visualizador. */
export const FORMAT_BY_EXTENSION: Readonly<Record<string, DocumentFormat>> = {
  pdf: DocumentFormat.PDF,
  docx: DocumentFormat.DOCX,
  pptx: DocumentFormat.PPTX,
};

/** Extensões aceitas no envio de documentos. Mantida igual à da API. */
export const ACCEPTED_DOCUMENT_EXTENSIONS = ['.pdf', '.docx', '.pptx'] as const;

/** Valor do atributo `accept` do input de arquivo. */
export const ACCEPTED_DOCUMENT_INPUT = ACCEPTED_DOCUMENT_EXTENSIONS.join(',');

/** Texto de ajuda exibido no envio. */
export const ACCEPTED_DOCUMENT_LABEL = 'PDF, DOCX ou PPTX';

/** Acima disso o arquivo não é renderizado no navegador (evita travar a aba). */
export const MAX_RENDERABLE_BYTES = 40 * 1024 * 1024;

/** Largura máxima de um slide de PPTX / página de PDF, em px. */
export const MAX_PAGE_WIDTH = 960;

/** Largura máxima de um slide de PPTX, em px (slides têm mais texto que uma página de PDF). */
export const MAX_SLIDE_WIDTH = 1200;
