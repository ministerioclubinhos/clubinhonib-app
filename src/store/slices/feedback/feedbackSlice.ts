import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FeedbackData {
  id?: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  email?: string;
  rating: number;
  comment: string;
  category: string;
  read: boolean;
}

interface FeedbackState {
  feedbacks: FeedbackData[] | null;
}

const initialState: FeedbackState = {
  feedbacks: null,
};

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    setFeedbacks: (state, action: PayloadAction<FeedbackData[]>) => {
      state.feedbacks = action.payload;
    },
    clearFeedbacks: (state) => {
      state.feedbacks = null;
    },
  },
});

export const { setFeedbacks, clearFeedbacks } = feedbackSlice.actions;
export default feedbackSlice.reducer;
