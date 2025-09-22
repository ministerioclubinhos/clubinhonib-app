import React from 'react';
import { Button, Box, Grid, useMediaQuery, useTheme } from '@mui/material';
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
  icon: IconType;
  color: MUIButtonColor;
}

type PaletteKey = Exclude<MUIButtonColor, 'inherit'>;
const toPaletteKey = (c: MUIButtonColor): PaletteKey => (c === 'inherit' ? 'primary' : c);

const FofinhoButton: React.FC<FofinhoButtonProps & { fullWidth?: boolean }> = ({
  to,
  label,
  icon: IconCmp,
  color,
  fullWidth = true,
}) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const paletteKey = toPaletteKey(color);

  return (
    <Button
      variant="contained"
      color={color}
      component={Link}
      to={to}
      startIcon={<IconCmp fontSize={isXs ? 'small' : 'medium'} />}
      fullWidth={fullWidth}
      aria-label={label}
      disableElevation
      sx={{
        px: { xs: 1.5, sm: 2 },
        py: { xs: 1.25, sm: 1.5 },
        minHeight: 48,
        borderRadius: { xs: 2, sm: 3 },
        fontWeight: 800,
        fontSize: { xs: '0.9rem', md: '1rem' },
        textTransform: 'none',
        justifyContent: 'flex-start',
        gap: 1.25,
        boxShadow: '0 4px 8px rgba(0,0,0,0.10)',
        backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(0,0,0,0.06))',
        transition: reduceMotion
          ? 'box-shadow .2s ease'
          : 'transform .18s ease, box-shadow .18s ease',
        '&:hover': {
          boxShadow: '0 8px 16px rgba(0,0,0,0.16)',
          transform: reduceMotion ? 'none' : 'translateY(-2px)',
        },
        '&:active': {
          transform: reduceMotion ? 'none' : 'translateY(0)',
          boxShadow: '0 6px 12px rgba(0,0,0,0.14)',
        },
        '&:focus-visible': {
          outline: `3px solid ${theme.palette[paletteKey].light}`,
          outlineOffset: 2,
        },
      }}
    >
      {label}
    </Button>
  );
};

const buttonMap: Record<string, FofinhoButtonProps> = {
  materials: {
    to: '/lista-materias-semanais',
    label: 'Materiais semanais',
    icon: MenuBookIcon,
    color: 'primary',
  },
  photos: {
    to: '/imagens-clubinho',
    label: 'Envie fotos do seu Clubinho',
    icon: PhotoCameraIcon,
    color: 'success',
  },
  rate: {
    to: '/avaliar-site',
    label: 'Avalie nosso Site',
    icon: StarRateIcon,
    color: 'success',
  },
  love: {
    to: '/amor',
    label: 'Espalhe Amor',
    icon: FavoriteIcon,
    color: 'error',
  },
  teaching: {
    to: '/ensino',
    label: 'Plano de Aula',
    icon: LibraryBooksIcon,
    color: 'info',
  },
  fun: {
    to: '/diversao',
    label: 'Diversão Garantida',
    icon: CelebrationIcon,
    color: 'warning',
  },
  schedule: {
    to: '/horarios',
    label: 'Horários',
    icon: ScheduleIcon,
    color: 'secondary',
  },
  team: {
    to: '/equipe',
    label: 'Equipe',
    icon: PeopleAltIcon,
    color: 'primary',
  },
  help: {
    to: '/contato',
    label: 'Precisa de Ajuda?',
    icon: HelpOutlineIcon,
    color: 'error',
  },
  events: {
    to: '/eventos',
    label: 'Eventos do Mês',
    icon: EventAvailableIcon,
    color: 'info',
  },
  teacherArea: {
    to: '/area-do-professor',
    label: 'Área do Professor',
    icon: BadgeIcon,
    color: 'primary',
  },
  childrenArea: {
    to: '/area-das-criancas',
    label: 'Área das Crianças',
    icon: ChildCareIcon,
    color: 'primary',
  },
};

interface ButtonSectionProps {
  references: string[];
}

const ButtonSection: React.FC<ButtonSectionProps> = ({ references }) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  const buttonsToRender = references
    .map((ref) => buttonMap[ref])
    .filter((btn): btn is FofinhoButtonProps => !!btn);

  if (buttonsToRender.length === 0) return null;
  if (buttonsToRender.length === 1) {
    const btn = buttonsToRender[0];
    return (
      <Box display="flex" justifyContent="center" mt={2} mb={4} px={2}>
        <Box maxWidth={420} width="100%">
          <FofinhoButton {...btn} fullWidth />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2, mt: 2, mb: 4 }}>
      <Grid container spacing={2} alignItems="stretch">
        {buttonsToRender.map((button, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index} sx={{ display: 'flex' }}>
            <Box sx={{ width: '100%', display: 'flex' }}>
              <FofinhoButton {...button} fullWidth />
            </Box>
          </Grid>
        ))}
      </Grid>
      {isXs && <Box sx={{ height: 8 }} />}
    </Box>
  );
};

export default ButtonSection;
