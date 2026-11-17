import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Tone } from '../../constants';
import { useTone } from './useTone';
import { EASE, fadeUp } from './motion';

interface SectionProps {
  testId: string;
  title: string;
  /** Como ler este bloco, numa frase. */
  help?: string;
  /** A cor do fio ao lado do título; sem ela, o azul de informação. */
  tone?: Tone;
  children: React.ReactNode;
}

/** Um bloco da página: título com fio colorido, uma frase de ajuda e o conteúdo. */
export const Section: React.FC<SectionProps> = ({ testId, title, help, tone = Tone.Info, children }) => {
  const color = useTone(tone);

  return (
    <Paper
      data-testid={testId}
      data-tone={tone}
      variant="outlined"
      sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 3, minWidth: 0,
        borderLeftWidth: 5,
        borderLeftColor: color.main,
        animation: `${fadeUp} 520ms ${EASE} both`,
        transition: `box-shadow 220ms ${EASE}`,
        '&:hover': { boxShadow: `0 8px 22px ${color.soft}` },
        '@media (prefers-reduced-motion: reduce)': { animation: 'none', transition: 'none' },
      }}
    >
      <Typography component="h3" variant="subtitle1" fontWeight={900} sx={{ color: color.text }}>
        {title}
      </Typography>
      {help ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {help}
        </Typography>
      ) : (
        <Box sx={{ height: 12 }} />
      )}
      {children}
    </Paper>
  );
};

/** Os blocos de uma visão: um embaixo do outro no celular, dois lado a lado no computador. */
export const SectionGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    data-testid="statistics-plain-section-grid"
    sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))' }}
  >
    {children}
  </Box>
);
