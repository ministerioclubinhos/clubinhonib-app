import React from 'react';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { BarItem } from './BarList';
import { useChartPalette } from './chartColors';
import { EASE, STAGGER_MS, fadeUp } from './motion';

/**
 * Blocos de tamanhos diferentes: quanto maior o número, maior o bloco. Para
 * comparar "o tamanho" de coisas com nome, como clubinhos e cidades.
 */
export const TileMap: React.FC<{ items: BarItem[]; emptyText: string }> = ({ items, emptyText }) => {
  const palette = useChartPalette();

  if (items.length === 0) {
    return (
      <Typography data-testid="statistics-plain-tile-map-empty" color="text.secondary">
        {emptyText}
      </Typography>
    );
  }

  const top = Math.max(...items.map((item) => item.value), 1);

  return (
    <Box data-testid="statistics-plain-tile-map" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {items.map((item, index) => {
        const color = palette[index % palette.length];
        return (
          <Box
            key={item.key}
            data-testid="statistics-plain-chart-item"
            aria-label={`${item.label}: ${item.display}`}
            sx={{
              flex: `${Math.max(1, item.value)} 1 ${Math.round(84 + (item.value / top) * 72)}px`,
              minHeight: 72 + (item.value / top) * 28,
              p: 1.25,
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              color: '#fff',
              backgroundImage: `linear-gradient(145deg, ${color}, ${alpha(color, 0.72)})`,
              boxShadow: `0 4px 12px ${alpha(color, 0.3)}`,
              transition: `transform 200ms ${EASE}, box-shadow 200ms ${EASE}`,
              animation: `${fadeUp} 480ms ${EASE} ${index * STAGGER_MS}ms both`,
              '&:hover': { transform: 'translateY(-3px) scale(1.02)', boxShadow: `0 10px 20px ${alpha(color, 0.45)}` },
              '@media (prefers-reduced-motion: reduce)': { animation: 'none', transition: 'none' },
            }}
          >
            <Typography variant="body2" fontWeight={800} sx={{ lineHeight: 1.2, overflowWrap: 'anywhere', textShadow: '0 1px 2px rgba(0,0,0,.25)' }}>
              {item.label}
            </Typography>
            <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', lineHeight: 1.1, textShadow: '0 1px 2px rgba(0,0,0,.25)' }}>{item.display}</Typography>
          </Box>
        );
      })}
    </Box>
  );
};
