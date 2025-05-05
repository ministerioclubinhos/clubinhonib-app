import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ContactData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  read?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface ContactState {
  contact: ContactData | null;
}

const initialState: ContactState = {
  contact: null,
};

const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    setContact: (state, action: PayloadAction<ContactData>) => {
      state.contact = action.payload;
    },
    clearContact: (state) => {
      state.contact = null;
    },
  },
});

export const { setContact, clearContact } = contactSlice.actions;
export default contactSlice.reducer;
