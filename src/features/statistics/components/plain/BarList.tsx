import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { RateTone } from '../../constants';
import { EASE, MOTION_MS, STAGGER_MS, shimmer, useInView } from './motion';

export interface BarItem {
  key: string;
  label: string;
  /** Quanto vale a barra (define o comprimento). */
  value: number;
  /** O que aparece escrito à direita: "84%", "12 crianças"… */
  display: string;
  tone?: RateTone;
  /** Uma linha pequena abaixo do nome. */
  caption?: string;
}

interface BarListProps {
  items: BarItem[];
  /** Valor que enche a barra por inteiro; por padrão, o maior da lista. */
  max?: number;
  emptyText: string;
}

/**
 * Lista de barras horizontais.
 *
 * Substitui os gráficos de pizza, radar e funil: o nome fica ao lado da barra e
 * o valor escrito no fim — ninguém precisa decifrar legenda ou eixo. As barras
 * crescem quando entram na tela, com um brilho que passa por cima.
 */
export const BarList: React.FC<BarListProps> = ({ items, max, emptyText }) => {
  const theme = useTheme();
  const [ref, seen] = useInView<HTMLUListElement>();
  const toneColor: Record<RateTone, string> = {
    [RateTone.Good]: theme.palette.success.main,
    [RateTone.Medium]: theme.palette.warning.main,
    [RateTone.Low]: theme.palette.error.main,
  };

  if (items.length === 0) {
    return (
      <Typography data-testid="statistics-plain-bar-list-empty" color="text.secondary">
        {emptyText}
      </Typography>
    );
  }

  const top = max ?? Math.max(...items.map((item) => item.value), 1);

  return (
    <Box
      ref={ref}
      data-testid="statistics-plain-bar-list"
      component="ul"
      sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 1.75 }}
    >
      {items.map((item, index) => {
        const width = Math.max(0, Math.min(100, (item.value / top) * 100));
        const color = item.tone ? toneColor[item.tone] : theme.palette.primary.main;
        const delay = `${index * STAGGER_MS}ms`;

        return (
          <Box
            component="li"
            key={item.key}
            data-testid="statistics-plain-bar-list-row"
            sx={{
              borderRadius: 2,
              mx: -0.75,
              px: 0.75,
              py: 0.5,
              transition: `background-color 200ms ${EASE}`,
              '&:hover': { bgcolor: alpha(color, 0.07) },
              '&:hover .bar-fill': { filter: 'brightness(1.08)' },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'baseline' }}>
              <Typography variant="body2" fontWeight={700} sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                {item.label}
              </Typography>
              <Typography variant="body2" fontWeight={900} sx={{ flexShrink: 0, color }}>
                {item.display}
              </Typography>
            </Box>
            <Box
              aria-hidden
              sx={{ height: 14, borderRadius: 7, bgcolor: alpha(color, 0.13), overflow: 'hidden', mt: 0.5 }}
            >
              <Box
                className="bar-fill"
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  height: '100%',
                  width: seen ? `${width}%` : 0,
                  minWidth: seen && width > 0 ? 8 : 0,
                  borderRadius: 7,
                  backgroundImage: `linear-gradient(90deg, ${alpha(color, 0.75)} 0%, ${color} 100%)`,
                  boxShadow: `0 0 10px ${alpha(color, 0.45)}`,
                  transition: `width ${MOTION_MS}ms ${EASE} ${delay}, filter 200ms`,
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)',
                    animation: `${shimmer} 2.4s ${EASE} ${delay} 1`,
                  },
                  '@media (prefers-reduced-motion: reduce)': { transition: 'none', '&::after': { animation: 'none' } },
                }}
              />
            </Box>
            {item.caption && (
              <Typography variant="caption" color="text.secondary">
                {item.caption}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
};
