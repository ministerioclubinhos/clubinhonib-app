import React from 'react';
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  CircularProgress,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  AutoStories,
  CheckCircle,
  ChevronRight,
  EditNote,
  LibraryBooks,
  Palette,
  Publish,
  Settings,
  ViewList,
  ArrowForward,
  TaskAlt,
  MenuBook,
  FactCheck,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLessonDashboard } from '@/hooks/api/useAiLessons';
import { LessonStageStatus } from '@/services/aiLessonsService';
import { AI_LESSON_HUB_RECENT_LIMIT } from '@/features/ai-lessons/constants';

const statusLabel: Record<string, string> = {
  DRAFT: 'Novo Rascunho',
  IN_PROGRESS: 'Em Produção',
  PACKAGE_READY: 'Pacote Completo',
  IN_REVIEW: 'Em Aprovação',
  CHANGES_REQUESTED: 'Ajustes Solicitados',
  READY_FOR_PUBLICATION: 'Pronto para Publicar',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Arquivado',
};

const statusColor: Record<
  string,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  DRAFT: 'warning',
  IN_PROGRESS: 'info',
  PACKAGE_READY: 'info',
  IN_REVIEW: 'warning',
  CHANGES_REQUESTED: 'error',
  READY_FOR_PUBLICATION: 'success',
  PUBLISHED: 'success',
  ARCHIVED: 'default',
};

