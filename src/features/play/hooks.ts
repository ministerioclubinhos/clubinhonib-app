import { useCallback, useEffect, useRef, useState } from 'react';

import { extractErrorMessage, isCancelledRequest } from '@/utils/apiError';
import {
  apiGetPlayHome,
  apiGetPlayVideo,
  apiListPlayCategories,
  apiListPlayVideos,
  apiListRelatedPlayVideos,
} from './api';
import { PLAY_PAGE_SIZE } from './constants';
import type {
  PaginatedPlayVideos,
  PlayCategory,
  PlayHome,
  PlayVideo,
  PlayVideoQuery,
} from './types';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
  /** Troca o dado em memória (atualizações otimistas). */
  setData: (updater: (current: T | null) => T | null) => void;
}

/** Carrega um recurso, cancela a requisição anterior e permite tentar de novo. */
function useAsync<T>(
  load: (signal: AbortSignal) => Promise<T>,
  deps: ReadonlyArray<unknown>,
  failureMessage: string
): AsyncState<T> {
  const [data, setDataState] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    loadRef
      .current(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setDataState(result);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted || isCancelledRequest(err)) return;
        setError(extractErrorMessage(err, failureMessage));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [...deps, retryToken]);

  const retry = useCallback(() => setRetryToken((token) => token + 1), []);
  const setData = useCallback(
    (updater: (current: T | null) => T | null) => setDataState((current) => updater(current)),
    []
  );

  return { data, loading, error, retry, setData };
}

export const usePlayHome = (): AsyncState<PlayHome> =>
  useAsync(
    (signal) => apiGetPlayHome({ signal }),
    [],
    'Não foi possível carregar o Clubinho Play.'
  );

export const usePlayCategories = (): AsyncState<PlayCategory[]> =>
  useAsync(
    (signal) => apiListPlayCategories({ signal }),
    [],
    'Não foi possível carregar as categorias.'
  );

/** Busca paginada com filtros; refaz quando qualquer filtro muda. */
export const usePlayVideos = (query: PlayVideoQuery): AsyncState<PaginatedPlayVideos> =>
  useAsync(
    (signal) => apiListPlayVideos({ limit: PLAY_PAGE_SIZE, ...query }, { signal }),
    [
      query.page,
      query.search,
      query.categoryId,
      query.galleryId,
      query.favorites,
      query.inProgress,
      query.sort,
    ],
    'Não foi possível carregar os vídeos.'
  );

export const usePlayVideo = (id: string): AsyncState<PlayVideo> =>
  useAsync((signal) => apiGetPlayVideo(id, { signal }), [id], 'Não foi possível carregar o vídeo.');

export const useRelatedPlayVideos = (id: string): AsyncState<PlayVideo[]> =>
  useAsync(
    (signal) => apiListRelatedPlayVideos(id, { signal }),
    [id],
    'Não foi possível carregar os próximos vídeos.'
  );
