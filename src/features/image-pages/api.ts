import api from '@/config/axiosConfig';
import { ImagePageData } from 'store/slices/image/imageSlice';

export async function apiListImagePages(): Promise<ImagePageData[]> {
  const { data } = await api.get('/image-pages');
  return data as ImagePageData[];
}

export async function apiDeleteImagePage(id: string): Promise<void> {
  await api.delete(`/image-pages/${id}`);
}
