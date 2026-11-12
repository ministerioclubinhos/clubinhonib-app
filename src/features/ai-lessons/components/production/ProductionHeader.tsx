import { useId, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { ArrowForward, DeleteOutline, MoreVert, RateReview } from '@mui/icons-material';
import { LESSON_STATUS_PRESENTATION } from '../../presentation.constants';
import { PRODUCTION_HEADER_ACTIONS_WIDTH, PRODUCTION_TEXTS } from '../../production.constants';
import { ProductionHeaderTarget, type ProductionHeaderProps } from '../../production.types';
import { LessonCategory } from '../../types';
import { formatLessonBadgeLabel } from '../../utils';

/** Lesson identity, overall progress and the one thing to do next. */
export function ProductionHeader({
  lesson,
  step,
  progress,
  canDelete,
  deleteDisabled,
  onOpenStage,
  onGoToReview,
  onDelete,
}: ProductionHeaderProps) {
  const menuId = useId();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const status = LESSON_STATUS_PRESENTATION[lesson.status];
  const nextStage = step.target === ProductionHeaderTarget.STAGE ? step.stage : null;

  return (
    <Paper
      data-testid="ai-lesson-production-header"
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        mb: 3,
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        // Two columns on desktop: the title takes what is left and the actions have a
        // fixed width, so they never squeeze the title into a few words per line.
        display: 'grid',
        gridTemplateColumns: {
          xs: 'minmax(0, 1fr)',
          md: `minmax(0, 1fr) ${PRODUCTION_HEADER_ACTIONS_WIDTH}px`,
        },
        gap: { xs: 2, md: 3 },
        alignItems: 'center',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" flexWrap="wrap" alignItems="center" gap={1} sx={{ mb: 1 }}>
          <Chip
            label={formatLessonBadgeLabel(lesson)}
            size="small"
            color={lesson.category === LessonCategory.SPECIAL ? 'secondary' : 'primary'}
            sx={{ fontWeight: 800, borderRadius: 1.5 }}
          />
          <Chip
            data-testid="ai-lesson-status-chip"
            label={status.label}
            color={status.color}
            size="small"
            sx={{ fontWeight: 700, borderRadius: 1.5 }}
          />
        </Stack>

        <Typography
          component="h1"
          color="text.primary"
          sx={{
            fontSize: { xs: '1.2rem', md: '1.5rem' },
            fontWeight: 800,
            lineHeight: 1.25,
            overflowWrap: 'anywhere',
          }}
        >
          {lesson.theme}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={600}
          sx={{ overflowWrap: 'anywhere', mt: 0.5 }}
        >
          {lesson.biblicalReference}
        </Typography>

        {lesson.category === LessonCategory.SPECIAL && lesson.specialContext && (
          <Typography
            data-testid="ai-lesson-special-context"
            variant="body2"
            color="text.secondary"
            sx={{ overflowWrap: 'anywhere', mt: 0.5, fontStyle: 'italic' }}
          >
            {PRODUCTION_TEXTS.specialContextPrefix} {lesson.specialContext}
          </Typography>
        )}

        {lesson.editorialPurpose && (
          <Typography
            data-testid="ai-lesson-editorial-purpose"
            variant="body2"
            color="text.secondary"
            sx={{ overflowWrap: 'anywhere', mt: 0.5, fontStyle: 'italic' }}
          >
            {PRODUCTION_TEXTS.editorialPurposePrefix} {lesson.editorialPurpose}
          </Typography>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          Criada em {new Date(lesson.createdAt).toLocaleString('pt-BR')} · Atualizada em{' '}
          {new Date(lesson.updatedAt).toLocaleString('pt-BR')}
        </Typography>

        <Box sx={{ mt: 2, maxWidth: 560 }}>
          <Stack direction="row" justifyContent="space-between" gap={1} sx={{ mb: 0.75 }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              {PRODUCTION_TEXTS.progressLabel}
            </Typography>
            <Typography
              data-testid="ai-lesson-progress-count"
              variant="caption"
              fontWeight={800}
              color="text.primary"
              sx={{ textAlign: 'right' }}
            >
              {progress.count}/{progress.total}{' '}
              {progress.finalReview
                ? PRODUCTION_TEXTS.progressApproved
                : PRODUCTION_TEXTS.progressCompleted}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progress.percent}
            color={progress.percent === 100 ? 'success' : 'primary'}
            aria-label={PRODUCTION_TEXTS.progressLabel}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      </Box>

      <Stack data-testid="ai-lesson-header-actions" spacing={1} sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          {nextStage ? (
            <Button
              data-testid="ai-lesson-next-step"
              variant="contained"
              endIcon={<ArrowForward />}
              onClick={() => onOpenStage(nextStage)}
              sx={{ flex: 1, minWidth: 0, minHeight: 48, borderRadius: 2.5, fontWeight: 700 }}
            >
              {step.label}
            </Button>
          ) : (
            <Button
              data-testid="ai-lesson-go-to-review"
              variant="contained"
              startIcon={<RateReview />}
              onClick={onGoToReview}
              sx={{ flex: 1, minWidth: 0, minHeight: 48, borderRadius: 2.5, fontWeight: 700 }}
            >
              {PRODUCTION_TEXTS.goToReview}
            </Button>
          )}

          {canDelete && (
            <>
              <Tooltip title={PRODUCTION_TEXTS.moreActions}>
                <IconButton
                  data-testid="ai-lesson-more-actions"
                  aria-label={PRODUCTION_TEXTS.moreActions}
                  aria-haspopup="menu"
                  aria-controls={menuAnchor ? menuId : undefined}
                  aria-expanded={menuAnchor ? 'true' : undefined}
                  onClick={(event) => setMenuAnchor(event.currentTarget)}
                  sx={{ width: 48, height: 48, flexShrink: 0 }}
                >
                  <MoreVert />
                </IconButton>
              </Tooltip>
              <Menu
                id={menuId}
                data-testid="ai-lesson-more-actions-menu"
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem
                  data-testid="ai-lesson-delete-button"
                  disabled={deleteDisabled}
                  onClick={() => {
                    setMenuAnchor(null);
                    onDelete();
                  }}
                  sx={{ minHeight: 44, color: 'error.main' }}
                >
                  <ListItemIcon sx={{ color: 'inherit' }}>
                    <DeleteOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>{PRODUCTION_TEXTS.deleteLesson}</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}
        </Stack>

        {nextStage && (
          <Button
            data-testid="ai-lesson-go-to-review"
            variant="outlined"
            startIcon={<RateReview />}
            onClick={onGoToReview}
            sx={{ minHeight: 44, borderRadius: 2.5, fontWeight: 600 }}
          >
            {PRODUCTION_TEXTS.goToReview}
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
