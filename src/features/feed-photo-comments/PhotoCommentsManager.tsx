import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, Button, Chip, Grid2, Paper, Stack, Typography } from '@mui/material';
import { ListingLayout, ListingToolbar } from '@/components/common/listing';
import { useDebouncedValue } from '@/hooks';
import type { RootState } from '@/store/slices';
import { extractErrorMessage } from '@/utils/apiError';
import {
  PHOTO_COMMENT_STATUS_COLORS,
  PHOTO_COMMENT_STATUS_LABELS,
  PHOTO_COMMENTS_ALL_STATUSES,
  PHOTO_COMMENTS_INITIAL_PAGE,
  PHOTO_COMMENTS_PAGE_SIZE,
  PHOTO_COMMENTS_PAGE_SIZES,
  PHOTO_COMMENTS_TOUCH_TARGET,
  photoCommentKeys,
} from './constants';
import { fetchPhotoCommentModeration, moderatePhotoComment } from './api';
import {
  PhotoCommentStatus,
  type AdminPhotoCommentResponse,
  type ModeratePhotoCommentVariables,
} from './types';
import {
  buildPhotoCommentModerationQuery,
  formatPhotoCommentDate,
  getPhotoCommentPreviewUrl,
  isPhotoCommentStatus,
} from './utils';
import { PhotoCommentReviewDialog } from './components/PhotoCommentReviewDialog';

export function PhotoCommentsManager() {
  const userId = useSelector((state: RootState) => state.auth.user?.id ?? null);
  const client = useQueryClient();
  const [page, setPage] = useState(PHOTO_COMMENTS_INITIAL_PAGE);
  const [limit, setLimit] = useState(PHOTO_COMMENTS_PAGE_SIZE);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PhotoCommentStatus | ''>(PhotoCommentStatus.PENDING);
  const [reviewing, setReviewing] = useState<AdminPhotoCommentResponse | null>(null);
  const debouncedSearch = useDebouncedValue(search);
  const params = buildPhotoCommentModerationQuery(page, limit, debouncedSearch, status);
  const query = useQuery({
    queryKey: photoCommentKeys.moderation(userId, params),
    queryFn: ({ signal }) => fetchPhotoCommentModeration(params, signal),
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: ({ id, payload }: ModeratePhotoCommentVariables) =>
      moderatePhotoComment(id, payload),
    onSuccess: () => client.invalidateQueries({ queryKey: photoCommentKeys.all }),
  });
  const error = query.error
    ? extractErrorMessage(query.error, 'Não foi possível carregar os comentários.')
    : null;

  return (
    <ListingLayout
      data-testid="feed-photo-comments-manager"
      title="Comentários das fotos"
      summary="Revise cada envio antes de publicá-lo no feed."
      loading={query.isPending}
      error={error ?? undefined}
      itemCount={query.data?.data.length ?? 0}
      emptyTitle="Nenhum comentário encontrado"
      emptySubtitle={
        status === PhotoCommentStatus.PENDING
          ? 'Não há comentários aguardando aprovação para estes filtros.'
          : 'Ajuste a busca ou o status para ver outros comentários.'
      }
      toolbar={
        <ListingToolbar
          searchValue={search}
          searchPlaceholder="Buscar por autor, comentário ou publicação..."
          onSearchChange={(value) => {
            setSearch(value);
            setPage(PHOTO_COMMENTS_INITIAL_PAGE);
          }}
          onRefresh={() => {
            void query.refetch();
          }}
          filters={[
            {
              id: 'photo-comment-status',
              label: 'Status',
              value: status,
              options: [
                { value: PHOTO_COMMENTS_ALL_STATUSES, label: 'Todos' },
                ...Object.values(PhotoCommentStatus).map((value) => ({
                  value,
                  label: PHOTO_COMMENT_STATUS_LABELS[value],
                })),
              ],
              onChange: (value) => {
                setStatus(isPhotoCommentStatus(value) ? value : PHOTO_COMMENTS_ALL_STATUSES);
                setPage(PHOTO_COMMENTS_INITIAL_PAGE);
              },
            },
          ]}
        />
      }
      pagination={{
        page,
        pageSize: limit,
        total: query.data?.total ?? 0,
        onPageChange: setPage,
        onPageSizeChange: (value) => {
          setLimit(value);
          setPage(PHOTO_COMMENTS_INITIAL_PAGE);
        },
      }}
      pageSizeOptions={PHOTO_COMMENTS_PAGE_SIZES}
      overlays={
        <PhotoCommentReviewDialog
          key={reviewing?.id ?? 'closed'}
          comment={reviewing}
          pending={mutation.isPending}
          error={
            mutation.error
              ? extractErrorMessage(mutation.error, 'Não foi possível salvar a revisão.')
              : null
          }
          onClose={() => setReviewing(null)}
          onModerate={async (comment, nextStatus, reason) => {
            try {
              await mutation.mutateAsync({
                id: comment.id,
                payload: {
                  status: nextStatus,
                  expectedVersion: comment.version,
                  ...(reason ? { reason } : {}),
                },
              });
              setReviewing(null);
              return true;
            } catch {
              void query.refetch();
              return false;
            }
          }}
        />
      }
    >
      {query.data?.data.map((comment) => (
        <Grid2 key={comment.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <Paper
            data-testid={`feed-photo-comment-admin-${comment.id}`}
            variant="outlined"
            sx={{
              borderRadius: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Box
              component="img"
              src={getPhotoCommentPreviewUrl(comment)}
              alt={comment.photoTitle || comment.sectionCaption}
              loading="lazy"
              sx={{ height: 160, width: '100%', objectFit: 'cover', bgcolor: 'grey.100' }}
            />
            <Box sx={{ p: 2, flex: 1 }}>
              <Chip
                size="small"
                label={PHOTO_COMMENT_STATUS_LABELS[comment.status]}
                color={PHOTO_COMMENT_STATUS_COLORS[comment.status]}
                sx={{ mb: 1.5 }}
              />
              <Typography sx={{ fontWeight: 700 }}>{comment.authorName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {formatPhotoCommentDate(comment.createdAt)}
              </Typography>
              <Typography
                sx={{
                  my: 1.5,
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {comment.text}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Publicação: {comment.sectionCaption}
              </Typography>
            </Box>
            <Stack direction="row" sx={{ p: 2, pt: 0 }}>
              <Button
                data-testid={`feed-photo-comment-review-${comment.id}`}
                type="button"
                fullWidth
                variant="outlined"
                disabled={mutation.isPending}
                onClick={() => {
                  mutation.reset();
                  setReviewing(comment);
                }}
                sx={{ minHeight: PHOTO_COMMENTS_TOUCH_TARGET, textTransform: 'none' }}
              >
                Revisar comentário
              </Button>
            </Stack>
          </Paper>
        </Grid2>
      ))}
    </ListingLayout>
  );
}
