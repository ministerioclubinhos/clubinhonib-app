import api from "@/config/axiosConfig";
import { MediaItem } from "@/store/slices/types";
 import type { VideoPageData } from "@/store/slices/video/videoSlice";

export interface GetVideoPageResponse {
  id: string;
  title: string;
  description?: string;
  public?: boolean; // pode vir faltando do backend
  videos: Array<MediaItem>; // ideal: tipar com MediaItem
}

/**
 * Adapter para converter a resposta da API no shape do Redux
 */
export const toVideoPageData = (dto: GetVideoPageResponse)  : VideoPageData => ({
  id: dto.id,
  title: dto.title,
  description: dto.description ?? "",
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
