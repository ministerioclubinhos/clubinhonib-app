import type { IdeasPageResponse } from '@/features/ideas-pages/types';

export interface MediaItem {
  id: string;
  title: string;
  description: string;
  uploadType: 'upload' | 'link';
  mediaType: 'image' | 'video' | 'audio' | 'document';
  isLocalFile: boolean;
  url: string;
  platformType: string | null;
  originalName: string | null;
  size: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IdeasSection {
  id: string;
  title: string;
  description: string;
  public: boolean;
  createdAt: string;
  updatedAt: string;
  medias: MediaItem[];
}

/**
 * Página de ideias, como a API devolve. Reaproveita o contrato da feature de
 * páginas de ideias: manter uma cópia aqui já fez o tipo divergir do que a API
 * realmente envia.
 */
export type IdeasPage = IdeasPageResponse;

export interface SectionData {
  title: string;
  description: string;
  public: boolean;
  medias: MediaItem[];
}

export interface UpdateSectionPayload {
  sectionData: SectionData;
  files?: File[];
}

