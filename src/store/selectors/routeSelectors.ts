import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../slices';
import { MediaTargetType } from '../slices/types';
import { UserRole } from '@/types/shared';

export const selectVideoRoutes = createSelector(
  [(state: RootState) => state.routes.routes],
  (routes) => routes.filter((r) => r.entityType === MediaTargetType.VideosPage)
);

export const selectIsAdmin = createSelector(
  [(state: RootState) => state.auth],
  (auth) => auth.isAuthenticated && auth.user?.role === UserRole.ADMIN
);

export const selectIsTeacher = createSelector(
  [(state: RootState) => state.auth],
  (auth) => auth.isAuthenticated && auth.user?.role === UserRole.TEACHER
);

export const selectIsCoordinator = createSelector(
  [(state: RootState) => state.auth],
  (auth) => auth.isAuthenticated && auth.user?.role === UserRole.COORDINATOR
);

