import React from 'react';
import { Box, Chip } from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GroupsIcon from '@mui/icons-material/Groups';
import HomeIcon from '@mui/icons-material/Home';
import { Tone } from '../constants';
import { attentionTone } from '../utils/alerts';
import { type BarItem } from '../components/plain/BarList';
import { RingGrid } from '../components/plain/RingGrid';
import { TileMap } from '../components/plain/TileMap';
import { ColumnChart } from '../components/plain/ColumnChart';
import { DotsList } from '../components/plain/DotsList';
import { DataState } from '../components/plain/DataState';
import { Section, SectionGrid } from '../components/plain/Section';
import { StatTile, StatTileGrid } from '../components/plain/StatTile';
import { AttentionList } from '../components/plain/AttentionList';
import { useClubAlerts } from './useClubAlerts';
import { daysSince, formatDaysAgo } from '../utils/alerts';
import { CLUBS_TEXTS, STATISTICS_TEXTS, WEEKDAY_PLAIN, WEEKLY_STATUS_PLAIN } from '../texts';
import { WeeklyClubStatus, type PeriodShortcut } from '../types';
import { formatDecimal, formatPercent, rateToTone, rateTone } from '../utils/plain';

interface ClubsViewProps {
  period: PeriodShortcut;
}

const STATUS_COLOR: Record<WeeklyClubStatus, 'success' | 'warning' | 'error' | 'default'> = {
  [WeeklyClubStatus.Ok]: 'success',
  [WeeklyClubStatus.Partial]: 'warning',
  [WeeklyClubStatus.Missing]: 'error',
  [WeeklyClubStatus.Pending]: 'default',
  [WeeklyClubStatus.Vacation]: 'default',
  [WeeklyClubStatus.Inactive]: 'default',
  [WeeklyClubStatus.OutOfPeriod]: 'default',
};

