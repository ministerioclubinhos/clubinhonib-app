import React from 'react';
import { Button, Box, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import {
    List as ListIcon,
    PhotoCamera as PhotoCameraIcon,
    StarRate as StarRateIcon,
    Favorite as FavoriteIcon,
    School as SchoolIcon,
    EmojiEmotions as EmojiEmotionsIcon,
    Alarm as AlarmIcon,
    Group as GroupIcon,
    Help as HelpIcon,
    Event as EventIcon,
} from '@mui/icons-material';

type MUIButtonColor = 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';

interface FofinhoButtonProps {
    to: string;
    label: string;
    icon: React.ReactNode;
    color: MUIButtonColor;
}

const FofinhoButton: React.FC<FofinhoButtonProps & { fullWidth?: boolean }> = ({
    to,
    label,
    icon,
    color,
    fullWidth = true,
}) => (
    <Button
        variant="contained"
        color={color}
        component={Link}
        to={to}
        startIcon={icon}
        fullWidth={fullWidth}
        sx={{
            px: 2,
            py: 1.5,
            fontWeight: 'bold',
            fontSize: { xs: '0.6rem', md: '1rem' },
            borderRadius: '20px',
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

const buttonMap: Record<string, FofinhoButtonProps> = {
    materials: {
        to: '/lista-materias-semanais',
        label: 'Materiais semanais',
        icon: <ListIcon />,
        color: 'primary',
    },
    photos: {
        to: '/imagens-clubinho',
        label: 'Envie fotos do seu Clubinho',
        icon: <PhotoCameraIcon />,
        color: 'success',
    },
    rate: {
        to: '/avaliar-site',
        label: 'Avalie nosso Site',
        icon: <StarRateIcon />,
        color: 'success',
    },
    love: {
        to: '/amor',
        label: 'Espalhe Amor',
        icon: <FavoriteIcon />,
        color: 'error',
    },
    teaching: {
        to: '/ensino',
        label: 'Plano de Aula',
        icon: <SchoolIcon />,
        color: 'info',
    },
    fun: {
        to: '/diversao',
        label: 'Diversão Garantida',
        icon: <EmojiEmotionsIcon />,
        color: 'warning',
    },
    schedule: {
        to: '/horarios',
        label: 'Horários',
        icon: <AlarmIcon />,
        color: 'secondary',
    },
    team: {
        to: '/equipe',
        label: 'Equipe',
        icon: <GroupIcon />,
        color: 'primary',
    },
    help: {
        to: '/contato',
        label: 'Precisa de Ajuda?',
        icon: <HelpIcon />,
        color: 'error',
    },
    events: {
        to: '/eventos',
        label: 'Eventos do Mês',
        icon: <EventIcon />,
        color: 'info',
    },
    teacherArea: {
        to: '/area-do-professor',
        label: 'Área do Professor',
        icon: <SchoolIcon />,
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
                <Box maxWidth={320} width="100%">
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
