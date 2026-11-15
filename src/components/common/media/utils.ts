import { MediaItem, MediaType, MediaUploadType } from '@/store/slices/types';
import { parseYoutubeVideoId } from '@/features/ideas-sections/share-utils';
import { getMediaPreviewUrl } from '@/utils/getMediaPreviewUrl';

import { MediaView, MediaViewKind } from './types';

/** True quando a mídia é um arquivo (enviado agora ou já salvo), e não um link. */
export const isFileMedia = (item: MediaItem): boolean =>
  item.uploadType === MediaUploadType.UPLOAD || item.isLocalFile === true || Boolean(item.file);

/** Nome do arquivo para decidir o formato; a URL local (blob:) não tem extensão. */
const fileNameOf = (item: MediaItem): string =>
  (item.file?.name ?? item.originalName ?? item.url).split('?')[0].toLowerCase();

/** Extensão em maiúsculas para o selo do cartão (ex.: "PDF"), ou vazio. */
export const mediaExtensionLabel = (item: MediaItem): string => {
  const name = item.file?.name ?? item.originalName ?? '';
  const parts = name.split('.');
  return parts.length > 1 ? (parts.pop() ?? '').toUpperCase() : '';
};

/** Tamanho legível em KB/MB; vazio quando desconhecido. */
export const formatMediaSize = (bytes?: number): string => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`;
};

/** Escolhe como visualizar a mídia, reaproveitando as URLs de prévia do app. */
export const resolveMediaView = (item: MediaItem): MediaView => {
  const previewUrl = getMediaPreviewUrl(item);
  const file = isFileMedia(item);

  switch (item.mediaType) {
    case MediaType.IMAGE:
      return { kind: MediaViewKind.IMAGE, src: previewUrl };
    case MediaType.VIDEO: {
      const youtubeId = file ? null : parseYoutubeVideoId(item.url);
      if (youtubeId) {
        return {
          kind: MediaViewKind.EMBED,
          src: `https://www.youtube.com/embed/${youtubeId}?rel=0`,
        };
      }
      return file
        ? { kind: MediaViewKind.VIDEO_FILE, src: item.url }
        : { kind: MediaViewKind.EMBED, src: previewUrl };
    }
    case MediaType.AUDIO:
      return file
        ? { kind: MediaViewKind.AUDIO_FILE, src: item.url }
        : { kind: MediaViewKind.EMBED, src: previewUrl };
    default:
      if (!file) return { kind: MediaViewKind.EMBED, src: previewUrl };
      return fileNameOf(item).endsWith('.pdf')
        ? { kind: MediaViewKind.EMBED, src: item.url }
        : { kind: MediaViewKind.DOWNLOAD, src: item.url };
  }
};

/**
 * Miniatura do material, quando existe uma: a própria imagem ou a capa do
 * vídeo do YouTube. Outros tipos usam um ícone no cartão.
 */
export const mediaThumbnailUrl = (item: MediaItem): string | null => {
  if (item.mediaType === MediaType.IMAGE) return resolveMediaView(item).src || null;
  if (item.mediaType === MediaType.VIDEO && !isFileMedia(item)) {
    const youtubeId = parseYoutubeVideoId(item.url);
    return youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg` : null;
  }
  return null;
};
