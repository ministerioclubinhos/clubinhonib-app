import api from '@/config/axiosConfig';
import { WeekMaterialPageData } from '@/store/slices/week-material/weekMaterialSlice';

export async function listWeekMaterials(): Promise<WeekMaterialPageData[]> {
  const { data } = await api.get<WeekMaterialPageData[]>('/week-material-pages');
  return [...data].sort(
    (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
  );
}

export async function deleteWeekMaterial(id: string): Promise<void> {
  await api.delete(`/week-material-pages/${id}`);
}

export async function setCurrentWeek(id: string): Promise<void> {
  await api.post(`/week-material-pages/current-week/${id}`);
}
