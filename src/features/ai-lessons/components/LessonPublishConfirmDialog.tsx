import { Alert, Box, CircularProgress, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ConfirmDialog from '@/components/common/modal/ConfirmDialog';
import {
  publicationDuplicateWarning,
  publicationDuplicates,
  publicationKindLabel,
  publicationMaterialPath,
} from '../publication';
import type { LessonPublishConfirmDialogProps } from '../types';

/** Confirms a publication showing exactly what will be created and any same-week material. */
export function LessonPublishConfirmDialog({
  open,
  lessonTheme,
  fallbackIsSpecial,
  fallbackDocumentCount,
  republish,
  preview,
  previewLoading,
  previewFailed,
  onConfirm,
  onClose,
}: LessonPublishConfirmDialogProps) {
  const isSpecial = preview?.isSpecial ?? fallbackIsSpecial;
  const documentCount = preview?.documentCount ?? fallbackDocumentCount;
  const kind = publicationKindLabel(isSpecial);
  const duplicates = publicationDuplicates(preview);
  return (
    <ConfirmDialog
      data-testid="ai-lesson-publish-confirm-dialog"
      open={open}
      maxWidth="sm"
      title={
        republish
          ? `Publicar novamente como ${kind}?`
          : isSpecial
            ? 'Publicar como Material Especial?'
            : 'Publicar no Materiais Semanais?'
      }
      confirmText={republish ? 'Publicar novamente' : 'Publicar'}
      confirmColor="success"
      onConfirm={onConfirm}
      onClose={onClose}
      autoCloseOnConfirm={false}
    >
      <Typography variant="body2" sx={{ mb: 1.5 }}>
        Os {documentCount} itens aprovados de <strong>{lessonTheme}</strong> serão convertidos em{' '}
        {documentCount} PDFs e publicados como um novo {kind} em Materiais Semanais.
      </Typography>

      {previewLoading && (
        <Stack
          data-testid="ai-lesson-publish-preview-loading"
          direction="row"
          spacing={1}
          alignItems="center"
          role="status"
          sx={{ mb: 1.5 }}
        >
          <CircularProgress size={16} />
          <Typography variant="caption" color="text.secondary">
            Conferindo o título e os materiais já existentes…
          </Typography>
        </Stack>
      )}

      {preview && (
        <Box
          data-testid="ai-lesson-publish-preview"
          sx={{
            mb: 1.5,
            p: 1.5,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            Título da página
          </Typography>
          <Typography variant="body2" fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>
            {preview.title}
          </Typography>
        </Box>
      )}

      {previewFailed && (
        <Alert data-testid="ai-lesson-publish-preview-error" severity="info" sx={{ mb: 1.5 }}>
          Não foi possível conferir agora se já existe material para esta semana. Você ainda pode
          publicar; confira depois em Materiais Semanais.
        </Alert>
      )}

      {duplicates.length > 0 && (
        <Alert data-testid="ai-lesson-publish-duplicates" severity="warning" sx={{ mb: 1.5 }}>
          <Typography variant="body2">
            {publicationDuplicateWarning(isSpecial, duplicates.length)}
          </Typography>
          <Box component="ul" sx={{ pl: 2.5, my: 0.5 }}>
            {duplicates.map((item) => {
              const path = publicationMaterialPath(item.routePath);
              return (
                <Typography component="li" variant="body2" key={item.id}>
                  {path ? (
                    <Link
                      component={RouterLink}
                      to={path}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="inherit"
                      sx={{ overflowWrap: 'anywhere' }}
                    >
                      {item.title}
                    </Link>
                  ) : (
                    item.title
                  )}
                </Typography>
              );
            })}
          </Box>
        </Alert>
      )}

      <Alert severity="warning">
        Esta ação não pode ser desfeita pelo Estúdio: depois de publicada, a lição não pode mais ser
        editada nem excluída aqui, e os destinatários cadastrados são avisados por e-mail sobre o
        novo material.
      </Alert>
    </ConfirmDialog>
  );
}
