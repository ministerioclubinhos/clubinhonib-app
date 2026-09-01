import api from '@/config/axiosConfig';
import { apiListIdeasPages } from '@/features/ideas-pages/api';
import { IdeasSection, IdeasPage } from './types';

export async function listIdeasSections(): Promise<IdeasSection[]> {
  const { data } = await api.get('/ideas-sections');
  return data as IdeasSection[];
}

/** Páginas de ideias disponíveis para publicar uma seção. */
export async function listIdeasPages(): Promise<IdeasPage[]> {
  return apiListIdeasPages();
}

export async function deleteIdeasSection(id: string): Promise<void> {
  await api.delete(`/ideas-sections/${id}`);
}

export async function updateIdeasSection(
  sectionId: string,
  pageId: string,
  payload: FormData
): Promise<void> {
  await api.patch(`/ideas-sections/${sectionId}/attach/${pageId}`, payload, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

