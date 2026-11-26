import { PLAY_THUMBNAIL_QUALITY, PLAY_THUMBNAIL_WIDTH } from './constants';

export interface VideoMetadata {
  durationSeconds: number | null;
  thumbnail: File | null;
}

const METADATA_TIMEOUT_MS = 10_000;

/**
 * Lê a duração e captura um quadro do arquivo de vídeo no navegador do admin.
 * Formatos que o navegador não decodifica devolvem `null` nos dois campos.
 */
export function extractVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.muted = true;
    video.preload = 'metadata';
    video.playsInline = true;

    let settled = false;
    const finish = (result: VideoMetadata) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      video.removeAttribute('src');
      resolve(result);
    };
    const empty: VideoMetadata = { durationSeconds: null, thumbnail: null };
    const timer = setTimeout(() => finish(empty), METADATA_TIMEOUT_MS);

    video.onerror = () => finish(empty);
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? Math.round(video.duration) : null;
      // Um quadro logo depois do início costuma ser mais útil que o primeiro (preto).
      video.currentTime = Math.min(1, (video.duration || 0) / 2);
      video.onseeked = () => {
        try {
          const ratio = video.videoWidth ? PLAY_THUMBNAIL_WIDTH / video.videoWidth : 1;
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(video.videoWidth * ratio) || PLAY_THUMBNAIL_WIDTH;
          canvas.height = Math.round(video.videoHeight * ratio) || 360;
          canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) =>
              finish({
                durationSeconds: duration,
                thumbnail: blob ? new File([blob], 'miniatura.jpg', { type: 'image/jpeg' }) : null,
              }),
            'image/jpeg',
            PLAY_THUMBNAIL_QUALITY
          );
        } catch {
          finish({ durationSeconds: duration, thumbnail: null });
        }
      };
    };
    video.src = url;
  });
}
