import { Box, Button, Chip, CircularProgress, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { Download as DownloadIcon, Send as PublishIcon } from '@mui/icons-material';
import type { ReviewHeaderProps } from '../../review.types';
import { reviewProgressText } from '../../review.utils';
import { formatLessonBadgeLabel } from '../../utils';

/** Lesson identity, approval progress and the package-level actions. */
export function ReviewHeader({
  lesson,
  isSpecial,
  summary,
  headerStatus,
  allApproved,
  showPublish,
  showPublishHint,
  publishLabel,
  publishDisabled,
  onPublish,
  canDownload,
  downloading,
  onDownload,
  showArchive,
  archiving,
  archiveDisabled,
  onArchive,
}: ReviewHeaderProps) {
  return (
    <Paper
      component="header"
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        mb: 2,
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        // Duas colunas no desktop: o título ocupa o que sobra e as ações têm
        // largura fixa. Antes as ações esticavam e espremiam o título.
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 280px' },
        gap: 2,
        alignItems: 'center',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" flexWrap="wrap" alignItems="center" gap={1} sx={{ mb: 0.75 }}>
          <Chip
            label={formatLessonBadgeLabel(lesson)}
            color={isSpecial ? 'secondary' : 'primary'}
            size="small"
            sx={{ fontWeight: 800, borderRadius: 1.5 }}
          />
          <Chip
            data-testid="ai-lesson-review-status-chip"
            size="small"
            label={headerStatus.label}
            color={headerStatus.color}
            sx={{ fontWeight: 800, borderRadius: 1.5 }}
          />
        </Stack>
        <Typography
          component="h1"
          fontWeight={800}
          color="text.primary"
          sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' }, lineHeight: 1.25, overflowWrap: 'anywhere' }}
        >
          {lesson.theme}
        </Typography>
        <Typography color="text.secondary" fontWeight={600} sx={{ mb: 1.25, overflowWrap: 'anywhere' }}>
          {lesson.biblicalReference}
        </Typography>

        <Box sx={{ maxWidth: 560 }}>
          <Typography
            data-testid="ai-lesson-review-progress"
            variant="caption"
            fontWeight={700}
            color="text.secondary"
            sx={{ display: 'block', mb: 0.5 }}
          >
            {reviewProgressText(summary)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={summary.percent}
            color={allApproved ? 'success' : 'primary'}
            aria-label="Progresso de revisão e aprovação"
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      </Box>

      <Stack gap={1} sx={{ minWidth: 0 }}>
        {showPublish && (
          <Button
            data-testid="ai-lesson-review-publish"
            variant="contained"
            color={allApproved ? 'success' : 'primary'}
            startIcon={<PublishIcon />}
            disabled={publishDisabled}
            onClick={onPublish}
            fullWidth
            sx={{ borderRadius: 3, minHeight: 48, fontWeight: 800, textTransform: 'none' }}
          >
            {publishLabel}
          </Button>
        )}
        {showPublishHint && (
          <Typography variant="caption" color="text.secondary" textAlign="center">
            Publicar fica disponível quando todos os itens forem aprovados.
          </Typography>
        )}
        {canDownload && (
          <Button
            data-testid="ai-lesson-review-download-package"
            variant="outlined"
            color="secondary"
            startIcon={downloading ? <CircularProgress size={18} /> : <DownloadIcon />}
            disabled={downloading}
            onClick={onDownload}
            fullWidth
            sx={{ borderRadius: 3, fontWeight: 700, minHeight: 44, textTransform: 'none' }}
          >
            {downloading ? 'Gerando o PDF do pacote…' : 'Baixar pacote completo (PDF)'}
          </Button>
        )}
        {showArchive && (
          <Button
            data-testid="ai-lesson-archive"
            variant="text"
            color="inherit"
            disabled={archiveDisabled}
            onClick={onArchive}
            fullWidth
            sx={{ borderRadius: 3, fontWeight: 600, minHeight: 44, textTransform: 'none', color: 'text.secondary' }}
          >
            {archiving ? 'Arquivando…' : 'Arquivar lição'}
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
