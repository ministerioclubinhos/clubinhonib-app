import { useSelector } from 'react-redux';
import { RootState } from '@/store/slices';
import { useVisibleRoutes } from '@/features/feature-flags';

export const useTeacherArea = () => {
  const routesLoading = useSelector((state: RootState) => state.routes.loading);
  const routes = useVisibleRoutes();

  const today = new Date();
  const weekday = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const showWeek = true;
  const showMeditation = routes.some(
    (r) => r.entityType === 'MeditationDay' && r.path.toLowerCase().includes(weekday)
  );

  return {
    loading: routesLoading && routes.length === 0,
    showWeek,
    showMeditation,
  };
};
