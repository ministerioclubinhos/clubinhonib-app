import React from 'react';
import { Button, Box, Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  MenuBook as MenuBookIcon,
  PhotoCamera as PhotoCameraIcon,
  StarRate as StarRateIcon,
  Favorite as FavoriteIcon,
  LibraryBooks as LibraryBooksIcon,
  Celebration as CelebrationIcon,
  Schedule as ScheduleIcon,
  PeopleAlt as PeopleAltIcon,
  HelpOutline as HelpOutlineIcon,
  EventAvailable as EventAvailableIcon,
  Badge as BadgeIcon,
  ChildCare as ChildCareIcon,
  ChevronRight as ChevronRightIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';

type MUIButtonColor =
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning'
  | 'inherit';

type IconType = React.ElementType;

interface FofinhoButtonProps {
  to: string;
  label: string;
  subtitle?: string;
  icon: IconType;
  color: MUIButtonColor;
  accentHex?: string;
}

type PaletteKey = Exclude<MUIButtonColor, 'inherit'>;
const toPaletteKey = (c: MUIButtonColor): PaletteKey => (c === 'inherit' ? 'primary' : c);

const FofinhoButton: React.FC<FofinhoButtonProps & { fullWidth?: boolean; compact?: boolean }> = ({
  to,
  label,
  subtitle,
  icon: IconCmp,
  color,
  accentHex,
  fullWidth = true,
  compact = false,
}) => {
  const theme = useTheme();
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const paletteKey = toPaletteKey(color);
  const mainColor = accentHex || theme.palette[paletteKey].main;

  if (compact) {
    return (
      <Button
        data-testid="teacher-area-buttons-fofinho-button"
        variant="contained"
        color={color}
        component={Link}
        to={to}
        startIcon={<IconCmp fontSize="small" />}
        fullWidth={fullWidth}
        aria-label={label}
        disableElevation
        sx={{
          px: 2,
          py: 1.1,
          minHeight: 42,
          borderRadius: 2.5,
          fontWeight: 700,
          fontSize: '0.9rem',
          textTransform: 'none',
          gap: 1,
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.16)',
          },
        }}
      >
        {label}
      </Button>
    );
  }

  return (
    <Button
      data-testid="teacher-area-buttons-fofinho-button"
      component={Link}
      to={to}
      fullWidth={fullWidth}
      aria-label={label}
      sx={{
        p: { xs: 1.5, sm: 1.75 },
        width: '100%',
        height: '100%',
        borderRadius: 3,
        textTransform: 'none',
        justifyContent: 'space-between',
        alignItems: 'center',
        textAlign: 'left',
        gap: 1.5,
        bgcolor: '#ffffff',
        color: '#1e293b',
        border: '1px solid #e2e8f0',
        borderLeft: `4px solid ${mainColor}`,
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
        transition: reduceMotion
          ? 'box-shadow .2s ease'
          : 'transform .18s ease, box-shadow .18s ease, border-color .18s ease',
        '&:hover': {
          bgcolor: '#ffffff',
          borderColor: mainColor,
          boxShadow: `0 8px 20px ${mainColor}1f`,
          transform: reduceMotion ? 'none' : 'translateY(-2px)',
          '& .shortcut-arrow': {
            transform: 'translateX(3px)',
            color: mainColor,
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            bgcolor: `${mainColor}14`,
            color: mainColor,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <IconCmp sx={{ fontSize: 22 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            fontWeight={800}
            sx={{
              color: '#0f172a',
              fontSize: { xs: '0.88rem', md: '0.94rem' },
              lineHeight: 1.25,
            }}
          >
            {label}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              sx={{
                color: '#64748b',
                display: 'block',
                fontSize: '0.75rem',
                lineHeight: 1.3,
                mt: 0.25,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      <ChevronRightIcon
        className="shortcut-arrow"
        sx={{
          color: '#94a3b8',
          fontSize: 20,
          flexShrink: 0,
          transition: 'transform 0.18s ease, color 0.18s ease',
        }}
      />
    </Button>
  );
};

const buttonMap: Record<string, FofinhoButtonProps> = {
  materials: {
    to: '/lista-materias-semanais',
    label: 'Materiais Semanais',
    subtitle: 'Acervo de lições e histórias bíblicas',
    icon: MenuBookIcon,
    color: 'primary',
    accentHex: '#0284c7',
  },
  photos: {
    to: '/imagens-clubinho',
    label: 'Enviar Fotos do Clubinho',
    subtitle: 'Registre os momentos do seu Clubinho',
    icon: PhotoCameraIcon,
    color: 'success',
    accentHex: '#16a34a',
  },
  ideas: {
    to: '/compartilhar-ideia',
    label: 'Compartilhar Ideia',
    subtitle: 'Envie dinâmicas, visuais ou brincadeiras',
    icon: LightbulbIcon,
    color: 'secondary',
    accentHex: '#7c3aed',
  },
  rate: {
    to: '/avaliar-site',
    label: 'Avaliar Plataforma',
    subtitle: 'Envie sugestões para a equipe',
    icon: StarRateIcon,
    color: 'warning',
    accentHex: '#d97706',
  },
  love: {
    to: '/amor',
    label: 'Espalhe Amor',
    subtitle: 'Ações que abençoam vidas',
    icon: FavoriteIcon,
    color: 'error',
    accentHex: '#e11d48',
  },
  teaching: {
    to: '/ensino',
    label: 'Plano de Aula',
    subtitle: 'Roteiro pedagógico da semana',
    icon: LibraryBooksIcon,
    color: 'info',
    accentHex: '#0284c7',
  },
  fun: {
    to: '/diversao',
    label: 'Diversão Garantida',
    subtitle: 'Dinâmicas e recreação',
    icon: CelebrationIcon,
    color: 'warning',
    accentHex: '#ea580c',
  },
  schedule: {
    to: '/horarios',
    label: 'Horários',
    subtitle: 'Agenda dos encontros',
    icon: ScheduleIcon,
    color: 'secondary',
    accentHex: '#7c3aed',
  },
  team: {
    to: '/equipe',
    label: 'Equipe',
    subtitle: 'Professores e coordenação',
    icon: PeopleAltIcon,
    color: 'primary',
    accentHex: '#2563eb',
  },
  help: {
    to: '/contato',
    label: 'Falar com a Coordenação',
    subtitle: 'Precisa de ajuda ou suporte?',
    icon: HelpOutlineIcon,
    color: 'error',
    accentHex: '#dc2626',
  },
  events: {
    to: '/eventos',
    label: 'Eventos do Mês',
    subtitle: 'Datas especiais e programação',
    icon: EventAvailableIcon,
    color: 'info',
    accentHex: '#0891b2',
  },
  teacherArea: {
    to: '/area-do-professor',
    label: 'Área do Professor',
    subtitle: 'Voltar ao painel do professor',
    icon: BadgeIcon,
    color: 'primary',
    accentHex: '#154c79',
  },
  childrenArea: {
    to: '/area-das-criancas',
    label: 'Crianças do meu Clubinho',
    subtitle: 'Acompanhe as crianças e pagelas do seu Clubinho',
    icon: ChildCareIcon,
    color: 'primary',
    accentHex: '#2563eb',
  },
};

interface ButtonSectionProps {
  references: string[];
}

const ButtonSection: React.FC<ButtonSectionProps> = ({ references }) => {
  const buttonsToRender = references
    .map((ref) => buttonMap[ref])
    .filter((btn): btn is FofinhoButtonProps => !!btn);

  if (buttonsToRender.length === 0) return null;

  if (buttonsToRender.length === 1) {
    const btn = buttonsToRender[0];
    return (
      <Box
        data-testid="teacher-area-buttons-fofinho-button-button-section"
        display="flex"
        justifyContent="center"
      >
        <Box maxWidth={320} width="100%">
          <FofinhoButton {...btn} fullWidth compact />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      data-testid="teacher-area-buttons-fofinho-button-button-section"
      sx={{ mb: { xs: 3, md: 4 } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, px: 0.5 }}>
        <Typography
          variant="overline"
          sx={{
            fontWeight: 800,
            color: '#475569',
            letterSpacing: 1,
            fontSize: '0.75rem',
          }}
        >
          ⚡ Acesso Rápido do Professor
        </Typography>
      </Box>
      <Grid container spacing={1.5} alignItems="stretch">
        {buttonsToRender.map((button) => (
          <Grid item xs={12} sm={6} md={4} lg={12 / Math.min(buttonsToRender.length, 4)} key={button.to} sx={{ display: 'flex' }}>
            <FofinhoButton {...button} fullWidth />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ButtonSection;
