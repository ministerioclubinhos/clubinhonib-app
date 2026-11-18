import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { IdeasPageResponse } from '@/features/ideas-pages/types';

/**
 * Página de ideias selecionada para edição. O tipo espelha a resposta da API:
 * o `route` devolvido é um recorte, sem id nem datas.
 */
export type IdeasPageData = IdeasPageResponse;

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

export const {
  setIdeasData,
  clearIdeasData,
} = ideasSlice.actions;
export default ideasSlice.reducer;
