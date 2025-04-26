import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CommentData {
  id?: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  comment: string;
  clubinho: string;
  neighborhood: string;
  published?: boolean;
}

interface CommentsState {
  comments: CommentData[] | null;
}

const initialState: CommentsState = {
  comments: null,
};

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    setComments: (state, action: PayloadAction<CommentData[]>) => {
      state.comments = action.payload;
    },
    clearComments: (state) => {
      state.comments = null;
    },
  },
});

export const { setComments, clearComments } = commentsSlice.actions;
export default commentsSlice.reducer;
