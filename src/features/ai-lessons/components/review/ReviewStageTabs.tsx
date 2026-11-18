import { Chip, Paper, Stack, Tab, Tabs, Tooltip } from '@mui/material';
import { CheckCircle as ApproveIcon } from '@mui/icons-material';
import { LESSON_STAGE_STATUS_COLORS, REVIEW_TAB_STATUS_LABELS } from '../../presentation.constants';
import { lessonStageLabel } from '../../presentation.utils';
import type { ReviewStageTabsProps } from '../../review.types';
import { LessonStageStatus, type LessonStageType } from '../../types';

/** One tab per package item, with its review status. */
export function ReviewStageTabs({ lesson, stageOrder, selectedType, onSelect }: ReviewStageTabsProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        mb: 2,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Tabs
        value={stageOrder.includes(selectedType) ? selectedType : false}
        onChange={(_, next: LessonStageType) => onSelect(next)}
        aria-label="Itens da lição"
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          px: 0.5,
          '& .MuiTab-root': { minHeight: 52, textTransform: 'none', fontWeight: 700 },
        }}
      >
        {stageOrder.map((stageType) => {
          const st = lesson.stages.find((item) => item.type === stageType);
          return (
            <Tab
              data-testid={`ai-lesson-review-tab-${stageType.toLowerCase().replaceAll('_', '-')}`}
              key={stageType}
              value={stageType}
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <span>{lessonStageLabel(stageType, lesson.category, true)}</span>
                  {st?.status === LessonStageStatus.APPROVED ? (
                    // Aprovado é o estado comum: um ícone basta e deixa os demais em evidência.
                    <Tooltip title={REVIEW_TAB_STATUS_LABELS[st.status]}>
                      <ApproveIcon
                        color="success"
                        aria-label={REVIEW_TAB_STATUS_LABELS[st.status]}
                        sx={{ fontSize: 18 }}
                      />
                    </Tooltip>
                  ) : st ? (
                    <Chip
                      size="small"
                      label={REVIEW_TAB_STATUS_LABELS[st.status]}
                      color={LESSON_STAGE_STATUS_COLORS[st.status]}
                      sx={{ height: 20, fontSize: '0.675rem', fontWeight: 800, borderRadius: 1 }}
                    />
                  ) : null}
                </Stack>
              }
            />
          );
        })}
      </Tabs>
    </Paper>
  );
}
