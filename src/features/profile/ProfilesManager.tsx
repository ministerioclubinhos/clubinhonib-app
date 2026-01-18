import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Avatar,
  Chip,
  Stack,
  Alert,
  Collapse,
  useTheme,
  useMediaQuery,
  Paper,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  CircularProgress,
  Skeleton,
  SelectChangeEvent,
  Dialog,
  DialogContent,
  Divider,
  Fade,
  Backdrop,
} from '@mui/material';
import {
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  Restaurant as RestaurantIcon,
  MusicNote as MusicNoteIcon,
  Palette as PaletteIcon,
  Cake as CakeIcon,
  EmojiEmotions as EmojiIcon,
  Build as BuildIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AdminPanelSettings as AdminIcon,
  School as MemberIcon,
  SupervisorAccount as LeaderIcon,
  Celebration as CelebrationIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Sort as SortIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Star as StarIcon,
  WhatsApp as WhatsAppIcon,
  ContentCopy as CopyIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/slices';
import { UserRole } from '@/types/shared';
import { apiGetAllProfiles } from './api';
import { CompleteProfileListItem, QueryProfilesDto, PaginationMeta } from './types';
import ProfileAdminEditDialog from './components/ProfileAdminEditDialog';

type BirthdayStatus = 'today' | 'this-week' | 'this-month' | null;

const getBirthdayStatus = (birthDateStr?: string): BirthdayStatus => {
  if (!birthDateStr) return null;

  try {
    const today = new Date();
    const [, month, day] = birthDateStr.split('-').map(Number);

    const birthdayThisYear = new Date(today.getFullYear(), month - 1, day);

    if (birthdayThisYear < today &&
      !(birthdayThisYear.getDate() === today.getDate() &&
        birthdayThisYear.getMonth() === today.getMonth())) {
      birthdayThisYear.setFullYear(today.getFullYear() + 1);
    }

    const diffTime = birthdayThisYear.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (birthdayThisYear.getDate() === today.getDate() &&
      birthdayThisYear.getMonth() === today.getMonth()) {
      return 'today';
    }

    if (diffDays > 0 && diffDays <= 7) {
      return 'this-week';
    }

    if (birthdayThisYear.getMonth() === today.getMonth() &&
      birthdayThisYear.getFullYear() === today.getFullYear()) {
      return 'this-month';
    }

    return null;
  } catch (e) {
    console.debug('getBirthdayStatus: Date parsing error', e);
    return null;
  }
};

const getDaysUntilBirthday = (birthDateStr?: string): number | null => {
  if (!birthDateStr) return null;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [, month, day] = birthDateStr.split('-').map(Number);

    const birthdayThisYear = new Date(today.getFullYear(), month - 1, day);
    birthdayThisYear.setHours(0, 0, 0, 0);

    if (birthdayThisYear < today) {
      birthdayThisYear.setFullYear(today.getFullYear() + 1);
    }

    const diffTime = birthdayThisYear.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (e) {
    console.debug('getDaysUntilBirthday: Date parsing error', e);
    return null;
  }
};

const formatBirthDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  try {
    const [, month, day] = dateStr.split('-').map(Number);
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${day} de ${months[month - 1]}`;
  } catch (e) {
    console.debug('formatBirthDate: Date parsing error', e);
    return dateStr;
  }
};

const formatBirthDateShort = (dateStr?: string): string => {
  if (!dateStr) return '';
  try {
    const [, month, day] = dateStr.split('-').map(Number);
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${day} ${months[month - 1]}`;
  } catch (e) {
    console.debug('formatBirthDateShort: Date parsing error', e);
    return dateStr;
  }
};

const calculateAge = (dateStr?: string): number | null => {
  if (!dateStr) return null;
  try {
    const birthDate = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  } catch (e) {
    console.debug('calculateAge: Date parsing error', e);
    return null;
  }
};

