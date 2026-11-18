import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Tone } from '../../constants';
import { useTone } from './useTone';
import { CountUp, EASE, fadeUp } from './motion';

interface StatTileProps {
  testId: string;
  title: string;
  /** O número grande. */
  value: React.ReactNode;
  /** Uma frase que explica o que o número quer dizer. */
  hint?: string;
  icon?: React.ReactNode;
  /** A cor que dá o recado: verde vai bem, amarelo atenção, vermelho ajuda, azul informação. */
  tone?: Tone;
}

/** "73%", "+12,5%", "99": o número que dá para animar; o resto (— , textos) aparece direto. */
const NUMBER_PATTERN = /^([+-]?)(\d+(?:,\d+)?)(%?)$/;

const AnimatedValue: React.FC<{ value: React.ReactNode }> = ({ value }) => {
  const raw = typeof value === 'number' ? String(value) : typeof value === 'string' ? value : null;
  const match = raw ? NUMBER_PATTERN.exec(raw) : null;
  if (!match) {
    return (
      <Box component="span" data-testid="statistics-plain-stat-value">
        {value}
      </Box>
    );
  }

  const [, sign, digits, percent] = match;
  const decimals = digits.includes(',') ? digits.split(',')[1].length : 0;
  const target = Number(digits.replace(',', '.'));
  return (
    <Box component="span" data-testid="statistics-plain-stat-value">
      <CountUp value={target} decimals={decimals} format={(n) => `${sign}${n.toFixed(decimals).replace('.', ',')}${percent}`} />
    </Box>
  );
};

/** Um número grande e colorido, com o que ele significa logo embaixo. */
export const StatTile: React.FC<StatTileProps> = ({ testId, title, value, hint, icon, tone = Tone.Info }) => {
  const color = useTone(tone);

  return (
    <Paper
      data-testid={testId}
      data-tone={tone}
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        minWidth: 0,
        bgcolor: color.soft,
        borderColor: color.border,
        borderTopWidth: 4,
        borderTopColor: color.main,
        backgroundImage: `linear-gradient(160deg, ${color.soft} 0%, transparent 70%)`,
        transition: `transform 220ms ${EASE}, box-shadow 220ms ${EASE}`,
        animation: `${fadeUp} 520ms ${EASE} both`,
        '&:hover': { transform: 'translateY(-3px)', boxShadow: `0 10px 24px ${color.border}` },
        '@media (prefers-reduced-motion: reduce)': { animation: 'none', transition: 'none', '&:hover': { transform: 'none' } },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: color.text }}>
        {icon && (
          <Box
            aria-hidden
            sx={{
              display: 'inline-flex',
              p: 0.75,
              borderRadius: '50%',
              bgcolor: color.main,
              color: '#fff',
              '& svg': { fontSize: 18 },
            }}
          >
            {icon}
          </Box>
        )}
        <Typography variant="body2" fontWeight={800} sx={{ minWidth: 0 }}>
          {title}
        </Typography>
      </Box>
      <Typography
        component="p"
        data-testid={`${testId}-value`}
        sx={{ fontSize: { xs: '2rem', md: '2.3rem' }, fontWeight: 900, lineHeight: 1.15, color: color.text }}
      >
        <AnimatedValue value={value} />
      </Typography>
      {hint && (
        <Typography variant="body2" color="text.secondary">
          {hint}
        </Typography>
      )}
    </Paper>
  );
};

/** A grade de números do topo de cada visão: 2 colunas no celular, 4 no computador. */
export const StatTileGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    data-testid="statistics-plain-stat-tile-grid"
    sx={{
      display: 'grid',
      gap: 1.5,
      gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
      // Os números entram um depois do outro.
      '& > *:nth-of-type(2)': { animationDelay: '60ms' },
      '& > *:nth-of-type(3)': { animationDelay: '120ms' },
      '& > *:nth-of-type(4)': { animationDelay: '180ms' },
      '& > *:nth-of-type(n+5)': { animationDelay: '240ms' },
    }}
  >
    {children}
  </Box>
);
