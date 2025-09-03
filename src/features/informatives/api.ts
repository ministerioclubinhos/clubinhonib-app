import api from '@/config/axiosConfig';
import { InformativeBannerData } from 'store/slices/informative/informativeBannerSlice';

// GET /informatives
export async function fetchBannersApi(): Promise<InformativeBannerData[]> {
  const { data } = await api.get<InformativeBannerData[]>('/informatives');
  return data;
}

// DELETE /informatives/:id
export async function deleteBannerApi(id: string): Promise<void> {
  await api.delete(`/informatives/${id}`);
}

// (Opcional – se quiser centralizar também as operações do modal)
// POST /informatives
export async function createBannerApi(payload: Pick<InformativeBannerData, 'title' | 'description'> & { public: boolean }) {
  const { data } = await api.post('/informatives', payload);
  return data as InformativeBannerData;
}

// PATCH /informatives/:id
export async function updateBannerApi(id: string, payload: Pick<InformativeBannerData, 'title' | 'description'> & { public: boolean }) {
  const { data } = await api.patch(`/informatives/${id}`, payload);
  return data as InformativeBannerData;
}
