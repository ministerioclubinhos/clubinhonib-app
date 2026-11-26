import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import { Tone } from '../../constants';
import { useTone } from './useTone';

interface StatusBannerProps {
  tone: Tone;
  title: string;
  detail?: string;
}

const ICONS: Partial<Record<Tone, React.ReactElement>> = {
  [Tone.Success]: <CheckCircleIcon fontSize="inherit" />,
  [Tone.Warning]: <WarningIcon fontSize="inherit" />,
  [Tone.Error]: <ErrorIcon fontSize="inherit" />,
};

/** A situação geral numa faixa baixinha: verde tudo certo, amarelo atenção, vermelho precisa de ajuda. */
export const StatusBanner: React.FC<StatusBannerProps> = ({ tone, title, detail }) => {
  const color = useTone(tone);

  return (
    <Paper
      data-testid="statistics-plain-status-banner"
      data-tone={tone}
      elevation={0}
      sx={{ px: 1.5, py: 1, borderRadius: 2, bgcolor: color.main, color: '#fff', display: 'flex', gap: 1, alignItems: 'center' }}
    >
      <Box aria-hidden sx={{ fontSize: 24, display: 'flex', flexShrink: 0 }}>
        {ICONS[tone]}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography component="p" variant="body2" sx={{ fontWeight: 900, lineHeight: 1.25 }}>
          {title}
        </Typography>
        {detail && (
          <Typography variant="caption" sx={{ opacity: 0.95, display: 'block', lineHeight: 1.25 }}>
            {detail}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};
