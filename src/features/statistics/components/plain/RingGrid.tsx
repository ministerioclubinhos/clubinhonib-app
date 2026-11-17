import React from 'react';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { BarItem } from './BarList';
import { Ring } from './Ring';
import { useToneColor } from './chartColors';
import { EASE, STAGGER_MS, fadeUp, useInView } from './motion';

/** Um anel por clubinho: dá para ver, de relance, quem está verde e quem está vermelho. */
export const RingGrid: React.FC<{ items: BarItem[]; emptyText: string }> = ({ items, emptyText }) => {
  const [ref, seen] = useInView<HTMLUListElement>();
  const colorOf = useToneColor();

  if (items.length === 0) {
    return (
      <Typography data-testid="statistics-plain-ring-grid-empty" color="text.secondary">
        {emptyText}
      </Typography>
    );
  }

  return (
    <Box
      ref={ref}
      component="ul"
      data-testid="statistics-plain-ring-grid"
      sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 1.25, gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))' }}
    >
      {items.map((item, index) => {
        const color = colorOf(item.tone);
        return (
          <Box
            component="li"
            key={item.key}
            data-testid="statistics-plain-chart-item"
            aria-label={`${item.label}: ${item.display}`}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 0.5,
              p: 1.25,
              borderRadius: 3,
              border: `1px solid ${alpha(color, 0.35)}`,
              backgroundImage: `linear-gradient(160deg, ${alpha(color, 0.1)}, transparent 70%)`,
              transition: `transform 200ms ${EASE}, box-shadow 200ms ${EASE}`,
              animation: `${fadeUp} 480ms ${EASE} ${index * 50}ms both`,
              '&:hover': { transform: 'translateY(-3px) scale(1.03)', boxShadow: `0 8px 18px ${alpha(color, 0.25)}` },
              '@media (prefers-reduced-motion: reduce)': { animation: 'none', transition: 'none' },
            }}
          >
            <Ring percent={item.value} color={color} size={84} center={item.display.length <= 5 ? item.display : '—'} active={seen} delayMs={index * STAGGER_MS} />
            <Typography variant="body2" fontWeight={800} sx={{ lineHeight: 1.2 }}>
              {item.label}
            </Typography>
            {item.display.length > 5 && (
              <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ lineHeight: 1.2 }}>
                {item.display}
              </Typography>
            )}
            {item.caption && (
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                {item.caption}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
