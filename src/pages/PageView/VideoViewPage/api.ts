import api from '@/config/axiosConfig';
import { MediaItem } from '@/store/slices/types';
import type { VideoPageData } from '@/store/slices/video/videoSlice';

export interface GetVideoPageResponse {
  id: string;
  title: string;
  description?: string;
  public?: boolean;
  videos: Array<MediaItem>;
}

export const toVideoPageData = (dto: GetVideoPageResponse): VideoPageData => ({
  id: dto.id,
  title: dto.title,
  description: dto.description ?? '',
  public: dto.public ?? false,
  videos: Array.isArray(dto.videos) ? dto.videos : [],
});

export const videoPageApi = {
  async getById(id: string) {
    const { data } = await api.get<GetVideoPageResponse>(`/video-pages/${id}`);
    return data;
  },

  async deleteById(id: string) {
    await api.delete(`/video-pages/${id}`);
  },
};
