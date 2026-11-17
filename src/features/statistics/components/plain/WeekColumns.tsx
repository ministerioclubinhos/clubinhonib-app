import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { WeekColumn } from '../../utils/plain';
import { EASE, MOTION_MS, STAGGER_MS, useInView } from './motion';

interface WeekColumnsProps {
  columns: WeekColumn[];
  emptyText: string;
}

const CHART_HEIGHT = 150;

/**
 * Colunas verticais, uma por semana, com o número de crianças escrito em cima.
 *
 * As colunas sobem quando o gráfico aparece, a semana mais recente ganha
 * destaque e uma linha pontilhada mostra a média — dá para ver de relance se a
 * semana ficou acima ou abaixo do normal.
 */
export const WeekColumns: React.FC<WeekColumnsProps> = ({ columns, emptyText }) => {
  const theme = useTheme();
  const [ref, seen] = useInView<HTMLDivElement>();

  if (columns.length === 0) {
    return (
      <Typography data-testid="statistics-plain-week-columns-empty" color="text.secondary">
        {emptyText}
      </Typography>
    );
  }

  const top = Math.max(...columns.map((column) => column.value), 1);
  const average = columns.reduce((sum, column) => sum + column.value, 0) / columns.length;
  const averageBottom = (average / top) * CHART_HEIGHT;
  const last = columns[columns.length - 1];

  return (
    <Box ref={ref} data-testid="statistics-plain-week-chart" sx={{ position: 'relative' }}>
      <Box
        data-testid="statistics-plain-week-columns"
        role="list"
        sx={{ display: 'flex', alignItems: 'flex-end', gap: { xs: 0.5, md: 1 }, height: CHART_HEIGHT + 44, position: 'relative' }}
      >
        <Box
          aria-hidden
          data-testid="statistics-plain-week-columns-average"
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: averageBottom + 22,
            borderTop: `2px dashed ${alpha(theme.palette.text.secondary, 0.45)}`,
            pointerEvents: 'none',
          }}
        >
          <Typography
            variant="caption"
            sx={{ position: 'absolute', right: 0, top: -20, color: 'text.secondary', bgcolor: 'background.paper', px: 0.5, borderRadius: 1 }}
          >
            média {Math.round(average)}
          </Typography>
        </Box>

        {columns.map((column, index) => {
          const isLast = column === last;
          const color = isLast ? theme.palette.primary.main : theme.palette.info.main;
          const height = Math.max(6, (column.value / top) * CHART_HEIGHT);

          return (
            <Box
              key={column.key}
              role="listitem"
              aria-label={`Semana ${column.label.slice(1)}: ${column.value} crianças`}
              sx={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                '&:hover .week-col': { filter: 'brightness(1.1)', transform: 'scaleX(1.08)' },
                '&:hover .week-value': { transform: 'translateY(-2px) scale(1.15)' },
              }}
            >
              <Typography
                className="week-value"
                variant="caption"
                fontWeight={isLast ? 900 : 800}
                sx={{
                  color: isLast ? 'primary.main' : 'text.primary',
                  opacity: seen ? 1 : 0,
                  transition: `opacity 400ms ${EASE} ${index * STAGGER_MS + 300}ms, transform 200ms ${EASE}`,
                }}
              >
                {column.value}
              </Typography>
              <Box
                className="week-col"
                sx={{
                  width: '100%',
                  maxWidth: 38,
                  height: seen ? height : 4,
                  borderRadius: '8px 8px 2px 2px',
                  backgroundImage: `linear-gradient(180deg, ${color} 0%, ${alpha(color, 0.55)} 100%)`,
                  boxShadow: isLast ? `0 0 14px ${alpha(color, 0.55)}` : 'none',
                  transformOrigin: 'bottom',
                  transition: `height ${MOTION_MS}ms ${EASE} ${index * STAGGER_MS}ms, transform 200ms ${EASE}, filter 200ms`,
                  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                }}
              />
              <Typography variant="caption" color={isLast ? 'primary.main' : 'text.secondary'} fontWeight={isLast ? 800 : 400} sx={{ mt: 0.5 }}>
                {column.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
