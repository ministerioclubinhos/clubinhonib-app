import { Alert, Box, Button, Container, Paper, Skeleton, Stack, Typography } from '@mui/material';
import AddAPhotoRoundedIcon from '@mui/icons-material/AddAPhotoRounded';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

import {
  FEED_CONTAINER_WIDTH,
  FEED_CONTENT_MAX_WIDTH,
  FEED_MESSAGES,
  FEED_PALETTE,
  FEED_SKELETON_CARD_COUNT,
  FEED_TEST_IDS,
  FEED_TOUCH_TARGET_PX,
} from '../constants';
import type { FeedEmptyStateProps, FeedErrorStateProps } from '../types';

export function FeedLoadingSkeleton() {
  return (
    <Box
      data-testid={FEED_TEST_IDS.LOADING_STATE}
      aria-label="Carregando publicações"
      aria-busy="true"
    >
      <Box
        sx={{
          bgcolor: FEED_PALETTE.canvasElevated,
          borderBottom: `1px solid ${FEED_PALETTE.borderSubtle}`,
          py: 3,
        }}
      >
        <Container
          maxWidth={false}
          disableGutters
          sx={{ width: FEED_CONTAINER_WIDTH, maxWidth: FEED_CONTENT_MAX_WIDTH }}
        >
          <Skeleton width={130} height={44} sx={{ mb: 1 }} />
          <Skeleton width="40%" height={48} />
          <Skeleton width="65%" height={28} />
        </Container>
      </Box>
      <Container
        maxWidth={false}
        disableGutters
        sx={{ width: FEED_CONTAINER_WIDTH, maxWidth: FEED_CONTENT_MAX_WIDTH, py: 3 }}
      >
        <Skeleton variant="rounded" height={44} sx={{ mb: 3 }} />
        <Stack spacing={3} sx={{ width: { xs: '100%', md: 'calc(100% - 314px)' } }}>
          {Array.from({ length: FEED_SKELETON_CARD_COUNT }).map((_, slot) => (
            <Paper
              key={slot}
              elevation={0}
              sx={{ p: 3, borderRadius: 3, border: `1px solid ${FEED_PALETTE.borderSubtle}` }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                <Skeleton variant="circular" width={44} height={44} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="35%" />
                  <Skeleton width="55%" />
                </Box>
              </Stack>
              <Skeleton width="75%" height={32} />
              <Skeleton width="90%" sx={{ mb: 2 }} />
              <Skeleton variant="rounded" height={320} />
            </Paper>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}

export function FeedErrorState({
  message,
  isRetrying,
  onRetry,
  onNavigateHome,
}: FeedErrorStateProps) {
  return (
    <Container
      data-testid={FEED_TEST_IDS.ERROR_STATE}
      maxWidth="xl"
      disableGutters
      sx={{ width: FEED_CONTAINER_WIDTH, mx: 'auto', py: { xs: 4, md: 7 } }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 680,
          mx: 'auto',
          p: { xs: 3, sm: 4.5 },
          borderRadius: 4,
          bgcolor: '#ffffff',
          border: `1px solid ${FEED_PALETTE.borderSubtle}`,
          boxShadow: FEED_PALETTE.cardShadow,
        }}
      >
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 3,
            fontSize: '0.95rem',
          }}
        >
          {message}
        </Alert>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
          <Button
            type="button"
            variant="outlined"
            onClick={onNavigateHome}
            startIcon={<HomeRoundedIcon />}
            sx={{
              minHeight: FEED_TOUCH_TARGET_PX,
              borderRadius: 99,
              textTransform: 'none',
              fontWeight: 700,
              color: FEED_PALETTE.inkSecondary,
              borderColor: FEED_PALETTE.borderStrong,
              bgcolor: 'transparent',
              '&:hover': {
                bgcolor: 'rgba(19, 60, 36, 0.05)',
                borderColor: FEED_PALETTE.brandForest,
              },
            }}
          >
            Página inicial
          </Button>

          <Button
            type="button"
            variant="contained"
            disabled={isRetrying}
            onClick={onRetry}
            startIcon={<RefreshRoundedIcon />}
            sx={{
              minHeight: FEED_TOUCH_TARGET_PX,
              px: 3,
              borderRadius: 99,
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: FEED_PALETTE.brandForest,
              color: '#ffffff',
              '&:hover': {
                bgcolor: FEED_PALETTE.brandForestDeep,
              },
            }}
          >
            {isRetrying ? 'Tentando novamente...' : 'Tentar novamente'}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

export function FeedEmptyState({
  canUploadPhotos,
  isRefreshing,
  onRefresh,
  onNavigateUpload,
}: FeedEmptyStateProps) {
  return (
    <Paper
      data-testid={FEED_TEST_IDS.EMPTY_STATE}
      elevation={0}
      sx={{
        maxWidth: 680,
        mx: 'auto',
        p: { xs: 3.5, sm: 5.5 },
        textAlign: 'center',
        borderRadius: 4.5,
        bgcolor: '#ffffff',
        border: `1px dashed ${FEED_PALETTE.borderStrong}`,
        boxShadow: FEED_PALETTE.cardShadow,
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          width: 64,
          height: 64,
          mx: 'auto',
          mb: 2,
          borderRadius: '20px',
          bgcolor: 'rgba(129, 215, 66, 0.16)',
          color: FEED_PALETTE.brandForest,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AutoAwesomeOutlinedIcon sx={{ fontSize: 32 }} />
      </Box>

      <Typography
        component="h2"
        sx={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: { xs: '1.25rem', sm: '1.45rem' },
          fontWeight: 800,
          color: FEED_PALETTE.inkPrimary,
          mb: 1,
        }}
      >
        {FEED_MESSAGES.EMPTY_TITLE}
      </Typography>

      <Typography
        sx={{
          color: FEED_PALETTE.inkSecondary,
          maxWidth: 500,
          mx: 'auto',
          mb: 3,
          lineHeight: 1.6,
        }}
      >
        {FEED_MESSAGES.EMPTY_DESCRIPTION}
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
        {canUploadPhotos && (
          <Button
            type="button"
            variant="contained"
            onClick={onNavigateUpload}
            startIcon={<AddAPhotoRoundedIcon />}
            sx={{
              minHeight: FEED_TOUCH_TARGET_PX,
              px: 3,
              borderRadius: 99,
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: FEED_PALETTE.brandForest,
              color: '#ffffff',
              '&:hover': {
                bgcolor: FEED_PALETTE.brandForestDeep,
              },
            }}
          >
            Enviar fotos do meu Clubinho
          </Button>
        )}

        <Button
          type="button"
          variant="outlined"
          disabled={isRefreshing}
          onClick={onRefresh}
          startIcon={<RefreshRoundedIcon />}
          sx={{
            minHeight: FEED_TOUCH_TARGET_PX,
            px: 3,
            borderRadius: 99,
            textTransform: 'none',
            fontWeight: 700,
            color: FEED_PALETTE.brandForest,
            borderColor: FEED_PALETTE.borderStrong,
            bgcolor: 'transparent',
            '&:hover': {
              bgcolor: 'rgba(129, 215, 66, 0.1)',
              borderColor: FEED_PALETTE.brandForest,
            },
          }}
        >
          {isRefreshing ? 'Atualizando...' : 'Atualizar Feed'}
        </Button>
      </Stack>
    </Paper>
  );
}
