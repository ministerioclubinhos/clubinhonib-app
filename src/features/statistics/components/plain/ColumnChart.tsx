import React from 'react';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { BarItem } from './BarList';
import { useChartPalette } from './chartColors';
import { EASE, MOTION_MS, STAGGER_MS, useInView } from './motion';

const HEIGHT = 130;

/**
 * Colunas verticais na ordem em que vieram (faixas de idade, dias da semana…).
 * A maior ganha destaque; o valor fica em cima e o nome embaixo.
 */
export const ColumnChart: React.FC<{ items: BarItem[]; emptyText: string }> = ({ items, emptyText }) => {
  const [ref, seen] = useInView<HTMLDivElement>();
  const palette = useChartPalette();

  if (items.length === 0) {
    return (
      <Typography data-testid="statistics-plain-column-chart-empty" color="text.secondary">
        {emptyText}
      </Typography>
    );
  }

  const top = Math.max(...items.map((item) => item.value), 1);

  return (
    <Box ref={ref} data-testid="statistics-plain-column-chart" sx={{ display: 'flex', alignItems: 'flex-end', gap: { xs: 0.75, md: 1.25 }, height: HEIGHT + 56 }}>
      {items.map((item, index) => {
        const color = palette[index % palette.length];
        const isTop = item.value === top;
        return (
          <Box
            key={item.key}
            data-testid="statistics-plain-chart-item"
            aria-label={`${item.label}: ${item.display}`}
            sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', '&:hover .col': { filter: 'brightness(1.1)', transform: 'scaleX(1.06)' } }}
          >
            <Typography variant="caption" fontWeight={900} sx={{ color, opacity: seen ? 1 : 0, transition: `opacity 400ms ${EASE} ${index * STAGGER_MS + 300}ms`, textAlign: 'center', lineHeight: 1.1 }}>
              {item.display}
            </Typography>
            <Box
              className="col"
              sx={{
                width: '100%',
                maxWidth: 44,
                mt: 0.25,
                height: seen ? Math.max(8, (item.value / top) * HEIGHT) : 6,
                borderRadius: '10px 10px 3px 3px',
                backgroundImage: `linear-gradient(180deg, ${color}, ${alpha(color, 0.5)})`,
                boxShadow: isTop ? `0 0 14px ${alpha(color, 0.6)}` : 'none',
                transformOrigin: 'bottom',
                transition: `height ${MOTION_MS}ms ${EASE} ${index * STAGGER_MS}ms, transform 200ms ${EASE}, filter 200ms`,
                '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
              }}
            />
            <Typography variant="caption" color={isTop ? 'text.primary' : 'text.secondary'} fontWeight={isTop ? 800 : 500} sx={{ mt: 0.5, textAlign: 'center', lineHeight: 1.15, overflowWrap: 'anywhere' }}>
              {item.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};
