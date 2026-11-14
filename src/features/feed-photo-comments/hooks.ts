import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PHOTO_COMMENTS_INITIAL_PAGE,
  PHOTO_COMMENTS_PAGE_SIZE,
  PHOTO_COMMENTS_STALE_TIME_MS,
  photoCommentKeys,
} from './constants';
import {
  createPhotoComment,
  deletePhotoComment,
  fetchOwnPhotoComments,
  fetchPublishedPhotoComments,
} from './api';
import type { SubmitPhotoCommentVariables } from './types';

export function usePhotoComments(
  mediaId: string | undefined,
  userId: string | null,
  canComment: boolean
) {
  const client = useQueryClient();
  const published = useInfiniteQuery({
    queryKey: photoCommentKeys.published(mediaId, userId),
    enabled: Boolean(mediaId),
    initialPageParam: PHOTO_COMMENTS_INITIAL_PAGE,
    staleTime: PHOTO_COMMENTS_STALE_TIME_MS,
    retry: false,
    queryFn: ({ pageParam, signal }) =>
      fetchPublishedPhotoComments(
        mediaId!,
        { page: pageParam, limit: PHOTO_COMMENTS_PAGE_SIZE },
        signal
      ),
    getNextPageParam: (last) => (last.page < last.pageCount ? last.page + 1 : undefined),
  });
  const mine = useInfiniteQuery({
    queryKey: photoCommentKeys.mine(mediaId, userId),
    enabled: Boolean(mediaId && canComment && userId),
    initialPageParam: PHOTO_COMMENTS_INITIAL_PAGE,
    staleTime: PHOTO_COMMENTS_STALE_TIME_MS,
    retry: false,
    queryFn: ({ pageParam, signal }) =>
      fetchOwnPhotoComments(mediaId!, { page: pageParam, limit: PHOTO_COMMENTS_PAGE_SIZE }, signal),
    getNextPageParam: (last) => (last.page < last.pageCount ? last.page + 1 : undefined),
  });
  const submit = useMutation({
    mutationFn: ({ mediaId: targetId, payload }: SubmitPhotoCommentVariables) =>
      createPhotoComment(targetId, payload),
    onSuccess: async (_, variables) => {
      await client.invalidateQueries({
        queryKey: photoCommentKeys.mine(variables.mediaId, userId),
      });
      await client.invalidateQueries({ queryKey: ['feed-photo-comments', 'moderation'] });
    },
  });
  const remove = useMutation({
    mutationFn: deletePhotoComment,
    onSuccess: () => client.invalidateQueries({ queryKey: photoCommentKeys.all }),
  });
  return { published, mine, submit, remove };
}
