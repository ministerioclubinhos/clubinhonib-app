import api from '@/config/axiosConfig';
import { DocumentItem } from './types';

export async function listDocuments(search?: string) {
  const params = search?.trim() ? { search: search.trim() } : {};
  const { data } = await api.get<DocumentItem[]>('/documents', { params });
  return data ?? [];
}

export async function createDocument(formData: FormData) {
  await api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function updateDocument(id: string, formData: FormData) {
  await api.patch(`/documents/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function deleteDocument(id: string) {
  await api.delete(`/documents/${id}`);
}
