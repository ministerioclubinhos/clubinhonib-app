import React from 'react';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { BarItem } from './BarList';
import { useChartPalette } from './chartColors';
import { EASE, MOTION_MS, useInView } from './motion';

/**
 * Uma barra só, dividida em pedaços: o todo é 100% e cada fatia é uma parte
 * dele. Boa para "quanto tempo as crianças estão no clubinho".
 */
export const StackedBar: React.FC<{ items: BarItem[]; emptyText: string }> = ({ items, emptyText }) => {
  const [ref, seen] = useInView<HTMLDivElement>();
  const palette = useChartPalette();
  const total = items.reduce((sum, item) => sum + item.value, 0);

  if (items.length === 0 || total <= 0) {
    return (
      <Typography data-testid="statistics-plain-stacked-empty" color="text.secondary">
        {emptyText}
      </Typography>
    );
  }

  return (
    <Box ref={ref} data-testid="statistics-plain-stacked-bar">
      <Box sx={{ display: 'flex', height: 34, borderRadius: 3, overflow: 'hidden', gap: '3px' }}>
        {items.map((item, index) => {
          const color = palette[index % palette.length];
          return (
            <Box
              key={item.key}
              aria-hidden
              sx={{
                flexGrow: seen ? item.value : 0,
                flexBasis: 0,
                minWidth: seen && item.value > 0 ? 6 : 0,
                backgroundImage: `linear-gradient(180deg, ${color}, ${alpha(color, 0.65)})`,
                transition: `flex-grow ${MOTION_MS}ms ${EASE} ${index * 90}ms, filter 200ms`,
                '&:hover': { filter: 'brightness(1.12)' },
                '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
              }}
            />
          );
        })}
      </Box>
      <Box component="ul" sx={{ listStyle: 'none', m: 0, mt: 1.5, p: 0, display: 'grid', gap: 0.75, gridTemplateColumns: '1fr' }}>
        {items.map((item, index) => {
          const color = palette[index % palette.length];
          return (
            <Box component="li" key={item.key} data-testid="statistics-plain-chart-item" aria-label={`${item.label}: ${item.display}`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: '4px', bgcolor: color, flexShrink: 0 }} />
              <Typography variant="body2" fontWeight={700} sx={{ flex: 1, minWidth: 0 }}>
                {item.label}
              </Typography>
              <Typography variant="body2" fontWeight={900}>
                {item.display}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
