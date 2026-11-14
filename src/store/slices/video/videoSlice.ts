import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { VideoPageResponse } from '@/features/video-pages/types';

/**
 * Galeria selecionada para edição. O tipo espelha a resposta da API: o `route`
 * devolvido é um recorte, sem `id`, `current` nem as datas.
 */
export type VideoPageData = VideoPageResponse;

interface VideoState {
  videoData: VideoPageData | null;
}

const initialState: VideoState = {
  videoData: null,
};

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    setVideoData: (state, action: PayloadAction<VideoPageData>) => {
      state.videoData = action.payload;
    },
    clearVideoData: (state) => {
      state.videoData = null;
    },
  },
});

export const { setVideoData, clearVideoData } = videoSlice.actions;
export default videoSlice.reducer;
