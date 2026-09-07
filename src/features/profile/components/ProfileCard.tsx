import React from 'react';
import {
  Avatar,
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import CakeIcon from '@mui/icons-material/Cake';
import EmailIcon from '@mui/icons-material/Email';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PaletteIcon from '@mui/icons-material/Palette';
import StarIcon from '@mui/icons-material/Star';
import { motion } from 'framer-motion';

import type { CompleteProfile } from '../types';
import { calculateAge, formatBirthDateShort, getBirthdayStatus, getInitials } from '../utils';
import { getGenderStyle, roleConfig } from './profileStyles';

interface ProfileCardProps {
  profile: CompleteProfile;
  index: number;
  onClick: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, index, onClick }) => {
  const theme = useTheme();
  const roleStyle = roleConfig[profile.role?.toLowerCase()] || roleConfig.teacher;
  const genderStyle = getGenderStyle(profile.personalData?.gender);
  const birthdayStatus = getBirthdayStatus(profile.personalData?.birthDate);
  const age = calculateAge(profile.personalData?.birthDate);
  const isBirthdayToday = birthdayStatus === 'today';

  return (
    <motion.article
      data-testid="profile-profile-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      style={{ height: '100%', cursor: 'pointer' }}
    >
      <Paper
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: isBirthdayToday ? '#f6416c' : alpha(genderStyle.color, 0.3),
          bgcolor: genderStyle.bgLight,
          boxShadow: isBirthdayToday
            ? '0 8px 24px rgba(246, 65, 108, 0.16)'
            : `0 4px 16px ${alpha(genderStyle.color, 0.08)}`,
          transition: 'all 0.25s ease',
          position: 'relative',
          '&:hover': {
            borderColor: isBirthdayToday ? '#f6416c' : genderStyle.color,
            boxShadow: `0 10px 28px ${alpha(genderStyle.color, 0.22)}`,
          },
          '&:focus-within': {
            borderColor: genderStyle.color,
            boxShadow: `0 0 0 3px ${alpha(genderStyle.color, 0.2)}`,
          },
        }}
      >
        {/* Birthday Badge if Today */}
        {isBirthdayToday && (
          <Chip
            label="🎂 Aniversário!"
            size="small"
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              bgcolor: '#FFFFFF',
              color: '#f6416c',
              fontWeight: 800,
              fontSize: '0.65rem',
              height: 22,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          />
        )}

        {/* Avatar and Person Header */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
          <Avatar
            src={profile.image?.url}
            alt={profile.name}
            sx={{
              width: 50,
              height: 50,
              fontSize: '1.15rem',
              fontWeight: 800,
              background: profile.image?.url ? 'transparent' : genderStyle.gradient,
              boxShadow: `0 4px 14px ${alpha(genderStyle.color, 0.35)}`,
              flexShrink: 0,
            }}
          >
            {!profile.image?.url && getInitials(profile.name)}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              fontWeight={800}
              noWrap
              title={profile.name}
              sx={{ color: 'text.primary', lineHeight: 1.25, mb: 0.35 }}
            >
              {profile.name}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Box sx={{ color: roleStyle.color, display: 'flex', alignItems: 'center' }}>
                {roleStyle.icon}
              </Box>
              <Typography variant="caption" fontWeight={700} sx={{ color: roleStyle.color, fontSize: '0.72rem' }}>
                {roleStyle.label}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        {/* Contact Info & Birthdate */}
        <Stack spacing={0.5} sx={{ mb: 1.5, flex: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '0.75rem' }}
          >
            <EmailIcon sx={{ fontSize: 13, opacity: 0.6, flexShrink: 0 }} />
            {profile.email}
          </Typography>

          {profile.personalData?.birthDate && (
            <Typography
              variant="caption"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                fontSize: '0.75rem',
                color: isBirthdayToday ? '#f6416c' : 'text.secondary',
                fontWeight: isBirthdayToday ? 700 : 400,
              }}
            >
              <CakeIcon sx={{ fontSize: 13, opacity: isBirthdayToday ? 1 : 0.6, flexShrink: 0 }} />
              {formatBirthDateShort(profile.personalData.birthDate)}
              {age !== null && ` • ${age} anos`}
            </Typography>
          )}
        </Stack>

        {/* Preference Chips */}
        {profile.preferences && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ gap: 0.5, mt: 'auto' }}>
            {profile.preferences.temperaments && (
              <Chip
                icon={<StarIcon sx={{ fontSize: '11px !important' }} />}
                label={profile.preferences.temperaments.split(' ')[0]}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  bgcolor: alpha(theme.palette.common.black, 0.05),
                  color: 'text.secondary',
                }}
              />
            )}
            {profile.preferences.loveLanguages && (
              <Chip
                icon={<FavoriteIcon sx={{ fontSize: '11px !important', color: '#f6416c !important' }} />}
                label={profile.preferences.loveLanguages.split(' ')[0]}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  bgcolor: alpha('#f6416c', 0.08),
                  color: '#f6416c',
                }}
              />
            )}
            {profile.preferences.favoriteColor && (
              <Chip
                icon={<PaletteIcon sx={{ fontSize: '11px !important' }} />}
                label={profile.preferences.favoriteColor.split(' ')[0]}
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  bgcolor: alpha(theme.palette.common.black, 0.05),
                  color: 'text.secondary',
                }}
              />
            )}
          </Stack>
        )}
      </Paper>
    </motion.article>
  );
};

export default ProfileCard;
