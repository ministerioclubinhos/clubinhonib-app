import React, { useMemo } from 'react';
import { Paper, Box, Typography, Avatar, Chip, Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import FavoriteIcon from '@mui/icons-material/Favorite';
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
import { WelcomeSectionProps } from '../../types';
import { WEEKLY_VERSES, EVANGELISM_VERSE } from '../../constants';

const getWeekOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
};

const ROLE_LABELS: Record<string, string> = {
  [UserRole.ADMIN]: 'Administração',
  [UserRole.COORDINATOR]: 'Coordenação',
  [UserRole.TEACHER]: 'Professor(a) do Clubinho',
};

interface HighlightProps {
  icon: React.ReactNode;
  title: string;
  text: string;
  reference: string;
  color: string;
  background: string;
  borderColor: string;
  testId: string;
}

const Highlight: React.FC<HighlightProps> = ({
  icon,
  title,
  text,
  reference,
  color,
  background,
  borderColor,
  testId,
}) => (
  <Box
    data-testid={testId}
    sx={{
      flex: 1,
      p: { xs: 1.5, md: 2 },
      borderRadius: 2.5,
      background,
      border: `1px solid ${borderColor}`,
      borderLeft: `4px solid ${color}`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
      {icon}
      <Typography
        variant="overline"
        fontWeight={800}
        sx={{ color, fontSize: '0.72rem', letterSpacing: 0.8, lineHeight: 1.2 }}
      >
        {title}
      </Typography>
    </Box>
    <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#334155', lineHeight: 1.5 }}>
      “{text}”{' '}
      <Box component="span" sx={{ color, fontStyle: 'normal', fontWeight: 700, whiteSpace: 'nowrap' }}>
        — {reference}
      </Box>
    </Typography>
  </Box>
);

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ userName, user: userProp, showVerse }) => {
  const authUser = useSelector((state: RootState) => state.auth.user);
  const user = userProp ?? authUser;
  const { flags } = useFeatureFlags();

  const verse = useMemo(() => WEEKLY_VERSES[getWeekOfYear(new Date()) % WEEKLY_VERSES.length], []);

  const displayName = userName || user?.name || 'Professor';
  const firstName = displayName.split(' ')[0];
  const club = user?.teacherProfile?.club;
  const hasClub = Boolean(club);
  const coordinatorClubs = user?.coordinatorProfile?.clubs ?? [];
  const roleLabel = (user?.role && ROLE_LABELS[user.role]) || 'Professor(a) do Clubinho';

  return (
    <Paper
      data-testid="teacher-area-sections-welcome-section"
      elevation={0}
      sx={{
        mb: { xs: 2, md: 3 },
        borderRadius: { xs: 2.5, md: 3.5 },
        overflow: 'hidden',
        border: '1px solid #dbe4f0',
        boxShadow: '0 6px 24px rgba(15, 23, 42, 0.06)',
        background: '#ffffff',
      }}
    >
      {/* Faixa superior de identidade da Sala do Professor (Mobile-first) */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0f2942 0%, #154c79 55%, #1e6091 100%)',
          color: '#ffffff',
          p: { xs: 2, sm: 2.5, md: 3.5 },
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: { xs: 'stretch', lg: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 2, lg: 3 },
          position: 'relative',
          overflow: 'hidden',
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
            background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Saudação e Identidade do Professor */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2.25 }, zIndex: 1 }}>
          <Avatar
            src={user?.image?.url}
            alt={displayName}
            sx={{
              width: { xs: 52, sm: 64 },
              height: { xs: 52, sm: 64 },
              bgcolor: 'rgba(255,255,255,0.18)',
              color: '#fff',
              fontWeight: 800,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              border: '2px solid rgba(255,255,255,0.75)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.22)',
              flexShrink: 0,
            }}
          >
            {firstName.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
              <Chip
                icon={<SchoolIcon sx={{ color: '#fff !important', fontSize: '0.9rem' }} />}
                label="Área do Professor"
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.18)',
                  color: '#fff',
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
                  color: '#e0f2fe',
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
                fontSize: { xs: '1.2rem', sm: '1.45rem', md: '1.7rem' },
                lineHeight: 1.2,
                letterSpacing: -0.3,
              }}
            >
              Olá, {firstName}! Bom ter você aqui.
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.86)',
                mt: 0.4,
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                lineHeight: 1.45,
              }}
            >
              Sua sala de preparação, materiais didáticos e acompanhamento do Clubinho •{' '}
              <Box component="span" sx={{ fontStyle: 'italic', color: '#bae6fd' }}>
                “Apascenta os meus cordeiros.” (João 21:15)
              </Box>
            </Typography>
          </Box>
        </Box>

        {/* Cartão de vínculo com o Clubinho + Ações do Professor */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 1.25,
            width: { xs: '100%', lg: 'auto' },
            justifyContent: { xs: 'stretch', sm: 'space-between', lg: 'flex-end' },
            zIndex: 1,
          }}
        >
          {club ? (
            <Box
              sx={{
                px: 1.75,
                py: 1,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.22)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <HomeOutlinedIcon sx={{ fontSize: 20, color: '#fff' }} />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: 'rgba(255,255,255,0.75)',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                    lineHeight: 1.1,
                  }}
                >
                  Meu Clubinho
                </Typography>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#fff', lineHeight: 1.25 }}>
                  Clubinho Nº {club.number}
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <AccessTimeIcon sx={{ fontSize: 12, color: '#bae6fd' }} />
                  <Typography variant="caption" sx={{ color: '#e0f2fe', fontWeight: 600 }}>
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
                bgcolor: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.22)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
              }}
            >
              <HomeOutlinedIcon sx={{ fontSize: 20, color: '#bae6fd' }} />
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', display: 'block', lineHeight: 1.1 }}>
                  Coordenação
                </Typography>
                <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#fff' }}>
                  {coordinatorClubs.length} {coordinatorClubs.length === 1 ? 'Clubinho vinculado' : 'Clubinhos vinculados'}
                </Typography>
              </Box>
            </Box>
          ) : null}

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
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
                  bgcolor: '#ffffff',
                  color: '#0f2942',
                  fontWeight: 800,
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  width: { xs: '100%', sm: 'auto' },
                  boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                  '&:hover': {
                    bgcolor: '#f0f9ff',
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
                color: '#ffffff',
                borderColor: 'rgba(255,255,255,0.4)',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: 2,
                px: 1.75,
                py: 1,
                width: { xs: '100%', sm: 'auto' },
                '&:hover': {
                  borderColor: '#ffffff',
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Meu Perfil
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Faixa inferior: Versículo da Semana + Motivação */}
      <Box
        sx={{
          p: { xs: 1.75, sm: 2.25, md: 2.75 },
          bgcolor: '#f8fafc',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 1.5, md: 2 },
        }}
      >
        {showVerse && (
          <Highlight
            testId="teacher-area-sections-verse-of-week-section"
            icon={<AutoStoriesIcon sx={{ color: '#d97706', fontSize: '1.15rem' }} />}
            title="Versículo da Semana para Meditar"
            text={verse.text}
            reference={verse.reference}
            color="#b45309"
            background="#fffbeb"
            borderColor="#fde68a"
          />
        )}
        <Highlight
          testId="teacher-area-sections-motivation-section"
          icon={<FavoriteIcon sx={{ color: '#0284c7', fontSize: '1.15rem' }} />}
          title="Propósito do Nosso Ministério"
          text={EVANGELISM_VERSE.text}
          reference={EVANGELISM_VERSE.reference}
          color="#0369a1"
          background="#f0f9ff"
          borderColor="#bae6fd"
        />
      </Box>
    </Paper>
  );
};

export default WelcomeSection;
