import { MediaItem, MediaUploadType } from 'store/slices/types';

export const isUploadedMedia = (media: MediaItem | null | undefined): boolean =>
  Boolean(media) && (media?.uploadType === MediaUploadType.UPLOAD || Boolean(media?.isLocalFile));

/**
 * Baixa o arquivo enviado (upload). Link externo não pode ser lido por fetch (CORS),
 * então nele quem chama deve abrir em nova aba.
 */
export async function downloadDocumentFile(media: MediaItem): Promise<void> {
  const filename = media.originalName || media.title || 'documento';
  const response = await fetch(media.url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}
