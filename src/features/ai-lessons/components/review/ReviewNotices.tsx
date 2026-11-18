import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material';
import type { ReviewNoticesProps } from '../../review.types';

/** Page-level notices of the review screen, in their fixed reading order. */
export function ReviewNotices({
  recovered,
  onDismissRecovered,
  publishing,
  kindLabel,
  publishedPanel,
  archived,
  restoring,
  restoreDisabled,
  onRestore,
  publishErrorMessage,
  onDismissPublishError,
  publicationFailureMessage,
  canStartReview,
  startingReview,
  startReviewDisabled,
  onStartReview,
  isSpecial,
  actionErrorMessage,
  notice,
  onDismissNotice,
  downloadError,
  onDismissDownloadError,
}: ReviewNoticesProps) {
  return (
    <>
      {recovered && (
        <Alert
          data-testid="ai-lesson-review-feedback-recovered"
          severity="info"
          onClose={onDismissRecovered}
          sx={{ mb: 2 }}
        >
          Rascunho recuperado: as observações que você digitou e não enviou foram restauradas neste
          navegador.
        </Alert>
      )}

      {publishing && (
        <Alert
          data-testid="ai-lesson-publishing-notice"
          severity="info"
          role="status"
          icon={<CircularProgress size={20} />}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          Publicação do {kindLabel} em andamento em Materiais Semanais. Isso pode levar alguns minutos enquanto os
          PDFs são gerados; envios duplicados estão bloqueados e esta tela será atualizada sozinha.
        </Alert>
      )}

      {publishedPanel}

      {archived && (
        <Alert
          data-testid="ai-lesson-archived-notice"
          severity="info"
          sx={{ mb: 2, borderRadius: 2 }}
          action={
            <Button
              data-testid="ai-lesson-unarchive"
              color="inherit"
              size="small"
              disabled={restoreDisabled}
              onClick={onRestore}
              sx={{ minHeight: 44 }}
            >
              {restoring ? 'Restaurando…' : 'Restaurar'}
            </Button>
          }
        >
          Esta lição está arquivada. O material publicado continua em Materiais Semanais; restaurar
          apenas devolve a lição à lista de publicadas do Estúdio.
        </Alert>
      )}

      {publishErrorMessage && (
        <Alert
          data-testid="ai-lesson-publish-error"
          severity="error"
          onClose={onDismissPublishError}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {publishErrorMessage}
        </Alert>
      )}

      {publicationFailureMessage && (
        <Alert
          data-testid="ai-lesson-publication-failure-notice"
          severity="warning"
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {publicationFailureMessage}
        </Alert>
      )}

      {canStartReview && (
        <Alert
          data-testid="ai-lesson-review-start-notice"
          severity="info"
          sx={{ mb: 2, '& .MuiAlert-message': { width: '100%' } }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <Typography variant="body2" sx={{ flex: 1 }}>
              {isSpecial ? 'Os três itens do Material Especial' : 'Os oito itens'} estão concluídos.
              Inicie a revisão para habilitar a aprovação de cada item.
            </Typography>
            <Button
              data-testid="ai-lesson-review-start"
              color="inherit"
              disabled={startReviewDisabled}
              onClick={onStartReview}
              sx={{ minHeight: 44, whiteSpace: 'nowrap' }}
            >
              {startingReview ? 'Iniciando revisão…' : 'Iniciar revisão'}
            </Button>
          </Stack>
        </Alert>
      )}
      {actionErrorMessage && (
        <Alert data-testid="ai-lesson-review-action-error" severity="error" sx={{ mb: 2 }}>
          {actionErrorMessage}
        </Alert>
      )}
      {notice && (
        <Alert
          data-testid="ai-lesson-review-notice"
          severity={notice.severity}
          onClose={onDismissNotice}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {notice.text}
        </Alert>
      )}
      {downloadError && (
        <Alert
          data-testid="ai-lesson-review-download-package-error"
          severity="error"
          onClose={onDismissDownloadError}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {downloadError}
        </Alert>
      )}
    </>
  );
}
