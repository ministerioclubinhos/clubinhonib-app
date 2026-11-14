import { useEffect, useState } from 'react';
import { Button, Paper, Stack, Typography } from '@mui/material';
import { AutoAwesome } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { STUDIO_ELAPSED_TICK_MS } from '../../constants';
import { GENERATION_TEXTS } from '../../generation.constants';
import { generationElapsedSeconds } from '../../generation.utils';
import { useActiveLessonGenerations } from '../../hooks';
import { STUDIO_ROUTES } from '../../presentation.constants';
import { lessonStageLabel } from '../../presentation.utils';
import { formatElapsedTime } from '../../utils';
import { GenerationProgress } from './GenerationProgress';

/**
 * Generations running right now, on every studio list. After a reload — or for
 * someone who left the lesson — this is the way back to the work in progress.
 */
export function StudioActiveGenerations() {
  const navigate = useNavigate();
  const { data } = useActiveLessonGenerations();
  const active = data ?? [];
  const [now, setNow] = useState(() => Date.now());
  const running = active.length > 0;

  useEffect(() => {
    if (!running) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), STUDIO_ELAPSED_TICK_MS);
    return () => clearInterval(timer);
  }, [running]);

  if (!running) return null;
  return (
    <Paper
      data-testid="studio-active-generations"
      role="status"
      variant="outlined"
      sx={{ p: { xs: 1.5, md: 2 }, mb: 2, borderRadius: 3, borderColor: 'info.main' }}
    >
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
        <AutoAwesome color="info" fontSize="small" />
        <Typography variant="subtitle2" fontWeight={800}>
          {active.length === 1
            ? GENERATION_TEXTS.bannerTitleOne
            : GENERATION_TEXTS.bannerTitleMany(active.length)}
        </Typography>
      </Stack>
      <Stack gap={1.5}>
        {active.map((item) => (
          <Stack
            key={item.lessonId}
            data-testid={`studio-active-generation-${item.lessonId}`}
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ sm: 'center' }}
            gap={{ xs: 1, sm: 2 }}
          >
            <Stack sx={{ flex: 1, minWidth: 0 }}>
              <GenerationProgress
                progress={item}
                elapsed={formatElapsedTime(generationElapsedSeconds(item.startedAt, now) ?? 0)}
                title={`${item.theme || 'Lição'} — ${lessonStageLabel(item.stage)}`}
              />
            </Stack>
            <Button
              variant="outlined"
              color="info"
              onClick={() => navigate(`${STUDIO_ROUTES.production}/${item.lessonId}`)}
              sx={{ minHeight: 44, borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
            >
              {GENERATION_TEXTS.follow}
            </Button>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
