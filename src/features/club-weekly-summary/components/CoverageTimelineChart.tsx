import { Box, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { COVERAGE_CHART_HEIGHT } from '../constants';
import type { ClubWeeklySummaryWeek, WeekCoveragePoint } from '../types';
import {
  buildCoverageSeries,
  formatRate,
  weekRangeLabel,
  weekShortLabel,
} from '../utils';

interface CoverageTimelineChartProps {
  /** Todas as semanas visíveis do ano; a linha sempre mostra o ano inteiro. */
  weeks: ClubWeeklySummaryWeek[];
  currentWeek: number | null;
  /** As semanas do recorte escolhido, realçadas sobre a linha. */
  highlightWeeks: number[];
}

/** O que o gráfico entrega ao tooltip, já no formato desta série. */
interface CoverageTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: WeekCoveragePoint }>;
}

/**
 * O tooltip da linha do tempo.
 *
 * Traz o intervalo da semana junto do percentual: "S12" sozinho não diz a
 * ninguém de que dias se está falando.
 */
function CoverageTooltip({
  active,
  payload,
  weeks,
}: CoverageTooltipProps & { weeks: ClubWeeklySummaryWeek[] }) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;

  const week = weeks.find((item) => item.week === point.week);

  return (
    <Paper
      data-testid="club-weekly-summary-chart-tooltip"
      elevation={3}
      sx={{ px: 1.5, py: 1, borderRadius: 2 }}
    >
      <Typography variant="subtitle2" fontWeight={700}>
        Semana {point.week}
      </Typography>
      {week && (
        <Typography variant="caption" color="text.secondary" display="block">
          {weekRangeLabel(week)}
        </Typography>
      )}
      <Typography variant="body2" sx={{ mt: 0.5 }}>
        {formatRate(point.completionRate)} das pagelas lançadas
      </Typography>
      {week && (
        <Typography variant="caption" color="text.secondary">
          {week.counts.childrenWithPagela} de {week.counts.children} crianças
        </Typography>
      )}
    </Paper>
  );
}

/**
 * A cobertura semana a semana.
 *
 * Uma medida só, num eixo só: percentual de pagelas lançadas. Quantidade de
 * crianças tem escala diferente e vive no quadro abaixo — dois eixos no mesmo
 * gráfico só produzem comparações que não existem.
 */
export function CoverageTimelineChart({
  weeks,
  currentWeek,
  highlightWeeks,
}: CoverageTimelineChartProps) {
  const theme = useTheme();
  // No celular o eixo Y come 13% da largura útil: menos marcas, rótulo mais
  // curto e a área de desenho sobra para a linha, que é o que se vem ver.
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const series = buildCoverageSeries(weeks);
  const first = highlightWeeks[0];
  const last = highlightWeeks[highlightWeeks.length - 1];

  if (series.length === 0) {
    return (
      <Paper
        data-testid="club-weekly-summary-chart-empty"
        elevation={0}
        sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}
      >
        <Typography variant="body2" color="text.secondary">
          Ainda não há semana encerrada para desenhar a linha do tempo.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      data-testid="club-weekly-summary-chart"
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack sx={{ mb: 1 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Cobertura de pagelas por semana
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Percentual das crianças com pagela lançada em cada semana letiva. O
          trecho realçado é o período escolhido acima.
        </Typography>
      </Stack>

      <Box sx={{ height: COVERAGE_CHART_HEIGHT, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={series}
            margin={{ top: 8, right: 8, bottom: 0, left: isMobile ? -14 : -20 }}
          >
            <defs>
              <linearGradient id="coverageFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={theme.palette.primary.main}
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor={theme.palette.primary.main}
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={theme.palette.divider}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: isMobile ? 10 : 11, fill: theme.palette.text.secondary }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={isMobile ? 24 : 12}
            />
            <YAxis
              domain={[0, 100]}
              ticks={isMobile ? [0, 50, 100] : [0, 25, 50, 75, 100]}
              tickFormatter={(value: number) => `${value}%`}
              tick={{ fontSize: isMobile ? 10 : 11, fill: theme.palette.text.secondary }}
              tickLine={false}
              axisLine={false}
              width={isMobile ? 34 : 48}
            />
            {first !== undefined && last !== undefined && (
              <ReferenceArea
                x1={weekShortLabel(first)}
                x2={weekShortLabel(last)}
                fill={theme.palette.primary.main}
                fillOpacity={0.1}
                stroke={theme.palette.primary.main}
                strokeOpacity={0.3}
              />
            )}
            <Tooltip
              cursor={{ stroke: theme.palette.text.disabled, strokeWidth: 1 }}
              content={<CoverageTooltip weeks={weeks} />}
            />
            {currentWeek !== null && (
              <ReferenceLine
                x={weekShortLabel(currentWeek)}
                stroke={theme.palette.text.disabled}
                strokeDasharray="4 4"
                label={{
                  value: 'hoje',
                  position: 'top',
                  fontSize: 11,
                  fill: theme.palette.text.secondary,
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="completionRate"
              name="Cobertura"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              fill="url(#coverageFill)"
              dot={false}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
