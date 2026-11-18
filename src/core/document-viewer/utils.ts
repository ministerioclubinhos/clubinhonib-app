import { MediaItem, MediaUploadType } from 'store/slices/types';
import { FORMAT_BY_EXTENSION } from './constants';
import { DocumentFormat, DocumentViewTarget } from './types';

const GOOGLE_PREVIEWABLE =
  /^https:\/\/(?:drive|docs)\.google\.com\/(file|document|spreadsheets|presentation)(?:\/u\/\d+)?\/d\/([\w-]+)/i;

const isHttpUrl = (value: string): boolean => {
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};

const extensionOf = (value?: string | null): string | null => {
  if (!value) return null;
  let path = value;
  try {
    path = new URL(value).pathname;
  } catch {
    // não é URL: trata como nome de arquivo
  }
  const match = decodeURIComponent(path).match(/\.([a-z0-9]{2,5})$/i);
  return match ? match[1].toLowerCase() : null;
};

/** Formato renderizável do documento, ou `null` se não for PDF/DOCX/PPTX. */
export const detectDocumentFormat = (
  ...candidates: Array<string | null | undefined>
): DocumentFormat | null => {
  for (const candidate of candidates) {
    const extension = extensionOf(candidate);
    if (extension && FORMAT_BY_EXTENSION[extension]) return FORMAT_BY_EXTENSION[extension];
  }
  return null;
};

/** Decide como abrir a mídia. `null` = não há o que abrir. */
export const getDocumentViewTarget = (media: MediaItem): DocumentViewTarget | null => {
  const url = media.url?.trim();
  if (!url) return null;

  const isUpload = media.uploadType === MediaUploadType.UPLOAD || Boolean(media.isLocalFile);

  if (isUpload) {
    const fileName = media.originalName || media.title || 'documento';
    const format = detectDocumentFormat(media.originalName, url, media.title);
    if (format) return { mode: 'viewer', format, url, fileName };
    // Formato legado (ex.: .doc enviado antes): comportamento anterior.
    return { mode: 'embed', url };
  }

  // Link: nunca abre/embute nada que não seja http(s) (ex.: javascript:).
  if (!isHttpUrl(url)) return null;

  const google = url.match(GOOGLE_PREVIEWABLE);
  if (google) {
    const [, kind, id] = google;
    const host = kind.toLowerCase() === 'file' ? 'drive.google.com' : 'docs.google.com';
    return { mode: 'embed', url: `https://${host}/${kind.toLowerCase()}/d/${id}/preview` };
  }

  return { mode: 'newTab', url };
};

/** Vale para o envio: só PDF, DOCX e PPTX (mesma regra da API). */
export const isAcceptedDocumentFile = (fileName: string): boolean =>
  detectDocumentFormat(fileName) !== null;
