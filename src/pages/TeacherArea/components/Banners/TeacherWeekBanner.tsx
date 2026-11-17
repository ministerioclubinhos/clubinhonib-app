import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/slices';
import { useVisibleRoutes } from '@/features/feature-flags';
import { Box, Typography, Button, Paper, Chip, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import { MediaTargetType } from 'store/slices/types';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LibraryBooksOutlinedIcon from '@mui/icons-material/LibraryBooksOutlined';

const TeacherWeekBanner: React.FC = () => {
  const routes = useVisibleRoutes();
  const { user } = useSelector((state: RootState) => state.auth);
  const currentWeekRoute = routes.find(
    (route) => route.entityType === MediaTargetType.WeekMaterialsPage && route.current === true
  );

  const firstName = (user?.name || 'Professor').split(' ')[0];

  if (!currentWeekRoute) {
    return (
      <Paper
        data-testid="teacher-area-banners-teacher-week-banner"
        elevation={0}
        sx={{
          width: '100%',
          height: '100%',
          minHeight: { xs: 200, md: 230 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(2, 132, 199, 0.2)',
        }}
      >
        <Box>
          <Chip
            icon={<AutoStoriesIcon sx={{ color: '#fff !important', fontSize: '1rem' }} />}
            label="Lição Bíblica Semanal"
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.18)',
              color: '#fff',
              fontWeight: 700,
              mb: 1.5,
            }}
          />
          <Typography variant="h5" fontWeight={800} sx={{ mb: 0.75, fontSize: { xs: '1.2rem', md: '1.4rem' } }}>
            Acervo de Aulas do Clubinho
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.88)', maxWidth: 520 }}>
            Nenhum material está marcado como semana atual no momento, mas você pode consultar todas as lições bíblicas disponíveis.
          </Typography>
        </Box>

        <Box sx={{ mt: 2.5 }}>
          <Button
            variant="contained"
            component={Link}
            to="/lista-materias-semanais"
            endIcon={<ArrowForwardIcon />}
            sx={{
              bgcolor: '#ffffff',
              color: '#0369a1',
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: 2,
              px: 2.5,
              py: 1,
              '&:hover': { bgcolor: '#f0f9ff' },
            }}
          >
            Ver Materiais Semanais
          </Button>
        </Box>
      </Paper>
    );
  }

  const lessonPath = `/${currentWeekRoute.path.replace(/^\/+/, '')}`;

  return (
    <Paper
      data-testid="teacher-area-banners-teacher-week-banner"
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: { xs: 220, md: 250 },
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: { xs: 2.5, sm: 3, md: 3.5 },
        borderRadius: 3.5,
        background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 60%, #0ea5e9 100%)',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 28px rgba(2, 132, 199, 0.22)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 180,
          height: 180,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <Chip
            icon={<AutoStoriesIcon sx={{ color: '#fff !important', fontSize: '1rem' }} />}
            label="Lição da Semana"
            size="small"
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: '#fff',
              fontWeight: 800,
              letterSpacing: 0.4,
            }}
          />
          <Chip
            label="Em andamento"
            size="small"
            sx={{
              bgcolor: 'rgba(186, 230, 253, 0.22)',
              color: '#e0f2fe',
              fontWeight: 700,
              fontSize: '0.7rem',
            }}
          />
        </Stack>

        <Typography
          variant="h5"
          fontWeight={800}
          sx={{
            fontSize: { xs: '1.25rem', sm: '1.45rem', md: '1.6rem' },
            lineHeight: 1.25,
            mb: 0.75,
          }}
        >
          {currentWeekRoute.title || 'Material Semanal do Clubinho'}
        </Typography>

        {currentWeekRoute.subtitle && (
          <Typography
            variant="subtitle2"
            sx={{
              color: '#e0f2fe',
              fontWeight: 600,
              fontSize: { xs: '0.9rem', md: '0.98rem' },
              mb: 1,
            }}
          >
            {currentWeekRoute.subtitle}
          </Typography>
        )}

        <Typography
          variant="body2"
          sx={{
            fontSize: { xs: '0.85rem', md: '0.92rem' },
            color: 'rgba(255,255,255,0.9)',
          }}
        >
          {firstName}, o roteiro, visuais e atividades desta semana já estão prontos para você preparar sua aula! 📖
        </Typography>
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.25}
        sx={{ mt: 2.5, position: 'relative', zIndex: 1, width: { xs: '100%', sm: 'auto' } }}
      >
        <Button
          variant="contained"
          component={Link}
          to={lessonPath}
          endIcon={<ArrowForwardIcon />}
          sx={{
            bgcolor: '#ffffff',
            color: '#0369a1',
            fontWeight: 800,
            textTransform: 'none',
            px: 2.5,
            py: 1.1,
            width: { xs: '100%', sm: 'auto' },
            borderRadius: 2.5,
            boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
            '&:hover': {
              bgcolor: '#f0f9ff',
              transform: 'translateY(-1px)',
            },
          }}
        >
          Abrir Material da Semana
        </Button>

        <Button
          variant="outlined"
          component={Link}
          to="/lista-materias-semanais"
          startIcon={<LibraryBooksOutlinedIcon />}
          sx={{
            color: '#ffffff',
            borderColor: 'rgba(255,255,255,0.45)',
            fontWeight: 700,
            textTransform: 'none',
            px: 2,
            py: 1.1,
            width: { xs: '100%', sm: 'auto' },
            borderRadius: 2.5,
            '&:hover': {
              borderColor: '#ffffff',
              bgcolor: 'rgba(255,255,255,0.12)',
            },
          }}
        >
          Ver Todas as Semanas
        </Button>
      </Stack>
    </Paper>
  );
};

export default TeacherWeekBanner;
