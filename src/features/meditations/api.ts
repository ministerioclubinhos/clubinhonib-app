import api from '@/config/axiosConfig';
import type { MeditationData } from '@/store/slices/meditation/meditationSlice';

export async function listMeditations(): Promise<MeditationData[]> {
  const res = await api.get('/meditations');
  return (res.data || []).map((item: any) => ({
    ...item.meditation,
    media: {
      ...item.meditation.media,
      mediaType: item.meditation.media.mediaType,
      uploadType: item.meditation.media.uploadType,
      platformType: item.meditation.media.platformType,
    },
  })) as MeditationData[];
}

export async function deleteMeditation(id: string): Promise<void> {
  await api.delete(`/meditations/${id}`);
}
