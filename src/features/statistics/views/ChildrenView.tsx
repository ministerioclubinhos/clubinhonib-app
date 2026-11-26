import React from 'react';
import { type BarItem } from '../components/plain/BarList';
import { DonutChart } from '../components/plain/DonutChart';
import { RingList } from '../components/plain/RingList';
import { ColumnChart } from '../components/plain/ColumnChart';
import { StackedBar } from '../components/plain/StackedBar';
import { DataState } from '../components/plain/DataState';
import { Section, SectionGrid } from '../components/plain/Section';
import { StatTile, StatTileGrid } from '../components/plain/StatTile';
import {
  AGE_GROUPS,
  MIN_PAGELAS_FOR_RANKING,
  PARTICIPATION_TIME_RANGES,
  RANKING_SIZE,
  Tone,
} from '../constants';
import { PersonList } from '../components/plain/PersonList';
import { useAcceptedChristsStats, useChildren, useOverview, usePagelasStats } from '../hooks';
import dayjs from 'dayjs';
import CakeIcon from '@mui/icons-material/Cake';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GroupsIcon from '@mui/icons-material/Groups';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SpaIcon from '@mui/icons-material/Spa';
import {
  AGE_GROUP_LABELS,
  CHILDREN_TEXTS,
  DECISION_LABELS,
  PARTICIPATION_LABELS,
  STATISTICS_TEXTS,
} from '../texts';
import type { ChildStat, DecisionType, PeriodShortcut } from '../types';
import { formatDecimal, formatPercent, outOfTen, rateToTone, rateTone } from '../utils/plain';

interface ChildrenViewProps {
  period: PeriodShortcut;
}

const childRow = (child: ChildStat): BarItem => ({
  key: child.childId,
  label: child.name,
  value: child.stats.presenceRate,
  display: formatPercent(child.stats.presenceRate) ?? STATISTICS_TEXTS.noValue,
  tone: rateTone(child.stats.presenceRate),
  caption: child.club ? `Clubinho ${child.club.number}` : undefined,
});

const share = (label: string, count: number, percentage: number, key = label): BarItem => ({
  key,
  label,
  value: percentage,
  display: `${count} (${Math.round(percentage)}%)`,
});

