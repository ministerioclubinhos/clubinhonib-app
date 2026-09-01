import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { IdeasPageResponse } from '@/features/ideas-pages/types';
import type { MediaItem } from '@/store/slices/types';

/**
 * Seção em edição no fluxo de ideias compartilhadas. É um rascunho, não a
 * resposta da API: uma seção nova ainda não tem id e as mídias podem carregar
 * o arquivo escolhido no navegador.
 */
export interface IdeasSection {
  id?: string;
  public?: boolean;
  createdAt?: string;
  updatedAt?: string;
  title: string;
  description: string;
  medias: MediaItem[];
}

/**
 * Página de ideias selecionada para edição. O tipo espelha a resposta da API:
 * o `route` devolvido é um recorte, sem id nem datas.
 */
export type IdeasPageData = IdeasPageResponse;

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

export const {
  setIdeasData,
  clearIdeasData,
  setIdeasSectionData,
  clearIdeasSectionData,
} = ideasSlice.actions;
export default ideasSlice.reducer;
