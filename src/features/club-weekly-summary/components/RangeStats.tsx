import type { ReactElement } from 'react';
import {
  Box,
  Grid2,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  EventAvailable,
  EventBusy,
  HowToReg,
  PendingActions,
  TrendingUp,
} from '@mui/icons-material';

import type { RangeTotals } from '../types';
import { formatCount, formatRate } from '../utils';

interface StatCardProps {
  testId: string;
  icon: ReactElement;
  color: string;
  value: string;
  title: string;
  caption: string;
  progress?: number;
}

/** Um número do recorte, com o que ele significa logo abaixo. */
function StatCard({
  testId,
  icon,
  color,
  value,
  title,
  caption,
  progress,
}: StatCardProps) {
  const theme = useTheme();

  return (
    <Paper
      data-testid={testId}
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 1.5, sm: 2 },
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 30,
            height: 30,
            borderRadius: 2,
            color,
            bgcolor: alpha(color, 0.12),
          }}
        >
          {icon}
        </Box>
        <Typography variant="body2" fontWeight={600} color="text.secondary">
          {title}
        </Typography>
      </Stack>

      <Typography
        variant="h4"
        fontWeight={700}
        sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, lineHeight: 1.1 }}
      >
        {value}
      </Typography>

      <Box sx={{ height: 6, mt: 1, mb: 0.75 }}>
        {progress !== undefined && (
          <LinearProgress
            variant="determinate"
            value={Math.min(100, Math.max(0, progress))}
            aria-label={`${title}: ${value}`}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: alpha(color, 0.14),
              '& .MuiLinearProgress-bar': { bgcolor: color },
            }}
          />
        )}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto', lineHeight: 1.45 }}>
        {caption}
      </Typography>
    </Paper>
  );
}

interface RangeStatsProps {
  totals: RangeTotals;
  /** Quantas semanas o recorte cobre; muda o texto de apoio. */
  weekCount: number;
}

/**
 * Larguras dos cinco cartões.
 *
 * No celular a cobertura ocupa a linha inteira — é o número que responde à
 * pergunta — e os outros quatro vêm dois a dois. Cinco cartões meia-largura
 * deixariam o último sozinho numa linha.
 */
const HERO_SIZE = { xs: 12, sm: 6, md: 2.4 } as const;
const CARD_SIZE = { xs: 6, sm: 6, md: 2.4 } as const;

/**
 * Os números do recorte escolhido.
 *
 * São cinco porque são cinco as perguntas de quem coordena: quanto foi
 * lançado, quanto falta, quantas crianças de fato vieram, quantos encontros
 * houve e quantas semanas ficaram devendo.
 */
export function RangeStats({ totals, weekCount }: RangeStatsProps) {
  const theme = useTheme();
  const semPendencia = totals.weeksWithPendency === 0;

  return (
    <Grid2 data-testid="club-weekly-summary-range-stats" container spacing={{ xs: 1.25, sm: 2 }}>
      <Grid2 size={HERO_SIZE}>
        <StatCard
          testId="club-weekly-summary-stat-coverage"
          icon={<TrendingUp fontSize="small" />}
          color={theme.palette.primary.main}
          value={formatRate(totals.counts.completionRate)}
          title="Cobertura"
          caption={`${formatCount(totals.counts.childrenWithPagela)} de ${formatCount(totals.counts.children)} pagelas lançadas`}
          progress={totals.counts.completionRate}
        />
      </Grid2>

      <Grid2 size={CARD_SIZE}>
        <StatCard
          testId="club-weekly-summary-stat-missing"
          icon={<PendingActions fontSize="small" />}
          color={
            totals.counts.childrenMissing > 0
              ? theme.palette.warning.main
              : theme.palette.success.main
          }
          value={formatCount(totals.counts.childrenMissing)}
          title="Pagelas faltando"
          caption={
            totals.counts.childrenMissing > 0
              ? 'lançamentos que ainda não foram feitos no período'
              : 'nada em aberto neste período'
          }
        />
      </Grid2>

      <Grid2 size={CARD_SIZE}>
        <StatCard
          testId="club-weekly-summary-stat-presence"
          icon={<HowToReg fontSize="small" />}
          color={theme.palette.info.main}
          value={formatRate(totals.presenceRate)}
          title="Presença"
          caption={`${formatCount(totals.counts.childrenPresent)} presentes entre as pagelas lançadas`}
          progress={totals.presenceRate}
        />
      </Grid2>

      <Grid2 size={CARD_SIZE}>
        <StatCard
          testId="club-weekly-summary-stat-meetings"
          icon={<EventAvailable fontSize="small" />}
          color={theme.palette.text.secondary}
          value={formatCount(totals.meetings)}
          title="Encontros"
          caption={
            totals.exceptions > 0
              ? `${formatCount(totals.exceptions)} dia(s) sem Clubinho no período`
              : `previstos em ${formatCount(weekCount)} semana(s)`
          }
        />
      </Grid2>

      <Grid2 size={CARD_SIZE}>
        <StatCard
          testId="club-weekly-summary-stat-pendency"
          icon={<EventBusy fontSize="small" />}
          color={semPendencia ? theme.palette.success.main : theme.palette.warning.main}
          value={formatCount(totals.weeksWithPendency)}
          title="Semanas com pendência"
          caption={
            semPendencia
              ? 'nenhuma semana ficou devendo pagela'
              : totals.worstWeek !== null
                ? `a mais difícil foi a semana ${totals.worstWeek}`
                : 'semanas em que algum clubinho ficou devendo'
          }
        />
      </Grid2>
    </Grid2>
  );
}
