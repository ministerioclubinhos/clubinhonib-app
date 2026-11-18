import {
  apiDeleteVideoPage,
  apiGetVideoPage,
  type VideoPageResponse,
} from "@/features/video-pages";

/** @deprecated Use `VideoPageResponse` de `@/features/video-pages`. */
export type GetVideoPageResponse = VideoPageResponse;

export const videoPageApi = {
  getById: apiGetVideoPage,
  deleteById: apiDeleteVideoPage,
};
