import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MediaItem } from '../types';

export interface DocumentData {
  id?: string;
  name: string;
  description?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  media: MediaItem | null;
}

interface DocumentState {
  documentData: DocumentData | null;
  media: MediaItem | null;
}

const initialState: DocumentState = {
  documentData: null,
  media: null,
};

const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    setDocumentData: (state, action: PayloadAction<DocumentData>) => {
      state.documentData = action.payload;
    },
    clearDocumentData: (state) => {
      state.documentData = null;
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

export const { setDocumentData, clearDocumentData, setMedia, clearMedia } = documentSlice.actions;

export default documentSlice.reducer;
