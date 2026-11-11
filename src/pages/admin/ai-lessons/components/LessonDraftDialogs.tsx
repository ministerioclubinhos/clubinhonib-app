import { useId } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import { AutoAwesome } from '@mui/icons-material';
import { LessonPdfPreviewDialog } from '@/features/ai-lessons/components/LessonPdfPreviewDialog';
import { displayAiFailure, lessonStageLabel } from '@/features/ai-lessons/presentation.utils';
import { formatLessonBadgeLabel } from '@/features/ai-lessons/utils';
import type { LessonDraftDialogsProps } from '@/features/ai-lessons/types';

export function LessonDraftDialogs({
  lesson,
  stage,
  canGenerate,
  generationLocked,
  llmErrorOpen,
  previewUrl,
  previewError,
  previewLoading,
  deleteConfirmOpen,
  deletePending,
  deleteError,
  onCloseLlmError,
  onRetryGeneration,
  onClosePreview,
  onCloseDelete,
  onConfirmDelete,
}: LessonDraftDialogsProps) {
  const errorTitleId = useId();
  const deleteTitleId = useId();
  const stageLabel = stage ? lessonStageLabel(stage.type, lesson.category) : 'Item da lição';
  return (
    <>
      <Dialog
        data-testid="ai-lesson-generation-error-dialog"
        open={llmErrorOpen && Boolean(stage?.failureMessage)}
        onClose={onCloseLlmError}
        aria-labelledby={errorTitleId}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              borderRadius: { xs: 2, sm: 3 },
              m: { xs: 1.5, sm: 3 },
              width: { xs: 'calc(100% - 24px)', sm: '100%' },
            },
          },
        }}
      >
        <DialogTitle id={errorTitleId} sx={{ fontWeight: 900, color: 'error.main', pb: 1 }}>
          Não foi possível gerar este item
        </DialogTitle>
        <DialogContent>
          <Typography fontWeight={800} sx={{ mb: 1 }}>
            {stageLabel}
          </Typography>
          <Alert severity="error" sx={{ borderRadius: 2.5 }}>
            {stage?.failureMessage
              ? displayAiFailure(stage.type, stage.failureMessage, lesson.category)
              : 'O provedor de inteligência artificial retornou um erro.'}
          </Alert>
          {stage?.failureCode && (
            <Typography
              data-testid="ai-lesson-generation-error-code"
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 1 }}
            >
              Código para suporte: {stage.failureCode}
            </Typography>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            pb: 2.5,
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            '& > :not(style) ~ :not(style)': { ml: { xs: 0, sm: 1 }, mt: { xs: 1, sm: 0 } },
            '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } },
          }}
        >
          <Button
            data-testid="ai-lesson-generation-error-close"
            onClick={onCloseLlmError}
            sx={{ minHeight: 44 }}
          >
            Fechar
          </Button>
          <Button
            data-testid="ai-lesson-generation-error-retry"
            variant="contained"
            startIcon={<AutoAwesome />}
            disabled={!canGenerate || generationLocked}
            onClick={onRetryGeneration}
            sx={{ minHeight: 44 }}
          >
            Tentar novamente
          </Button>
        </DialogActions>
      </Dialog>

      <LessonPdfPreviewDialog
        data-testid="ai-lesson-pdf-preview-dialog"
        title={stage ? stageLabel : 'Item'}
        fileName={`preview-${stage?.type.toLowerCase() ?? 'item'}.pdf`}
        url={previewUrl}
        error={previewError}
        loading={previewLoading}
        onClose={onClosePreview}
      />

      <Dialog
        data-testid="ai-lesson-delete-confirm-dialog"
        open={deleteConfirmOpen}
        onClose={() => !deletePending && onCloseDelete()}
        aria-labelledby={deleteTitleId}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: { xs: 2, sm: 3 },
              p: { xs: 0, sm: 1 },
              m: { xs: 1.5, sm: 4 },
              width: { xs: 'calc(100% - 24px)', sm: '100%' },
            },
          },
        }}
      >
        <DialogTitle id={deleteTitleId} sx={{ fontWeight: 800 }}>
          Excluir Lição?
        </DialogTitle>
        <DialogContent>
          <DialogContentText color="text.secondary">
            Tem certeza que deseja excluir a lição <strong>{lesson.theme}</strong> (
            {formatLessonBadgeLabel(lesson)})?
          </DialogContentText>
          <DialogContentText
            color="error.main"
            sx={{ mt: 1.5, fontWeight: 600, fontSize: '0.875rem' }}
          >
            Esta ação é irreversível. {lesson.stages.length === 1 ? 'A etapa' : `As ${lesson.stages.length} etapas`}
            , as versões geradas, os comentários e os arquivos de imagem associados serão
            permanentemente removidos.
          </DialogContentText>
          {deleteError && (
            <Alert data-testid="ai-lesson-delete-error" severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            pb: 2,
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            '& > :not(style) ~ :not(style)': { ml: { xs: 0, sm: 1 }, mt: { xs: 1, sm: 0 } },
            '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' }, minHeight: 44 },
          }}
        >
          <Button
            data-testid="ai-lesson-delete-cancel"
            onClick={onCloseDelete}
            disabled={deletePending}
          >
            Cancelar
          </Button>
          <Button
            data-testid="ai-lesson-delete-confirm"
            onClick={onConfirmDelete}
            disabled={deletePending}
            color="error"
            variant="contained"
          >
            {deletePending ? 'Excluindo...' : 'Excluir definitivamente'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
