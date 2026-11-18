import { useId } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { Download } from '@mui/icons-material';
import type { LessonPdfPreviewDialogProps } from '../types';

export function LessonPdfPreviewDialog({
  title,
  fileName,
  url,
  error,
  loading,
  onClose,
  'data-testid': testId = 'ai-lesson-pdf-preview-dialog',
}: LessonPdfPreviewDialogProps) {
  const titleId = useId();
  return (
    <Dialog
      data-testid={testId}
      open={loading || Boolean(url) || Boolean(error)}
      onClose={onClose}
      aria-labelledby={titleId}
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
      <DialogTitle id={titleId} sx={{ fontWeight: 800 }}>
        Preview final — {title}
      </DialogTitle>
      <DialogContent
        dividers
        sx={{ p: { xs: 0.5, md: 1.5 }, display: 'flex', flexDirection: 'column' }}
      >
        {loading ? (
          <Box data-testid="ai-lesson-pdf-loading" role="status" sx={{ p: 3 }}>
            <CircularProgress aria-label="Gerando PDF" />
          </Box>
        ) : error ? (
          <Alert data-testid="ai-lesson-pdf-error" severity="error">
            {error}
          </Alert>
        ) : url ? (
          <Box
            component="iframe"
            title="Preview do PDF do item"
            src={url}
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
        sx={{
          px: { xs: 1.5, sm: 3 },
          '& .MuiButton-root': { minHeight: 44, flex: { xs: 1, sm: 'initial' } },
        }}
      >
        <Button data-testid="ai-lesson-pdf-preview-close" onClick={onClose}>
          Fechar
        </Button>
        {url && (
          <Button
            data-testid="ai-lesson-pdf-preview-download"
            component="a"
            href={url}
            download={fileName}
            startIcon={<Download />}
          >
            Baixar preview
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
