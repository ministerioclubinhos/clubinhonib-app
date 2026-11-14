import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { WeekMaterialResponse } from '@/features/week-materials/types';

interface WeekMaterialState {
  /** Page selected in the admin list and edited by the admin form. */
  weekMaterialSData: WeekMaterialResponse | null;
}

const initialState: WeekMaterialState = {
  weekMaterialSData: null,
};

const weekMaterialSlice = createSlice({
  name: 'weekMaterial',
  initialState,
  reducers: {
    setWeekMaterialData: (
      state,
      action: PayloadAction<WeekMaterialResponse>,
    ) => {
      state.weekMaterialSData = action.payload;
    },
    clearWeekMaterialData: (state) => {
      state.weekMaterialSData = null;
    },
  },
});

export const { setWeekMaterialData, clearWeekMaterialData } =
  weekMaterialSlice.actions;
export default weekMaterialSlice.reducer;
