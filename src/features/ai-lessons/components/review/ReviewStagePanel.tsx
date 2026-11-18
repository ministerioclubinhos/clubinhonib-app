import { Alert, Box, Button, Chip, CircularProgress, Divider, Paper, Stack, Typography } from '@mui/material';
import { CheckCircle as ApproveIcon, PictureAsPdf } from '@mui/icons-material';
import { lessonStageLabel } from '../../presentation.utils';
import type { ReviewStagePanelProps } from '../../review.types';
import { LessonStageStatus } from '../../types';
import { LessonStageContentViewer } from '../LessonStageContentViewer';

/** Read-only content of the selected item, with the version warnings the reviewer must see. */
export function ReviewStagePanel({
  category,
  stage,
  stageLabel,
  currentVersion,
  document,
  structuredData,
  assetIssue,
  previewLoading,
  onOpenPreview,
  versionChanged,
  onAcknowledgeVersion,
  newerUpstream,
}: ReviewStagePanelProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 3 },
        minWidth: 0,
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h6" component="h2" fontWeight={800} color="text.primary">
            {stageLabel}
          </Typography>
          {currentVersion && (
            <Typography
              data-testid="ai-lesson-review-version"
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              Versão {currentVersion.versionNumber} · criada em{' '}
              {new Date(currentVersion.createdAt).toLocaleString('pt-BR')}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Button
            data-testid="ai-lesson-review-pdf-preview"
            variant="outlined"
            color="secondary"
            size="small"
            startIcon={previewLoading ? <CircularProgress size={16} /> : <PictureAsPdf />}
            disabled={!stage?.currentVersionId || previewLoading}
            onClick={onOpenPreview}
            sx={{ minHeight: 44, borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
          >
            Visualizar PDF do item
          </Button>
          {stage?.status === LessonStageStatus.APPROVED && (
            <Chip icon={<ApproveIcon />} label="Item Aprovado" color="success" sx={{ fontWeight: 800 }} />
          )}
        </Stack>
      </Stack>

      {versionChanged && stage && (
        <Alert
          data-testid="ai-lesson-review-version-changed"
          severity="warning"
          sx={{ mb: 2, '& .MuiAlert-message': { width: '100%' } }}
        >
          <Typography variant="body2" sx={{ mb: 1 }}>
            Este item recebeu uma nova versão
            {currentVersion ? ` (versão ${currentVersion.versionNumber})` : ''} enquanto estava
            aberto. O conteúdo abaixo já é o atual. Releia antes de decidir.
          </Typography>
          <Button
            data-testid="ai-lesson-review-acknowledge-version"
            color="inherit"
            variant="outlined"
            onClick={onAcknowledgeVersion}
            sx={{ minHeight: 44 }}
          >
            Revisei a versão atual
          </Button>
        </Alert>
      )}

      {newerUpstream && (
        <Alert data-testid="ai-lesson-review-upstream-changed" severity="info" sx={{ mb: 2 }}>
          “{lessonStageLabel(newerUpstream, category)}” foi alterado depois desta versão;
          confira se este item continua coerente com ele. Este aviso é apenas informativo.
        </Alert>
      )}

      <Divider sx={{ mb: 3 }} />

      {stage ? (
        <LessonStageContentViewer
          stage={stage}
          version={currentVersion}
          document={document}
          structuredData={structuredData}
          assetIssue={assetIssue}
          editable={false}
          readOnly
          onOpenPdfPreview={onOpenPreview}
          pdfPreviewLoading={previewLoading}
          pdfPreviewDisabled={!stage.currentVersionId}
        />
      ) : (
        <Alert data-testid="ai-lesson-review-stage-missing" severity="error">
          Esta etapa não faz parte deste pacote. Selecione outro item acima.
        </Alert>
      )}
    </Paper>
  );
}
