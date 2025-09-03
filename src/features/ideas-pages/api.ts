import api from '@/config/axiosConfig';
import { IdeasPageData } from 'store/slices/ideas/ideasSlice';

export async function apiListIdeasPages() {
  const { data } = await api.get<IdeasPageData[]>('/ideas-pages');
  return data;
}

export async function apiDeleteIdeasPage(id: string) {
  await api.delete(`/ideas-pages/${id}`);
}
