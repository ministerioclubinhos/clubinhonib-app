import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RouteData } from '../route/routeSlice';
import { MediaItem } from '../types';
import api from '../../../config/axiosConfig';

export interface WeekMaterialPageData {
  id: string;
  title: string;
  subtitle: string;
  currentWeek?: boolean;
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

// ✅ Thunk para buscar o material da semana atual
export const fetchCurrentWeekMaterial = createAsyncThunk<WeekMaterialPageData>(
  'studyMaterial/fetchCurrentWeek',
  async () => {
    const response = await api.get<WeekMaterialPageData>('/week-material-pages/current-week');
    return response.data;
  }
);

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
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentWeekMaterial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentWeekMaterial.fulfilled, (state, action) => {
        state.loading = false;
        state.weekMaterialSData = action.payload;
      })
      .addCase(fetchCurrentWeekMaterial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Erro ao buscar material da semana.';
      });
  },
});

export const { setWeekMaterialData, clearWeekMaterialData } = studyMaterialSlice.actions;
export default studyMaterialSlice.reducer;
