import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MediaItem } from '@/store/slices/types';
import type {
  MeditationDayResponse,
  MeditationResponse,
} from '@/features/meditations/types';

export type WeekDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

/** @deprecated Use `MeditationDayResponse` de `@/features/meditations`. */
export type DayItem = MeditationDayResponse;

export enum WeekDayLabel {
  Monday = 'Segunda-feira',
  Tuesday = 'Terça-feira',
  Wednesday = 'Quarta-feira',
  Thursday = 'Quinta-feira',
  Friday = 'Sexta-feira',
}

/** Meditação selecionada para edição/visualização. */
export type MeditationData = MeditationResponse;

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
