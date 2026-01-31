import React from 'react';
import {
    Paper,
    Typography,
    Stack,
    Box,
    Avatar,
    Tooltip,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { CompleteProfileListItem } from '../types';
import { getGenderStyle } from '../constants/profileConstants';
import { getDaysUntilBirthday, getInitials } from '../utils/profileHelpers';

interface BirthdaySectionProps {
    title: string;
    emoji: string;
    profiles: CompleteProfileListItem[];
    variant: 'today' | 'week' | 'month';
    onProfileClick: (profile: CompleteProfileListItem) => void;
}

const BirthdaySection: React.FC<BirthdaySectionProps> = ({
    title,
    emoji,
    profiles,
    variant,
    onProfileClick
}) => {
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));

    if (profiles.length === 0) return null;

    const configs = {
        today: {
            bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        week: {
            bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        },
        month: {
            bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        },
    };

    const config = configs[variant];
    const visibleAvatars = isXs ? 2 : 3;

    return (
        <Paper
            elevation={0}
            sx={{
                background: config.bg,
                borderRadius: 2,
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.75, sm: 1 },
                color: 'white',
                flex: 1,
                minWidth: 0,
            }}
        >
            <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 1.5 }}>
                <Box
                    sx={{
                        width: { xs: 28, sm: 32 },
                        height: { xs: 28, sm: 32 },
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: { xs: '0.85rem', sm: '1rem' },
                        flexShrink: 0,
                    }}
                >
                    {emoji}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{
                            opacity: 0.95,
                            lineHeight: 1.2,
                            display: 'block',
                            fontSize: { xs: '0.65rem', sm: '0.75rem' },
                        }}
                    >
                        {isXs ? title.replace('Aniversário Hoje! 🎉', 'Hoje! 🎉').replace('Esta Semana', 'Semana').replace('Este Mês', 'Mês') : title}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7, fontSize: { xs: '0.55rem', sm: '0.65rem' } }}>
                        {profiles.length} {profiles.length === 1 ? 'pessoa' : 'pessoas'}
                    </Typography>
                </Box>

                <Stack direction="row" spacing={-0.8}>
                    {profiles.slice(0, visibleAvatars).map((profile) => {
                        const days = getDaysUntilBirthday(profile.personalData?.birthDate);
                        return (
                            <Tooltip
                                key={profile.id}
                                title={`${profile.name?.split(' ')[0]}${days === 0 ? ' - HOJE!' : days ? ` - em ${days} dias` : ''}`}
                                arrow
                            >
                                <Avatar
                                    src={profile.image?.url}
                                    onClick={(e) => { e.stopPropagation(); onProfileClick(profile); }}
                                    sx={{
                                        width: { xs: 24, sm: 28 },
                                        height: { xs: 24, sm: 28 },
                                        fontSize: { xs: '0.6rem', sm: '0.7rem' },
                                        fontWeight: 700,
                                        border: '2px solid white',
                                        cursor: 'pointer',
                                        background: profile.image?.url ? 'transparent' : getGenderStyle(profile.personalData?.gender).gradient,
                                        transition: 'transform 0.2s',
                                        '&:hover': {
                                            transform: 'scale(1.15)',
                                            zIndex: 1,
                                        },
                                    }}
                                >
                                    {!profile.image?.url && getInitials(profile.name)}
                                </Avatar>
                            </Tooltip>
                        );
                    })}
                    {profiles.length > visibleAvatars && (
                        <Tooltip
                            arrow
                            title={
                                <Box sx={{ p: 0.5 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                                        +{profiles.length - visibleAvatars} pessoas:
                                    </Typography>
                                    {profiles.slice(visibleAvatars).map((p) => {
                                        const days = getDaysUntilBirthday(p.personalData?.birthDate);
                                        return (
                                            <Typography
                                                key={p.id}
                                                variant="caption"
                                                sx={{
                                                    display: 'block',
                                                    cursor: 'pointer',
                                                    '&:hover': { textDecoration: 'underline' },
                                                    py: 0.2,
                                                }}
                                                onClick={(e) => { e.stopPropagation(); onProfileClick(p); }}
                                            >
                                                • {p.name?.split(' ')[0]}{days === 0 ? ' 🎂' : days ? ` (${days}d)` : ''}
                                            </Typography>
                                        );
                                    })}
                                </Box>
                            }
                        >
                            <Avatar
                                sx={{
                                    width: { xs: 24, sm: 28 },
                                    height: { xs: 24, sm: 28 },
                                    fontSize: { xs: '0.5rem', sm: '0.6rem' },
                                    fontWeight: 700,
                                    border: '2px solid white',
                                    bgcolor: 'rgba(0,0,0,0.3)',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        bgcolor: 'rgba(0,0,0,0.5)',
                                    },
                                }}
                            >
                                +{profiles.length - visibleAvatars}
                            </Avatar>
                        </Tooltip>
                    )}
                </Stack>
            </Stack>
        </Paper>
    );
};

export default BirthdaySection;
