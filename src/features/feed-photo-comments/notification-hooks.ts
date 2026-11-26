import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPhotoCommentNotifications, markPhotoCommentNotificationRead } from './api';
import {
  PHOTO_COMMENTS_INITIAL_PAGE,
  PHOTO_COMMENTS_PAGE_SIZE,
  PHOTO_NOTIFICATIONS_POLL_MS,
  photoNotificationKey,
} from './constants';

export function usePhotoCommentNotifications(userId: string | null, enabled: boolean) {
  const client = useQueryClient();
  const queryKey = photoNotificationKey(userId);
  const notifications = useInfiniteQuery({
    queryKey,
    enabled: enabled && Boolean(userId),
    initialPageParam: PHOTO_COMMENTS_INITIAL_PAGE,
    queryFn: ({ pageParam, signal }) =>
      fetchPhotoCommentNotifications({ page: pageParam, limit: PHOTO_COMMENTS_PAGE_SIZE }, signal),
    getNextPageParam: (last) => (last.page < last.pageCount ? last.page + 1 : undefined),
    retry: false,
    refetchInterval: PHOTO_NOTIFICATIONS_POLL_MS,
    refetchOnWindowFocus: true,
  });
  const markRead = useMutation({
    mutationFn: markPhotoCommentNotificationRead,
    onSuccess: () => client.invalidateQueries({ queryKey }),
  });
  return { notifications, markRead };
}
