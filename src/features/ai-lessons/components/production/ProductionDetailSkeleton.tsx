import { Box, Paper, Skeleton, Stack } from '@mui/material';
import {
  PRODUCTION_HEADER_ACTIONS_WIDTH,
  PRODUCTION_SKELETON_STAGE_ROWS,
  PRODUCTION_TEXTS,
} from '../../production.constants';

const PANEL_SX = {
  p: { xs: 2, md: 3 },
  borderRadius: 4,
  border: '1px solid',
  borderColor: 'divider',
} as const;

/** Placeholder with the shape of the loaded screen, so nothing jumps when the lesson arrives. */
export function ProductionDetailSkeleton() {
  return (
    <Box
      data-testid="ai-lessons-detail-loading"
      role="status"
      aria-busy="true"
      aria-label={PRODUCTION_TEXTS.loading}
      sx={{ width: { xs: '98%', md: '95%' }, mx: 'auto', py: { xs: 1.5, sm: 2.5, md: 3.5 } }}
    >
      <Skeleton variant="rounded" width={240} height={36} sx={{ mb: 2 }} />
      <Paper
        elevation={0}
        sx={{
          ...PANEL_SX,
          mb: 3,
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            md: `minmax(0, 1fr) ${PRODUCTION_HEADER_ACTIONS_WIDTH}px`,
          },
          gap: { xs: 2, md: 3 },
          alignItems: 'center',
        }}
      >
        <Box>
          <Skeleton variant="rounded" width={160} height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" sx={{ fontSize: '1.5rem', maxWidth: 420 }} />
          <Skeleton variant="text" sx={{ maxWidth: 260 }} />
          <Skeleton variant="rounded" height={8} sx={{ mt: 2, maxWidth: 560 }} />
        </Box>
        <Stack spacing={1}>
          <Skeleton variant="rounded" height={48} />
          <Skeleton variant="rounded" height={44} />
        </Stack>
      </Paper>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: '320px minmax(0, 1fr)' },
          gap: { xs: 2.5, lg: 3 },
          alignItems: 'start',
        }}
      >
        <Paper elevation={0} sx={{ ...PANEL_SX, display: { xs: 'none', lg: 'block' } }}>
          <Stack spacing={1}>
            {Array.from({ length: PRODUCTION_SKELETON_STAGE_ROWS }, (_, row) => (
              <Skeleton key={row} variant="rounded" height={52} />
            ))}
          </Stack>
        </Paper>
        <Paper elevation={0} sx={PANEL_SX}>
          <Skeleton variant="text" sx={{ fontSize: '1.3rem', maxWidth: 280 }} />
          <Skeleton variant="text" sx={{ maxWidth: 480, mb: 2 }} />
          <Skeleton variant="rounded" height={44} sx={{ maxWidth: 320, mb: 3 }} />
          <Skeleton variant="rounded" height={320} />
        </Paper>
      </Box>
    </Box>
  );
}
