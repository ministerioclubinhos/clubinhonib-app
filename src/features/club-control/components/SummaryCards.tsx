import React from 'react';
import { Box, LinearProgress, Stack, Typography, useTheme } from '@mui/material';
import {
  CheckCircle,
  Warning,
  Cancel,
  HourglassEmpty,
  EventAvailable,
  Groups,
  Block,
} from '@mui/icons-material';
import type { WeekCheckResult } from '../types';

interface SummaryCardsProps {
  summary: WeekCheckResult['summary'];
  overallCompleteness: number;
  childrenWithPagela: number;
  totalChildren: number;
}

type TileTone = 'success' | 'info' | 'warning' | 'error' | 'neutral';

interface TileProps {
  testId: string;
  tone: TileTone;
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
  hint?: string;
}

const COMPLETE_GOOD = 80;
const COMPLETE_MEDIUM = 50;

/** Um número grande com cor que diz se está bem (verde), pede cuidado (amarelo) ou está grave (vermelho). */
const Tile: React.FC<TileProps> = ({ testId, tone, icon, value, label, hint }) => {
  const theme = useTheme();
  const color = tone === 'neutral' ? theme.palette.grey[600] : theme.palette[tone].main;

  return (
    <Box
      data-testid={testId}
      data-tone={tone}
      sx={{
        borderRadius: 2.5,
        border: `1px solid ${color}55`,
        borderLeft: `5px solid ${color}`,
        bgcolor: `${color}14`,
        px: 1.5,
        py: 1,
        minWidth: 0,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box sx={{ display: 'flex', color, '& svg': { fontSize: 26 } }}>{icon}</Box>
        <Typography data-testid={`${testId}-value`} sx={{ color, fontWeight: 900, fontSize: '1.75rem', lineHeight: 1 }}>
          {value}
        </Typography>
      </Stack>
      <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5, lineHeight: 1.2 }}>
        {label}
      </Typography>
      {hint && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2 }}>
          {hint}
        </Typography>
      )}
    </Box>
  );
};

/**
 * Os números da semana, no celular primeiro: duas colunas, cada número com a
 * cor do que significa. Só aparecem os grupos que têm algum clubinho, para não
 * gastar tela com zeros que não dizem nada.
 */
export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  overallCompleteness,
  childrenWithPagela,
  totalChildren,
}) => {
  const theme = useTheme();
  const percent = Math.round(overallCompleteness);
  const completeColor =
    overallCompleteness >= COMPLETE_GOOD
      ? theme.palette.success.main
      : overallCompleteness >= COMPLETE_MEDIUM
        ? theme.palette.warning.main
        : theme.palette.error.main;
  const okPercent = summary.totalClubs > 0 ? Math.round((summary.clubsOk / summary.totalClubs) * 100) : 0;

  return (
    <Box data-testid="club-control-summary-cards" sx={{ mb: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: 'grid',
          gap: 1,
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
        }}
      >
        <Tile
          testId="club-control-summary-ok"
          tone="success"
          icon={<CheckCircle />}
          value={summary.clubsOk}
          label="Completos"
          hint={`${okPercent}% de ${summary.totalClubs} clubinhos`}
        />
        <Tile
          testId="club-control-summary-missing"
          tone={summary.clubsMissing > 0 ? 'error' : 'success'}
          icon={<Cancel />}
          value={summary.clubsMissing}
          label="Faltando"
          hint="nenhuma pagela lançada"
        />
        <Tile
          testId="club-control-summary-partial"
          tone={summary.clubsPartial > 0 ? 'warning' : 'success'}
          icon={<Warning />}
          value={summary.clubsPartial}
          label="Parciais"
          hint="algumas crianças sem pagela"
        />
        {summary.clubsPending !== undefined && summary.clubsPending > 0 && (
          <Tile
            testId="club-control-summary-pending"
            tone="info"
            icon={<HourglassEmpty />}
            value={summary.clubsPending}
            label="Pendentes"
            hint="ainda dentro do prazo"
          />
        )}
        {summary.clubsInactive > 0 && (
          <Tile
            testId="club-control-summary-inactive"
            tone="neutral"
            icon={<Block />}
            value={summary.clubsInactive}
            label="Inativos"
            hint="sem dia da semana"
          />
        )}
        {summary.clubsOutOfPeriod > 0 && (
          <Tile
            testId="club-control-summary-out-of-period"
            tone="info"
            icon={<EventAvailable />}
            value={summary.clubsOutOfPeriod}
            label="Fora do período"
            hint="semana sem aula"
          />
        )}
      </Box>

      <Box
        data-testid="club-control-summary-completeness"
        sx={{
          mt: 1,
          borderRadius: 2.5,
          border: `1px solid ${completeColor}55`,
          bgcolor: `${completeColor}14`,
          px: 1.5,
          py: 1,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Groups sx={{ color: completeColor }} />
            <Typography variant="body2" fontWeight={700}>
              Pagelas da semana
            </Typography>
          </Stack>
          <Typography sx={{ color: completeColor, fontWeight: 900, fontSize: '1.25rem' }}>
            {percent}%
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, overallCompleteness)}
          sx={{
            my: 0.75,
            height: 8,
            borderRadius: 4,
            bgcolor: `${completeColor}25`,
            '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: completeColor },
          }}
        />
        <Typography variant="caption" color="text.secondary">
          {childrenWithPagela} de {totalChildren} crianças já têm pagela
        </Typography>
      </Box>
    </Box>
  );
};