/** Como cada clubinho está: presença, tamanho e a pagela da semana. */
export const ClubsView: React.FC<ClubsViewProps> = ({ period }) => {
  const alerts = useClubAlerts({ period });
  const { clubs } = alerts;
  const weekly = alerts.weeks.currentQuery;
  const lastWeekly = alerts.weeks.previousQuery;

  const retry = () => alerts.refetch();

  const list = clubs.data?.clubs ?? [];
  const summary = clubs.data?.summary;
  const avgChildren = summary && summary.totalClubs > 0 ? summary.totalChildren / summary.totalClubs : null;

  const name = (club: { clubNumber: number; address: { city: string } }) =>
    CLUBS_TEXTS.clubName(club.clubNumber, club.address.city);

  const withPagelas = list.filter((club) => club.performance.totalPagelas > 0);
  const withoutPagelas = list.filter((club) => club.performance.totalPagelas === 0);
  const presenceItems: BarItem[] = [
    ...[...withPagelas]
      .sort((a, b) => b.performance.presenceRate - a.performance.presenceRate)
      .map((club) => ({
        key: club.clubId,
        label: name(club),
        value: club.performance.presenceRate,
        display: formatPercent(club.performance.presenceRate) ?? STATISTICS_TEXTS.noValue,
        tone: rateTone(club.performance.presenceRate),
        caption: CLUBS_TEXTS.lastPagela(formatDaysAgo(daysSince(club.lastActivity?.date))),
      })),
    ...withoutPagelas.map((club) => ({
      key: club.clubId,
      label: name(club),
      value: 0,
      display: CLUBS_TEXTS.noPagelas,
    })),
  ];

  const sizeItems: BarItem[] = [...list]
    .sort((a, b) => b.children.active - a.children.active)
    .map((club) => ({
      key: club.clubId,
      label: name(club),
      value: club.children.active,
      display: CLUBS_TEXTS.children(club.children.active),
    }));

  const cityItems: BarItem[] = (clubs.data?.distribution.byCity ?? []).map((city) => ({
    key: `${city.city}-${city.state}`,
    label: `${city.city} - ${city.state}`,
    value: city.count,
    display: `${city.count} ${city.count === 1 ? 'clubinho' : 'clubinhos'}`,
  }));

  const WEEK_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const weekdayItems: BarItem[] = [...(clubs.data?.distribution.byWeekday ?? [])]
    .sort((a, b) => WEEK_ORDER.indexOf(a.weekday.toLowerCase()) - WEEK_ORDER.indexOf(b.weekday.toLowerCase()))
    .map((row) => ({
      key: row.weekday,
      label: (WEEKDAY_PLAIN[row.weekday.toLowerCase()] ?? row.weekday).replace('-feira', ''),
      value: row.count,
      display: String(row.count),
    }));

  const weeklyClubs = [...(weekly.data?.clubs ?? [])].sort((a, b) => a.clubNumber - b.clubNumber);
  const lastWeeklyClubs = [...(lastWeekly.data?.clubs ?? [])].sort((a, b) => a.clubNumber - b.clubNumber);

  const chips = (rows: typeof weeklyClubs, loading: boolean, failed: boolean) =>
    failed ? (
      STATISTICS_TEXTS.loadError
    ) : (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {loading && STATISTICS_TEXTS.loadingData}
        {!loading && rows.length === 0 && STATISTICS_TEXTS.empty}
        {rows.map((club) => (
          <Chip
            key={club.clubId}
            data-testid="statistics-clubs-week-chip"
            color={STATUS_COLOR[club.status]}
            variant={STATUS_COLOR[club.status] === 'default' ? 'outlined' : 'filled'}
            label={`Clubinho ${club.clubNumber}: ${WEEKLY_STATUS_PLAIN[club.status] ?? club.status}`}
            sx={{ minHeight: 32 }}
          />
        ))}
      </Box>
    );

  return (
    <DataState data-testid="statistics-clubs-view" isLoading={clubs.isLoading} isError={clubs.isError} onRetry={retry}>
      <>
        <StatTileGrid>
          <StatTile testId="statistics-clubs-total"  icon={<HomeIcon />} tone={Tone.Info} title={CLUBS_TEXTS.totalTitle} value={summary?.totalClubs ?? STATISTICS_TEXTS.noValue} />
          <StatTile
            testId="statistics-clubs-avg-children"
            icon={<GroupsIcon />}
            tone={Tone.Neutral}
            title={CLUBS_TEXTS.avgChildrenTitle}
            value={formatDecimal(avgChildren) ?? STATISTICS_TEXTS.noValue}
            hint={CLUBS_TEXTS.avgChildrenHint}
          />
          <StatTile
            testId="statistics-clubs-presence"
            icon={<EventAvailableIcon />}
            tone={rateToTone(summary?.avgPresenceRate)}
            title={CLUBS_TEXTS.presenceTitle}
            value={formatPercent(summary?.avgPresenceRate) ?? STATISTICS_TEXTS.noValue}
          />
          <StatTile testId="statistics-clubs-decisions"  icon={<FavoriteIcon />} tone={Tone.Success} title={CLUBS_TEXTS.decisionsTitle} value={summary?.totalDecisions ?? 0} />
        </StatTileGrid>

        <Section testId="statistics-clubs-attention" title={CLUBS_TEXTS.attentionTitle} tone={attentionTone(alerts.items)}>
          <AttentionList items={alerts.items} allGoodText={CLUBS_TEXTS.attentionNone} />
        </Section>

        <SectionGrid>
          <Section testId="statistics-clubs-presence-list" tone={Tone.Success} title={CLUBS_TEXTS.presenceListTitle} help={CLUBS_TEXTS.presenceListHelp}>
            <RingGrid items={presenceItems} emptyText={STATISTICS_TEXTS.empty} />
          </Section>
          <Section testId="statistics-clubs-last-week" tone={alerts.previous.missing.length > 0 ? Tone.Error : Tone.Success} title={CLUBS_TEXTS.lastWeekTitle} help={CLUBS_TEXTS.weekHelp}>
            {chips(lastWeeklyClubs, lastWeekly.isLoading, lastWeekly.isError)}
          </Section>
          <Section testId="statistics-clubs-week" tone={alerts.current.missing.length > 0 ? Tone.Error : Tone.Info} title={CLUBS_TEXTS.weekTitle} help={CLUBS_TEXTS.thisWeekHelp}>
            {chips(weeklyClubs, weekly.isLoading, weekly.isError)}
          </Section>
          <Section testId="statistics-clubs-size-list" title={CLUBS_TEXTS.sizeListTitle}>
            <TileMap items={sizeItems} emptyText={STATISTICS_TEXTS.empty} />
          </Section>
          <Section testId="statistics-clubs-weekdays" title={CLUBS_TEXTS.weekdaysTitle}>
            <ColumnChart items={weekdayItems} emptyText={STATISTICS_TEXTS.empty} />
          </Section>
          <Section testId="statistics-clubs-cities" title={CLUBS_TEXTS.citiesTitle}>
            <DotsList icon={HomeIcon} items={cityItems} emptyText={STATISTICS_TEXTS.empty} />
          </Section>
        </SectionGrid>
      </>
    </DataState>
  );
};
