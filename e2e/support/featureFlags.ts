import type { ApiClient } from './api';
import { assertLocalApi, EMAIL_FLAG_PREFIX, type FeatureFlag } from './emailFlags';

interface FlagsPage {
  data: FeatureFlag[];
  pageCount: number;
}

const FLAGS_PAGE_LIMIT = 100;

/**
 * Liga todas as flags de produto desligadas (nunca as `email_*`) e devolve uma
 * função que as desliga de volta. É o que permite a um teste percorrer telas
 * que o ambiente local mantém escondidas, sem deixar a configuração alterada.
 */
export async function enableProductFlags(api: ApiClient): Promise<() => Promise<void>> {
  assertLocalApi();

  const turnedOn: string[] = [];
  for (let page = 1; ; page += 1) {
    const response = await api.get<FlagsPage>('/feature-flags', { page, limit: FLAGS_PAGE_LIMIT });
    for (const flag of response.data) {
      if (!flag.enabled && !flag.key.startsWith(EMAIL_FLAG_PREFIX)) turnedOn.push(flag.key);
    }
    if (response.data.length === 0 || page >= (response.pageCount || 1)) break;
  }

  for (const key of turnedOn) await api.patch(`/feature-flags/${key}`, { enabled: true });

  return async () => {
    for (const key of turnedOn) await api.patch(`/feature-flags/${key}`, { enabled: false });
  };
}
