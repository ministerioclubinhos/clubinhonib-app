import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SectionData } from '../image-section/imageSectionSlice';

export interface PaginatedSectionResponse {
  id: string;
  title: string;
  description: string;
  public: boolean;
  createdAt: string;
  updatedAt: string;
  sections: SectionData[];
  page: number;
  limit: number;
  total: number;
}

interface ImageSectionPaginationState {
  section: PaginatedSectionResponse | null;
}

const initialState: ImageSectionPaginationState = {
  section: null,
};

const imageSectionPaginationSlice = createSlice({
  name: 'imageSectionPagination',
  initialState,
  reducers: {
    setSectionData(state, action: PayloadAction<PaginatedSectionResponse>) {
      state.section = action.payload;
    },
    appendSections(state, action: PayloadAction<SectionData[]>) {
      if (state.section) {
        state.section.sections = [...state.section.sections, ...action.payload];
      }
    },
    updatePagination(state, action: PayloadAction<{ page: number; total: number }>) {
      if (state.section) {
        state.section.page = action.payload.page;
        state.section.total = action.payload.total;
      }
    },
  },
});

export const { setSectionData, appendSections, updatePagination } =
  imageSectionPaginationSlice.actions;
export default imageSectionPaginationSlice.reducer;
