import React from 'react';
import { Box } from '@mui/material';
import dayjs from 'dayjs';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GroupsIcon from '@mui/icons-material/Groups';
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SpaIcon from '@mui/icons-material/Spa';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { StatusBanner } from '../components/plain/StatusBanner';
import { ToneLegend } from '../components/plain/ToneLegend';
import { AttentionList } from '../components/plain/AttentionList';
import { DataState } from '../components/plain/DataState';
import { PersonList } from '../components/plain/PersonList';
import { ProgressLine } from '../components/plain/ProgressLine';
import { Section, SectionGrid } from '../components/plain/Section';
import { StatTile, StatTileGrid } from '../components/plain/StatTile';
import { WeekColumns } from '../components/plain/WeekColumns';
import { MIN_PAGELAS_FOR_RANKING, RANKING_SIZE, StatisticsTab, Tone } from '../constants';
import { useAcceptedChristsStats, useChildren, useOverview, usePagelasStats, usePeriodGrowth } from '../hooks';
import {
  ALERT_TEXTS,
  DECISION_LABELS,
  presencePhrase,
  STATISTICS_TEXTS,
  STATUS_BANNER_TEXTS,
  SUMMARY_TEXTS,
} from '../texts';
import { PeriodShortcut, type AttentionItem, type DecisionType } from '../types';
import { attentionTone, weekDelta } from '../utils/alerts';
import { deltaTone, formatPercent, outOfTen, rateToTone, toWeekColumns } from '../utils/plain';
import { useClubAlerts } from './useClubAlerts';

interface SummaryViewProps {
  period: PeriodShortcut;
  onGoToTab: (tab: StatisticsTab) => void;
}

const RECENT_DECISIONS_SHOWN = 5;

const growthHint = (rate: number | undefined, period: PeriodShortcut): string | undefined => {
  if (rate === undefined || !Number.isFinite(rate)) return undefined;
  const abs = Math.abs(rate).toFixed(1).replace('.', ',').replace(',0', '');
  if (Math.abs(rate) < 0.05) return SUMMARY_TEXTS.growthSame;
  const than = SUMMARY_TEXTS.growthThan(period);
  return rate > 0 ? SUMMARY_TEXTS.growthUp(abs, than) : SUMMARY_TEXTS.growthDown(abs, than);
};

