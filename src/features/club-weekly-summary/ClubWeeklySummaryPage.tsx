import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { CalendarMonth } from '@mui/icons-material';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@/config/queryClient';
import { extractErrorMessage } from '@/utils/apiError';

import {
  ClubBreakdownList,
  CoverageTimelineChart,
  RangeNavigator,
  RangeStats,
  SummaryFilters,
  WeekStatusLegend,
  WeeksHeatStrip,
} from './components';
import { ALL_CLUBS_OPTION, PAGE_WIDTH } from './constants';
import { useClubWeeklySummary } from './hooks';
import { RangeGranularity } from './types';
import {
  aggregateByClub,
  buildRanges,
  buildSummaryQuery,
  currentRangeIndex,
  keepClubs,
  onlyActiveClubs,
  rangeTotals,
  visibleWeeks,
} from './utils';

/**
 * O resumo semanal dos clubinhos de quem está logado.
 *
 * É a tela que o e-mail de segunda-feira abre. A leitura acontece **um período
 * por vez**: a semana em curso ao abrir, e daí navegando para trás — ou
 * trocando para mês, trimestre e ano quando a pergunta é outra. A faixa no
 * rodapé é o mapa do ano inteiro e serve de atalho.
 *
 * O que aparece é sempre o recorte do back; a tela não decide quem vê o quê.
 */
