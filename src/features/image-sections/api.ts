import api from '@/config/axiosConfig';
import { SectionData } from '@/store/slices/image-section/imageSectionSlice';

export async function listImageSections(): Promise<SectionData[]> {
  const { data } = await api.get('/image-sections');
  return data as SectionData[];
}

export async function deleteImageSection(id: string): Promise<void> {
  await api.delete(`/image-sections/${id}`);
}
