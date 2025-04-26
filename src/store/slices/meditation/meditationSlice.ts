import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MediaItem } from '../types';

export type WeekDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export interface DayItem {
  id: string;
  day: WeekDay | string;
  verse: string;
  topic: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export enum WeekDayLabel {
  Monday = 'Segunda-feira',
  Tuesday = 'Terça-feira',
  Wednesday = 'Quarta-feira',
  Thursday = 'Quinta-feira',
  Friday = 'Sexta-feira',
}

export interface MeditationData {
  id: string;
  topic: string;
  startDate: string;
  endDate: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  media: MediaItem;
  days: DayItem[];
}

interface MeditationState {
  meditationData: MeditationData | null;
  media: MediaItem | null;
}

const initialState: MeditationState = {
  meditationData: null,
  media: null,
};

const meditationSlice = createSlice({
  name: 'meditation',
  initialState,
  reducers: {
    setMeditationData: (state, action: PayloadAction<MeditationData>) => {
      state.meditationData = action.payload;
    },
    clearMeditationData: (state) => {
      state.meditationData = null;
      state.media = null;
    },
    setMedia: (state, action: PayloadAction<MediaItem>) => {
      state.media = action.payload;
    },
    clearMedia: (state) => {
      state.media = null;
    },
  },
});

export const { setMeditationData, clearMeditationData, setMedia, clearMedia } =
  meditationSlice.actions;

export default meditationSlice.reducer;
