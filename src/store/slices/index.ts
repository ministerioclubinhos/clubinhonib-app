import { configureStore, combineReducers } from '@reduxjs/toolkit';

import imageReducer from './image/imageSlice';
import imageSectionReducer from './image-section/imageSectionSlice';
import authReducer from './auth/authSlice';
import routesReducer from './route/routeSlice';
import videoReducer from './video/videoSlice';
import meditationReducer from './meditation/meditationSlice';
import weekMaterialReducer from './week-material/weekMaterialSlice';
import eventsReducer from './events/eventsSlice';
import commentsReducer from './comment/commentsSlice';
import documentReducer from './documents/documentSlice';
import ideasReducer from './ideas/ideasSlice';
import informativeBannerReducer from './informative/informativeBannerSlice';
import imageSectionPaginationReducer from './image-section-pagination/imageSectionPaginationSlice';
import feedbackReducer from './feedback/feedbackSlice';
import { configureApiAuth } from '@/config/axiosConfig';
import { logout, tokensRefreshed } from './auth/authSlice';
import { readAuthTokens } from './auth/authStorage';

const rootReducer = combineReducers({
  auth: authReducer,
  image: imageReducer,
  imageSection: imageSectionReducer,
  routes: routesReducer,
  video: videoReducer,
  meditation: meditationReducer,
  weekMaterial: weekMaterialReducer,
  events: eventsReducer,
  comments: commentsReducer,
  document: documentReducer,
  ideas: ideasReducer,
  informativeBanner: informativeBannerReducer,
  imageSectionPagination: imageSectionPaginationReducer,
  feedback: feedbackReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

configureApiAuth({
  getTokens: () => {
    const { accessToken, refreshToken } = store.getState().auth;
    return { accessToken, refreshToken };
  },
  onTokensRefreshed: (tokens) => {
    store.dispatch(tokensRefreshed(tokens));
  },
  onSessionExpired: () => {
    store.dispatch(logout());
  },
});

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== 'accessToken' && event.key !== 'refreshToken') return;

    const storedTokens = readAuthTokens();
    const current = store.getState().auth;
    if (!storedTokens) {
      if (current.accessToken || current.refreshToken) store.dispatch(logout());
      return;
    }

    if (
      storedTokens.accessToken !== current.accessToken ||
      storedTokens.refreshToken !== current.refreshToken
    ) {
      store.dispatch(tokensRefreshed(storedTokens));
    }
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
