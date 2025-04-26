import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RouteData } from '../route/routeSlice';
import { MediaItem } from '../types';

export interface VideoPageData {
  id?: string;
  public: boolean;
  title: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  videos: MediaItem[];
  route?: RouteData;
}

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
