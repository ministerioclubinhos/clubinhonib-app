import React, { useMemo } from 'react';
import {
  Alert,
  alpha,
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ArrowForward,
  AutoStories,
  CheckCircle,
  FactCheck,
  Palette,
  Settings,
  TaskAlt,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

import { useLessonDashboard } from '@/hooks/api/useAiLessons';
import { HubMetrics } from '@/features/ai-lessons/components/hub/HubMetrics';
import { HubQueueItem } from '@/features/ai-lessons/components/hub/HubQueueItem';
import { StudioActiveGenerations } from '@/features/ai-lessons/components/generation/StudioActiveGenerations';
import { HubReference } from '@/features/ai-lessons/components/hub/HubReference';
import {
  STUDIO_HUB_PUBLISHED_LIMIT,
  STUDIO_HUB_QUEUE_LIMIT,
  STUDIO_HUB_ROUTES,
  STUDIO_HUB_TEXTS,
} from '@/features/ai-lessons/hub.constants';
import {
  buildHubQueue,
  hubLessonTag,
  hubMetrics,
  hubRelativeTime,
} from '@/features/ai-lessons/hub.utils';
import { LessonStatus } from '@/features/ai-lessons/types';

const panelSx = {
  p: { xs: 1.5, sm: 2 },
  minWidth: 0,
  borderRadius: 4,
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
} as const;

/**
 * Painel do Estúdio Clubinho.
 *
 * É uma fila de trabalho, não uma vitrine: o topo diz quantas lições há em cada
 * situação (e cada número abre a lista correspondente), e o meio lista as
 * lições em andamento com o próximo passo de cada uma a um clique. O que nunca
 * muda — o fluxo editorial e o padrão do estúdio — fica recolhido no fim.
 */
export const AiLessonsHubPage: React.FC = () => {
  const theme = useTheme();
  const { data, isLoading, isError, refetch } = useLessonDashboard();

  const queue = useMemo(() => buildHubQueue(data?.active ?? []), [data?.active]);
  const metrics = useMemo(() => hubMetrics(data), [data]);
  const published = useMemo(
    () =>
      (data?.recent ?? [])
        .filter((lesson) => lesson.status === LessonStatus.PUBLISHED)
        .slice(0, STUDIO_HUB_PUBLISHED_LIMIT),
    [data?.recent]
  );
  const visibleQueue = queue.slice(0, STUDIO_HUB_QUEUE_LIMIT);
  const total = data?.total ?? 0;

  return (
    <Box
      data-testid="ai-lessons-hub-page"
      sx={{ width: { xs: '98%', md: '95%' }, mx: 'auto', py: { xs: 1.5, md: 2 } }}
    >
      <Paper
        component="header"
        elevation={0}
        sx={{
          p: { xs: 1.75, md: 2.25 },
          mb: 2,
          borderRadius: 4,
          color: '#fff',
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 70%, ${theme.palette.primary.light} 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Palette
          aria-hidden
          sx={{
            position: 'absolute',
            right: -24,
            bottom: -36,
            fontSize: 200,
            opacity: 0.08,
            pointerEvents: 'none',
          }}
        />
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
          gap={1.5}
          sx={{ position: 'relative' }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="h1"
              fontWeight={800}
              // A cor é explícita: o estilo global dos títulos os pinta de azul, que
              // some sobre o fundo azul do cabeçalho.
              sx={{
                color: '#fff',
                fontSize: { xs: '1.35rem', md: '1.6rem' },
                letterSpacing: '-0.3px',
              }}
            >
              {STUDIO_HUB_TEXTS.title}
            </Typography>
            <Typography
              data-testid="ai-lessons-hub-summary"
              sx={{ color: 'rgba(255,255,255,.9)', fontSize: { xs: '0.9rem', sm: '0.95rem' } }}
            >
              {isLoading || isError
                ? 'Lições e materiais bíblicos semanais.'
                : `${total} ${total === 1 ? 'lição' : 'lições'} no estúdio · ${queue.length} em andamento`}
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
            <Button
              component={RouterLink}
              to={STUDIO_HUB_ROUTES.production}
              variant="contained"
              startIcon={<AutoStories />}
              sx={{
                bgcolor: '#fff',
                color: 'primary.main',
                fontWeight: 700,
                minHeight: 44,
                borderRadius: 3,
                textTransform: 'none',
                '&:hover': { bgcolor: 'rgba(255,255,255,.92)' },
              }}
            >
              Produzir lição
            </Button>
            <Stack direction="row" gap={1}>
              {[
                { label: 'Revisão', to: STUDIO_HUB_ROUTES.review, icon: <FactCheck /> },
                { label: 'Orientações', to: STUDIO_HUB_ROUTES.guidelines, icon: <Settings /> },
              ].map((link) => (
                <Button
                  key={link.to}
                  component={RouterLink}
                  to={link.to}
                  variant="outlined"
                  startIcon={link.icon}
                  sx={{
                    flex: { xs: 1, sm: 'none' },
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,.55)',
                    fontWeight: 600,
                    minHeight: 44,
                    borderRadius: 3,
                    textTransform: 'none',
                    '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,.1)' },
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      <StudioActiveGenerations />

      {isError ? (
        <Alert
          severity="error"
          sx={{ borderRadius: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          }
        >
          {STUDIO_HUB_TEXTS.error}
        </Alert>
      ) : isLoading ? (
        <Box data-testid="ai-lessons-hub-loading" aria-busy="true" aria-label="Carregando o painel">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(5, minmax(0, 1fr))',
              },
              gap: 1.25,
              mb: 2,
            }}
          >
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} variant="rounded" height={64} sx={{ borderRadius: 3 }} />
            ))}
          </Box>
          <Stack gap={1.25}>
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} variant="rounded" height={132} sx={{ borderRadius: 3 }} />
            ))}
          </Stack>
        </Box>
      ) : (
        <>
          <HubMetrics metrics={metrics} />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                lg: 'minmax(0, 2fr) minmax(300px, 1fr)',
              },
              gap: 2,
              alignItems: 'start',
            }}
          >
            <Paper
              component="section"
              elevation={0}
              aria-labelledby="hub-queue-title"
              data-testid="ai-lessons-hub-queue"
              sx={panelSx}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                gap={1}
                sx={{ mb: 1.5 }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <TaskAlt color="primary" fontSize="small" />
                    <Typography
                      id="hub-queue-title"
                      component="h2"
                      fontWeight={800}
                      fontSize="1.15rem"
                      color="text.primary"
                    >
                      {STUDIO_HUB_TEXTS.queueTitle}
                    </Typography>
                    {queue.length > 0 && <Chip size="small" label={queue.length} />}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {STUDIO_HUB_TEXTS.queueSubtitle}
                  </Typography>
                </Box>
                <Button
                  component={RouterLink}
                  to={STUDIO_HUB_ROUTES.production}
                  size="small"
                  endIcon={<ArrowForward />}
                  sx={{ flexShrink: 0, fontWeight: 700, minHeight: 44, textTransform: 'none' }}
                >
                  Ver todas
                </Button>
              </Stack>

              {queue.length === 0 ? (
                <Box
                  data-testid="ai-lessons-hub-queue-empty"
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderRadius: 3,
                    border: '1px dashed',
                    borderColor: 'divider',
                    bgcolor: alpha(theme.palette.success.main, 0.04),
                  }}
                >
                  <CheckCircle color="success" sx={{ fontSize: 36, mb: 1 }} />
                  <Typography fontWeight={700}>{STUDIO_HUB_TEXTS.queueEmptyTitle}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {STUDIO_HUB_TEXTS.queueEmptyText}
                  </Typography>
                  <Button
                    component={RouterLink}
                    to={STUDIO_HUB_ROUTES.production}
                    variant="contained"
                    startIcon={<AutoStories />}
                    sx={{
                      borderRadius: 2.5,
                      fontWeight: 700,
                      minHeight: 44,
                      textTransform: 'none',
                    }}
                  >
                    Produzir lição
                  </Button>
                </Box>
              ) : (
                <Stack component="ul" gap={1.25} sx={{ m: 0, p: 0 }}>
                  {visibleQueue.map((item) => (
                    <HubQueueItem key={item.lesson.id} item={item} />
                  ))}
                </Stack>
              )}

              {queue.length > visibleQueue.length && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 1.5 }}
                >
                  Mostrando {visibleQueue.length} de {queue.length}. Abra a lista completa em Ver
                  todas.
                </Typography>
              )}
            </Paper>

            <Stack gap={2} sx={{ minWidth: 0 }}>
              <Paper
                component="section"
                elevation={0}
                aria-labelledby="hub-published-title"
                data-testid="ai-lessons-hub-published"
                sx={panelSx}
              >
                <Typography
                  id="hub-published-title"
                  component="h2"
                  fontWeight={800}
                  fontSize="1.05rem"
                  color="text.primary"
                  sx={{ mb: 1 }}
                >
                  {STUDIO_HUB_TEXTS.publishedTitle}
                </Typography>
                {published.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {STUDIO_HUB_TEXTS.publishedEmpty}
                  </Typography>
                ) : (
                  <Stack component="ul" gap={0.5} sx={{ m: 0, p: 0, listStyle: 'none' }}>
                    {published.map((lesson) => (
                      <Box component="li" key={lesson.id} sx={{ minWidth: 0 }}>
                        <Button
                          component={RouterLink}
                          to={`${STUDIO_HUB_ROUTES.review}/${lesson.id}`}
                          fullWidth
                          sx={{
                            justifyContent: 'flex-start',
                            textAlign: 'left',
                            textTransform: 'none',
                            minHeight: 44,
                            px: 1,
                            borderRadius: 2,
                            color: 'text.primary',
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              sx={{
                                overflowWrap: 'anywhere',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {lesson.theme}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {hubLessonTag(lesson)} · {hubRelativeTime(lesson.updatedAt)}
                            </Typography>
                          </Box>
                        </Button>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Paper>

              <HubReference />
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );
};
