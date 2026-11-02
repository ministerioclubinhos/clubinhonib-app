import { LessonCategory } from '@/features/ai-lessons/types';
import { lessonStageLabel } from '../lessonStagePresentation.utils';
import { Box, Button, Chip, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import type { LessonStage, LessonStageType } from '@/services/aiLessonsService';
import {
  LESSON_STAGE_STATUS_COLORS,
  LESSON_STAGE_STATUS_LABELS,
} from '../lessonDraftDetail.constants';

type Props = {
  stages: LessonStage[];
  category?: LessonCategory;
  selectedType: LessonStageType;
  mode: 'mobile' | 'desktop';
  onSelect: (type: LessonStageType) => void;
};

export function LessonStageNavigation({ stages, category, selectedType, mode, onSelect }: Props) {
  if (mode === 'mobile') {
    return (
      <Paper
        data-testid="ai-lesson-stage-navigation-mobile"
        elevation={0}
        sx={{
          display: { xs: 'block', lg: 'none' },
          mb: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Tabs
          value={selectedType}
          onChange={(_, next: LessonStageType) => onSelect(next)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 1,
            py: 0.5,
            '& .MuiTab-root': { minHeight: 48, textTransform: 'none', fontWeight: 700 },
          }}
        >
          {stages.map((stage) => (
            <Tab
              key={stage.id}
              data-testid={`ai-stage-tab-${stage.type}`}
              value={stage.type}
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <span>{lessonStageLabel(stage.type, category, true)}</span>
                  <Chip
                    size="small"
                    label={LESSON_STAGE_STATUS_LABELS[stage.status] ?? stage.status}
                    color={LESSON_STAGE_STATUS_COLORS[stage.status] ?? 'default'}
                    sx={{ height: 20, fontSize: '0.675rem', fontWeight: 700, borderRadius: 1 }}
                  />
                </Stack>
              }
            />
          ))}
        </Tabs>
      </Paper>
    );
  }

  return (
    <Paper
      data-testid="ai-lesson-stage-navigation-desktop"
      elevation={0}
      sx={{
        display: { xs: 'none', lg: 'block' },
        position: 'sticky',
        top: 88,
        p: 2.5,
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="h6" fontWeight={800} gutterBottom>
        Fluxo da produção
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Selecione a etapa para ver, editar e aprovar os materiais.
      </Typography>
      <Stack spacing={1}>
        {stages.map((stage) => {
          const selected = selectedType === stage.type;
          return (
            <Button
              key={stage.id}
              data-testid={`ai-stage-tab-${stage.type}`}
              fullWidth
              variant={selected ? 'contained' : 'outlined'}
              color={selected ? 'primary' : 'inherit'}
              onClick={() => onSelect(stage.type)}
              sx={{
                justifyContent: 'space-between',
                textAlign: 'left',
                py: 1.25,
                px: 2,
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: selected ? 'primary.main' : 'divider',
                bgcolor: selected ? undefined : 'background.paper',
                textTransform: 'none',
                '&:hover': { borderColor: 'primary.main' },
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  sx={{ color: selected ? '#ffffff' : 'text.primary', lineHeight: 1.3 }}
                >
                  {lessonStageLabel(stage.type, category)}
                </Typography>
                <Chip
                  size="small"
                  label={LESSON_STAGE_STATUS_LABELS[stage.status] ?? stage.status}
                  color={
                    selected ? 'default' : (LESSON_STAGE_STATUS_COLORS[stage.status] ?? 'default')
                  }
                  sx={{
                    mt: 0.5,
                    height: 20,
                    fontSize: '0.675rem',
                    fontWeight: 700,
                    bgcolor: selected ? 'rgba(255,255,255,0.25)' : undefined,
                    color: selected ? '#ffffff' : undefined,
                  }}
                />
              </Box>
            </Button>
          );
        })}
      </Stack>
    </Paper>
  );
}
