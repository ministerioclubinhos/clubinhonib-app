import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

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

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['accessToken', 'refreshToken', 'isAuthenticated'],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
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

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
