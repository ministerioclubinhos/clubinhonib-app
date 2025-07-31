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

const FofinhoButton: React.FC<FofinhoButtonProps & { fullWidth?: boolean }> = ({
    to,
    label,
    icon: IconCmp,
    color,
    fullWidth = true,
}) => {
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));

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
                px: 2,
                py: 1.5,
                fontWeight: 'bold',
                fontSize: { xs: '0.8rem', md: '1rem' },
                borderRadius: '20px',
                minHeight: 48,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                '@keyframes wiggle': {
                    '0%': { transform: 'translateX(0)' },
                    '15%': { transform: 'translateX(-4px)' },
                    '30%': { transform: 'translateX(4px)' },
                    '45%': { transform: 'translateX(-4px)' },
                    '60%': { transform: 'translateX(4px)' },
                    '75%': { transform: 'translateX(-2px)' },
                    '100%': { transform: 'translateX(0)' },
                },
                '&:hover': {
                    animation: 'wiggle 0.6s ease-in-out',
                    boxShadow: '0 6px 8px rgba(0,0,0,0.15)',
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
    const buttonsToRender = references
        .map((ref) => buttonMap[ref])
        .filter((btn): btn is FofinhoButtonProps => !!btn);

    if (buttonsToRender.length === 1) {
        const btn = buttonsToRender[0];
        return (
            <Box display="flex" justifyContent="center" mt={2} mb={4} px={2}>
                <Box maxWidth={360} width="100%">
                    <FofinhoButton {...btn} fullWidth />
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ px: 2, mt: 2, mb: 4 }}>
            <Grid container spacing={2}>
                {buttonsToRender.map((button, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <FofinhoButton {...button} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default ButtonSection;
