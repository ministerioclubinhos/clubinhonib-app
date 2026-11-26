import { MediaPlatform, MediaType } from '@/store/slices/types';
import { MediaEditorConfig } from './types';

const DOCUMENT_PLATFORMS = [
  MediaPlatform.GOOGLE_DRIVE,
  MediaPlatform.ONEDRIVE,
  MediaPlatform.DROPBOX,
];

/** Rótulos legíveis das plataformas oferecidas para mídia por link. */
export const MEDIA_PLATFORM_LABELS: Record<MediaPlatform, string> = {
  [MediaPlatform.YOUTUBE]: 'YouTube',
  [MediaPlatform.GOOGLE_DRIVE]: 'Google Drive',
  [MediaPlatform.ONEDRIVE]: 'OneDrive',
  [MediaPlatform.DROPBOX]: 'Dropbox',
  [MediaPlatform.ANY]: 'Outro',
};

/** Configuração do editor de mídia compartilhado, por tipo de mídia. */
export const MEDIA_EDITOR_CONFIG: Record<MediaType, MediaEditorConfig> = {
  [MediaType.VIDEO]: {
    mediaType: MediaType.VIDEO,
    label: 'Vídeo',
    confirmLabel: 'este vídeo',
    urlLabel: 'URL do Vídeo',
    uploadLabel: 'Upload de Vídeo',
    addLabel: 'Adicionar Vídeo',
    accept: 'video/*',
    platforms: [MediaPlatform.YOUTUBE, ...DOCUMENT_PLATFORMS],
    defaultPlatform: MediaPlatform.YOUTUBE,
  },
  [MediaType.DOCUMENT]: {
    mediaType: MediaType.DOCUMENT,
    label: 'Documento',
    confirmLabel: 'este documento',
    urlLabel: 'URL do Documento',
    uploadLabel: 'Upload de Documento',
    addLabel: 'Adicionar Documento',
    accept: '.pdf,.doc,.docx',
    platforms: DOCUMENT_PLATFORMS,
    defaultPlatform: MediaPlatform.GOOGLE_DRIVE,
    previewInDialog: true,
  },
  [MediaType.IMAGE]: {
    mediaType: MediaType.IMAGE,
    label: 'Imagem',
    confirmLabel: 'esta imagem',
    urlLabel: 'URL da Imagem',
    uploadLabel: 'Upload de Imagem',
    addLabel: 'Adicionar Imagem',
    accept: 'image/*',
    platforms: DOCUMENT_PLATFORMS,
    defaultPlatform: MediaPlatform.GOOGLE_DRIVE,
  },
  [MediaType.AUDIO]: {
    mediaType: MediaType.AUDIO,
    label: 'Áudio',
    confirmLabel: 'este áudio',
    urlLabel: 'URL do Áudio',
    uploadLabel: 'Upload de Áudio MP3',
    addLabel: 'Adicionar Áudio',
    accept: 'audio/mp3,audio/mpeg',
    platforms: DOCUMENT_PLATFORMS,
    defaultPlatform: MediaPlatform.GOOGLE_DRIVE,
  },
};
