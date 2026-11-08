import { useCallback, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';

import type { RootState } from '@/store/slices';
import { extractErrorMessage } from '@/utils/apiError';
import { apiGetClubinhoFeedSections } from './api';
import {
  clubinhoFeedQueryKeys,
  FEED_CELEBRATIONS_STORAGE_KEY,
  FEED_INITIAL_PAGE,
  FEED_MESSAGES,
  FEED_SECTIONS_PAGE_SIZE,
  FEED_STALE_TIME_MS,
} from './constants';
import {
  ShareResultKind,
  type FeedSectionViewModel,
  type UseClubinhoFeedResult,
  type UseFeedCelebrationsResult,
} from './types';
import {
  buildSectionShareUrl,
  hasNextFeedPage,
  mergeFeedPages,
} from './utils';

function readStoredCelebrationIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(FEED_CELEBRATIONS_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(
      parsed.filter((item): item is string => typeof item === 'string' && item.length > 0),
    );
  } catch {
    return new Set();
  }
}

function writeStoredCelebrationIds(ids: ReadonlySet<string>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      FEED_CELEBRATIONS_STORAGE_KEY,
      JSON.stringify(Array.from(ids)),
    );
  } catch {
    // Ambientes com armazenamento bloqueado mantêm a reação em memória na sessão.
  }
}

/**
 * Orquestra o carregamento infinito, atualização e deduplicação do Feed Clubinho
 * com um único dono de estado remoto (TanStack Query).
 */
export function useClubinhoFeed(): UseClubinhoFeedResult {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const rawFeedPageId = import.meta.env.VITE_FEED_MINISTERIO_ID;
  const feedPageId =
    typeof rawFeedPageId === 'string' && rawFeedPageId.trim().length > 0
      ? rawFeedPageId.trim()
      : undefined;

  const query = useInfiniteQuery({
    queryKey: clubinhoFeedQueryKeys.sections(
      feedPageId ?? 'unconfigured',
      FEED_SECTIONS_PAGE_SIZE,
      isAuthenticated,
    ),
    enabled: Boolean(feedPageId),
    initialPageParam: FEED_INITIAL_PAGE,
    staleTime: FEED_STALE_TIME_MS,
    queryFn: ({ pageParam, signal }) =>
      apiGetClubinhoFeedSections(
        feedPageId as string,
        { page: pageParam, limit: FEED_SECTIONS_PAGE_SIZE },
        { signal },
      ),
    getNextPageParam: (lastPage) =>
      hasNextFeedPage(lastPage) ? lastPage.page + 1 : undefined,
  });

  const merged = useMemo(
    () => {
      const result = mergeFeedPages(query.data?.pages);
      return { ...result, sections: result.sections.map((section) => ({ ...section, isOwnPublication: Boolean(section.authorId && user?.id === section.authorId) })) };
    },
    [query.data?.pages, user?.id],
  );

  const loadNextPage = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      void query.fetchNextPage();
    }
  }, [query]);

  const refreshFeed = useCallback(async () => {
    if (!feedPageId) return;
    await query.refetch();
  }, [feedPageId, query]);

  const hasLoadedPages = Boolean(query.data?.pages && query.data.pages.length > 0);

  const initialErrorMessage =
    query.isError && !hasLoadedPages
      ? extractErrorMessage(query.error, FEED_MESSAGES.LOAD_ERROR)
      : null;

  const nextPageErrorMessage =
    query.isFetchNextPageError
      ? extractErrorMessage(query.error, FEED_MESSAGES.NEXT_PAGE_ERROR)
      : null;

  return {
    feedPageId,
    isMissingConfig: !feedPageId,
    pageMeta: merged.pageMeta,
    sections: merged.sections,
    totalSections: merged.totalSections,
    totalLoadedMedia: merged.totalLoadedMedia,
    isInitialLoading: Boolean(feedPageId) && query.isPending,
    isRefreshing: query.isRefetching && !query.isFetchingNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: Boolean(query.hasNextPage),
    initialErrorMessage,
    nextPageErrorMessage,
    loadNextPage,
    refreshFeed,
  };
}

/**
 * Controla microinterações locais de celebração de momentos e marcação de
 * destaques já abertos, sem armazenar qualquer dado pessoal.
 */
export function useFeedCelebrations(): UseFeedCelebrationsResult {
  const [celebratedIds, setCelebratedIds] = useState<Set<string>>(
    () => readStoredCelebrationIds(),
  );
  const [viewedStoryIds, setViewedStoryIds] = useState<Set<string>>(
    () => new Set(),
  );

  const isCelebrated = useCallback(
    (sectionId: string) => celebratedIds.has(sectionId),
    [celebratedIds],
  );

  const toggleCelebration = useCallback((sectionId: string) => {
    setCelebratedIds((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      writeStoredCelebrationIds(next);
      return next;
    });
  }, []);

  const markStoryViewed = useCallback((sectionId: string) => {
    setViewedStoryIds((prev) => {
      if (prev.has(sectionId)) return prev;
      const next = new Set(prev);
      next.add(sectionId);
      return next;
    });
  }, []);

  return {
    isCelebrated,
    toggleCelebration,
    viewedStoryIds,
    markStoryViewed,
  };
}

/** Compartilha uma publicação via Web Share API ou copia seu link direto. */
export async function shareFeedSection(
  section: FeedSectionViewModel,
): Promise<ShareResultKind> {
  if (typeof window === 'undefined') return ShareResultKind.FAILED;

  const shareUrl = buildSectionShareUrl(
    window.location.origin,
    window.location.pathname,
    section.id,
  );

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: `${section.caption} · Feed Clubinho NIB`,
        text: section.description || section.caption,
        url: shareUrl,
      });
      return ShareResultKind.SHARED_NATIVE;
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === 'AbortError') {
        return ShareResultKind.ABORTED;
      }
    }
  }

  try {
    await navigator.clipboard.writeText(shareUrl);
    return ShareResultKind.COPIED_LINK;
  } catch {
    return ShareResultKind.FAILED;
  }
}
