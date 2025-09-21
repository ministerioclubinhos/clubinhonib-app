import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/slices';
import { MediaTargetType } from 'store/slices/types';

export const useTeacherArea = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const routes = useSelector((state: RootState) => state.routes.routes);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const today = new Date();
  const weekday = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const showWeek = true;  
  const showMeditation = routes.some(
    (r) => r.entityType === 'MeditationDay' && r.path.toLowerCase().includes(weekday)
  );

  return {
    loading,
    showWeek,
    showMeditation,
  };
};
