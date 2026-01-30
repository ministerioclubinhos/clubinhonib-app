import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    Chip,
    Stack,
    IconButton,
    Tooltip,
    Avatar,
    Divider,
    Grid,
    useTheme,
    useMediaQuery,
    Fade,
    Backdrop,
} from '@mui/material';
import {
    Favorite as FavoriteIcon,
    Restaurant as RestaurantIcon,
    MusicNote as MusicNoteIcon,
    Palette as PaletteIcon,
    Cake as CakeIcon,
    EmojiEmotions as EmojiIcon,
    Build as BuildIcon,
    Group as GroupIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Close as CloseIcon,
    Star as StarIcon,
    WhatsApp as WhatsAppIcon,
    ContentCopy as CopyIcon,
    Edit as EditIcon,
    Celebration as CelebrationIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { UserRole } from '@/types/shared';
import { CompleteProfileListItem } from '../types';
import { roleConfig, getGenderStyle } from '../constants/profileConstants';
import { getBirthdayStatus, calculateAge, formatBirthDate, getInitials } from '../utils/profileHelpers';
import { buildWhatsappLink } from '@/utils/whatsapp';
import ImagePreviewModal from './ImagePreviewModal';

interface ProfileDetailModalProps {
    profile: CompleteProfileListItem | null;
    open: boolean;
    onClose: () => void;
    userRole?: string;
    currentUserName?: string;
    onEdit: () => void;
}

const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({
    profile,
    open,
    onClose,
    userRole,
    currentUserName,
    onEdit
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [copied, setCopied] = useState<string | null>(null);
    const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

    if (!profile) return null;

    const config = roleConfig[profile.role?.toLowerCase()] || roleConfig.teacher;
    const genderStyle = getGenderStyle(profile.personalData?.gender);
    const birthdayStatus = getBirthdayStatus(profile.personalData?.birthDate);
    const age = calculateAge(profile.personalData?.birthDate);

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleWhatsApp = () => {
        if (profile.phone) {
            const isBirthday = birthdayStatus === 'today';
            const link = buildWhatsappLink(profile.name, currentUserName, profile.phone, isBirthday, profile.personalData?.gender);
            if (link) {
                window.open(link, '_blank');
            }
        }
    };

    const handleEmail = () => {
        if (profile.email) {
            window.location.href = `mailto:${profile.email}`;
        }
    };

    const hasPreferences = profile.preferences && (
        profile.preferences.loveLanguages ||
        profile.preferences.temperaments ||
        profile.preferences.favoriteColor ||
        profile.preferences.favoriteFood ||
        profile.preferences.favoriteMusic ||
        profile.preferences.whatMakesYouSmile ||
        profile.preferences.skillsAndTalents
    );

    const hasGaInfo = profile.personalData?.gaLeaderName || profile.personalData?.gaLeaderContact;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            slots={{ transition: Fade, backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    sx: {
                        backdropFilter: 'blur(8px)',
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    },
                },
                paper: {
                    sx: {
                        borderRadius: 4,
                        overflow: 'hidden',
                        m: isMobile ? 2 : 3,
                        maxHeight: 'calc(100vh - 32px)',
                    },
                }
            }}
        >
            <Box
                sx={{
                    background: genderStyle.gradient,
                    pt: 2,
                    pb: 5,
                    px: 2,
                    position: 'relative',
                    textAlign: 'center',
                }}
            >
                {userRole === UserRole.COORDINATOR && (
                    <IconButton
                        onClick={onEdit}
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            zIndex: 100,
                            color: 'white',
                            bgcolor: 'rgba(255,255,255,0.2)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                        }}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                )}

                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 100,
                        color: 'white',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>

                {birthdayStatus === 'today' && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        style={{
                            position: 'absolute',
                            top: 8,
                            left: (userRole === UserRole.ADMIN || userRole === UserRole.COORDINATOR) ? 48 : 8,
                            zIndex: 5
                        }}
                    >
                        <Chip
                            icon={<CelebrationIcon sx={{ color: 'white !important', fontSize: 16 }} />}
                            label="🎉 Aniversário!"
                            size="small"
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.25)',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                height: 24,
                            }}
                        />
                    </motion.div>
                )}

                {birthdayStatus === 'today' && (
                    <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ y: -10, x: Math.random() * 100 + '%', opacity: 1 }}
                                animate={{ y: '100%', rotate: Math.random() * 360, opacity: [1, 1, 0] }}
                                transition={{ duration: 2.5 + Math.random() * 1.5, repeat: Infinity, delay: Math.random() * 1.5 }}
                                style={{
                                    position: 'absolute',
                                    width: 6,
                                    height: 6,
                                    borderRadius: Math.random() > 0.5 ? '50%' : 0,
                                    backgroundColor: ['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#9370DB'][Math.floor(Math.random() * 5)],
                                }}
                            />
                        ))}
                    </Box>
                )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: -4, position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                    <Tooltip title={profile.image?.url ? "Ver foto" : ""} arrow>
                        <Avatar
                            src={profile.image?.url}
                            onClick={() => profile.image?.url && setImagePreviewOpen(true)}
                            sx={{
                                width: 72,
                                height: 72,
                                fontSize: '1.8rem',
                                fontWeight: 700,
                                background: profile.image?.url ? 'transparent' : genderStyle.gradient,
                                border: '3px solid white',
                                boxShadow: `0 4px 20px ${genderStyle.color}50`,
                                cursor: profile.image?.url ? 'pointer' : 'default',
                                '&:hover': profile.image?.url ? {
                                    transform: 'scale(1.05)',
                                    transition: 'transform 0.2s',
                                } : {},
                            }}
                        >
                            {!profile.image?.url && getInitials(profile.name)}
                        </Avatar>
                    </Tooltip>
                </motion.div>
            </Box>

            <ImagePreviewModal
                open={imagePreviewOpen}
                onClose={() => setImagePreviewOpen(false)}
                imageUrl={profile.image?.url}
                name={profile.name}
            />

            <Box sx={{ px: 2.5, pt: 1.5, pb: 2.5 }}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                        {profile.name}
                    </Typography>

                    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" flexWrap="wrap">
                        <Chip
                            icon={config.icon}
                            label={config.label}
                            size="small"
                            sx={{
                                bgcolor: config.bgLight,
                                color: config.color,
                                fontWeight: 600,
                                height: 24,
                                '& .MuiChip-icon': { color: config.color },
                                '& .MuiChip-label': { px: 1, fontSize: '0.75rem' },
                            }}
                        />

                        {profile.personalData?.birthDate && (
                            <Chip
                                icon={<CakeIcon sx={{ fontSize: 14 }} />}
                                label={age !== null ? `${age} anos` : formatBirthDate(profile.personalData.birthDate)}
                                size="small"
                                sx={{
                                    bgcolor: birthdayStatus ? 'rgba(246, 65, 108, 0.1)' : 'rgba(0,0,0,0.05)',
                                    color: birthdayStatus ? '#f6416c' : 'text.secondary',
                                    fontWeight: birthdayStatus ? 600 : 400,
                                    height: 24,
                                    '& .MuiChip-icon': { color: birthdayStatus ? '#f6416c' : 'text.disabled' },
                                    '& .MuiChip-label': { px: 1, fontSize: '0.75rem' },
                                }}
                            />
                        )}
                    </Stack>
                </Box>

                {(profile.email || profile.phone) && (
                    <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
                        {profile.phone && (
                            <Tooltip title="WhatsApp" arrow>
                                <IconButton
                                    onClick={handleWhatsApp}
                                    size="small"
                                    sx={{
                                        bgcolor: '#25D366',
                                        color: 'white',
                                        width: 36,
                                        height: 36,
                                        '&:hover': { bgcolor: '#128C7E', transform: 'scale(1.05)' },
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <WhatsAppIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {profile.phone && (
                            <Tooltip title={copied === 'phone' ? 'Copiado!' : 'Copiar telefone'} arrow>
                                <IconButton
                                    onClick={() => handleCopy(profile.phone || '', 'phone')}
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(0,0,0,0.06)',
                                        width: 36,
                                        height: 36,
                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' },
                                    }}
                                >
                                    {copied === 'phone' ? (
                                        <Typography sx={{ fontSize: '0.7rem', color: 'success.main' }}>✓</Typography>
                                    ) : (
                                        <PhoneIcon fontSize="small" />
                                    )}
                                </IconButton>
                            </Tooltip>
                        )}
                        {profile.email && (
                            <Tooltip title="Enviar email" arrow>
                                <IconButton
                                    onClick={handleEmail}
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(0,0,0,0.06)',
                                        width: 36,
                                        height: 36,
                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' },
                                    }}
                                >
                                    <EmailIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {profile.email && (
                            <Tooltip title={copied === 'email' ? 'Copiado!' : 'Copiar email'} arrow>
                                <IconButton
                                    onClick={() => handleCopy(profile.email, 'email')}
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(0,0,0,0.06)',
                                        width: 36,
                                        height: 36,
                                        '&:hover': { bgcolor: 'rgba(0,0,0,0.1)' },
                                    }}
                                >
                                    {copied === 'email' ? (
                                        <Typography sx={{ fontSize: '0.7rem', color: 'success.main' }}>✓</Typography>
                                    ) : (
                                        <CopyIcon fontSize="small" />
                                    )}
                                </IconButton>
                            </Tooltip>
                        )}
                    </Stack>
                )}

                {hasGaInfo && (
                    <Box
                        sx={{
                            p: 1.5,
                            bgcolor: 'rgba(33, 150, 243, 0.06)',
                            borderRadius: 2,
                            mb: 2,
                        }}
                    >
                        <Stack direction="row" spacing={1} alignItems="center">
                            <GroupIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                            <Typography variant="caption" fontWeight={600} color="primary.main">
                                GA: {profile.personalData?.gaLeaderName}
                            </Typography>
                            {profile.personalData?.gaLeaderContact && (
                                <Tooltip title="Copiar contato do líder" arrow>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleCopy(profile.personalData?.gaLeaderContact || '', 'ga')}
                                        sx={{ ml: 'auto', p: 0.5 }}
                                    >
                                        {copied === 'ga' ? (
                                            <Typography sx={{ fontSize: '0.6rem', color: 'success.main' }}>✓</Typography>
                                        ) : (
                                            <PhoneIcon sx={{ fontSize: 14 }} />
                                        )}
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Stack>
                    </Box>
                )}

                {hasPreferences && (
                    <>
                        <Divider sx={{ mb: 1.5 }} />
                        <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Conheça melhor
                        </Typography>

                        <Grid container spacing={1} sx={{ mt: 0.5 }}>
                            {profile.preferences?.loveLanguages && (
                                <Grid item xs={6}>
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <FavoriteIcon sx={{ fontSize: 14, color: '#f6416c' }} />
                                        <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.7rem' }}>
                                            {profile.preferences.loveLanguages}
                                        </Typography>
                                    </Stack>
                                </Grid>
                            )}
                            {profile.preferences?.temperaments && (
                                <Grid item xs={6}>
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <StarIcon sx={{ fontSize: 14, color: '#9c27b0' }} />
                                        <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.7rem' }}>
                                            {profile.preferences.temperaments}
                                        </Typography>
                                    </Stack>
                                </Grid>
                            )}
                            {profile.preferences?.favoriteFood && (
                                <Grid item xs={6}>
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <RestaurantIcon sx={{ fontSize: 14, color: '#ff9800' }} />
                                        <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.7rem' }}>
                                            {profile.preferences.favoriteFood}
                                        </Typography>
                                    </Stack>
                                </Grid>
                            )}
                            {profile.preferences?.favoriteColor && (
                                <Grid item xs={6}>
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <PaletteIcon sx={{ fontSize: 14, color: '#2196f3' }} />
                                        <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.7rem' }}>
                                            {profile.preferences.favoriteColor}
                                        </Typography>
                                    </Stack>
                                </Grid>
                            )}
                            {profile.preferences?.favoriteMusic && (
                                <Grid item xs={12}>
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <MusicNoteIcon sx={{ fontSize: 14, color: '#e91e63' }} />
                                        <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.7rem' }}>
                                            {profile.preferences.favoriteMusic}
                                        </Typography>
                                    </Stack>
                                </Grid>
                            )}
                        </Grid>

                        {(profile.preferences?.whatMakesYouSmile || profile.preferences?.skillsAndTalents) && (
                            <Box sx={{ mt: 1.5 }}>
                                {profile.preferences?.whatMakesYouSmile && (
                                    <Box sx={{ p: 1.5, bgcolor: 'rgba(76, 175, 80, 0.06)', borderRadius: 2, mb: 1 }}>
                                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
                                            <EmojiIcon sx={{ fontSize: 14, color: '#4caf50' }} />
                                            <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 600, fontSize: '0.65rem' }}>
                                                O que me faz sorrir
                                            </Typography>
                                        </Stack>
                                        <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary', fontSize: '0.75rem' }}>
                                            "{profile.preferences.whatMakesYouSmile}"
                                        </Typography>
                                    </Box>
                                )}
                                {profile.preferences?.skillsAndTalents && (
                                    <Box sx={{ p: 1.5, bgcolor: 'rgba(33, 150, 243, 0.06)', borderRadius: 2 }}>
                                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
                                            <BuildIcon sx={{ fontSize: 14, color: '#2196f3' }} />
                                            <Typography variant="caption" sx={{ color: '#2196f3', fontWeight: 600, fontSize: '0.65rem' }}>
                                                Talentos
                                            </Typography>
                                        </Stack>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                                            {profile.preferences.skillsAndTalents}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </Dialog>
    );
};

export default ProfileDetailModal;
