import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';

import { weekdayLabel } from '@/utils/dateUtils';

import type { ProfileClub } from '../types';
import { formatClubLocation } from '../utils';

interface Props {
  club: ProfileClub;
}

/** Cartão de um clubinho no perfil: número, bairro/cidade e dia e horário. */
const ProfileClubCard: React.FC<Props> = ({ club }) => {
  const location = formatClubLocation(club);

  return (
    <Paper
      data-testid={`profile-club-card-${club.number}`}
      elevation={0}
      sx={{ p: 1.5, bgcolor: 'white', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
    >
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ p: 0.5, borderRadius: 1, bgcolor: 'primary.main', color: 'white', display: 'flex' }}>
            <HomeOutlinedIcon sx={{ fontSize: 16 }} />
          </Box>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary">
            Clubinho {club.number}
          </Typography>
        </Stack>

        {location && (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <PlaceOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              {location}
            </Typography>
          </Stack>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'action.hover', py: 0.5, px: 1, borderRadius: 1 }}>
          <GroupsOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="caption" fontWeight={600} color="text.secondary">
            {weekdayLabel(club.weekday)}
            {club.time ? ` às ${club.time}` : ''}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default ProfileClubCard;
