import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type {
  ImagePageResponse,
  ImageSectionResponse,
} from '@/features/image-pages/types';

/** @deprecated Use `ImageSectionResponse` de `@/features/image-pages`. */
export type SectionData = ImageSectionResponse;

/**
 * Galeria selecionada para edição. O tipo espelha a resposta da API: o `route`
 * devolvido é um recorte, e título/descrição das mídias são opcionais.
 */
export type ImagePageData = ImagePageResponse;

interface ImageState {
  imageData: ImagePageData | null;
}

const initialState: ImageState = {
  imageData: null,
};

const imageSlice = createSlice({
  name: 'image',
  initialState,
  reducers: {
    setImageData: (state, action: PayloadAction<ImagePageData>) => {
      state.imageData = action.payload;
    },
    clearImageData: (state) => {
      state.imageData = null;
    },
  },
});

export const { setImageData, clearImageData } = imageSlice.actions;
export default imageSlice.reducer;
