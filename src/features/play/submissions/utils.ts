import { MediaUploadType } from '@/store/slices/types';
import { getYouTubeId } from '@/utils/video';
import {
  PLAY_SUBMISSION_MAX_VIDEO_BYTES,
  PLAY_SUBMISSION_PAYLOAD_FIELD,
  PLAY_SUBMISSION_THUMBNAIL_FIELD,
  PLAY_SUBMISSION_TITLE_MAX_LENGTH,
  PLAY_SUBMISSION_VIDEO_FIELD,
} from './constants';
import type { PlaySubmissionDraft } from './types';

export type PlaySubmissionErrors = Partial<Record<'title' | 'url' | 'file', string>>;

/** O link precisa ser de um vídeo do YouTube. */
export const isYouTubeLink = (url: string): boolean => {
  try {
    const parsed = new URL(url.trim());
    const host = parsed.hostname.toLowerCase();
    const known = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'];
    return known.includes(host) && Boolean(getYouTubeId(url.trim()));
  } catch {
    return false;
  }
};

/** Valida o que a API também cobra, para o erro aparecer antes do envio. */
export function validateSubmission(draft: PlaySubmissionDraft): PlaySubmissionErrors {
  const errors: PlaySubmissionErrors = {};
  if (!draft.title.trim()) errors.title = 'Dê um título ao vídeo.';
  else if (draft.title.length > PLAY_SUBMISSION_TITLE_MAX_LENGTH) {
    errors.title = 'Use até 255 caracteres.';
  }
  if (draft.mode === 'link') {
    if (!isYouTubeLink(draft.url)) errors.url = 'Cole um link válido do YouTube.';
  } else if (!draft.file) {
    errors.file = 'Selecione o arquivo de vídeo.';
  } else if (!draft.file.type.startsWith('video/')) {
    errors.file = 'O arquivo precisa ser um vídeo.';
  } else if (draft.file.size > PLAY_SUBMISSION_MAX_VIDEO_BYTES) {
    errors.file = 'O vídeo deve ter até 100 MB.';
  }
  return errors;
}

/** Monta o multipart: JSON em `submissionData` e os arquivos nos demais campos. */
export function buildSubmissionFormData(draft: PlaySubmissionDraft): FormData {
  const isUpload = draft.mode === 'upload';
  const formData = new FormData();
  formData.append(
    PLAY_SUBMISSION_PAYLOAD_FIELD,
    JSON.stringify({
      title: draft.title.trim(),
      description: draft.description.trim(),
      uploadType: isUpload ? MediaUploadType.UPLOAD : MediaUploadType.LINK,
      ...(isUpload ? {} : { url: draft.url.trim() }),
      ...(isUpload && draft.durationSeconds !== null
        ? { durationSeconds: draft.durationSeconds }
        : {}),
    })
  );
  if (isUpload && draft.file) formData.append(PLAY_SUBMISSION_VIDEO_FIELD, draft.file);
  if (isUpload && draft.thumbnail) {
    formData.append(PLAY_SUBMISSION_THUMBNAIL_FIELD, draft.thumbnail);
  }
  return formData;
}

/** 1536000 → "1,5 MB". */
export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return `${mb.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`;
}
