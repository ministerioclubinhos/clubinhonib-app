import React from 'react';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { BarItem } from './BarList';
import { Ring } from './Ring';
import { useToneColor } from './chartColors';
import { EASE, STAGGER_MS, fadeUp, useInView } from './motion';

const MEDALS = ['#F5B301', '#9AA5B1', '#CD7F32'];

/**
 * Ranking: cada pessoa com o seu anel de presença. O anel enche e muda de cor
 * (verde, amarelo, vermelho); os três primeiros ganham medalha quando é um
 * "top". Substitui a lista de barras onde o que importa é quem é quem.
 */
export const RingList: React.FC<{ items: BarItem[]; emptyText: string; medals?: boolean; rank?: boolean }> = ({ items, emptyText, medals = false, rank = false }) => {
  const [ref, seen] = useInView<HTMLUListElement>();
  const colorOf = useToneColor();

  const leader = Math.max(...items.map((item) => item.value), 1);

  if (items.length === 0) {
    return (
      <Typography data-testid="statistics-plain-ring-list-empty" color="text.secondary">
        {emptyText}
      </Typography>
    );
  }

  return (
    <Box ref={ref} component="ul" data-testid="statistics-plain-ring-list" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 1 }}>
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
              alignItems: 'center',
              gap: 1.5,
              p: 1,
              borderRadius: 3,
              bgcolor: alpha(color, 0.07),
              transition: `transform 200ms ${EASE}, background-color 200ms`,
              animation: `${fadeUp} 480ms ${EASE} ${index * STAGGER_MS}ms both`,
              '&:hover': { transform: 'translateX(4px)', bgcolor: alpha(color, 0.13) },
              '@media (prefers-reduced-motion: reduce)': { animation: 'none', transition: 'none' },
            }}
          >
            <Box sx={{ position: 'relative' }}>
              <Ring percent={rank ? (item.value / leader) * 100 : item.value} color={color} size={52} center={rank ? `${index + 1}º` : item.display.length <= 5 ? item.display : '—'} active={seen} delayMs={index * STAGGER_MS} />
              {medals && index < 3 && (
                <Box
                  aria-hidden
                  sx={{ position: 'absolute', top: -6, left: -6, width: 20, height: 20, borderRadius: '50%', bgcolor: MEDALS[index], color: '#fff', fontSize: 11, fontWeight: 900, display: 'grid', placeItems: 'center', boxShadow: 1 }}
                >
                  {index + 1}
                </Box>
              )}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={800} sx={{ overflowWrap: 'anywhere' }}>
                {item.label}
              </Typography>
              {(rank || item.display.length > 5) && (
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block' }}>
                  {item.display}
                </Typography>
              )}
              {item.caption && (
                <Typography variant="caption" color="text.secondary">
                  {item.caption}
                </Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
