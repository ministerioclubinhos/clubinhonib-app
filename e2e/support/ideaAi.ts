import { expect } from '@playwright/test';

import type { IdeasSectionResponse } from '@/features/ideas-sections/types';

import type { ApiClient } from './api';

/**
 * Espera a fila de IA terminar a tentativa em andamento da ideia (com
 * `AI_PROVIDER_MODE=fake` não há rede, só fila, worker e banco).
 */
export async function waitForIdeaAi(api: ApiClient, ideaId: string): Promise<IdeasSectionResponse> {
  let latest: IdeasSectionResponse | undefined;
  await expect
    .poll(
      async () => {
        latest = await api.get<IdeasSectionResponse>(`/ideas-sections/${ideaId}`);
        const ai = latest.aiEnhancement;
        return Boolean(ai && !ai.activeAttempt && ai.attemptHistory.length > 0);
      },
      { timeout: 90_000, intervals: [500, 1000, 2000] }
    )
    .toBe(true);
  return latest as IdeasSectionResponse;
}
