import type { AxiosRequestConfig } from 'axios';

import api from '@/config/axiosConfig';
import { FEED_IMAGE_PAGES_ENDPOINT } from './constants';
import type {
  ClubinhoFeedPageDto,
  QueryClubinhoFeedSectionsParams,
} from './types';
import { buildFeedSectionsQuery } from './utils';

/**
 * Busca uma página de seções publicadas (e privadas, quando há sessão ativa)
 * da galeria associada ao Feed Clubinho.
 *
 * `skipGlobalError` é ativado porque o Feed Clubinho renderiza estados locais
 * completos de falha inicial e de falha ao carregar próximas páginas, evitando
 * toasts duplicados durante tentativas do TanStack Query.
 */
export async function apiGetClubinhoFeedSections(
  pageId: string,
  params: QueryClubinhoFeedSectionsParams,
  config?: AxiosRequestConfig,
): Promise<ClubinhoFeedPageDto> {
  const safeParams = buildFeedSectionsQuery(params.page, params.limit);

  const { data } = await api.get<ClubinhoFeedPageDto>(
    `${FEED_IMAGE_PAGES_ENDPOINT}/${pageId}/sections`,
    {
      skipGlobalError: true,
      ...config,
      params: safeParams,
    },
  );

  return data;
}
