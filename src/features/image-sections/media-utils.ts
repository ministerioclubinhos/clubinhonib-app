import { MediaType, MediaUploadType, MediaPlatform, type MediaItem } from '@/store/slices/types';
import {
  CLUBINHO_IMAGE_FORMATS,
  CLUBINHO_VIDEO_FORMATS,
  CLUBINHO_MAX_PHOTOS,
  CLUBINHO_MAX_IMAGE_BYTES,
  CLUBINHO_MAX_VIDEO_BYTES,
} from './constants';
import type { ClubinhoFileSelection } from './types';

export function validateClubinhoSelection({
  files,
  mediaType,
  currentCount,
}: ClubinhoFileSelection): string | null {
  const video = mediaType === MediaType.VIDEO;
  if (!files.length) return null;
  if (video && files.length + currentCount > 1)
    return 'Envie apenas um vídeo por publicação. Remova o atual para escolher outro.';
  if (!video && files.length + currentCount > CLUBINHO_MAX_PHOTOS)
    return 'Selecione no máximo 20 fotos por publicação.';
  const formats = video ? CLUBINHO_VIDEO_FORMATS : CLUBINHO_IMAGE_FORMATS;
  const maxBytes = video ? CLUBINHO_MAX_VIDEO_BYTES : CLUBINHO_MAX_IMAGE_BYTES;
  for (const file of files) {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!formats[file.type]?.includes(extension))
      return video ? 'Escolha um vídeo MP4 ou WebM.' : 'Escolha fotos JPG, PNG, WebP ou GIF.';
    if (file.size <= 0 || file.size > maxBytes)
      return video
        ? 'O vídeo deve ter até 100 MB e não pode estar vazio.'
        : 'Cada foto deve ter até 10 MB e não pode estar vazia.';
  }
  return null;
}

export function validateClubinhoPublication(
  items: Pick<MediaItem, 'mediaType'>[],
  preserveLegacyCount = false
): string | null {
  if (!items.length) return 'Adicione fotos ou um vídeo para compartilhar.';
  const videos = items.filter((item) => item.mediaType === MediaType.VIDEO).length;
  if (
    (!preserveLegacyCount && items.length > CLUBINHO_MAX_PHOTOS) ||
    (videos > 0 && items.length !== 1) ||
    items.some((item) => item.mediaType !== MediaType.IMAGE && item.mediaType !== MediaType.VIDEO)
  )
    return 'Envie até 20 fotos ou um único vídeo, sem misturar os formatos.';
  return null;
}

export function toClubinhoUploadMedia(file: File, mediaType: MediaType): MediaItem {
  return {
    file,
    mediaType,
    uploadType: MediaUploadType.UPLOAD,
    platformType: MediaPlatform.ANY,
    isLocalFile: true,
    url: '',
    title: file.name,
    description: '',
    originalName: file.name,
    size: file.size,
  };
}
