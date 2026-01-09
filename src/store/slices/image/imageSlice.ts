import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RouteData } from '@/store/slices/route/routeSlice';
import { MediaItem } from '@/store/slices/types';

export interface SectionData {
  id?: string;
  public: boolean;
  caption: string;
  description: string;
  mediaItems: MediaItem[];
  createdAt?: Date | string;
  updatedAt?: Date;
}

export interface ImagePageData {
  id?: string;
  public: boolean;
  title?: string | '';
  description: string;
  createdAt?: string;
  updatedAt?: string;
  sections: SectionData[];
  route?: RouteData;
}

interface ImageState {
  imageData: ImagePageData | null;
}

const initialState: ImageState = {
  imageData: null,
};

const imageSlice = createSlice({
  name: 'image',
  initialState,
  reducers: {
    setImageData: (state, action: PayloadAction<ImagePageData>) => {
      state.imageData = action.payload;
    },
    clearImageData: (state) => {
      state.imageData = null;
    },
  },
});

export const { setImageData, clearImageData } = imageSlice.actions;
export default imageSlice.reducer;
