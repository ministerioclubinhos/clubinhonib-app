import React from 'react';
import { ButtonBase, Typography, alpha, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Box } from '@mui/material';

import { StudioHubMetric } from '../../types';

interface Metric {
  key: StudioHubMetric;
  label: string;
  value: number;
  href: string;
  color: string;
}

interface Props {
  metrics: Metric[];
}

/**
 * The counters, each one a link to the listing it counts.
 *
 * "Ajustes solicitados" only stands out when there is something to fix; a zero
 * there is good news and stays quiet.
 */
export const HubMetrics: React.FC<Props> = ({ metrics }) => {
  const theme = useTheme();
  const paletteOf = (color: string) =>
    (theme.palette as unknown as Record<string, { main: string; dark: string }>)[color] ??
    theme.palette.primary;

  return (
    <Box
      component="nav"
      aria-label="Lições por situação"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(5, minmax(0, 1fr))' },
        gap: 1.25,
        mb: 2,
        // Com cinco cartões em duas colunas o último ficaria sozinho: ele ocupa a linha.
        '& > :last-child:nth-of-type(odd)': { gridColumn: { xs: '1 / -1', md: 'auto' } },
      }}
    >
      {metrics.map((metric) => {
        const palette = paletteOf(metric.color);
        const urgent = metric.key === StudioHubMetric.CHANGES && metric.value > 0;
        return (
          <ButtonBase
            key={metric.key}
            component={RouterLink}
            to={metric.href}
            data-testid={`ai-lessons-hub-metric-${metric.key}`}
            aria-label={`${metric.label}: ${metric.value}. Abrir a lista.`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              p: 1.5,
              minHeight: 64,
              minWidth: 0,
              textAlign: 'left',
              borderRadius: 3,
              border: '1px solid',
              borderColor: urgent ? palette.main : 'divider',
              bgcolor: urgent ? alpha(palette.main, 0.08) : 'background.paper',
              transition: 'border-color .15s ease, box-shadow .15s ease',
              '&:hover, &:focus-visible': {
                borderColor: palette.main,
                boxShadow: `0 4px 14px ${alpha(palette.main, 0.18)}`,
              },
            }}
          >
            <Typography
              variant="body2"
              fontWeight={600}
              color="text.secondary"
              sx={{ minWidth: 0, lineHeight: 1.25 }}
            >
              {metric.label}
            </Typography>
            <Typography
              component="span"
              fontWeight={800}
              sx={{ fontSize: '1.6rem', lineHeight: 1, color: palette.dark ?? palette.main }}
            >
              {metric.value}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
};