const roleConfig: Record<string, { gradient: string; color: string; label: string; icon: React.ReactElement; bgLight: string }> = {
  admin: {
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#764ba2',
    label: 'Admin',
    icon: <AdminIcon sx={{ fontSize: 14 }} />,
    bgLight: 'rgba(118, 75, 162, 0.08)',
  },
  leader: {
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: '#f5576c',
    label: 'Coordenador',
    icon: <LeaderIcon sx={{ fontSize: 14 }} />,
    bgLight: 'rgba(245, 87, 108, 0.08)',
  },
  member: {
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: '#4facfe',
    label: 'Professor',
    icon: <MemberIcon sx={{ fontSize: 14 }} />,
    bgLight: 'rgba(79, 172, 254, 0.08)',
  },
};

const genderConfig: Record<string, { gradient: string; color: string; bgLight: string }> = {
  Masculino: {
    gradient: 'linear-gradient(135deg, #667eea 0%, #4facfe 100%)',
    color: '#4facfe',
    bgLight: 'rgba(79, 172, 254, 0.06)',
  },
  Feminino: {
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: '#f5576c',
    bgLight: 'rgba(245, 87, 108, 0.06)',
  },
  neutral: {
    gradient: 'linear-gradient(135deg, #a8a8a8 0%, #6b6b6b 100%)',
    color: '#888888',
    bgLight: 'rgba(136, 136, 136, 0.06)',
  },
};

const getGenderStyle = (gender?: string) => {
  if (gender === 'Masculino') return genderConfig.Masculino;
  if (gender === 'Feminino') return genderConfig.Feminino;
  return genderConfig.neutral;
};

interface ProfileDetailModalProps {
  profile: CompleteProfileListItem | null;
  open: boolean;
  onClose: () => void;
  userRole?: string;
  onEdit: () => void;
}

const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({ profile, open, onClose, userRole, onEdit }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [copied, setCopied] = useState<string | null>(null);

  if (!profile) return null;

  const config = roleConfig[profile.role?.toLowerCase()] || roleConfig.member;
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
      const phone = profile.phone.replace(/\D/g, '');
      window.open(`https://wa.me/55${phone}`, '_blank');
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
      TransitionComponent={Fade}
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          m: isMobile ? 2 : 3,
          maxHeight: 'calc(100vh - 32px)',
        },
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
        {(userRole === UserRole.ADMIN || userRole === UserRole.COORDINATOR) && (
          <IconButton
            onClick={onEdit}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 10,
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
            zIndex: 10,
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
          <Avatar
            sx={{
              width: 72,
              height: 72,
              fontSize: '1.8rem',
              fontWeight: 700,
              background: genderStyle.gradient,
              border: '3px solid white',
              boxShadow: `0 4px 20px ${genderStyle.color}50`,
            }}
          >
            {profile.name?.charAt(0).toUpperCase()}
          </Avatar>
        </motion.div>
      </Box>

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
    </Dialog >
  );
};

interface BirthdaySectionProps {
  title: string;
  emoji: string;
  profiles: CompleteProfileListItem[];
  variant: 'today' | 'week' | 'month';
  onProfileClick: (profile: CompleteProfileListItem) => void;
}

const BirthdaySection: React.FC<BirthdaySectionProps> = ({
  title, emoji, profiles, variant, onProfileClick
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
                  onClick={(e) => { e.stopPropagation(); onProfileClick(profile); }}
                  sx={{
                    width: { xs: 24, sm: 28 },
                    height: { xs: 24, sm: 28 },
                    fontSize: { xs: '0.6rem', sm: '0.7rem' },
                    fontWeight: 700,
                    border: '2px solid white',
                    cursor: 'pointer',
                    background: getGenderStyle(profile.personalData?.gender).gradient,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.15)',
                      zIndex: 1,
                    },
                  }}
                >
                  {profile.name?.charAt(0).toUpperCase()}
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

