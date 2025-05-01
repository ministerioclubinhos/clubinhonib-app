import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MediaItem } from '../types';

export interface EventData {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  date: string;
  location: string;
  description: string;
  media: MediaItem;
}

interface EventsState {
  events: EventData[] | null;
}

const initialState: EventsState = {
  events: null,
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<EventData[]>) => {
      state.events = action.payload;
    },
    clearEvents: (state) => {
      state.events = null;
    },
  },
});

export const { setEvents, clearEvents } = eventsSlice.actions;
export default eventsSlice.reducer;
