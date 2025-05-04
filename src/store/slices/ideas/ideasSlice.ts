import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RouteData } from '../route/routeSlice';
import { MediaItem } from '../types';

export interface IdeasSection {
  id?: string;
  public?: boolean;
  createdAt?: string;
  updatedAt?: string;
  title: string;
  description: string;
  medias: MediaItem[];
}

export interface IdeasPageData {
  id?: string;
  public?: boolean;
  title: string;
  subtitle?: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  sections: IdeasSection[];
  route?: RouteData;
}

interface IdeasState {
  ideasData: IdeasPageData | null;
}

const initialState: IdeasState = {
  ideasData: null,
};

const ideasSlice = createSlice({
  name: 'ideas',
  initialState,
  reducers: {
    setIdeasData: (state, action: PayloadAction<IdeasPageData>) => {
      state.ideasData = action.payload;
    },
    clearIdeasData: (state) => {
      state.ideasData = null;
    },
  },
});

export const { setIdeasData, clearIdeasData } = ideasSlice.actions;
export default ideasSlice.reducer;