interface ProfileCardProps {
  profile: CompleteProfileListItem;
  index: number;
  onClick: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, index, onClick }) => {
  const roleStyle = roleConfig[profile.role?.toLowerCase()] || roleConfig.member;
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
              sx={{
                width: 48,
                height: 48,
                fontSize: '1.1rem',
                fontWeight: 700,
                background: genderStyle.gradient,
                boxShadow: `0 4px 14px ${genderStyle.color}40`,
              }}
            >
              {profile.name?.charAt(0).toUpperCase()}
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

const ProfileCardSkeleton: React.FC = () => (
  <Paper
    elevation={0}
    sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', p: 2 }}
  >
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Skeleton variant="circular" width={48} height={48} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="70%" height={20} />
        <Skeleton variant="text" width="40%" height={16} />
      </Box>
    </Stack>
    <Stack spacing={0.5} sx={{ mt: 1.5 }}>
      <Skeleton variant="text" width="90%" height={14} />
      <Skeleton variant="text" width="50%" height={14} />
    </Stack>
  </Paper>
);

const ProfilesManager: React.FC = () => {
  const [profiles, setProfiles] = useState<CompleteProfileListItem[]>([]);
  const [allProfiles, setAllProfiles] = useState<CompleteProfileListItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<CompleteProfileListItem | null>(null);
  const [editingProfile, setEditingProfile] = useState<CompleteProfileListItem | null>(null);

  const { user } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(true);
  const [loadingBirthdays, setLoadingBirthdays] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<QueryProfilesDto>({
    page: 1,
    limit: 12,
    sortBy: 'name',
    order: 'ASC',
  });

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setFilters(prev => ({ ...prev, q: debouncedSearch || undefined, page: 1 }));
  }, [debouncedSearch]);

  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiGetAllProfiles(filters);
      setProfiles(response.items);
      setMeta(response.meta);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao carregar perfis');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadAllProfilesForBirthdays = useCallback(async () => {
    try {
      setLoadingBirthdays(true);
      const response = await apiGetAllProfiles({ limit: 1000 });
      setAllProfiles(response.items);
    } catch {
    } finally {
      setLoadingBirthdays(false);
    }
  }, []);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);
  useEffect(() => { loadAllProfilesForBirthdays(); }, [loadAllProfilesForBirthdays]);

  const { birthdayToday, birthdayWeek, birthdayMonth } = useMemo(() => {
    const today: CompleteProfileListItem[] = [];
    const week: CompleteProfileListItem[] = [];
    const month: CompleteProfileListItem[] = [];

    allProfiles.forEach((profile) => {
      const status = getBirthdayStatus(profile.personalData?.birthDate);
      if (status === 'today') today.push(profile);
      else if (status === 'this-week') week.push(profile);
      else if (status === 'this-month') month.push(profile);
    });

    const sortByBirthday = (a: CompleteProfileListItem, b: CompleteProfileListItem) => {
      const daysA = getDaysUntilBirthday(a.personalData?.birthDate) ?? 999;
      const daysB = getDaysUntilBirthday(b.personalData?.birthDate) ?? 999;
      return daysA - daysB;
    };

    week.sort(sortByBirthday);
    month.sort(sortByBirthday);

    return { birthdayToday: today, birthdayWeek: week, birthdayMonth: month };
  }, [allProfiles]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleRoleFilterChange = (role: string) => {
    setFilters(prev => ({ ...prev, role: role === 'all' ? undefined : role, page: 1 }));
  };

  const handleSortChange = (e: SelectChangeEvent<string>) => {
    const [sortBy, order] = e.target.value.split('-') as [QueryProfilesDto['sortBy'], QueryProfilesDto['order']];
    setFilters(prev => ({ ...prev, sortBy, order, page: 1 }));
  };

  const handleLimitChange = (e: SelectChangeEvent<number>) => {
    setFilters(prev => ({ ...prev, limit: e.target.value as number, page: 1 }));
  };

  const handleAdvancedFilterChange = (field: keyof QueryProfilesDto, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value || undefined, page: 1 }));
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({ page: 1, limit: 12, sortBy: 'name', order: 'ASC' });
  };

  const hasActiveFilters = Boolean(
    filters.q || filters.role || filters.temperaments || filters.loveLanguages || filters.favoriteColor
  );

  const handleRefresh = () => {
    loadProfiles();
    loadAllProfilesForBirthdays();
  };

  if (loading && profiles.length === 0) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%', minHeight: '100%' }}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Skeleton variant="text" width={300} height={50} sx={{ mx: 'auto' }} />
          <Skeleton variant="text" width={400} height={24} sx={{ mx: 'auto', mt: 1 }} />
        </Box>
        <Grid container spacing={2}>
          {[...Array(8)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <ProfileCardSkeleton />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5,
            }}
          >
            Nossa Família ❤️
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Conheça cada pessoa especial do nosso ministério
          </Typography>
        </Box>
      </motion.div>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!loadingBirthdays && (birthdayToday.length > 0 || birthdayWeek.length > 0 || birthdayMonth.length > 0) && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ mb: 2 }}
        >
          <BirthdaySection
            title="Aniversário Hoje! 🎉"
            emoji="🎂"
            profiles={birthdayToday}
            variant="today"
            onProfileClick={setSelectedProfile}
          />
          <BirthdaySection
            title="Esta Semana"
            emoji="🎈"
            profiles={birthdayWeek}
            variant="week"
            onProfileClick={setSelectedProfile}
          />
          <BirthdaySection
            title="Este Mês"
            emoji="🎁"
            profiles={birthdayMonth}
            variant="month"
            onProfileClick={setSelectedProfile}
          />
        </Stack>
      )}

      <Paper
        elevation={0}
        sx={{ p: { xs: 1.5, sm: 2 }, mb: 2, borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', bgcolor: 'rgba(255,255,255,0.8)' }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 1.5, sm: 2 }} alignItems={{ xs: 'stretch', md: 'center' }}>
          <TextField
            placeholder="Buscar por nome ou email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: { xs: '100%', md: 200 }, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' } }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.disabled' }} /></InputAdornment>,
              endAdornment: searchInput && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchInput('')}><ClearIcon sx={{ fontSize: 18 }} /></IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}>
            {(['all', 'member', 'leader', 'admin'] as const).map((role) => {
              const isSelected = (filters.role || 'all') === (role === 'all' ? 'all' : role) && (role === 'all' ? !filters.role : true);
              const config = role === 'all' ? null : roleConfig[role];
              return (
                <Chip
                  key={role}
                  label={role === 'all' ? 'Todos' : config?.label}
                  size="small"
                  onClick={() => handleRoleFilterChange(role)}
                  sx={{
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                    height: { xs: 28, sm: 32 },
                    bgcolor: isSelected ? (config?.color || '#667eea') : 'rgba(0,0,0,0.04)',
                    color: isSelected ? 'white' : 'text.secondary',
                    '&:hover': { bgcolor: isSelected ? (config?.color || '#667eea') : 'rgba(0,0,0,0.08)' },
                  }}
                />
              );
            })}
          </Stack>

          <Stack direction="row" spacing={1} sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}>
            <Tooltip title="Filtros avançados">
              <IconButton
                size="small"
                onClick={() => setShowFilters(!showFilters)}
                sx={{
                  bgcolor: showFilters ? 'primary.main' : 'rgba(0,0,0,0.04)',
                  color: showFilters ? 'white' : 'text.secondary',
                  '&:hover': { bgcolor: showFilters ? 'primary.dark' : 'rgba(0,0,0,0.08)' },
                }}
              >
                <FilterIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Atualizar">
              <IconButton size="small" onClick={handleRefresh} disabled={loading} sx={{ bgcolor: 'rgba(0,0,0,0.04)' }}>
                {loading ? <CircularProgress size={20} /> : <RefreshIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            {hasActiveFilters && (
              <Tooltip title="Limpar filtros">
                <IconButton size="small" onClick={clearFilters} sx={{ bgcolor: 'rgba(244,67,54,0.1)', color: '#f44336' }}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </Paper>

      <Collapse in={showFilters}>
        <Paper
          elevation={0}
          sx={{ p: 2, mb: 2, borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', bgcolor: 'rgba(248,248,255,0.5)' }}
        >
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, color: 'text.secondary' }}>
            <FilterIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} /> Filtros Avançados
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField label="Temperamento" placeholder="Ex: Sanguíneo" value={filters.temperaments || ''} onChange={(e) => handleAdvancedFilterChange('temperaments', e.target.value)} size="small" fullWidth />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField label="Linguagem do Amor" placeholder="Ex: Palavras" value={filters.loveLanguages || ''} onChange={(e) => handleAdvancedFilterChange('loveLanguages', e.target.value)} size="small" fullWidth />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField label="Cor Favorita" placeholder="Ex: Azul" value={filters.favoriteColor || ''} onChange={(e) => handleAdvancedFilterChange('favoriteColor', e.target.value)} size="small" fullWidth />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl size="small" fullWidth>
                <InputLabel><SortIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} /> Ordenar por</InputLabel>
                <Select value={`${filters.sortBy}-${filters.order}`} onChange={handleSortChange} label="Ordenar por">
                  <MenuItem value="name-ASC">Nome (A-Z)</MenuItem>
                  <MenuItem value="name-DESC">Nome (Z-A)</MenuItem>
                  <MenuItem value="email-ASC">Email (A-Z)</MenuItem>
                  <MenuItem value="email-DESC">Email (Z-A)</MenuItem>
                  <MenuItem value="createdAt-DESC">Mais recentes</MenuItem>
                  <MenuItem value="createdAt-ASC">Mais antigos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      {profiles.length === 0 && !loading ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: '1px solid rgba(0,0,0,0.06)' }}>
          <PersonIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>Nenhum perfil encontrado</Typography>
          <Typography variant="body2" color="text.disabled">Tente ajustar os filtros de busca</Typography>
          {hasActiveFilters && <Chip label="Limpar filtros" onClick={clearFilters} sx={{ mt: 2 }} color="primary" variant="outlined" />}
        </Paper>
      ) : (
        <>
          <Grid container spacing={2}>
            <AnimatePresence>
              {profiles.map((profile, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={profile.id}>
                  <ProfileCard profile={profile} index={index} onClick={() => setSelectedProfile(profile)} />
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>

          {meta && (
            <Paper
              elevation={0}
              sx={{
                mt: 3,
                p: { xs: 1.5, sm: 2 },
                borderRadius: 3,
                border: '1px solid rgba(0,0,0,0.06)',
                bgcolor: 'rgba(255,255,255,0.8)'
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="center"
                alignItems="center"
                spacing={{ xs: 1.5, sm: 2 }}
                sx={{ position: 'relative' }}
              >
                {meta.totalPages > 1 && (
                  <Pagination
                    count={meta.totalPages}
                    page={meta.currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size={isMobile ? 'small' : 'medium'}
                    showFirstButton
                    showLastButton
                    siblingCount={isMobile ? 0 : 1}
                    boundaryCount={1}
                  />
                )}

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    position: { xs: 'static', sm: 'absolute' },
                    right: { sm: 16 },
                  }}
                >
                  <FormControl size="small" sx={{ minWidth: { xs: 60, sm: 70 } }}>
                    <Select
                      value={filters.limit || 12}
                      onChange={handleLimitChange}
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.1)' },
                        bgcolor: 'white',
                        borderRadius: 2,
                        fontSize: { xs: '0.7rem', sm: '0.8rem' },
                        '& .MuiSelect-select': { py: 0.75 },
                      }}
                    >
                      <MenuItem value={8}>8</MenuItem>
                      <MenuItem value={12}>12</MenuItem>
                      <MenuItem value={24}>24</MenuItem>
                      <MenuItem value={48}>48</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, whiteSpace: 'nowrap' }}
                  >
                    de <strong>{meta.totalItems}</strong>
                    {hasActiveFilters && ' (filtrado)'}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          )}
        </>
      )}

      {loading && profiles.length > 0 && (
        <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
          <Paper elevation={8} sx={{ p: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'white' }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">Carregando...</Typography>
          </Paper>
        </Box>
      )}

      <ProfileDetailModal
        profile={selectedProfile}
        open={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        userRole={user?.role}
        onEdit={() => {
          setEditingProfile(selectedProfile);
          setSelectedProfile(null);
        }}
      />

      <ProfileAdminEditDialog
        open={!!editingProfile}
        profile={editingProfile}
        onClose={() => setEditingProfile(null)}
        onUpdate={() => {
          loadProfiles();
          // Optionally refresh birthdays too
          loadAllProfilesForBirthdays();
        }}
      />
    </Box>
  );
};

export default ProfilesManager;
