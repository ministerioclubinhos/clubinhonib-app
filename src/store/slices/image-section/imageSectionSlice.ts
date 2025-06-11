import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MediaItem } from '@/store/slices/types';

export interface SectionData {
  id?: string;
  public: boolean;
  caption: string;
  description: string;
  mediaItems: MediaItem[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

interface ImageSectionState {
  data: SectionData | null;
}

const initialState: ImageSectionState = {
  data: null,
};

const imageSectionSlice = createSlice({
  name: 'imageSection',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<SectionData>) => {
      state.data = action.payload;
    },
    clearData: (state) => {
      state.data = null;
    },
  },
});

export const { setData, clearData } = imageSectionSlice.actions;
export default imageSectionSlice.reducer;
