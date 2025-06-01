import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RouteData } from '@/store/slices/route/routeSlice';
import { MediaItem } from '@/store/slices/types';

export interface WeekMaterialPageData {
  id: string;
  title: string;
  subtitle: string;
  currentWeek: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
  videos: MediaItem[];
  documents: MediaItem[];
  images: MediaItem[];
  audios: MediaItem[];
  route: RouteData;
}

interface WeekMaterialState {
  weekMaterialSData: WeekMaterialPageData | null;
  loading: boolean;
  error: string | null;
}

// Estado inicial
const initialState: WeekMaterialState = {
  weekMaterialSData: null,
  loading: false,
  error: null,
};

// Slice
const studyMaterialSlice = createSlice({
  name: 'studyMaterial',
  initialState,
  reducers: {
    setWeekMaterialData: (state, action: PayloadAction<WeekMaterialPageData>) => {
      state.weekMaterialSData = action.payload;
    },
    clearWeekMaterialData: (state) => {
      state.weekMaterialSData = null;
    },
  },
});

export const { setWeekMaterialData, clearWeekMaterialData } = studyMaterialSlice.actions;
export default studyMaterialSlice.reducer;