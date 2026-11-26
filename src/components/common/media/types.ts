import { MediaPlatform, MediaType } from '@/store/slices/types';

/** Configuração do editor de mídia compartilhado, por tipo de mídia. */
export interface MediaEditorConfig {
  mediaType: MediaType;
  /** Substantivo no singular usado em rótulos e diálogos, ex.: "Vídeo". */
  label: string;
  /** Artigo + substantivo usados em frases, ex.: "este vídeo". */
  confirmLabel: string;
  urlLabel: string;
  uploadLabel: string;
  addLabel: string;
  accept: string;
  platforms: MediaPlatform[];
  defaultPlatform: MediaPlatform;
  /** Se um item enviado é pré-visualizado em diálogo em vez de inline. */
  previewInDialog?: boolean;
}

/** Estado local de validação do formulário do editor de mídia. */
export interface MediaEditorErrors {
  title: boolean;
  description: boolean;
  url: boolean;
}

/** Como o visualizador mostra uma mídia. */
export enum MediaViewKind {
  IMAGE = 'image',
  VIDEO_FILE = 'video-file',
  AUDIO_FILE = 'audio-file',
  /** Iframe: YouTube, PDF, Drive, OneDrive, Dropbox. */
  EMBED = 'embed',
  /** Formato que o navegador não renderiza (ex.: .docx): abrir ou baixar. */
  DOWNLOAD = 'download',
}

/** Resultado de `resolveMediaView`: o que renderizar e de onde. */
export interface MediaView {
  kind: MediaViewKind;
  src: string;
}
