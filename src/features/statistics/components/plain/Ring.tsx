import React from 'react';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { EASE, MOTION_MS } from './motion';

interface RingProps {
  /** 0 a 100. */
  percent: number;
  color: string;
  size: number;
  /** Escrito no meio do anel. */
  center: string;
  /** Liga a animação de preenchimento. */
  active: boolean;
  delayMs?: number;
}

/** Anel de progresso: o número no meio, o arco colorido em volta. */
export const Ring: React.FC<RingProps> = ({ percent, color, size, center, active, delayMs = 0 }) => {
  const stroke = Math.max(6, Math.round(size / 8));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.max(0, Math.min(100, percent)) / 100) * circumference;

  return (
    <Box data-testid="statistics-plain-ring" sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={alpha(color, 0.16)} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          strokeDasharray={`${active ? filled : 0} ${circumference}`}
          style={{ transition: `stroke-dasharray ${MOTION_MS}ms ${EASE} ${delayMs}ms`, filter: `drop-shadow(0 0 3px ${alpha(color, 0.5)})` }}
        />
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontWeight: 900, fontSize: size >= 80 ? '1.1rem' : '0.8rem', color }}>{center}</Typography>
      </Box>
    </Box>
  );
};
