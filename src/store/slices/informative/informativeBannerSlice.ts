import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface InformativeBannerData {
  id?: string;
  title: string;
  description: string;
  public: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface InformativeBannerState {
  banner: InformativeBannerData | null;
}

const initialState: InformativeBannerState = {
  banner: null,
};

const informativeBannerSlice = createSlice({
  name: 'informativeBanner',
  initialState,
  reducers: {
    setInformativeBanner: (state, action: PayloadAction<InformativeBannerData>) => {
      state.banner = action.payload;
    },
    clearInformativeBanner: (state) => {
      state.banner = null;
    },
  },
});

export const { setInformativeBanner, clearInformativeBanner } = informativeBannerSlice.actions;
export default informativeBannerSlice.reducer;
