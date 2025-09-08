import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../slices';
import { MediaTargetType } from '../slices/types';
import { RoleUser } from '../slices/auth/authSlice';

export const selectVideoRoutes = createSelector(
  [(state: RootState) => state.routes.routes],
  (routes) => routes.filter((r) => r.entityType === MediaTargetType.VideosPage)
);

export const selectIsAdmin = createSelector(
  [(state: RootState) => state.auth],
  (auth) => auth.isAuthenticated && auth.user?.role === RoleUser.ADMIN
);

export const selectIsTeacher = createSelector(
  [(state: RootState) => state.auth],
  (auth) => auth.isAuthenticated && auth.user?.role === RoleUser.TEACHER
);

export const selectIsCoordinator = createSelector(
  [(state: RootState) => state.auth],
  (auth) => auth.isAuthenticated && auth.user?.role === RoleUser.COORDINATOR
);

