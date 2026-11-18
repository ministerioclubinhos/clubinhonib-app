import React, { useState } from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';

import type { ProfileClub } from '../types';
import ProfileClubCard from './ProfileClubCard';

interface Props {
  clubs: readonly ProfileClub[];
}

/**
 * Clubinhos do coordenador, sem inflar a coluna: com um clubinho mostra o
 * cartão; com vários, uma linha de chips com os números e o detalhe só do
 * que for tocado.
 */
const ProfileCoordinatorClubs: React.FC<Props> = ({ clubs }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  if (clubs.length === 1) return <ProfileClubCard club={clubs[0]} />;

  const opened = clubs.find((club) => club.id === openId) ?? null;

  return (
    <Box data-testid="profile-coordinator-clubs">
      <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
        {clubs.length} clubinhos
      </Typography>
      <Stack direction="row" useFlexGap flexWrap="wrap" gap={0.75}>
        {clubs.map((club) => (
          <Chip
            key={club.id}
            label={club.number}
            clickable
            color={club.id === openId ? 'primary' : 'default'}
            variant={club.id === openId ? 'filled' : 'outlined'}
            aria-pressed={club.id === openId}
            aria-label={`Clubinho ${club.number}`}
            onClick={() => setOpenId(club.id === openId ? null : club.id)}
            sx={{ fontWeight: 700, minWidth: 48, height: 32 }}
          />
        ))}
      </Stack>
      {opened ? (
        <Box sx={{ mt: 1.25 }}>
          <ProfileClubCard club={opened} />
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Toque em um número para ver bairro, cidade e horário.
        </Typography>
      )}
    </Box>
  );
};

export default ProfileCoordinatorClubs;
