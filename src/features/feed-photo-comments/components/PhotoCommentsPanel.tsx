import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import type { RootState } from '@/store/slices';
import { extractErrorMessage } from '@/utils/apiError';
import { PHOTO_COMMENT_MAX_LENGTH, PHOTO_COMMENTS_TOUCH_TARGET } from '../constants';
import { usePhotoComments } from '../hooks';
import { PhotoCommentTab, type PhotoCommentDraft, type PhotoCommentsPanelProps } from '../types';
import { validatePhotoComment } from '../utils';
import { PhotoCommentCard } from './PhotoCommentCard';

export function PhotoCommentsPanel({ mediaId }: PhotoCommentsPanelProps) {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const canComment = Boolean(isAuthenticated && user?.active);
  const { published, mine, submit, remove } = usePhotoComments(
    mediaId,
    user?.id ?? null,
    canComment
  );
  const [tab, setTab] = useState(PhotoCommentTab.PUBLISHED);
  const [drafts, setDrafts] = useState<Record<string, PhotoCommentDraft>>({});
  const [submittedPhoto, setSubmittedPhoto] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const submittingRef = useRef(false);
  const draft = mediaId ? drafts[mediaId] : undefined;
  const showMine = tab === PhotoCommentTab.MINE && canComment;
  const listing = showMine ? mine : published;
  const comments = listing.data?.pages.flatMap((page) => page.data) ?? [];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!mediaId || !canComment || submittingRef.current) return;
    const validation = validatePhotoComment(draft?.text ?? '');
    setFieldError(validation);
    if (validation || !draft) return;
    const targetId = mediaId;
    submittingRef.current = true;
    try {
      await submit.mutateAsync({
        mediaId: targetId,
        payload: { text: draft.text.trim(), requestId: draft.requestId },
      });
      setDrafts((current) => ({
        ...current,
        [targetId]: { text: '', requestId: crypto.randomUUID() },
      }));
      setSubmittedPhoto(targetId);
      setTab(PhotoCommentTab.MINE);
    } catch {
      // The mutation retains the error and the draft for an idempotent retry.
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <Box
      data-testid="feed-photo-comments-panel"
      component="section"
      aria-label="Comentários"
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        minWidth: 0,
        boxSizing: 'border-box',
        p: { xs: 2, sm: 2.5 },
        height: { xs: 'auto', md: '100%' },
        overflowY: { xs: 'visible', md: 'auto' },
        pb: 'max(20px, env(safe-area-inset-bottom))',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Typography component="h3" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
          Comentários
        </Typography>
        {mediaId && (
          <IconButton
            data-testid="feed-photo-comments-refresh"
            aria-label="Atualizar comentários"
            disabled={listing.isFetching}
            onClick={() => {
              void listing.refetch();
            }}
            sx={{ minWidth: PHOTO_COMMENTS_TOUCH_TARGET, minHeight: PHOTO_COMMENTS_TOUCH_TARGET }}
          >
            <RefreshRoundedIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>
      {!mediaId ? (
        <Alert severity="info">Os comentários não estão disponíveis no momento.</Alert>
      ) : (
        <>
          {canComment ? (
            <Box
              component="form"
              onSubmit={(event) => {
                void handleSubmit(event);
              }}
              data-testid="feed-photo-comment-form"
              sx={{ mt: 2 }}
            >
              <TextField
                fullWidth
                multiline
                minRows={3}
                maxRows={8}
                label="Seu comentário"
                value={draft?.text ?? ''}
                disabled={submit.isPending}
                error={Boolean(fieldError)}
                helperText={fieldError ?? `${draft?.text.length ?? 0}/${PHOTO_COMMENT_MAX_LENGTH}`}
                inputProps={{
                  maxLength: PHOTO_COMMENT_MAX_LENGTH,
                  'data-testid': 'feed-photo-comment-input',
                }}
                onChange={(event) => {
                  setDrafts((current) => ({
                    ...current,
                    [mediaId]: { text: event.target.value, requestId: crypto.randomUUID() },
                  }));
                  setFieldError(null);
                  setSubmittedPhoto(null);
                  submit.reset();
                }}
              />
              <Button
                data-testid="feed-photo-comment-submit"
                type="submit"
                fullWidth
                variant="contained"
                disableElevation
                disabled={submit.isPending || !draft?.text.trim()}
                startIcon={
                  submit.isPending ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <SendRoundedIcon />
                  )
                }
                sx={{
                  minHeight: PHOTO_COMMENTS_TOUCH_TARGET,
                  mt: 1,
                  textTransform: 'none',
                  bgcolor: 'success.dark',
                  '&:hover': { bgcolor: 'success.main' },
                }}
              >
                {submit.isPending ? 'Enviando...' : 'Enviar comentário'}
              </Button>
              {submit.isError && submit.variables?.mediaId === mediaId && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {extractErrorMessage(
                    submit.error,
                    'Não foi possível enviar. Seu texto foi mantido; tente novamente.'
                  )}
                </Alert>
              )}
              {submittedPhoto === mediaId && (
                <Alert data-testid="feed-photo-comment-submitted" severity="success" sx={{ mt: 1 }}>
                  Comentário enviado!
                </Alert>
              )}
            </Box>
          ) : isAuthenticated ? (
            <Alert severity="info" sx={{ my: 2 }}>
              Sua conta precisa estar ativa para enviar comentários.
            </Alert>
          ) : (
            <Alert severity="info" sx={{ my: 2 }}>
              Entre na sua conta para comentar.
              <Button
                component={Link}
                to="/login"
                sx={{
                  display: 'flex',
                  minHeight: PHOTO_COMMENTS_TOUCH_TARGET,
                  textTransform: 'none',
                }}
              >
                Entrar
              </Button>
            </Alert>
          )}
          <Tabs
            value={showMine ? PhotoCommentTab.MINE : PhotoCommentTab.PUBLISHED}
            onChange={(_, value: PhotoCommentTab) => {
              setTab(value);
              // A moderator may have reviewed the comment in another session.
              void (value === PhotoCommentTab.MINE ? mine : published).refetch();
            }}
            aria-label="Comentários e meus comentários"
            variant="fullWidth"
            sx={{ mt: 2 }}
          >
            <Tab
              data-testid="feed-photo-comments-published-tab"
              value={PhotoCommentTab.PUBLISHED}
              label={`Comentários (${published.data?.pages[0]?.total ?? 0})`}
              sx={{ textTransform: 'none', minWidth: 0 }}
            />
            {canComment && (
              <Tab
                data-testid="feed-photo-comments-mine-tab"
                value={PhotoCommentTab.MINE}
                label="Meus comentários"
                sx={{ textTransform: 'none', minWidth: 0 }}
              />
            )}
          </Tabs>
          {listing.isPending ? (
            <Stack data-testid="feed-photo-comments-loading" alignItems="center" sx={{ py: 3 }}>
              <CircularProgress size={24} aria-label="Carregando comentários" />
            </Stack>
          ) : listing.isError ? (
            <Alert
              data-testid="feed-photo-comments-error"
              severity="error"
              sx={{ mt: 2 }}
              action={
                <Button
                  type="button"
                  color="inherit"
                  onClick={() => {
                    void listing.refetch();
                  }}
                  sx={{ minHeight: PHOTO_COMMENTS_TOUCH_TARGET }}
                >
                  Tentar novamente
                </Button>
              }
            >
              Não foi possível carregar os comentários.
            </Alert>
          ) : comments.length === 0 ? (
            <Typography
              data-testid="feed-photo-comments-empty"
              color="text.secondary"
              sx={{ py: 3, fontSize: '0.9rem' }}
            >
              {showMine ? 'Você ainda não enviou comentários aqui.' : 'Ainda não há comentários.'}
            </Typography>
          ) : (
            <Box data-testid="feed-photo-comments-list">
              {comments.map((comment) => (
                <PhotoCommentCard
                  key={comment.id}
                  comment={comment}
                  deleting={remove.isPending}
                  onDelete={
                    showMine
                      ? () => {
                          remove.reset();
                          setDeleteId(comment.id);
                        }
                      : undefined
                  }
                />
              ))}
            </Box>
          )}
          {listing.hasNextPage && (
            <Button
              data-testid="feed-photo-comments-load-more"
              type="button"
              fullWidth
              disabled={listing.isFetchingNextPage}
              onClick={() => {
                void listing.fetchNextPage();
              }}
              sx={{ minHeight: PHOTO_COMMENTS_TOUCH_TARGET, mt: 1, textTransform: 'none' }}
            >
              {listing.isFetchingNextPage ? 'Carregando...' : 'Ver mais comentários'}
            </Button>
          )}
          <Dialog
            data-testid="feed-photo-comment-delete-dialog"
            open={Boolean(deleteId)}
            onClose={() => {
              if (!remove.isPending) setDeleteId(null);
            }}
            aria-labelledby="feed-photo-comment-delete-title"
          >
            <DialogTitle id="feed-photo-comment-delete-title">Excluir seu comentário?</DialogTitle>
            <DialogContent>
              O comentário será removido.
              {remove.isError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {extractErrorMessage(remove.error, 'Não foi possível excluir.')}
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                type="button"
                disabled={remove.isPending}
                onClick={() => setDeleteId(null)}
                sx={{ minHeight: PHOTO_COMMENTS_TOUCH_TARGET }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                color="error"
                disabled={remove.isPending}
                onClick={async () => {
                  if (!deleteId) return;
                  try {
                    await remove.mutateAsync(deleteId);
                    setDeleteId(null);
                  } catch {
                    /* Error stays visible in the dialog. */
                  }
                }}
                sx={{ minHeight: PHOTO_COMMENTS_TOUCH_TARGET }}
              >
                {remove.isPending ? 'Excluindo...' : 'Excluir'}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
}
