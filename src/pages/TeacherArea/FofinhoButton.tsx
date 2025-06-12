import React from 'react';
import { Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import ListIcon from '@mui/icons-material/List';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import StarRateIcon from '@mui/icons-material/StarRate';


type MUIButtonColor = 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';

interface FofinhoButtonProps {
    to: string;
    label: string;
    icon: React.ReactNode;
    color: MUIButtonColor;
}

const FofinhoButton: React.FC<FofinhoButtonProps> = ({ to, label, icon, color }) => (
    <Button
        variant="contained"
        color={color}
        component={Link}
        to={to}
        startIcon={icon}
        sx={{
            px: { xs: 2, md: 4 },
            py: { xs: 1.2, md: 1.5 },
            fontWeight: 'bold',
            fontSize: { xs: '0.8rem', md: '1rem' },
            width: { xs: '100%', md: 'auto' },
            height: { xs: 42, md: 48 },
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

const buttons: FofinhoButtonProps[] = [
    {
        to: '/lista-materias-semanais',
        label: 'Ver Lista de Materiais Semanais',
        icon: <ListIcon />,
        color: 'primary',
    },
    {
        to: '/imagens-clubinho',
        label: 'Envie fotos do seu Clubinho',
        icon: <PhotoCameraIcon />,
        color: 'success',
    },
    {
        to: '/avaliar-site',
        label: 'Avalie nosso site',
        icon: <StarRateIcon />,
        color: 'success',
    },
];

const ButtonSection: React.FC = () => (
    <Box
        sx={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            gap: 2,
            mt: 1,
            mb: 4,
        }}
    >
        {buttons.map((button, index) => (
            <FofinhoButton
                key={index}
                to={button.to}
                label={button.label}
                icon={button.icon}
                color={button.color}
            />
        ))}
    </Box>
);

export default ButtonSection;
