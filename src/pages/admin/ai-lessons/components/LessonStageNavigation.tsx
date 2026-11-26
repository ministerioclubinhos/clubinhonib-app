import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import {
  LESSON_STAGE_STATUS_COLORS,
  LESSON_STAGE_STATUS_LABELS,
} from '@/features/ai-lessons/presentation.constants';
import { lessonStageLabel } from '@/features/ai-lessons/presentation.utils';
import {
  LESSON_STAGE_STATUS_SHORT_LABELS,
  LESSON_STAGE_UNSAVED_LABEL,
  LESSON_STAGE_UNSAVED_SHORT_LABEL,
  STAGE_NAVIGATION_TEXTS,
} from '@/features/ai-lessons/production.constants';
import {
  StageNavigationMode,
  type LessonStageNavigationProps,
} from '@/features/ai-lessons/types';

export function LessonStageNavigation({
  stages,
  category,
  selectedType,
  mode,
  draftStages = [],
  onSelect,
  collapsed = false,
  onToggleCollapsed,
}: LessonStageNavigationProps) {
  if (mode === StageNavigationMode.MOBILE) {
    return (
      <Paper
        data-testid="ai-lesson-stage-navigation-mobile"
        component="nav"
        aria-label="Etapas da lição"
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
          onChange={(_, next: typeof selectedType) => onSelect(next)}
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
                    // Short names here: the full ones push the item name out of the tab.
                    label={
                      draftStages.includes(stage.type)
                        ? LESSON_STAGE_UNSAVED_SHORT_LABEL
                        : LESSON_STAGE_STATUS_SHORT_LABELS[stage.status]
                    }
                    color={
                      draftStages.includes(stage.type)
                        ? 'warning'
                        : LESSON_STAGE_STATUS_COLORS[stage.status]
                    }
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

  const toggleLabel = collapsed ? STAGE_NAVIGATION_TEXTS.expand : STAGE_NAVIGATION_TEXTS.collapse;
  const toggle = onToggleCollapsed ? (
    <Tooltip title={toggleLabel} placement="right">
      <IconButton
        data-testid="ai-lesson-stage-navigation-toggle"
        size="small"
        aria-label={toggleLabel}
        aria-expanded={!collapsed}
        onClick={onToggleCollapsed}
        sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
      >
        {collapsed ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />}
      </IconButton>
    </Tooltip>
  ) : null;

  if (collapsed) {
    return (
      <Paper
        data-testid="ai-lesson-stage-navigation-desktop"
        data-collapsed="true"
        component="nav"
        aria-label="Etapas da lição"
        elevation={0}
        sx={{
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          position: 'sticky',
          top: 88,
          py: 1.5,
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        {toggle}
        {stages.map((stage, index) => {
          const selected = selectedType === stage.type;
          const hasDraft = draftStages.includes(stage.type);
          const statusLabel = hasDraft
            ? LESSON_STAGE_UNSAVED_LABEL
            : LESSON_STAGE_STATUS_LABELS[stage.status];
          const statusColor = hasDraft ? 'warning' : LESSON_STAGE_STATUS_COLORS[stage.status];
          const label = `${lessonStageLabel(stage.type, category)} — ${statusLabel}`;
          return (
            <Tooltip key={stage.id} title={label} placement="right">
              <Button
                data-testid={`ai-stage-tab-${stage.type}`}
                aria-current={selected ? 'step' : undefined}
                aria-label={label}
                variant={selected ? 'contained' : 'outlined'}
                color={selected ? 'primary' : 'inherit'}
                onClick={() => onSelect(stage.type)}
                sx={{
                  position: 'relative',
                  minWidth: 44,
                  width: 44,
                  height: 44,
                  p: 0,
                  borderRadius: 2.5,
                  fontWeight: 800,
                  borderColor: selected ? 'primary.main' : 'divider',
                  '&:hover': { borderColor: 'primary.main' },
                }}
              >
                {index + 1}
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    border: '1px solid',
                    borderColor: 'background.paper',
                    bgcolor: statusColor === 'default' ? 'action.disabled' : `${statusColor}.main`,
                  }}
                />
              </Button>
            </Tooltip>
          );
        })}
      </Paper>
    );
  }

  return (
    <Paper
      data-testid="ai-lesson-stage-navigation-desktop"
      data-collapsed="false"
      component="nav"
      aria-label="Etapas da lição"
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
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
        <Typography variant="h6" component="h2" color="text.primary" fontWeight={800} gutterBottom>
          {STAGE_NAVIGATION_TEXTS.title}
        </Typography>
        {toggle}
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {STAGE_NAVIGATION_TEXTS.subtitle}
      </Typography>
      <Stack spacing={1}>
        {stages.map((stage) => {
          const selected = selectedType === stage.type;
          const hasDraft = draftStages.includes(stage.type);
          return (
            <Button
              key={stage.id}
              data-testid={`ai-stage-tab-${stage.type}`}
              fullWidth
              aria-current={selected ? 'step' : undefined}
              variant={selected ? 'contained' : 'outlined'}
              color={selected ? 'primary' : 'inherit'}
              onClick={() => onSelect(stage.type)}
              sx={{
                justifyContent: 'space-between',
                textAlign: 'left',
                py: 1.25,
                px: 2,
                minHeight: 44,
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
                  sx={{
                    color: selected ? 'primary.contrastText' : 'text.primary',
                    lineHeight: 1.3,
                  }}
                >
                  {lessonStageLabel(stage.type, category)}
                </Typography>
                <Chip
                  size="small"
                  label={hasDraft ? LESSON_STAGE_UNSAVED_LABEL : LESSON_STAGE_STATUS_LABELS[stage.status]}
                  color={
                    selected
                      ? 'default'
                      : hasDraft
                        ? 'warning'
                        : LESSON_STAGE_STATUS_COLORS[stage.status]
                  }
                  sx={{
                    mt: 0.5,
                    height: 20,
                    fontSize: '0.675rem',
                    fontWeight: 700,
                    bgcolor: selected ? 'rgba(255,255,255,0.25)' : undefined,
                    color: selected ? 'primary.contrastText' : undefined,
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
