import React, { useState } from 'react';
import {
  Avatar,
  Backdrop,
  Box,
  Chip,
  Dialog,
  Divider,
  Fade,
  Grid2,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import CakeIcon from '@mui/icons-material/Cake';
import CelebrationIcon from '@mui/icons-material/Celebration';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GroupIcon from '@mui/icons-material/Group';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PaletteIcon from '@mui/icons-material/Palette';
import PhoneIcon from '@mui/icons-material/Phone';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import StarIcon from '@mui/icons-material/Star';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { motion } from 'framer-motion';

import { UserRole } from '@/types/shared';
import { buildWhatsappLink } from '@/utils/whatsapp';

import type { CompleteProfile } from '../types';
import { calculateAge, formatBirthDate, getBirthdayStatus, getInitials } from '../utils';
import ImagePreviewModal from './ImagePreviewModal';
import { getGenderStyle, roleConfig } from './profileStyles';

interface ProfileDetailModalProps {
  profile: CompleteProfile | null;
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
  onEdit,
}) => {
  const theme = useTheme();
  const [copied, setCopied] = useState<string | null>(null);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  if (!profile) return null;

  const config = roleConfig[profile.role?.toLowerCase()] || roleConfig.teacher;
  const genderStyle = getGenderStyle(profile.personalData?.gender);
  const birthdayStatus = getBirthdayStatus(profile.personalData?.birthDate);
  const age = calculateAge(profile.personalData?.birthDate);
  const isBirthdayToday = birthdayStatus === 'today';

  const handleCopy = (text: string, field: string) => {
    void navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleWhatsApp = () => {
    if (profile.phone) {
      const link = buildWhatsappLink(
        profile.name,
        currentUserName,
        profile.phone,
        isBirthdayToday,
        profile.personalData?.gender,
      );
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

  const hasPreferences =
    profile.preferences &&
    (profile.preferences.loveLanguages ||
      profile.preferences.temperaments ||
      profile.preferences.favoriteColor ||
      profile.preferences.favoriteFood ||
      profile.preferences.favoriteMusic ||
      profile.preferences.whatMakesYouSmile ||
      profile.preferences.skillsAndTalents);

  const hasGaInfo = profile.personalData?.gaLeaderName || profile.personalData?.gaLeaderContact;

  return (
    <Dialog
      data-testid="profile-profile-detail-modal"
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slots={{ transition: Fade, backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
          },
        },
        paper: {
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            m: { xs: 1.5, sm: 3 },
            maxHeight: 'calc(100vh - 32px)',
          },
        },
      }}
    >
      {/* Cover Background */}
      <Box
        sx={{
          background: genderStyle.gradient,
          pt: 2.5,
          pb: 5,
          px: 2,
          position: 'relative',
          textAlign: 'center',
        }}
      >
        {userRole === UserRole.ADMIN && (
          <IconButton
            data-testid="profile-profile-detail-modal-edit"
            onClick={onEdit}
            size="small"
            aria-label="Editar"
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 10,
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.22)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        )}

        <IconButton
          data-testid="profile-profile-detail-modal-close"
          onClick={onClose}
          size="small"
          aria-label="Fechar"
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 10,
            color: 'white',
            bgcolor: 'rgba(255,255,255,0.22)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.35)' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        {isBirthdayToday && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            style={{
              position: 'absolute',
              top: 10,
              left: userRole === UserRole.ADMIN ? 52 : 10,
              zIndex: 5,
            }}
          >
            <Chip
              icon={<CelebrationIcon sx={{ color: 'white !important', fontSize: 16 }} />}
              label="🎉 Aniversário!"
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.25)',
                color: 'white',
                fontWeight: 800,
                fontSize: '0.7rem',
                height: 26,
              }}
            />
          </motion.div>
        )}
      </Box>

      {/* Avatar Overlay */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: -4.5, position: 'relative', zIndex: 2 }}>
        <Tooltip title={profile.image?.url ? 'Ver foto em tamanho real' : ''} arrow>
          <Avatar
            src={profile.image?.url}
            alt={profile.name}
            onClick={() => profile.image?.url && setImagePreviewOpen(true)}
            sx={{
              width: 80,
              height: 80,
              fontSize: '2rem',
              fontWeight: 800,
              background: profile.image?.url ? 'transparent' : genderStyle.gradient,
              border: '4px solid #FFFFFF',
              boxShadow: `0 6px 24px ${alpha(genderStyle.color, 0.4)}`,
              cursor: profile.image?.url ? 'pointer' : 'default',
              transition: 'transform 0.2s ease',
              '&:hover': profile.image?.url ? { transform: 'scale(1.06)' } : {},
            }}
          >
            {!profile.image?.url && getInitials(profile.name)}
          </Avatar>
        </Tooltip>
      </Box>

      <ImagePreviewModal
        open={imagePreviewOpen}
        onClose={() => setImagePreviewOpen(false)}
        imageUrl={profile.image?.url}
        name={profile.name}
      />

      {/* Content Section */}
      <Box sx={{ px: { xs: 2, sm: 3 }, pt: 1.5, pb: 3, overflowY: 'auto' }}>
        {/* Name and Badges */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 0.75, color: 'text.primary', lineHeight: 1.25 }}>
            {profile.name}
          </Typography>

          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" flexWrap="wrap" useFlexGap sx={{ gap: 0.75 }}>
            <Chip
              icon={config.icon}
              label={config.label}
              size="small"
              sx={{
                bgcolor: config.bgLight,
                color: config.color,
                fontWeight: 700,
                height: 26,
                '& .MuiChip-icon': { color: config.color },
                '& .MuiChip-label': { px: 1, fontSize: '0.75rem' },
              }}
            />

            {profile.personalData?.birthDate && (
              <Chip
                icon={<CakeIcon sx={{ fontSize: 15 }} />}
                label={age !== null ? `${age} anos • ${formatBirthDate(profile.personalData.birthDate)}` : formatBirthDate(profile.personalData.birthDate)}
                size="small"
                sx={{
                  bgcolor: isBirthdayToday ? 'rgba(246, 65, 108, 0.12)' : alpha(theme.palette.action.disabledBackground, 0.4),
                  color: isBirthdayToday ? '#f6416c' : 'text.secondary',
                  fontWeight: isBirthdayToday ? 700 : 500,
                  height: 26,
                  '& .MuiChip-icon': { color: isBirthdayToday ? '#f6416c' : 'text.secondary' },
                  '& .MuiChip-label': { px: 1, fontSize: '0.75rem' },
                }}
              />
            )}
          </Stack>
        </Box>

        {/* Contact Actions Bar */}
        {(profile.email || profile.phone) && (
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2.5 }}>
            {profile.phone && (
              <Tooltip title="Conversar no WhatsApp" arrow>
                <IconButton
                  onClick={handleWhatsApp}
                  size="small"
                  aria-label="WhatsApp"
                  sx={{
                    bgcolor: '#25D366',
                    color: 'white',
                    width: 40,
                    height: 40,
                    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                    '&:hover': { bgcolor: '#128C7E', transform: 'scale(1.06)' },
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
                  aria-label="Copiar"
                  sx={{
                    bgcolor: alpha(theme.palette.action.hover, 0.8),
                    width: 40,
                    height: 40,
                    '&:hover': { bgcolor: alpha(theme.palette.action.selected, 0.9) },
                  }}
                >
                  {copied === 'phone' ? (
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: 'success.main' }}>✓</Typography>
                  ) : (
                    <PhoneIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            )}

            {profile.email && (
              <Tooltip title="Enviar e-mail" arrow>
                <IconButton
                  onClick={handleEmail}
                  size="small"
                  aria-label="Enviar email"
                  sx={{
                    bgcolor: alpha(theme.palette.action.hover, 0.8),
                    width: 40,
                    height: 40,
                    '&:hover': { bgcolor: alpha(theme.palette.action.selected, 0.9) },
                  }}
                >
                  <EmailIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {profile.email && (
              <Tooltip title={copied === 'email' ? 'Copiado!' : 'Copiar e-mail'} arrow>
                <IconButton
                  onClick={() => handleCopy(profile.email, 'email')}
                  size="small"
                  aria-label="Copiar"
                  sx={{
                    bgcolor: alpha(theme.palette.action.hover, 0.8),
                    width: 40,
                    height: 40,
                    '&:hover': { bgcolor: alpha(theme.palette.action.selected, 0.9) },
                  }}
                >
                  {copied === 'email' ? (
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: 'success.main' }}>✓</Typography>
                  ) : (
                    <ContentCopyIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        )}

        {/* GA Info Callout */}
        {hasGaInfo && (
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              mb: 2.5,
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: alpha(theme.palette.info.main, 0.2),
              bgcolor: alpha(theme.palette.info.main, 0.05),
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <GroupIcon sx={{ fontSize: 18, color: 'info.main' }} />
              <Typography variant="caption" fontWeight={700} color="info.main">
                Líder de GA: {profile.personalData?.gaLeaderName}
              </Typography>

              {profile.personalData?.gaLeaderContact && (
                <Tooltip title="Copiar contato do líder" arrow>
                  <IconButton
                    size="small"
                    onClick={() => handleCopy(profile.personalData?.gaLeaderContact || '', 'ga')}
                    aria-label="Copiar contato do líder"
                    sx={{ ml: 'auto', p: 0.5 }}
                  >
                    {copied === 'ga' ? (
                      <Typography sx={{ fontSize: '0.65rem', color: 'success.main', fontWeight: 800 }}>✓</Typography>
                    ) : (
                      <PhoneIcon sx={{ fontSize: 15, color: 'info.main' }} />
                    )}
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Paper>
        )}

        {/* Preferences Section */}
        {hasPreferences && (
          <>
            <Divider sx={{ mb: 2 }} />

            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={800}
              sx={{ textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', mb: 1.25 }}
            >
              Preferências e Estilo
            </Typography>

            <Grid2 container spacing={1.25} sx={{ mb: 2 }}>
              {profile.preferences?.loveLanguages && (
                <Grid2 size={{ xs: 6 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: alpha('#f6416c', 0.06),
                      border: '1px solid',
                      borderColor: alpha('#f6416c', 0.15),
                    }}
                  >
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <FavoriteIcon sx={{ fontSize: 15, color: '#f6416c' }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                          Linguagem do Amor
                        </Typography>
                        <Typography variant="caption" fontWeight={700} color="text.primary" noWrap sx={{ display: 'block', fontSize: '0.72rem' }}>
                          {profile.preferences.loveLanguages}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid2>
              )}

              {profile.preferences?.temperaments && (
                <Grid2 size={{ xs: 6 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: alpha('#9c27b0', 0.06),
                      border: '1px solid',
                      borderColor: alpha('#9c27b0', 0.15),
                    }}
                  >
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <StarIcon sx={{ fontSize: 15, color: '#9c27b0' }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                          Temperamento
                        </Typography>
                        <Typography variant="caption" fontWeight={700} color="text.primary" noWrap sx={{ display: 'block', fontSize: '0.72rem' }}>
                          {profile.preferences.temperaments}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid2>
              )}

              {profile.preferences?.favoriteFood && (
                <Grid2 size={{ xs: 6 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: alpha('#ff9800', 0.06),
                      border: '1px solid',
                      borderColor: alpha('#ff9800', 0.15),
                    }}
                  >
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <RestaurantIcon sx={{ fontSize: 15, color: '#ff9800' }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                          Comida Favorita
                        </Typography>
                        <Typography variant="caption" fontWeight={700} color="text.primary" noWrap sx={{ display: 'block', fontSize: '0.72rem' }}>
                          {profile.preferences.favoriteFood}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid2>
              )}

              {profile.preferences?.favoriteColor && (
                <Grid2 size={{ xs: 6 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: alpha('#2196f3', 0.06),
                      border: '1px solid',
                      borderColor: alpha('#2196f3', 0.15),
                    }}
                  >
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <PaletteIcon sx={{ fontSize: 15, color: '#2196f3' }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                          Cor Favorita
                        </Typography>
                        <Typography variant="caption" fontWeight={700} color="text.primary" noWrap sx={{ display: 'block', fontSize: '0.72rem' }}>
                          {profile.preferences.favoriteColor}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid2>
              )}

              {profile.preferences?.favoriteMusic && (
                <Grid2 size={{ xs: 12 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: alpha('#e91e63', 0.06),
                      border: '1px solid',
                      borderColor: alpha('#e91e63', 0.15),
                    }}
                  >
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <MusicNoteIcon sx={{ fontSize: 15, color: '#e91e63' }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                          Música Favorita
                        </Typography>
                        <Typography variant="caption" fontWeight={700} color="text.primary" noWrap sx={{ display: 'block', fontSize: '0.72rem' }}>
                          {profile.preferences.favoriteMusic}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid2>
              )}
            </Grid2>

            {/* Extra Quotes & Skills */}
            {(profile.preferences?.whatMakesYouSmile || profile.preferences?.skillsAndTalents) && (
              <Stack spacing={1.25}>
                {profile.preferences?.whatMakesYouSmile && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      bgcolor: alpha(theme.palette.success.main, 0.06),
                      border: '1px solid',
                      borderColor: alpha(theme.palette.success.main, 0.18),
                      borderRadius: 2.5,
                    }}
                  >
                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.5 }}>
                      <EmojiEmotionsIcon sx={{ fontSize: 16, color: 'success.main' }} />
                      <Typography variant="caption" fontWeight={700} color="success.dark" sx={{ fontSize: '0.7rem' }}>
                        O que me faz sorrir
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', fontSize: '0.8rem', lineHeight: 1.35 }}>
                      &ldquo;{profile.preferences.whatMakesYouSmile}&rdquo;
                    </Typography>
                  </Paper>
                )}

                {profile.preferences?.skillsAndTalents && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.06),
                      border: '1px solid',
                      borderColor: alpha(theme.palette.primary.main, 0.18),
                      borderRadius: 2.5,
                    }}
                  >
                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 0.5 }}>
                      <BuildIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      <Typography variant="caption" fontWeight={700} color="primary.dark" sx={{ fontSize: '0.7rem' }}>
                        Talentos e Habilidades
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', lineHeight: 1.35 }}>
                      {profile.preferences.skillsAndTalents}
                    </Typography>
                  </Paper>
                )}
              </Stack>
            )}
          </>
        )}
      </Box>
    </Dialog>
  );
};

export default ProfileDetailModal;