/** O retrato geral: o que pede atenção primeiro, depois os números e as decisões. */
export const SummaryView: React.FC<SummaryViewProps> = ({ period, onGoToTab }) => {
  const overview = useOverview();
  const pagelas = usePagelasStats({ period, groupBy: 'week' });
  const decisions = useAcceptedChristsStats({ period });
  const lowChildren = useChildren({
    period,
    isActive: true,
    minPagelas: MIN_PAGELAS_FOR_RANKING,
    sortBy: 'presenceRate',
    sortOrder: 'ASC',
    limit: RANKING_SIZE,
  });
  const newcomers = useChildren({ period, limit: 1 });
  const weekly = usePeriodGrowth(period);
  const alerts = useClubAlerts({ period, onGoToClubs: () => onGoToTab(StatisticsTab.Clubs) });

  const isLoading = overview.isLoading || pagelas.isLoading || decisions.isLoading || alerts.isLoading;
  const isError = overview.isError || pagelas.isError || decisions.isError || alerts.isError;
  const retry = () => {
    void overview.refetch();
    void pagelas.refetch();
    void decisions.refetch();
    void lowChildren.refetch();
    alerts.refetch();
  };

  const summary = overview.data?.summary;
  const indicators = overview.data?.indicators;
  const overall = pagelas.data?.overall;
  const presenceTen = outOfTen(overall?.averagePresenceRate);
  const meditationTen = outOfTen(overall?.averageMeditationRate);
  const verseTen = outOfTen(overall?.averageVerseRecitationRate);
  const columns = toWeekColumns(pagelas.data?.byWeek);
  const delta = weekDelta(columns);
  const growthRate = weekly.rate;
  const newCount = newcomers.data?.distribution.byParticipationTime.find((row) => row.timeRange === '0-3 meses')?.count ?? 0;

  const attention: AttentionItem[] = [...alerts.items];
  const lowList = lowChildren.data?.children ?? [];
  const lowTotal = indicators?.childrenWithLowEngagement ?? 0;
  if (lowTotal > 0) {
    attention.push({
      key: 'low-children',
      title: ALERT_TEXTS.lowChildren(lowTotal),
      detail: ALERT_TEXTS.lowChildrenDetail,
      names: lowList.map((child) => `${child.name} (${formatPercent(child.stats.presenceRate)})`),
      actionLabel: ALERT_TEXTS.goChildren,
      onAction: () => onGoToTab(StatisticsTab.Children),
    });
  }

  const overallTone = attentionTone(attention);
  const errorCount = attention.filter((item) => item.severity === 'error').length;
  const lastWeek = alerts.previous;
  const thisWeek = alerts.current;
  const previousRange = alerts.weeks.previousQuery.data?.weekRange;
  const rangeText = (range?: { start: string | null; end: string | null }) =>
    range?.start && range.end ? `${dayjs(range.start).format('DD/MM')} a ${dayjs(range.end).format('DD/MM')}` : undefined;

  const decisionRows = (decisions.data?.recentDecisions ?? []).slice(0, RECENT_DECISIONS_SHOWN).map((decision) => ({
    key: decision.id,
    name: decision.childName,
    caption: dayjs(decision.createdAt).format('DD/MM/YYYY'),
    badge: decision.decision ? DECISION_LABELS[decision.decision as DecisionType] : undefined,
  }));

  return (
    <DataState data-testid="statistics-summary-view" isLoading={isLoading} isError={isError} onRetry={retry}>
      <StatTileGrid>
        <StatTile
          testId="statistics-summary-children"
          icon={<GroupsIcon />}
          tone={Tone.Info}
          title={SUMMARY_TEXTS.childrenTitle}
          value={summary?.totalChildren ?? STATISTICS_TEXTS.noValue}
          hint={SUMMARY_TEXTS.childrenHint(summary?.activeChildrenThisMonth ?? 0)}
        />
        <StatTile
          testId="statistics-summary-presence"
          icon={<EventAvailableIcon />}
          tone={rateToTone(overall?.averagePresenceRate)}
          title={SUMMARY_TEXTS.presenceTitle}
          value={formatPercent(overall?.averagePresenceRate) ?? STATISTICS_TEXTS.noValue}
          hint={presenceTen === null ? undefined : presencePhrase(presenceTen)}
        />
        <StatTile
          testId="statistics-summary-decisions"
          icon={<FavoriteIcon />}
          tone={Tone.Success}
          title={SUMMARY_TEXTS.decisionsTitle}
          value={decisions.data?.overall.totalDecisions ?? 0}
          hint={SUMMARY_TEXTS.decisionsHint}
        />
        <StatTile
          testId="statistics-summary-clubs"
          icon={<HomeIcon />}
          tone={Tone.Info}
          title={SUMMARY_TEXTS.clubsTitle}
          value={summary?.totalClubs ?? STATISTICS_TEXTS.noValue}
          hint={SUMMARY_TEXTS.clubsHint}
        />
        <StatTile
          testId="statistics-summary-meditation"
          icon={<SpaIcon />}
          tone={rateToTone(overall?.averageMeditationRate)}
          title={SUMMARY_TEXTS.meditationTitle}
          value={formatPercent(overall?.averageMeditationRate) ?? STATISTICS_TEXTS.noValue}
          hint={meditationTen === null ? undefined : SUMMARY_TEXTS.meditationHint(meditationTen)}
        />
        <StatTile
          testId="statistics-summary-verse"
          icon={<MenuBookIcon />}
          tone={rateToTone(overall?.averageVerseRecitationRate)}
          title={SUMMARY_TEXTS.verseTitle}
          value={formatPercent(overall?.averageVerseRecitationRate) ?? STATISTICS_TEXTS.noValue}
          hint={verseTen === null ? undefined : SUMMARY_TEXTS.verseHint(verseTen)}
        />
        <StatTile
          testId="statistics-summary-new"
          icon={<PersonAddIcon />}
          tone={Tone.Info}
          title={SUMMARY_TEXTS.newTitle}
          value={newCount}
          hint={SUMMARY_TEXTS.newHint}
        />
        <StatTile
          testId="statistics-summary-growth"
          icon={<TrendingUpIcon />}
          tone={deltaTone(growthRate)}
          title={SUMMARY_TEXTS.growthTitle(period)}
          value={growthRate !== undefined ? `${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1).replace('.', ',').replace(',0', '')}%` : STATISTICS_TEXTS.noValue}
          hint={growthHint(growthRate, period)}
        />
      </StatTileGrid>

      <StatusBanner
        tone={overallTone}
        title={
          overallTone === Tone.Error
            ? STATUS_BANNER_TEXTS.help(errorCount)
            : overallTone === Tone.Warning
              ? STATUS_BANNER_TEXTS.attention(attention.length)
              : STATUS_BANNER_TEXTS.good
        }
        detail={
          overallTone === Tone.Error
            ? STATUS_BANNER_TEXTS.helpDetail
            : overallTone === Tone.Warning
              ? STATUS_BANNER_TEXTS.attentionDetail
              : STATUS_BANNER_TEXTS.goodDetail
        }
      />
      <ToneLegend />

      {/* No computador, avisos e pagelas da semana lado a lado — só quando há aviso a mostrar. */}
      <Box
        data-testid="statistics-summary-attention-row"
        data-side-by-side={attention.length > 0}
        sx={{
          display: 'grid',
          gap: 2,
          alignItems: 'start',
          gridTemplateColumns: { xs: '1fr', md: attention.length > 0 ? 'repeat(2, minmax(0, 1fr))' : '1fr' },
        }}
      >
      <Section testId="statistics-summary-attention" title={SUMMARY_TEXTS.attentionTitle} tone={overallTone}>
        <AttentionList items={attention} allGoodText={SUMMARY_TEXTS.attentionNone} />
      </Section>

      <Section
        testId="statistics-summary-pagelas"
        title={SUMMARY_TEXTS.pagelasTitle}
        help={SUMMARY_TEXTS.pagelasHelp}
        tone={lastWeek.expected === 0 ? Tone.Info : lastWeek.launched >= lastWeek.expected ? Tone.Success : Tone.Error}
      >
        <Box sx={{ display: 'grid', gap: 2 }}>
          <ProgressLine
            title={SUMMARY_TEXTS.lastWeek}
            done={lastWeek.launched}
            total={lastWeek.expected}
            caption={rangeText(previousRange)}
          />
          <ProgressLine
            title={SUMMARY_TEXTS.thisWeek}
            done={thisWeek.launched}
            total={thisWeek.expected}
            caption={thisWeek.expected === 0 ? SUMMARY_TEXTS.thisWeekWaiting : rangeText(alerts.weeks.currentQuery.data?.weekRange)}
          />
        </Box>
      </Section>
      </Box>

      <SectionGrid>
        <Section testId="statistics-summary-weeks" title={SUMMARY_TEXTS.weeksTitle} help={SUMMARY_TEXTS.weeksHelp}>
          <WeekColumns columns={columns} emptyText={STATISTICS_TEXTS.empty} />
          {delta !== null && (
            <Box data-testid="statistics-summary-weeks-delta" sx={{ mt: 1.5, typography: 'body2', color: 'text.secondary' }}>
              {delta > 0 ? SUMMARY_TEXTS.weekUp(delta) : delta < 0 ? SUMMARY_TEXTS.weekDown(Math.abs(delta)) : SUMMARY_TEXTS.weekSame}
            </Box>
          )}
        </Section>
        <Section testId="statistics-summary-decisions-list" tone={Tone.Success} title={SUMMARY_TEXTS.decisionsListTitle} help={SUMMARY_TEXTS.decisionsListHelp}>
          <PersonList rows={decisionRows} emptyText={SUMMARY_TEXTS.decisionsEmpty} />
        </Section>
      </SectionGrid>
    </DataState>
  );
};
