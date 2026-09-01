import api from '@/config/axiosConfig';
import { MEDITATIONS_ENDPOINT, MULTIPART_HEADERS } from './constants';
import { MeditationResponse } from './types';

/** Lista todas as meditações cadastradas. */
export async function listMeditations(): Promise<MeditationResponse[]> {
  const { data } = await api.get<MeditationResponse[]>(MEDITATIONS_ENDPOINT);
  return data;
}

/** Carrega uma meditação pelo id. */
export async function getMeditation(id: string): Promise<MeditationResponse> {
  const { data } = await api.get<MeditationResponse>(
    `${MEDITATIONS_ENDPOINT}/${id}`,
  );
  return data;
}

/** Meditação que cobre a data de hoje, quando existir. */
export async function getThisWeekMeditation(): Promise<MeditationResponse | null> {
  const { data } = await api.get<MeditationResponse | null>(
    `${MEDITATIONS_ENDPOINT}/this-week`,
  );
  return data;
}

/** Exclui uma meditação, sua mídia e sua rota. */
export async function deleteMeditation(id: string): Promise<void> {
  await api.delete(`${MEDITATIONS_ENDPOINT}/${id}`);
}

/** Cria uma meditação a partir do corpo multipart. */
export async function createMeditation(
  formData: FormData,
): Promise<MeditationResponse> {
  const { data } = await api.post<MeditationResponse>(
    MEDITATIONS_ENDPOINT,
    formData,
    { headers: MULTIPART_HEADERS },
  );
  return data;
}

/** Atualiza uma meditação a partir do corpo multipart. */
export async function updateMeditation(
  id: string,
  formData: FormData,
): Promise<MeditationResponse> {
  const { data } = await api.patch<MeditationResponse>(
    `${MEDITATIONS_ENDPOINT}/${id}`,
    formData,
    { headers: MULTIPART_HEADERS },
  );
  return data;
}
