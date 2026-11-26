import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { EASE, MOTION_MS, STAGGER_MS, useInView } from './motion';

export interface DonutItem {
  key: string;
  label: string;
  value: number;
  /** O que a legenda escreve ao lado: "56% · 12 crianças". */
  display: string;
}

interface DonutChartProps {
  items: DonutItem[];
  /** O que fica escrito no meio do anel, por exemplo "99". */
  centerValue: string;
  centerLabel: string;
  emptyText: string;
}

const SIZE = 168;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 3;

/**
 * Anel com as fatias de um todo (por exemplo meninos e meninas) e a legenda
 * escrita ao lado. Só para poucas categorias: com mais de cinco, a lista de
 * barras lê melhor.
 */
export const DonutChart: React.FC<DonutChartProps> = ({ items, centerValue, centerLabel, emptyText }) => {
  const theme = useTheme();
  const [ref, seen] = useInView<HTMLDivElement>();
  const total = items.reduce((sum, item) => sum + item.value, 0);

  if (items.length === 0 || total <= 0) {
    return (
      <Typography data-testid="statistics-plain-donut-empty" color="text.secondary">
        {emptyText}
      </Typography>
    );
  }

  const palette = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
  ];

  let offset = 0;
  const slices = items.map((item, index) => {
    const length = (item.value / total) * CIRCUMFERENCE;
    const slice = { ...item, color: palette[index % palette.length], length, offset };
    offset += length;
    return slice;
  });

  return (
    <Box
      ref={ref}
      data-testid="statistics-plain-donut"
      sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 3 }, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}
    >
      <Box sx={{ position: 'relative', width: SIZE, height: SIZE, flexShrink: 0 }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`${centerLabel}: ${items.map((i) => `${i.label} ${i.display}`).join(', ')}`}>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke={alpha(theme.palette.text.primary, 0.07)} strokeWidth={STROKE} />
          <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
            {slices.map((slice, index) => (
              <circle
                key={slice.key}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={slice.color}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={`${seen ? Math.max(0, slice.length - GAP) : 0} ${CIRCUMFERENCE}`}
                strokeDashoffset={-slice.offset}
                style={{
                  transition: `stroke-dasharray ${MOTION_MS}ms ${EASE} ${index * STAGGER_MS * 2}ms`,
                  filter: `drop-shadow(0 0 4px ${alpha(slice.color, 0.5)})`,
                }}
              />
            ))}
          </g>
        </svg>
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ fontSize: '1.9rem', fontWeight: 900, lineHeight: 1 }}>{centerValue}</Typography>
          <Typography variant="caption" color="text.secondary">
            {centerLabel}
          </Typography>
        </Box>
      </Box>

      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 1, flex: 1, minWidth: 160 }}>
        {slices.map((slice) => (
          <Box
            component="li"
            key={slice.key}
            data-testid="statistics-plain-donut-row"
            sx={{ display: 'flex', alignItems: 'center', gap: 1, borderRadius: 2, px: 1, py: 0.5, transition: `background-color 200ms ${EASE}`, '&:hover': { bgcolor: alpha(slice.color, 0.1) } }}
          >
            <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: slice.color, flexShrink: 0, boxShadow: `0 0 6px ${alpha(slice.color, 0.6)}` }} />
            <Typography variant="body2" fontWeight={700} sx={{ flex: 1, minWidth: 0 }}>
              {slice.label}
            </Typography>
            <Typography variant="body2" fontWeight={900}>
              {slice.display}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
