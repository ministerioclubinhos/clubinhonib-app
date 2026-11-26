import React from 'react';
import { Paper, Box, Typography, Avatar, Chip, Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/slices';
import { useFeatureFlags } from '@/hooks';
import { FEATURE } from '@/features/feature-flags';
import { weekdayLabel } from '@/utils/dateUtils';
import { UserRole } from '@/types/shared';
import { formatCoordinatorClubsLabel, formatTeacherClubLabel } from '../../utils/clubLabel';

const ROLE_LABELS: Record<string, string> = {
  [UserRole.ADMIN]: 'Administração',
  [UserRole.COORDINATOR]: 'Coordenação',
  [UserRole.TEACHER]: 'Professor(a) do Clubinho',
};

const TeacherAreaHeader: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const { flags } = useFeatureFlags();

  const displayName = user?.name || 'Professor';
  const firstName = displayName.split(' ')[0];
  const club = user?.teacherProfile?.club;
  const hasClub = Boolean(club);
  const coordinatorClubs = user?.coordinatorProfile?.clubs ?? [];
  const roleLabel = (user?.role && ROLE_LABELS[user.role]) || 'Professor(a) do Clubinho';

  return (
    <Paper
      data-testid="teacher-area-header"
      elevation={0}
      sx={{
        mb: { xs: 1.5, md: 2.5 },
        borderRadius: { xs: 2.5, md: 3.5 },
        overflow: 'hidden',
        border: '1px solid #dbe4f0',
        boxShadow: '0 6px 24px rgba(15, 23, 42, 0.06)',
        background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 55%, #ffffff 100%)',
        color: '#0f2942',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          right: -40,
          top: -50,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.18) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <Box
        sx={{
          p: { xs: 1.5, sm: 2.5, md: 3 },
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: { xs: 'stretch', lg: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 1.25, lg: 3 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Identidade fixa da Área do Professor */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2.25 } }}>
          <Avatar
            src={user?.image?.url}
            alt={displayName}
            sx={{
              width: { xs: 50, sm: 60 },
              height: { xs: 50, sm: 60 },
              bgcolor: '#bae6fd',
              color: '#0f2942',
              fontWeight: 800,
              fontSize: { xs: '1.2rem', sm: '1.45rem' },
              border: '2px solid #ffffff',
              boxShadow: '0 4px 14px rgba(0,0,0,0.22)',
              flexShrink: 0,
            }}
          >
            {firstName.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
              <Chip
                icon={<SchoolIcon sx={{ color: '#0369a1 !important', fontSize: '0.9rem' }} />}
                label="Área do Professor"
                size="small"
                sx={{
                  bgcolor: '#bae6fd',
                  color: '#0c4a6e',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  height: 22,
                  backdropFilter: 'blur(4px)',
                }}
              />
              <Chip
                label={roleLabel}
                size="small"
                sx={{
                  bgcolor: 'rgba(56, 189, 248, 0.22)',
                  color: '#0c4a6e',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 22,
                  border: '1px solid rgba(186, 230, 253, 0.3)',
                }}
              />
            </Stack>

            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                fontSize: { xs: '1.15rem', sm: '1.4rem', md: '1.65rem' },
                lineHeight: 1.2,
                letterSpacing: -0.3,
              }}
            >
              Olá, {firstName}! Bom ter você aqui.
            </Typography>

            <Typography
              variant="body2"
              sx={{
                display: { xs: 'none', sm: 'block' },
                color: '#334155',
                mt: 0.4,
                fontSize: { xs: '0.78rem', sm: '0.88rem' },
                lineHeight: 1.45,
              }}
            >
              Sua sala de preparação, materiais didáticos e acompanhamento do Clubinho •{' '}
              <Box component="span" sx={{ fontStyle: 'italic', color: '#0369a1' }}>
                “Apascenta os meus cordeiros.” (João 21:15)
              </Box>
            </Typography>
          </Box>
        </Box>

        {/* Vínculo com Clubinho + Ações */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 1.25,
            width: { xs: '100%', lg: 'auto' },
            justifyContent: { xs: 'stretch', sm: 'space-between', lg: 'flex-end' },
          }}
        >
          {club ? (
            <Box
              sx={{
                px: 1.75,
                py: 1,
                borderRadius: 2,
                bgcolor: '#ffffff',
                border: '1px solid #cfe3f5',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
              }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 1.5,
                  bgcolor: '#e0f2fe',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <HomeOutlinedIcon sx={{ fontSize: 19, color: '#0369a1' }} />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: '#64748b',
                    fontWeight: 700,
                    fontSize: '0.64rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                    lineHeight: 1.1,
                  }}
                >
                  Meu Clubinho
                </Typography>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#0f2942', lineHeight: 1.25 }}>
                  {formatTeacherClubLabel(club)}
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <AccessTimeIcon sx={{ fontSize: 12, color: '#0369a1' }} />
                  <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>
                    {weekdayLabel(club.weekday)}
                    {club.time ? ` às ${club.time}` : ''}
                  </Typography>
                </Stack>
              </Box>
            </Box>
          ) : coordinatorClubs.length > 0 ? (
            <Box
              sx={{
                px: 1.75,
                py: 1,
                borderRadius: 2,
                bgcolor: '#ffffff',
                border: '1px solid #cfe3f5',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
              }}
            >
              <HomeOutlinedIcon sx={{ fontSize: 20, color: '#0369a1' }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', lineHeight: 1.1 }}>
                  Coordenação
                </Typography>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#0f2942' }}>
                  {formatCoordinatorClubsLabel(coordinatorClubs)}
                </Typography>
              </Box>
            </Box>
          ) : null}

          <Stack
            direction="row"
            spacing={1}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {flags[FEATURE.CHILDREN_AREA] && hasClub && (
              <Button
                component={Link}
                to="/area-das-criancas"
                variant="contained"
                size="small"
                startIcon={<ChildCareIcon />}
                sx={{
                  bgcolor: '#154c79',
                  color: '#ffffff',
                  fontWeight: 800,
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2,
                  py: 0.9,
                  flex: { xs: 1, sm: 'none' }, fontSize: { xs: '0.8rem', sm: '0.875rem' }, minHeight: 40,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                  '&:hover': {
                    bgcolor: '#0f2942',
                  },
                }}
              >
                Crianças do meu Clubinho
              </Button>
            )}
            <Button
              component={Link}
              to="/meu-perfil"
              variant="outlined"
              size="small"
              startIcon={<PersonOutlineIcon />}
              sx={{
                color: '#154c79',
                borderColor: '#93c5e8',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: 2,
                px: 1.75,
                py: 0.9,
                flex: { xs: 1, sm: 'none' }, fontSize: { xs: '0.8rem', sm: '0.875rem' }, minHeight: 40,
                '&:hover': {
                  borderColor: '#154c79',
                  bgcolor: 'rgba(21,76,121,0.06)',
                },
              }}
            >
              Meu Perfil
            </Button>
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
};

export default TeacherAreaHeader;
