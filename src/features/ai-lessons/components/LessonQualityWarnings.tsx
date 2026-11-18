import { useId, useMemo, useState } from 'react';
import { alpha, Box, ButtonBase, Collapse, Tooltip, Typography } from '@mui/material';
import { ExpandMore, WarningAmberRounded } from '@mui/icons-material';
import { LESSON_QUALITY_TEXTS } from '../quality.constants';
import type { LessonQualityWarningsProps } from '../quality.types';
import { lessonQualityIssueLabel, lessonQualityIssues } from '../quality.utils';

/**
 * Approximate check of the generated lesson. A slim strip: hovering lists the
 * points, clicking opens them with the excerpts. Never blocks anything.
 */
export function LessonQualityWarnings({ document }: LessonQualityWarningsProps) {
  const issues = useMemo(() => lessonQualityIssues(document), [document]);
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  if (issues.length === 0) return null;

  const summary = LESSON_QUALITY_TEXTS.summary(issues.length);
  const tooltip = (
    <Box component="ul" sx={{ m: 0, pl: 2 }}>
      {issues.map((issue) => (
        <li key={issue.kind}>{lessonQualityIssueLabel(issue)}</li>
      ))}
    </Box>
  );

  return (
    <Box
      data-testid="ai-lesson-quality-warnings"
      sx={(theme) => ({
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: alpha(theme.palette.warning.main, 0.4),
        bgcolor: alpha(theme.palette.warning.main, 0.08),
      })}
    >
      <Tooltip title={open ? '' : tooltip} placement="bottom-start" arrow>
        <ButtonBase
          data-testid="ai-lesson-quality-toggle"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={detailsId}
          aria-label={`${summary}. ${open ? LESSON_QUALITY_TEXTS.hideDetails : LESSON_QUALITY_TEXTS.showDetails}`}
          sx={{
            width: '100%',
            minHeight: 36,
            px: 1.5,
            py: 0.5,
            gap: 1,
            justifyContent: 'flex-start',
            borderRadius: 2,
            textAlign: 'left',
          }}
        >
          <WarningAmberRounded color="warning" sx={{ fontSize: 18 }} />
          <Typography variant="body2" fontWeight={700} sx={{ flex: 1 }}>
            {summary}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {open ? LESSON_QUALITY_TEXTS.hideDetails : LESSON_QUALITY_TEXTS.showDetails}
          </Typography>
          <ExpandMore
            sx={{ fontSize: 20, transition: 'transform 150ms', transform: open ? 'rotate(180deg)' : 'none' }}
          />
        </ButtonBase>
      </Tooltip>

      <Collapse in={open} unmountOnExit>
        <Box id={detailsId} sx={{ px: 1.5, pb: 1.5 }}>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            {issues.map((issue) => (
              <Box component="li" key={issue.kind} data-testid={`ai-lesson-quality-${issue.kind}`} sx={{ mb: 1 }}>
                <Typography variant="body2" fontWeight={700}>
                  {lessonQualityIssueLabel(issue)}
                </Typography>
                {issue.excerpts.map((excerpt) => (
                  <Typography
                    key={excerpt}
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontStyle: 'italic', overflowWrap: 'anywhere' }}
                  >
                    “{excerpt}”
                  </Typography>
                ))}
              </Box>
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary">
            {LESSON_QUALITY_TEXTS.hint}
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
}
