import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { EASE, MOTION_MS, shimmer, useInView } from './motion';

interface ProgressLineProps {
  title: string;
  /** Quantos fizeram. */
  done: number;
  /** De quantos. */
  total: number;
  /** Texto abaixo: o período, ou o que falta. */
  caption?: string;
}

/** "12 de 14" com uma barra que enche: quanto já foi feito do que era esperado. */
export const ProgressLine: React.FC<ProgressLineProps> = ({ title, done, total, caption }) => {
  const theme = useTheme();
  const [ref, seen] = useInView<HTMLDivElement>();
  const percent = total > 0 ? Math.min(100, (done / total) * 100) : 0;
  const complete = total > 0 && done >= total;
  const color =
    total === 0
      ? theme.palette.grey[500]
      : complete
        ? theme.palette.success.main
        : percent >= 50
          ? theme.palette.warning.main
          : theme.palette.error.main;

  return (
    <Box ref={ref} data-testid="statistics-plain-progress-line">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'baseline' }}>
        <Typography variant="body2" fontWeight={800} sx={{ minWidth: 0 }}>
          {title}
        </Typography>
        <Typography variant="body2" fontWeight={900} sx={{ flexShrink: 0, color }}>
          {total > 0 ? `${done} de ${total}` : '—'}
        </Typography>
      </Box>
      <Box
        role="progressbar"
        aria-label={title}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        sx={{ height: 16, borderRadius: 8, mt: 0.75, bgcolor: alpha(color, 0.15), overflow: 'hidden' }}
      >
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            height: '100%',
            width: seen ? `${percent}%` : 0,
            borderRadius: 8,
            backgroundImage: `linear-gradient(90deg, ${alpha(color, 0.7)}, ${color})`,
            boxShadow: `0 0 12px ${alpha(color, 0.5)}`,
            transition: `width ${MOTION_MS}ms ${EASE}`,
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
              animation: `${shimmer} 2.2s ${EASE} 1`,
            },
            '@media (prefers-reduced-motion: reduce)': { transition: 'none', '&::after': { animation: 'none' } },
          }}
        />
      </Box>
      {caption && (
        <Typography variant="caption" color="text.secondary">
          {caption}
        </Typography>
      )}
    </Box>
  );
};
