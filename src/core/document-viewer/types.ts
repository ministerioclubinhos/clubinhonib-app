/** Formatos que o visualizador renderiza dentro da aplicação, com biblioteca própria. */
export enum DocumentFormat {
  PDF = 'pdf',
  DOCX = 'docx',
  PPTX = 'pptx',
}

/**
 * Como um documento deve ser aberto.
 *
 * - `viewer`: renderizado aqui dentro por biblioteca (PDF, DOCX, PPTX enviados).
 * - `embed`: iframe — só para origens sabidamente embutíveis (Google Drive/Docs)
 *   e arquivos enviados de formato legado (o navegador decide o que fazer).
 * - `newTab`: a origem proíbe moldura (Dropbox, OneDrive, sites quaisquer) e o
 *   link abre em nova aba.
 */
export type DocumentViewTarget =
  | { mode: 'viewer'; format: DocumentFormat; url: string; fileName: string }
  | { mode: 'embed'; url: string }
  | { mode: 'newTab'; url: string };
