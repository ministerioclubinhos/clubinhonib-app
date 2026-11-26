import React from 'react';
import { Box, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import type { BarItem } from './BarList';
import { useChartPalette } from './chartColors';
import { EASE, STAGGER_MS, fadeUp } from './motion';

const MAX_ICONS = 10;

/** "Quantas pessoas": um bonequinho para cada uma, em vez de uma barra. */
export const DotsList: React.FC<{ items: BarItem[]; emptyText: string; icon?: React.ElementType }> = ({ items, emptyText, icon: Icon = PersonIcon }) => {
  const palette = useChartPalette();

  if (items.length === 0) {
    return (
      <Typography data-testid="statistics-plain-dots-empty" color="text.secondary">
        {emptyText}
      </Typography>
    );
  }

  return (
    <Box component="ul" data-testid="statistics-plain-dots-list" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 1 }}>
      {items.map((item, rowIndex) => {
        const color = palette[rowIndex % palette.length];
        const shown = Math.min(item.value, MAX_ICONS);
        return (
          <Box
            component="li"
            key={item.key}
            data-testid="statistics-plain-chart-item"
            aria-label={`${item.label}: ${item.display}`}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}
          >
            <Typography variant="body2" fontWeight={800} sx={{ width: { xs: 96, sm: 120 }, flexShrink: 0 }}>
              {item.label}
            </Typography>
            <Box aria-hidden sx={{ display: 'flex', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
              {Array.from({ length: shown }).map((_, i) => (
                <Icon
                  key={i}
                  sx={{ color, fontSize: 28, animation: `${fadeUp} 360ms ${EASE} ${(rowIndex * 3 + i) * (STAGGER_MS / 2)}ms both`, '@media (prefers-reduced-motion: reduce)': { animation: 'none' } }}
                />
              ))}
              {item.value > MAX_ICONS && (
                <Typography variant="body2" fontWeight={900} sx={{ color, alignSelf: 'center', ml: 0.5 }}>
                  +{item.value - MAX_ICONS}
                </Typography>
              )}
            </Box>
            <Typography variant="body2" fontWeight={900} sx={{ color }}>
              {item.display}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};