export const AiLessonsHubPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { data, isLoading, isError, refetch } = useLessonDashboard();
  const lessons = data?.recent ?? [];

  const metrics = [
    {
      label: 'Total de lições',
      value: data?.total ?? 0,
      icon: <LibraryBooks />,
      color: theme.palette.primary.main,
      bg: alpha(theme.palette.primary.main, 0.1),
    },
    {
      label: 'Em produção',
      value:
        (data?.byStatus.DRAFT ?? 0) +
        (data?.byStatus.IN_PROGRESS ?? 0) +
        (data?.byStatus.CHANGES_REQUESTED ?? 0),
      icon: <EditNote />,
      color: theme.palette.warning.main,
      bg: alpha(theme.palette.warning.main, 0.1),
    },
    {
      label: 'Prontas',
      value: data?.byStatus.READY_FOR_PUBLICATION ?? 0,
      icon: <CheckCircle />,
      color: theme.palette.success.main,
      bg: alpha(theme.palette.success.main, 0.1),
    },
    {
      label: 'Publicadas',
      value: data?.byStatus.PUBLISHED ?? 0,
      icon: <Publish />,
      color: theme.palette.info.main,
      bg: alpha(theme.palette.info.main, 0.1),
    },
  ];

  const editorialFlow = [
    { step: 1, name: 'Lição completa', desc: 'Estrutura teológica e roteiro' },
    { step: 2, name: 'Visuais da história', desc: 'Artes narrativas (A4 Paisagem)' },
    { step: 3, name: 'Brincadeira', desc: 'Atividade dinâmica interativa' },
    {
      step: 4,
      name: 'Visuais do versículo',
      desc: 'Imagens pela quebra semântica + referência final',
    },
    { step: 5, name: 'Fixação divertida', desc: 'Dinâmica para memorizar o versículo' },
    { step: 6, name: 'Meditação menores', desc: 'Para crianças de 5 a 7 anos' },
    { step: 7, name: 'Meditação maiores', desc: 'Para crianças de 8 a 11 anos' },
    { step: 8, name: 'Trabalho manual', desc: 'Atividades impressas (A4 Retrato)' },
    { step: 9, name: 'Material semanal', desc: 'Compilação e PDF oficial' },
  ];

  return (
    <Box
      data-testid="ai-lessons-hub-page"
      sx={{
        width: { xs: '98%', md: '95%' },
        mx: 'auto',
        py: { xs: 1.5, md: 2 },
      }}
    >
      {/* Hero Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 2,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 60%, ${theme.palette.primary.light} 100%)`,
          color: '#ffffff',
          boxShadow: '0 10px 30px rgba(25, 118, 210, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background icon */}
        <Palette
          sx={{
            position: 'absolute',
            right: -20,
            bottom: -30,
            fontSize: 220,
            opacity: 0.08,
            color: '#ffffff',
            pointerEvents: 'none',
          }}
        />

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
          spacing={2}
          sx={{ position: 'relative', zIndex: 1 }}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
              <Box
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 3,
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Palette sx={{ fontSize: { xs: 24, sm: 32 }, color: '#ffffff' }} />
              </Box>
              <Chip
                label="IA & Editorial"
                size="small"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  backdropFilter: 'blur(4px)',
                }}
              />
            </Stack>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                fontSize: { xs: '1.4rem', md: '1.75rem' },
                letterSpacing: '-0.5px',
                color: '#ffffff',
                mb: 0.75,
              }}
            >
              Estúdio Clubinho
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                maxWidth: 600,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                lineHeight: 1.5,
              }}
            >
              Central inteligente para criação, revisão e produção das lições e materiais bíblicos
              semanais.
            </Typography>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ width: { xs: '100%', md: 'auto' } }}
          >
            <Button
              fullWidth
              variant="contained"
              size="medium"
              startIcon={<AutoStories />}
              onClick={() => navigate('/adm/estudio/licoes')}
              sx={{
                bgcolor: '#ffffff',
                color: theme.palette.primary.main,
                fontWeight: 700,
                px: 3,
                py: 1,
                borderRadius: 3,
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                minHeight: 44,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Produzir lição
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="medium"
              startIcon={<FactCheck />}
              onClick={() => navigate('/adm/estudio/revisao')}
              sx={{
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                fontWeight: 600,
                px: 2.5,
                py: 1,
                borderRadius: 3,
                minHeight: 44,
                backdropFilter: 'blur(4px)',
                '&:hover': {
                  borderColor: '#ffffff',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Revisão & Aprovação
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="medium"
              startIcon={<Settings />}
              onClick={() => navigate('/adm/estudio/orientacoes')}
              sx={{
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                fontWeight: 600,
                px: 2.5,
                py: 1,
                borderRadius: 3,
                minHeight: 44,
                backdropFilter: 'blur(4px)',
                '&:hover': {
                  borderColor: '#ffffff',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Orientações
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Loading & Error States */}
      {isLoading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 10 }}>
          <CircularProgress size={44} thickness={4} />
          <Typography color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>
            Carregando painel do estúdio...
          </Typography>
        </Box>
      ) : isError ? (
        <Alert
          severity="error"
          sx={{ borderRadius: 3, mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          }
        >
          Não foi possível carregar o painel do estúdio.
        </Alert>
      ) : (
        <>
          {/* KPI Metrics Grid (2x2 on Mobile, 4x1 on Desktop) */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 1.25,
              mb: 2,
            }}
          >
            {metrics.map((metric) => (
              <Paper
                key={metric.label}
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 3.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                  },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  justifyContent="space-between"
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 3,
                      bgcolor: metric.bg,
                      color: metric.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '& svg': { fontSize: { xs: 22, sm: 26 } },
                    }}
                  >
                    {metric.icon}
                  </Box>
                  <Typography
                    variant="h4"
                    fontWeight={800}
                    sx={{
                      color: metric.color,
                      fontSize: { xs: '1.4rem', sm: '1.6rem' },
                    }}
                  >
                    {metric.value}
                  </Typography>
                </Stack>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ mt: 0.75, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  {metric.label}
                </Typography>
              </Paper>
            ))}
          </Box>

          {/* Main Grid: Recent Productions & Editorial Guide */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                lg: 'minmax(0, 1.8fr) minmax(320px, 1fr)',
              },
              gap: 2,
            }}
          >
            {/* Recent Productions */}
            <Paper
              data-testid="ai-lessons-hub-recent-productions"
              elevation={0}
              sx={{
                p: 2,
                minWidth: 0,
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                gap={1}
                sx={{ mb: 1.5 }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                  >
                    Produções recentes
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Últimas lições em andamento no estúdio
                  </Typography>
                </Box>
                <Button
                  size="small"
                  startIcon={<ViewList />}
                  endIcon={<ArrowForward sx={{ fontSize: '1rem !important' }} />}
                  onClick={() => navigate('/adm/estudio/licoes')}
                  sx={{ fontWeight: 700, borderRadius: 2, minHeight: 44, flexShrink: 0 }}
                >
                  Ver todas
                </Button>
              </Stack>

              {lessons.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                    borderRadius: 3,
                    border: '1px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}
                  >
                    <AutoStories sx={{ fontSize: 28 }} />
                  </Box>
                  <Typography fontWeight={700} variant="subtitle1" gutterBottom>
                    Nenhuma lição iniciada
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2.5, maxWidth: 360, margin: '0 auto 20px' }}
                  >
                    Comece produzindo o primeiro pacote editorial de lições para o Clubinho.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AutoStories />}
                    onClick={() => navigate('/adm/estudio/licoes')}
                    sx={{ borderRadius: 2.5, px: 3, fontWeight: 700 }}
                  >
                    Criar Primeira Lição
                  </Button>
                </Paper>
              ) : (
                <Stack spacing={1}>
                  {lessons.slice(0, AI_LESSON_HUB_RECENT_LIMIT).map((lesson) => {
                    const approved = lesson.stages.filter(
                      (stage) => stage.status === LessonStageStatus.APPROVED
                    ).length;
                    const total = lesson.stages.length || 7;
                    const progressPercent = Math.round((approved / total) * 100);

                    return (
                      <Card
                        data-testid={`ai-lessons-hub-recent-lesson-${lesson.id}`}
                        key={lesson.id}
                        elevation={0}
                        sx={{
                          borderRadius: 3,
                          border: '1px solid',
                          borderColor: 'divider',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                          },
                        }}
                      >
                        <CardActionArea
                          onClick={() => navigate(`/adm/estudio/licoes/${lesson.id}`)}
                          sx={{ p: 1.25 }}
                        >
                          <Stack spacing={0.75}>
                            <Stack
                              direction={{ xs: 'column', sm: 'row' }}
                              justifyContent="space-between"
                              alignItems="flex-start"
                              gap={1}
                            >
                              <Box sx={{ minWidth: 0, flex: 1, width: { xs: '100%', sm: 'auto' } }}>
                                <Typography
                                  fontWeight={700}
                                  sx={{
                                    fontSize: { xs: '0.95rem', sm: '1.05rem' },
                                    color: 'text.primary',
                                    overflowWrap: 'anywhere',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    lineHeight: 1.3,
                                  }}
                                >
                                  {lesson.theme}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    mt: 0.25,
                                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {lesson.biblicalReference}
                                </Typography>
                              </Box>

                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Chip
                                  size="small"
                                  label={statusLabel[lesson.status] ?? lesson.status}
                                  color={statusColor[lesson.status] ?? 'default'}
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: '0.725rem',
                                    borderRadius: 1.5,
                                  }}
                                />
                                <ChevronRight sx={{ color: 'action.active', ml: 0.5 }} />
                              </Stack>
                            </Stack>

                            <Box>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                flexWrap="wrap"
                                gap={0.5}
                                sx={{ mb: 0.75 }}
                              >
                                <Typography
                                  variant="caption"
                                  fontWeight={600}
                                  color="text.secondary"
                                >
                                  Progresso de aprovação
                                </Typography>
                                <Typography variant="caption" fontWeight={700} color="primary.main">
                                  {approved}/{total} etapas ({progressPercent}%)
                                </Typography>
                              </Stack>
                              <LinearProgress
                                variant="determinate"
                                value={progressPercent}
                                sx={{
                                  height: 4,
                                  borderRadius: 4,
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    bgcolor:
                                      progressPercent === 100 ? 'success.main' : 'primary.main',
                                  },
                                }}
                              />
                            </Box>
                          </Stack>
                        </CardActionArea>
                      </Card>
                    );
                  })}
                </Stack>
              )}
            </Paper>

            {/* Right Column: Editorial Flow & Standards */}
            <Stack spacing={2} sx={{ minWidth: 0 }}>
              {/* Fluxo Editorial Card */}
              <Paper
                data-testid="ai-lessons-hub-editorial-flow"
                elevation={0}
                sx={{
                  p: 2,
                  minWidth: 0,
                  overflowWrap: 'anywhere',
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <TaskAlt color="primary" />
                  <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1.1rem' }}>
                    Fluxo editorial
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  O pacote contém 8 itens encadeados e, após a aprovação, é compilado no material
                  semanal:
                </Typography>

                <Stack spacing={1}>
                  {editorialFlow.map((item) => (
                    <Paper
                      key={item.step}
                      elevation={0}
                      sx={{
                        p: 1,
                        px: 1.25,
                        borderRadius: 2.5,
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                        border: '1px solid',
                        borderColor: alpha(theme.palette.primary.main, 0.08),
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Chip
                        label={item.step}
                        size="small"
                        color="primary"
                        sx={{
                          fontWeight: 800,
                          minWidth: 26,
                          flexShrink: 0,
                          height: 26,
                          borderRadius: '50%',
                          fontSize: '0.75rem',
                          '& .MuiChip-label': { px: 0 },
                        }}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                          {item.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', overflowWrap: 'anywhere' }}
                        >
                          {item.desc}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </Paper>

              {/* Padrão do Estúdio Card */}
              <Paper
                data-testid="ai-lessons-hub-studio-standards"
                elevation={0}
                sx={{
                  p: 2,
                  minWidth: 0,
                  overflowWrap: 'anywhere',
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: alpha(theme.palette.info.main, 0.03),
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <MenuBook color="info" />
                  <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1.1rem' }}>
                    Padrão do estúdio
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 2 }}>
                  Conteúdo estruturado para crianças de 5 a 11 anos, fundamentado na Bíblia NVI, com
                  artes narrativas em A4 paisagem e atividades manuais em A4 retrato.
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  <Chip size="small" label="5 a 11 anos" variant="outlined" color="primary" />
                  <Chip size="small" label="Bíblia NVI" variant="outlined" color="primary" />
                  <Chip size="small" label="A4 Paisagem" variant="outlined" color="info" />
                  <Chip size="small" label="A4 Retrato" variant="outlined" color="info" />
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );
};