function ClubWeeklySummaryContent() {
  const theme = useTheme();

  const [year, setYear] = useState<number | null>(null);
  const [clubId, setClubId] = useState<string>(ALL_CLUBS_OPTION);
  const [showFutureWeeks, setShowFutureWeeks] = useState(false);
  const [showInactiveClubs, setShowInactiveClubs] = useState(false);
  const [granularity, setGranularity] = useState<RangeGranularity>(
    RangeGranularity.Week,
  );
  const [rangeIndex, setRangeIndex] = useState<number | null>(null);

  const query = useMemo(() => buildSummaryQuery(year, clubId), [year, clubId]);
  const { data, isPending, isFetching, isError, error, refetch } =
    useClubWeeklySummary(query);

  /**
   * Os clubinhos que o quadro desenha. Os desativados ficam de fora por
   * padrão: eles nunca mudam de situação, e numa base com muitos deles cada
   * período viraria uma lista de "Desativado".
   */
  const clubs = useMemo(
    () => (showInactiveClubs ? (data?.clubs ?? []) : onlyActiveClubs(data?.clubs ?? [])),
    [data?.clubs, showInactiveClubs],
  );
  const inactiveClubCount =
    (data?.clubs.length ?? 0) - onlyActiveClubs(data?.clubs ?? []).length;

  const weeks = useMemo(
    () => keepClubs(visibleWeeks(data?.weeks ?? [], showFutureWeeks), clubs),
    [data?.weeks, showFutureWeeks, clubs],
  );

  const ranges = useMemo(
    () => buildRanges(weeks, granularity, data?.year ?? new Date().getFullYear()),
    [weeks, granularity, data?.year],
  );
  const currentIndex = useMemo(
    () => currentRangeIndex(ranges, data?.currentWeek ?? null),
    [ranges, data?.currentWeek],
  );

  // A tela abre no agora. Trocar de visão, de ano, de clubinho ou revelar as
  // semanas futuras refaz a lista de recortes: manter o índice antigo cairia
  // num período que já não é o mesmo — ou que nem existe mais.
  useEffect(() => setRangeIndex(null), [granularity, data?.year, clubId, showFutureWeeks]);

  const index = Math.min(rangeIndex ?? currentIndex, Math.max(0, ranges.length - 1));
  const range = ranges[index] ?? null;
  const rangeWeeks = useMemo(() => range?.weeks ?? [], [range]);
  const totals = useMemo(() => rangeTotals(rangeWeeks), [rangeWeeks]);
  const clubSummaries = useMemo(
    () => aggregateByClub(rangeWeeks, clubs),
    [rangeWeeks, clubs],
  );
  const highlightWeeks = useMemo(
    () => rangeWeeks.map((week) => week.week),
    [rangeWeeks],
  );

  /** Salta da faixa do ano para o recorte que contém aquela semana. */
  const selectWeek = (week: number) => {
    const target = ranges.findIndex((item) =>
      item.weeks.some((candidate) => candidate.week === week),
    );
    if (target >= 0) setRangeIndex(target);
  };

  const hasContent = clubs.length > 0 && data?.period && weeks.length > 0;

  return (
    <Box
      data-testid="club-weekly-summary-page"
      sx={{
        width: PAGE_WIDTH,
        mx: 'auto',
        py: { xs: 2, sm: 3 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.background.paper, 0)} 60%)`,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              flexShrink: 0,
              borderRadius: 2.5,
              color: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
            }}
          >
            <CalendarMonth />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ fontSize: { xs: '1.15rem', sm: '1.5rem' } }}
              >
                Resumo dos clubinhos
              </Typography>
              {data?.currentWeek !== null && data?.currentWeek !== undefined && (
                <Chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  label={`Semana ${data.currentWeek} em curso`}
                />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Como está a semana, o mês, o trimestre e o ano nos seus clubinhos.
            </Typography>
          </Box>
        </Stack>

        <SummaryFilters
          years={data?.availableYears ?? []}
          year={year ?? data?.year ?? null}
          onYearChange={setYear}
          clubs={data?.clubs ?? []}
          clubId={clubId}
          onClubChange={setClubId}
          showFutureWeeks={showFutureWeeks}
          onShowFutureWeeksChange={setShowFutureWeeks}
          inactiveClubCount={inactiveClubCount}
          showInactiveClubs={showInactiveClubs}
          onShowInactiveClubsChange={setShowInactiveClubs}
          onRefresh={() => void refetch()}
          isRefreshing={isFetching}
        />
      </Paper>

      {isPending && (
        <Stack data-testid="club-weekly-summary-loading" spacing={2}>
          <Skeleton variant="rounded" height={72} />
          <Skeleton variant="rounded" height={148} />
          <Skeleton variant="rounded" height={220} />
        </Stack>
      )}

      {isError && (
        <Alert
          data-testid="club-weekly-summary-error"
          severity="error"
          action={
            <Button type="button" color="inherit" size="small" onClick={() => void refetch()}>
              Tentar de novo
            </Button>
          }
        >
          <AlertTitle>Não foi possível carregar o resumo</AlertTitle>
          {extractErrorMessage(error, 'Tente novamente em instantes.')}
        </Alert>
      )}

      {data && !isError && (
        <Stack spacing={{ xs: 2, sm: 2.5 }}>
          {data.clubs.length === 0 && (
            <Alert data-testid="club-weekly-summary-no-clubs" severity="info">
              <AlertTitle>Nenhum clubinho vinculado</AlertTitle>
              Assim que um clubinho estiver sob a sua coordenação, o resumo dele
              aparece aqui.
            </Alert>
          )}

          {data.clubs.length > 0 && clubs.length === 0 && (
            <Alert data-testid="club-weekly-summary-only-inactive" severity="info">
              <AlertTitle>Todos os seus clubinhos estão desativados</AlertTitle>
              Ligue “Incluir desativado(s)” acima para ver o histórico deles.
            </Alert>
          )}

          {clubs.length > 0 && !data.period && (
            <Alert data-testid="club-weekly-summary-no-period" severity="info">
              <AlertTitle>Ano letivo {data.year} sem período cadastrado</AlertTitle>
              O calendário do ano ainda não foi definido, então não há semanas a
              mostrar. Escolha outro ano ou fale com a coordenação.
            </Alert>
          )}

          {clubs.length > 0 && data.period && weeks.length === 0 && (
            <Alert data-testid="club-weekly-summary-no-weeks" severity="info">
              <AlertTitle>Nenhuma semana encerrada ainda</AlertTitle>
              O ano letivo começou agora. Ligue “Mostrar semanas futuras” para ver o
              calendário completo.
            </Alert>
          )}

          {hasContent && (
            <>
              <RangeNavigator
                granularity={granularity}
                onGranularityChange={setGranularity}
                range={range}
                index={index}
                total={ranges.length}
                onIndexChange={setRangeIndex}
                currentIndex={currentIndex}
              />

              <RangeStats totals={totals} weekCount={rangeWeeks.length} />

              <Stack spacing={1.25}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Por clubinho
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {range?.label} — {clubs.length} clubinho(s) no recorte.
                  </Typography>
                </Box>
                {rangeWeeks.length === 1 && <WeekStatusLegend />}
                <ClubBreakdownList
                  clubs={clubSummaries}
                  singleWeek={rangeWeeks.length === 1}
                />
              </Stack>

              <CoverageTimelineChart
                weeks={weeks}
                currentWeek={data.currentWeek}
                highlightWeeks={highlightWeeks}
              />

              <WeeksHeatStrip
                weeks={weeks}
                selectedWeeks={highlightWeeks}
                onSelectWeek={selectWeek}
              />
            </>
          )}
        </Stack>
      )}
    </Box>
  );
}

/** A rota do resumo semanal, com o cache compartilhado do painel. */
export default function ClubWeeklySummaryPage() {
  return (
    <QueryClientProvider data-testid="club-weekly-summary" client={queryClient}>
      <ClubWeeklySummaryContent />
    </QueryClientProvider>
  );
}
