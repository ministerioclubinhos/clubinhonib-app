import React from 'react';
import {
    Paper,
    Avatar,
    Stack,
    Box,
    Typography,
    Chip,
} from '@mui/material';
import {
    Email as EmailIcon,
    Cake as CakeIcon,
    Palette as PaletteIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { CompleteProfileListItem } from '../types';
import { roleConfig, getGenderStyle } from '../constants/profileConstants';
import { getBirthdayStatus, calculateAge, formatBirthDateShort, getInitials } from '../utils/profileHelpers';

interface ProfileCardProps {
    profile: CompleteProfileListItem;
    index: number;
    onClick: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, index, onClick }) => {
    const roleStyle = roleConfig[profile.role?.toLowerCase()] || roleConfig.teacher;
    const genderStyle = getGenderStyle(profile.personalData?.gender);
    const birthdayStatus = getBirthdayStatus(profile.personalData?.birthDate);
    const age = calculateAge(profile.personalData?.birthDate);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.02 }}
            whileHover={{ y: -4 }}
            onClick={onClick}
            style={{ cursor: 'pointer' }}
        >
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: birthdayStatus === 'today' ? '#f6416c' : `${genderStyle.color}30`,
                    bgcolor: genderStyle.bgLight,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '&:hover': {
                        borderColor: genderStyle.color,
                        boxShadow: `0 12px 40px ${genderStyle.color}25`,
                    },
                }}
            >
                {birthdayStatus === 'today' && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            zIndex: 1,
                        }}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <Typography sx={{ fontSize: 20 }}>🎂</Typography>
                        </motion.div>
                    </Box>
                )}

                <Box sx={{ p: 2 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                            src={profile.image?.url}
                            sx={{
                                width: 48,
                                height: 48,
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                background: profile.image?.url ? 'transparent' : genderStyle.gradient,
                                boxShadow: `0 4px 14px ${genderStyle.color}40`,
                            }}
                        >
                            {!profile.image?.url && getInitials(profile.name)}
                        </Avatar>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" fontWeight={700} noWrap>
                                {profile.name}
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Box sx={{ color: roleStyle.color, display: 'flex' }}>
                                    {roleStyle.icon}
                                </Box>
                                <Typography variant="caption" color="text.disabled">
                                    {roleStyle.label}
                                </Typography>
                            </Stack>
                        </Box>
                    </Stack>

                    <Stack spacing={0.3} sx={{ mt: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EmailIcon sx={{ fontSize: 12, opacity: 0.5 }} />
                            {profile.email}
                        </Typography>
                        {profile.personalData?.birthDate && (
                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    color: birthdayStatus ? '#f6416c' : 'text.secondary',
                                    fontWeight: birthdayStatus ? 600 : 400,
                                }}
                            >
                                <CakeIcon sx={{ fontSize: 12, opacity: birthdayStatus ? 1 : 0.5 }} />
                                {formatBirthDateShort(profile.personalData.birthDate)}
                                {age !== null && ` • ${age} anos`}
                            </Typography>
                        )}
                    </Stack>

                    {profile.preferences && (
                        <Stack direction="row" spacing={0.5} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
                            {profile.preferences.temperaments && (
                                <Chip
                                    label={profile.preferences.temperaments.split(' ')[0]}
                                    size="small"
                                    sx={{ height: 20, fontSize: '0.6rem', bgcolor: 'rgba(0,0,0,0.04)' }}
                                />
                            )}
                            {profile.preferences.favoriteColor && (
                                <Chip
                                    icon={<PaletteIcon sx={{ fontSize: '10px !important' }} />}
                                    label={profile.preferences.favoriteColor.split(' ')[0]}
                                    size="small"
                                    sx={{ height: 20, fontSize: '0.6rem', bgcolor: 'rgba(0,0,0,0.04)' }}
                                />
                            )}
                        </Stack>
                    )}
                </Box>
            </Paper>
        </motion.div>
    );
};

export default ProfileCard;
