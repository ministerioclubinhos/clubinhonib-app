import api from '@/config/axiosConfig';
import { VideoPageData } from 'store/slices/video/videoSlice';

export async function apiListVideoPages(): Promise<VideoPageData[]> {
  const { data } = await api.get<VideoPageData[]>('/video-pages');
  return data ?? [];
}

export async function apiDeleteVideoPage(id: string): Promise<void> {
  await api.delete(`/video-pages/${id}`);
}
