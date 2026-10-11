import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import { AutoAwesome, Download } from '@mui/icons-material';
import type { Lesson, LessonStage } from '@/services/aiLessonsService';
import { LESSON_STAGE_LABELS, displayAiFailure } from '../lessonDraftDetail.constants';

type Props = {
  lesson: Lesson;
  stage?: LessonStage;
  canGenerate: boolean;
  generationLocked: boolean;
  llmErrorOpen: boolean;
  previewUrl: string | null;
  previewError: string | null;
  deleteConfirmOpen: boolean;
  deletePending: boolean;
  onCloseLlmError: () => void;
  onRetryGeneration: () => void;
  onClosePreview: () => void;
  onCloseDelete: () => void;
  onConfirmDelete: () => Promise<void>;
};

export function LessonDraftDialogs({
  lesson,
  stage,
  canGenerate,
  generationLocked,
  llmErrorOpen,
  previewUrl,
  previewError,
  deleteConfirmOpen,
  deletePending,
  onCloseLlmError,
  onRetryGeneration,
  onClosePreview,
  onCloseDelete,
  onConfirmDelete,
}: Props) {
  return (
    <>
      <Dialog
        data-testid="ai-lesson-generation-error-dialog"
        open={llmErrorOpen && Boolean(stage?.failureMessage)}
        onClose={onCloseLlmError}
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
        <DialogTitle sx={{ fontWeight: 900, color: 'error.main', pb: 1 }}>
          Não foi possível gerar este item
        </DialogTitle>
        <DialogContent>
          <Typography fontWeight={800} sx={{ mb: 1 }}>
            {stage ? LESSON_STAGE_LABELS[stage.type] : 'Item da lição'}
          </Typography>
          <Alert severity="error" sx={{ borderRadius: 2.5 }}>
            {stage?.failureMessage
              ? displayAiFailure(stage.type, stage.failureMessage)
              : 'O provedor de inteligência artificial retornou um erro.'}
          </Alert>
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
          <Button onClick={onCloseLlmError} sx={{ minHeight: 44 }}>
            Fechar
          </Button>
          <Button
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

      <Dialog
        data-testid="ai-lesson-pdf-preview-dialog"
        open={Boolean(previewUrl) || Boolean(previewError)}
        onClose={() => !generationLocked && onClosePreview()}
        fullWidth
        maxWidth="lg"
        slotProps={{
          paper: {
            sx: {
              height: { xs: 'calc(100dvh - 12px)', md: '90vh' },
              m: { xs: 0.75, md: 4 },
              width: { xs: 'calc(100% - 12px)', md: '100%' },
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Preview final — {stage ? LESSON_STAGE_LABELS[stage.type] : 'Item'}
        </DialogTitle>
        <DialogContent
          dividers
          sx={{ p: { xs: 0.5, md: 1.5 }, display: 'flex', flexDirection: 'column' }}
        >
          {previewError ? (
            <Alert severity="error">{previewError}</Alert>
          ) : previewUrl ? (
            <Box
              component="iframe"
              title="Preview do PDF do item"
              src={previewUrl}
              sx={{
                border: 0,
                width: '100%',
                flex: 1,
                minHeight: { xs: 520, md: 650 },
                bgcolor: 'grey.100',
              }}
            />
          ) : null}
        </DialogContent>
        <DialogActions
          sx={{ px: { xs: 1.5, sm: 3 }, '& .MuiButton-root': { flex: { xs: 1, sm: 'initial' } } }}
        >
          <Button disabled={generationLocked} onClick={onClosePreview}>
            Fechar
          </Button>
          {previewUrl && (
            <Button
              component="a"
              disabled={generationLocked}
              href={previewUrl}
              download={`preview-${stage?.type.toLowerCase() ?? 'item'}.pdf`}
              startIcon={<Download />}
            >
              Baixar preview
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        data-testid="ai-lesson-delete-confirm-dialog"
        open={deleteConfirmOpen}
        onClose={() => !generationLocked && !deletePending && onCloseDelete()}
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
        <DialogTitle sx={{ fontWeight: 800 }}>Excluir Lição?</DialogTitle>
        <DialogContent>
          <DialogContentText color="text.secondary">
            Tem certeza que deseja excluir a lição <strong>{lesson.theme}</strong> (Semana{' '}
            {lesson.weekNumber})?
          </DialogContentText>
          <DialogContentText
            color="error.main"
            sx={{ mt: 1.5, fontWeight: 600, fontSize: '0.875rem' }}
          >
            ⚠️ Esta ação é irreversível. Todas as 8 etapas, versões geradas, comentários e arquivos
            de imagem associados serão permanentemente removidos.
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            pb: 2,
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            '& > :not(style) ~ :not(style)': { ml: { xs: 0, sm: 1 }, mt: { xs: 1, sm: 0 } },
            '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' } },
          }}
        >
          <Button onClick={onCloseDelete} disabled={generationLocked || deletePending}>
            Cancelar
          </Button>
          <Button
            onClick={() => void onConfirmDelete()}
            disabled={generationLocked || deletePending}
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
