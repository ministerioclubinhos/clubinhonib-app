import api from '@/config/axiosConfig';
import { MULTIPART_HEADERS, WEEK_MATERIALS_ENDPOINT } from './constants';
import { WeekMaterialResponse } from './types';
import { sortByCreationDesc } from './utils';

/** Lists every week material page, newest first. */
export async function listWeekMaterials(): Promise<WeekMaterialResponse[]> {
  const { data } = await api.get<WeekMaterialResponse[]>(
    WEEK_MATERIALS_ENDPOINT,
  );
  return sortByCreationDesc(data);
}

/** Loads a single week material page with its media. */
export async function getWeekMaterial(
  id: string,
): Promise<WeekMaterialResponse> {
  const { data } = await api.get<WeekMaterialResponse>(
    `${WEEK_MATERIALS_ENDPOINT}/${id}`,
  );
  return data;
}

/** Loads the page published as the current week material, if any. */
export async function getCurrentWeekMaterial(): Promise<WeekMaterialResponse | null> {
  const { data } = await api.get<WeekMaterialResponse | null>(
    `${WEEK_MATERIALS_ENDPOINT}/current-week`,
  );
  return data;
}

/** Creates a week material page from a multipart body. */
export async function createWeekMaterial(
  formData: FormData,
): Promise<WeekMaterialResponse> {
  const { data } = await api.post<WeekMaterialResponse>(
    WEEK_MATERIALS_ENDPOINT,
    formData,
    { headers: MULTIPART_HEADERS },
  );
  return data;
}

/** Updates a week material page from a multipart body. */
export async function updateWeekMaterial(
  id: string,
  formData: FormData,
): Promise<WeekMaterialResponse> {
  const { data } = await api.patch<WeekMaterialResponse>(
    `${WEEK_MATERIALS_ENDPOINT}/${id}`,
    formData,
    { headers: MULTIPART_HEADERS },
  );
  return data;
}

/** Deletes a week material page, its media and its route. */
export async function deleteWeekMaterial(id: string): Promise<void> {
  await api.delete(`${WEEK_MATERIALS_ENDPOINT}/${id}`);
}

/** Publishes a page as the current week material and returns the saved page. */
export async function setCurrentWeek(
  id: string,
): Promise<WeekMaterialResponse> {
  const { data } = await api.post<WeekMaterialResponse>(
    `${WEEK_MATERIALS_ENDPOINT}/current-week/${id}`,
  );
  return data;
}
