import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RouteData } from '@/store/slices/route/routeSlice';
import { MediaItem } from '@/store/slices/types';

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
  ideasSectionData: IdeasSection | null;
}

const initialState: IdeasState = {
  ideasData: null,
  ideasSectionData: null,
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
    setIdeasSectionData: (state, action: PayloadAction<IdeasSection>) => {
      state.ideasSectionData = action.payload;
    },
    clearIdeasSectionData: (state) => {
      state.ideasSectionData = null;
    },
  },
});

export const { setIdeasData, clearIdeasData, setIdeasSectionData, clearIdeasSectionData } =
  ideasSlice.actions;
export default ideasSlice.reducer;
