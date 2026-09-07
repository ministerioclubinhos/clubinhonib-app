import {
  Box,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';

import { fmtBR, weekdayLabel } from '@/utils/dateUtils';

import type { ClubRangeSummary } from '../types';
import {
  formatCount,
  formatRate,
  weekStatusDescription,
  weekStatusLabel,
} from '../utils';
import { STATUS_ICONS, statusColor } from './statusVisuals';

interface ClubBreakdownListProps {
  clubs: ClubRangeSummary[];
  /** `true` quando o recorte é de uma semana só: aí há situação a mostrar. */
  singleWeek: boolean;
}

/**
 * Um clubinho por cartão, dentro do recorte escolhido.
 *
 * Desenhado para o celular primeiro: nome e situação dividem a primeira linha,
 * a barra ocupa a largura toda e o detalhe fica no rodapé do cartão. No
 * desktop as mesmas três partes viram colunas, sem trocar de componente.
 */
export function ClubBreakdownList({ clubs, singleWeek }: ClubBreakdownListProps) {
  const theme = useTheme();

  if (clubs.length === 0) return null;

  return (
    <Stack data-testid="club-weekly-summary-club-breakdown" spacing={1.25}>
      {clubs.map((club) => {
        const color = club.status
          ? statusColor(theme, club.status)
          : club.weeksWithPendency > 0
            ? theme.palette.warning.main
            : theme.palette.success.main;

        const detail =
          singleWeek && club.status
            ? club.exceptionReason ?? weekStatusDescription(club.status)
            : club.weeksWithPendency > 0
              ? `${formatCount(club.weeksWithPendency)} semana(s) devendo pagela`
              : 'nenhuma semana devendo pagela';

        const footnote =
          singleWeek && club.expectedDate
            ? `Encontro em ${fmtBR(club.expectedDate)}`
            : `${formatCount(club.meetings)} encontro(s) · ${formatCount(club.counts.childrenPresent)} presença(s)`;

        return (
          <Paper
            key={club.clubId}
            data-testid={`club-weekly-summary-club-${club.clubId}`}
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              borderLeftWidth: 4,
              borderLeftColor: color,
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={{ xs: 1, md: 2.5 }}
              alignItems={{ xs: 'stretch', md: 'center' }}
            >
              {/* Identidade e situação: uma linha só, mesmo no celular. */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ minWidth: { md: 210 } }}
              >
                <Box sx={{ display: 'flex', fontSize: 22, color, flexShrink: 0 }}>
                  {club.status ? STATUS_ICONS[club.status] : null}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={700} noWrap>
                    Clubinho {club.clubNumber}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {weekdayLabel(club.weekday)}
                    {!club.isActive && ' · desativado'}
                  </Typography>
                </Box>
                {singleWeek && club.status && (
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ color, textAlign: 'right', flexShrink: 0 }}
                  >
                    {weekStatusLabel(club.status)}
                  </Typography>
                )}
              </Stack>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack
                  direction="row"
                  alignItems="baseline"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                    {formatRate(club.counts.completionRate)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatCount(club.counts.childrenWithPagela)} de{' '}
                    {formatCount(club.counts.children)} pagelas
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, Math.max(0, club.counts.completionRate))}
                  aria-label={`Cobertura do clubinho ${club.clubNumber}`}
                  sx={{
                    mt: 0.75,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.text.disabled, 0.2),
                    '& .MuiLinearProgress-bar': { bgcolor: color },
                  }}
                />
              </Box>

              <Box sx={{ minWidth: { md: 200 } }}>
                <Typography
                  variant="caption"
                  color={
                    !singleWeek && club.weeksWithPendency > 0
                      ? 'warning.main'
                      : 'text.secondary'
                  }
                  sx={{ display: 'block', lineHeight: 1.45 }}
                >
                  {detail}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {footnote}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
}