/** Quem são as crianças, quem mais vem e quem está sumido. */
export const ChildrenView: React.FC<ChildrenViewProps> = ({ period }) => {
  const overview = useOverview();
  const top = useChildren({
    period,
    isActive: true,
    minPagelas: MIN_PAGELAS_FOR_RANKING,
    sortBy: 'presenceRate',
    sortOrder: 'DESC',
    limit: RANKING_SIZE,
  });
  const low = useChildren({
    period,
    isActive: true,
    minPagelas: MIN_PAGELAS_FOR_RANKING,
    sortBy: 'presenceRate',
    sortOrder: 'ASC',
    limit: RANKING_SIZE,
  });
  const decisions = useAcceptedChristsStats({ period });
  const pagelas = usePagelasStats({ period });
  const newcomers = useChildren({ period, isActive: true, isNewcomer: true, limit: RANKING_SIZE });

  const isLoading = top.isLoading || low.isLoading || overview.isLoading || decisions.isLoading || pagelas.isLoading || newcomers.isLoading;
  const isError = top.isError || low.isError || overview.isError || decisions.isError || pagelas.isError || newcomers.isError;
  const retry = () => {
    void top.refetch();
    void low.refetch();
    void overview.refetch();
    void decisions.refetch();
    void pagelas.refetch();
    void newcomers.refetch();
  };

  const summary = top.data?.summary;
  const distribution = top.data?.distribution;

  const gender = (distribution?.byGender ?? []).map((row) =>
    share(row.gender === 'M' ? CHILDREN_TEXTS.male : CHILDREN_TEXTS.female, row.count, row.percentage, row.gender),
  );
  const inOrder = <T,>(rows: T[], order: readonly string[], key: (row: T) => string) =>
    [...rows].sort((a, b) => order.indexOf(key(a)) - order.indexOf(key(b)));
  const ages = inOrder(distribution?.byAgeGroup ?? [], AGE_GROUPS, (row) => row.ageGroup).map((row) =>
    share(AGE_GROUP_LABELS[row.ageGroup] ?? row.ageGroup, row.count, row.percentage, row.ageGroup),
  );
  const time = inOrder(distribution?.byParticipationTime ?? [], PARTICIPATION_TIME_RANGES, (row) => row.timeRange).map((row) =>
    share(PARTICIPATION_LABELS[row.timeRange] ?? row.timeRange, row.count, row.percentage, row.timeRange),
  );
  const decisionRows = Object.entries(decisions.data?.overall.byDecisionType ?? {}).map(([type, count]) => ({
    key: type,
    label: DECISION_LABELS[type as DecisionType] ?? type,
    value: count ?? 0,
    display: String(count ?? 0),
  }));
  const inactive = overview.data?.summary.inactiveChildren ?? 0;
  const meditation = pagelas.data?.overall.averageMeditationRate;
  const verse = pagelas.data?.overall.averageVerseRecitationRate;
  const recentDecisions = (decisions.data?.recentDecisions ?? []).slice(0, RANKING_SIZE).map((decision) => ({
    key: decision.id,
    name: decision.childName,
    caption: dayjs(decision.createdAt).format('DD/MM/YYYY'),
    badge: decision.decision ? DECISION_LABELS[decision.decision as DecisionType] : undefined,
  }));
  const newcomerRows = (newcomers.data?.children ?? []).map((child) => ({
    key: child.childId,
    name: child.name,
    caption: CHILDREN_TEXTS.newcomerCaption(child.monthsParticipating, child.club?.number),
  }));

  return (
    <DataState data-testid="statistics-children-view" isLoading={isLoading} isError={isError} onRetry={retry}>
      <>
        <StatTileGrid>
          <StatTile
            testId="statistics-children-total"
            icon={<GroupsIcon />}
            tone={Tone.Info}
            title={CHILDREN_TEXTS.totalTitle}
            value={summary?.totalChildren ?? STATISTICS_TEXTS.noValue}
            hint={inactive > 0 ? CHILDREN_TEXTS.inactive(inactive) : undefined}
          />
          <StatTile
            testId="statistics-children-presence"
            icon={<EventAvailableIcon />}
            tone={rateToTone(summary?.avgPresenceRate)}
            title={CHILDREN_TEXTS.presenceTitle}
            value={formatPercent(summary?.avgPresenceRate) ?? STATISTICS_TEXTS.noValue}
            hint={CHILDREN_TEXTS.presenceHint}
          />
          <StatTile
            testId="statistics-children-age"
            icon={<CakeIcon />}
            tone={Tone.Neutral}
            title={CHILDREN_TEXTS.ageTitle}
            value={formatDecimal(summary?.avgAge) ?? STATISTICS_TEXTS.noValue}
            hint={CHILDREN_TEXTS.ageHint}
          />
          <StatTile
            testId="statistics-children-decided"
            icon={<FavoriteIcon />}
            tone={Tone.Success}
            title={CHILDREN_TEXTS.decidedTitle}
            value={summary?.childrenWithDecisions ?? 0}
          />
          <StatTile
            testId="statistics-children-meditation"
            icon={<SpaIcon />}
            tone={rateToTone(meditation)}
            title={CHILDREN_TEXTS.meditationTitle}
            value={formatPercent(meditation) ?? STATISTICS_TEXTS.noValue}
            hint={outOfTen(meditation) === null ? undefined : CHILDREN_TEXTS.ofTen(outOfTen(meditation) ?? 0)}
          />
          <StatTile
            testId="statistics-children-verse"
            icon={<MenuBookIcon />}
            tone={rateToTone(verse)}
            title={CHILDREN_TEXTS.verseTitle}
            value={formatPercent(verse) ?? STATISTICS_TEXTS.noValue}
            hint={outOfTen(verse) === null ? undefined : CHILDREN_TEXTS.ofTen(outOfTen(verse) ?? 0)}
          />
        </StatTileGrid>

        <SectionGrid>
          <Section testId="statistics-children-low" tone={Tone.Error} title={CHILDREN_TEXTS.lowTitle} help={`${CHILDREN_TEXTS.lowHelp} ${CHILDREN_TEXTS.needsPagelas}`}>
            <RingList items={(low.data?.children ?? []).map(childRow)} emptyText={STATISTICS_TEXTS.empty} />
          </Section>
          <Section testId="statistics-children-top" tone={Tone.Success} title={CHILDREN_TEXTS.topTitle} help={`${CHILDREN_TEXTS.topHelp} ${CHILDREN_TEXTS.needsPagelas}`}>
            <RingList medals items={(top.data?.children ?? []).map(childRow)} emptyText={STATISTICS_TEXTS.empty} />
          </Section>
          <Section testId="statistics-children-newcomers" tone={Tone.Info} title={CHILDREN_TEXTS.newcomersTitle} help={CHILDREN_TEXTS.newcomersHelp}>
            <PersonList rows={newcomerRows} emptyText={STATISTICS_TEXTS.empty} />
          </Section>
          <Section testId="statistics-children-recent-decisions" tone={Tone.Success} title={CHILDREN_TEXTS.recentTitle}>
            <PersonList rows={recentDecisions} emptyText={STATISTICS_TEXTS.empty} />
          </Section>
          <Section testId="statistics-children-gender" title={CHILDREN_TEXTS.genderTitle}>
            <DonutChart items={gender} centerValue={String(summary?.totalChildren ?? '')} centerLabel="crianças" emptyText={STATISTICS_TEXTS.empty} />
          </Section>
          <Section testId="statistics-children-ages" title={CHILDREN_TEXTS.agesTitle}>
            <ColumnChart items={ages} emptyText={STATISTICS_TEXTS.empty} />
          </Section>
          <Section testId="statistics-children-time" title={CHILDREN_TEXTS.timeTitle}>
            <StackedBar items={time} emptyText={STATISTICS_TEXTS.empty} />
          </Section>
          <Section testId="statistics-children-decisions" tone={Tone.Success} title={CHILDREN_TEXTS.decisionsTitle}>
            <DonutChart items={decisionRows} centerValue={String(decisionRows.reduce((sum, row) => sum + row.value, 0))} centerLabel="decisões" emptyText={STATISTICS_TEXTS.empty} />
          </Section>
        </SectionGrid>
      </>
    </DataState>
  );
};
