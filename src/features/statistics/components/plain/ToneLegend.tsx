import React from 'react';
import { Box, Typography } from '@mui/material';
import { Tone } from '../../constants';
import { TONE_LEGEND } from '../../texts';
import { useTone } from './useTone';

const Dot: React.FC<{ tone: Tone; label: string }> = ({ tone, label }) => {
  const color = useTone(tone);

  return (
    <Box data-testid="statistics-plain-tone-legend-item" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
      <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: color.main }} />
      <Typography variant="caption" fontWeight={700}>
        {label}
      </Typography>
    </Box>
  );
};

/** Pequena legenda das cores, para ninguém ter que adivinhar o que o vermelho quer dizer. */
export const ToneLegend: React.FC = () => (
  <Box data-testid="statistics-plain-tone-legend" sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1.5, sm: 2.5 } }}>
    <Dot tone={Tone.Success} label={TONE_LEGEND.good} />
    <Dot tone={Tone.Warning} label={TONE_LEGEND.attention} />
    <Dot tone={Tone.Error} label={TONE_LEGEND.help} />
    <Dot tone={Tone.Info} label={TONE_LEGEND.info} />
  </Box>
);
