import api from '@/config/axiosConfig';
import { IdeasSection, IdeasPage, SectionData } from './types';

export async function listIdeasSections(): Promise<IdeasSection[]> {
  const { data } = await api.get('/ideas-sections');
  return data as IdeasSection[];
}

export async function listIdeasPages(): Promise<IdeasPage[]> {
  const { data } = await api.get('/ideas-pages');
  return data as IdeasPage[];
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
